import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isWhitelisted } from '@/lib/whitelist';
import Anthropic from '@anthropic-ai/sdk';

const REFERRAL_CP_REWARD = 1000;

// Lazy-load Anthropic client only when needed
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  return new Anthropic({ apiKey });
}
const MAX_REFERRALS = 5;

// Set ENABLE_AI_VERIFICATION=true in .env.local to enable real AI verification
const AI_VERIFICATION_ENABLED = process.env.ENABLE_AI_VERIFICATION === 'true';

async function verifyFollowWithAI(imageBase64: string, mediaType: string): Promise<{ verified: boolean; reason: string }> {
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
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyze this screenshot and determine if it shows that the user is following the Twitter/X account @OrvexFi (or a similar Orvex-related account).

Look for:
1. The "Following" button state (not "Follow")
2. The account name containing "Orvex" or "OrvexFi"
3. Any indication this is a Twitter/X profile page

Respond with JSON only:
{"verified": true/false, "reason": "brief explanation"}`,
            },
          ],
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
    const formData = await request.formData();
    const wallet_address = formData.get('wallet_address') as string;
    const screenshot = formData.get('screenshot') as File;

    if (!wallet_address || !screenshot) {
      return NextResponse.json(
        { ok: false, error: 'Missing wallet address or screenshot' },
        { status: 400 }
      );
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, tweet_verified, follow_verified, referred_by, registration_complete')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found. Complete tweet verification first.' },
        { status: 400 }
      );
    }

    if (!user.tweet_verified) {
      return NextResponse.json(
        { ok: false, error: 'Tweet verification required first' },
        { status: 400 }
      );
    }

    // Block re-verification unless whitelisted
    if (user.follow_verified && !isWhitelisted(wallet_address)) {
      return NextResponse.json(
        { ok: false, error: 'Follow already verified' },
        { status: 400 }
      );
    }

    const bytes = await screenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `follows/${wallet_address.toLowerCase()}_${Date.now()}.${screenshot.type.split('/')[1] || 'png'}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('verification-screenshots')
      .upload(fileName, buffer, {
        contentType: screenshot.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Screenshot upload error:', uploadError);
    }

    const imageBase64 = buffer.toString('base64');
    const mediaType = screenshot.type || 'image/png';

    const aiResult = await verifyFollowWithAI(imageBase64, mediaType);
    const aiVerified = aiResult.verified;

    console.log('AI verification result:', aiResult);

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        follow_verified: aiVerified,
        follow_verified_at: aiVerified ? new Date().toISOString() : null,
        follow_screenshot_url: fileName,
        registration_complete: aiVerified,
        registration_completed_at: aiVerified ? new Date().toISOString() : null,
      })
      .eq('wallet_address', wallet_address.toLowerCase());

    if (updateError) {
      console.error('User update error:', updateError);
      return NextResponse.json(
        { ok: false, error: 'Failed to update user', details: updateError.message },
        { status: 500 }
      );
    }

    // Process referral if registration just completed and user was referred
    if (aiVerified && !user.registration_complete && user.referred_by) {
      try {
        // Find the referrer by their referral code
        const { data: referrer } = await supabaseAdmin
          .from('users')
          .select('id, wallet_address, points')
          .eq('referral_code', user.referred_by)
          .single();

        if (referrer) {
          // Check if referrer hasn't hit the cap
          const { count: existingReferrals } = await supabaseAdmin
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', referrer.id)
            .eq('verified', true);

          if ((existingReferrals || 0) < MAX_REFERRALS) {
            // Create referral record
            await supabaseAdmin
              .from('referrals')
              .insert({
                referrer_id: referrer.id,
                referee_id: user.id,
                referrer_wallet: referrer.wallet_address,
                referee_wallet: wallet_address.toLowerCase(),
                verified: true,
                verified_at: new Date().toISOString(),
                cp_awarded: REFERRAL_CP_REWARD,
              });

            // Award CP to referrer
            await supabaseAdmin
              .from('users')
              .update({ points: (referrer.points || 0) + REFERRAL_CP_REWARD })
              .eq('id', referrer.id);

            // Log to CP ledger
            await supabaseAdmin
              .from('cp_ledger')
              .insert({
                user_id: referrer.id,
                amount: REFERRAL_CP_REWARD,
                reason: `Referral bonus: ${wallet_address.slice(0, 6)}...${wallet_address.slice(-4)} registered`,
              });

            console.log(`Referral processed: ${referrer.wallet_address} earned ${REFERRAL_CP_REWARD} CP for referring ${wallet_address}`);
          }
        }
      } catch (refError) {
        // Log but don't fail the registration
        console.error('Referral processing error:', refError);
      }
    }

    return NextResponse.json({
      ok: true,
      verified: aiVerified,
      message: aiVerified
        ? 'Follow verified successfully. Registration complete!'
        : 'Follow verification failed - screenshot does not show follow',
    });
  } catch (err) {
    console.error('Verify follow error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
