import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isWhitelisted } from '@/lib/whitelist';
import { isRegistrationAiEnabled } from '@/lib/ai-verify';

interface VerifyTweetRequest {
  wallet_address: string;
  tweet_url: string;
  verification_code: string;
  referral_code?: string;
  x_handle?: string;
}

async function verifyTweetWithAI(
  tweetUrl: string,
  expectedCode: string,
  expectedHandle: string
): Promise<{ verified: boolean; reason: string }> {
  const aiEnabled = await isRegistrationAiEnabled();
  if (!aiEnabled) {
    console.log('AI review disabled - tweet auto-approved');
    return { verified: true, reason: 'AI review disabled - auto-approved' };
  }

  // Extract handle from tweet URL
  const handleMatch = tweetUrl.match(/(?:twitter\.com|x\.com)\/(@)?([a-zA-Z0-9_]+)\/status\//i);
  const urlHandle = handleMatch ? handleMatch[2].toLowerCase() : null;

  if (!urlHandle) {
    return { verified: false, reason: 'Could not extract X handle from tweet URL. Please check the URL.' };
  }

  // Verify the handle in the URL matches what they provided
  if (urlHandle !== expectedHandle.toLowerCase()) {
    return {
      verified: false,
      reason: `Tweet URL is from @${urlHandle} but you registered as @${expectedHandle}. Please submit a tweet from your own account.`,
    };
  }

  // Try to fetch tweet content via Twitter oEmbed (public, no API key needed)
  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}&omit_script=true`;
    const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });

    if (response.ok) {
      const data = await response.json();
      const tweetHtml: string = data.html || '';

      // Check if the verification code appears in the tweet
      if (!tweetHtml.toLowerCase().includes(expectedCode.toLowerCase())) {
        return {
          verified: false,
          reason: `Tweet does not contain your verification code (${expectedCode}). Please post the exact tweet with your code and try again.`,
        };
      }

      // Check the tweet mentions @OrvexFi
      if (!tweetHtml.toLowerCase().includes('orvex')) {
        return {
          verified: false,
          reason: 'Tweet does not mention @OrvexFi. Please post the correct verification tweet.',
        };
      }

      return { verified: true, reason: 'Tweet verified: correct handle, code, and mention found.' };
    } else {
      // oEmbed failed (tweet might be deleted, private, or rate-limited)
      // Fall back to URL handle check only
      console.warn('Twitter oEmbed failed, falling back to handle verification only');
      return { verified: true, reason: 'Tweet URL verified (handle matches). Content check unavailable.' };
    }
  } catch (err) {
    console.warn('Twitter oEmbed request failed:', err);
    // Network error - fall back to handle check only
    return { verified: true, reason: 'Tweet URL verified (handle matches). Content check unavailable.' };
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
        { ok: false, error: 'Invalid tweet URL format. Must be a twitter.com or x.com status URL.' },
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
          { ok: false, error: 'This tweet has already been used for verification by another wallet.' },
          { status: 400 }
        );
      }
    }

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, wallet_address, tweet_verified')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    // AI-powered tweet verification
    const aiResult = await verifyTweetWithAI(tweet_url, verification_code, x_handle);
    const aiVerified = aiResult.verified;

    console.log('Tweet AI verification result:', aiResult);

    if (!aiVerified) {
      return NextResponse.json(
        { ok: false, error: aiResult.reason },
        { status: 400 }
      );
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
      verified: true,
      message: 'Tweet verified successfully',
    });
  } catch (err) {
    console.error('Verify tweet error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
