import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isWhitelisted } from '@/lib/whitelist';
import Anthropic from '@anthropic-ai/sdk';

const ADMIN_WALLET = '0xc4a00be797e0acfe8518f795359898b01a038dc8';

interface VerifyTweetRequest {
  wallet_address: string;
  tweet_url: string;
  verification_code: string;
  referral_code?: string;
  x_handle?: string;
}

// Set ENABLE_AI_VERIFICATION=true in .env.local to enable real AI verification
const AI_VERIFICATION_ENABLED = process.env.ENABLE_AI_VERIFICATION === 'true';

// Lazy-load Anthropic client only when needed
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  return new Anthropic({ apiKey });
}

async function verifyTweetWithAI(tweetUrl: string, verificationCode: string): Promise<{ verified: boolean; reason: string }> {
  // Skip AI verification if disabled (for testing)
  if (!AI_VERIFICATION_ENABLED) {
    console.log('AI verification disabled - auto-approving for testing');
    return { verified: true, reason: 'AI verification disabled - auto-approved for testing' };
  }

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Verify if this tweet URL contains the verification code "${verificationCode}".

Tweet URL: ${tweetUrl}

Instructions:
1. Access the tweet URL and check its content
2. Look for the exact verification code: ${verificationCode}
3. The code should appear as-is in the tweet text

Respond with JSON only:
{"verified": true/false, "reason": "brief explanation of what you found"}`,
        },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (textContent && textContent.type === 'text') {
      const parsed = JSON.parse(textContent.text);
      return { verified: parsed.verified, reason: parsed.reason };
    }
    return { verified: false, reason: 'Could not parse AI response' };
  } catch (error) {
    console.error('AI verification error:', error);
    return { verified: false, reason: 'AI verification failed' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyTweetRequest = await request.json();
    const { wallet_address, tweet_url, verification_code, referral_code, x_handle } = body;

    if (!wallet_address || !tweet_url || !verification_code || !x_handle) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tweetUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
    if (!tweetUrlPattern.test(tweet_url)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid tweet URL format' },
        { status: 400 }
      );
    }

    // Check if this specific tweet URL has already been used (by anyone)
    // Skip this check for whitelisted wallets
    if (!isWhitelisted(wallet_address)) {
      const { data: existingTweet } = await supabaseAdmin
        .from('users')
        .select('id, wallet_address')
        .eq('tweet_url', tweet_url)
        .single();

      if (existingTweet && existingTweet.wallet_address !== wallet_address.toLowerCase()) {
        return NextResponse.json(
          { ok: false, error: 'This tweet has already been used for verification' },
          { status: 400 }
        );
      }
    }

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, wallet_address, tweet_verified')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    // Admin wallet bypasses verification
    let aiVerified = false;
    let verificationReason = '';

    if (wallet_address.toLowerCase() === ADMIN_WALLET) {
      aiVerified = true;
      verificationReason = 'Admin wallet - auto-approved';
      console.log('Admin wallet detected - auto-approving tweet verification');
    } else {
      // All other wallets require AI verification
      const aiResult = await verifyTweetWithAI(tweet_url, verification_code);
      aiVerified = aiResult.verified;
      verificationReason = aiResult.reason;
      console.log('Tweet verification result:', aiResult);
    }

    if (!existingUser) {
      // Validate referral code if provided
      let validReferralCode: string | null = null;
      if (referral_code) {
        const { data: referrer } = await supabaseAdmin
          .from('users')
          .select('id, referral_code')
          .eq('referral_code', referral_code.toUpperCase())
          .single();

        if (referrer) {
          validReferralCode = referrer.referral_code;
        }
      }

      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          wallet_address: wallet_address.toLowerCase(),
          tweet_url,
          verification_code,
          tweet_verified: aiVerified,
          tweet_verified_at: aiVerified ? new Date().toISOString() : null,
          referred_by: validReferralCode,
          x_handle: x_handle.toLowerCase(),
        });

      if (insertError) {
        console.error('User insert error:', insertError);
        return NextResponse.json(
          { ok: false, error: 'Failed to create user', details: insertError.message },
          { status: 500 }
        );
      }
    } else {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          tweet_url,
          verification_code,
          tweet_verified: aiVerified,
          tweet_verified_at: aiVerified ? new Date().toISOString() : null,
          x_handle: x_handle.toLowerCase(),
        })
        .eq('wallet_address', wallet_address.toLowerCase());

      if (updateError) {
        console.error('User update error:', updateError);
        return NextResponse.json(
          { ok: false, error: 'Failed to update user', details: updateError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      verified: aiVerified,
      reason: verificationReason,
      message: aiVerified
        ? 'Tweet verified successfully'
        : 'Tweet verification failed - code not found in tweet',
    });
  } catch (err) {
    console.error('Verify tweet error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
