import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isWhitelisted } from '@/lib/whitelist';
import { isRegistrationAiEnabled } from '@/lib/ai-verify';
import Anthropic from '@anthropic-ai/sdk';

const REFERRAL_CP_REWARD = 1000;

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }
  return new Anthropic({ apiKey });
}
const MAX_REFERRALS = 5;

async function verifyFollowWithAI(imageBase64: string, mediaType: string): Promise<{ verified: boolean; reason: string }> {
  // Check the registration AI toggle from admin panel settings
  const aiEnabled = await isRegistrationAiEnabled();
  if (!aiEnabled) {
    console.log('AI review disabled in admin panel - auto-approving');
    return { verified: true, reason: 'AI review disabled - auto-approved' };
  }

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
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
              text: 'List all visible text and button labels you can see in this screenshot. Be thorough - include usernames, handles, button text, profile names, tab labels, and any other text visible in the image.',
            },
          ],
        },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return { verified: false, reason: 'AI could not read the screenshot. Please try again.' };
    }

    const extractedText = textContent.text.toLowerCase();
    console.log('AI extracted text from screenshot:', extractedText.slice(0, 500));

    // Check for Orvex account presence
    const hasOrvex = extractedText.includes('orvex') || extractedText.includes('@orvexfi');
    // Check for "Following" button (not just "Follow")
    const hasFollowing = extractedText.includes('following');

    if (!hasOrvex) {
      return { verified: false, reason: 'Could not find the @OrvexFi account in the screenshot. Please upload a screenshot of the @OrvexFi profile page.' };
    }

    if (!hasFollowing) {
      return { verified: false, reason: 'Could not find the "Following" button in the screenshot. Make sure you are following @OrvexFi and the "Following" button is visible.' };
    }

    return { verified: true, reason: 'Verified: Orvex profile with Following button detected.' };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('AI verification error:', errMsg);
    return { verified: false, reason: `AI verification error: ${errMsg}` };
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

    // Block re-verification unless whitelisted or admin testing
    // Allow re-verification so admins can test AI when toggling settings
    if (user.follow_verified && user.registration_complete && !isWhitelisted(wallet_address)) {
      const aiEnabled = await isRegistrationAiEnabled();
      if (!aiEnabled) {
        return NextResponse.json(
          { ok: false, error: 'Registration already complete for this wallet. Connect a different wallet to register again.' },
          { status: 400 }
        );
      }
      // When AI is enabled, allow re-submission so screenshots are actually checked
      console.log('Re-verification allowed: AI is enabled and user wants to re-verify follow');
    }

    const bytes = await screenshot.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageBase64 = buffer.toString('base64');
    const mediaType = screenshot.type || 'image/png';

    // Verify with AI (screenshot is not stored, only processed for verification)
    const aiResult = await verifyFollowWithAI(imageBase64, mediaType);
    const aiVerified = aiResult.verified;

    console.log('AI verification result:', aiResult);

    // If verification failed, return error immediately without updating database
    if (!aiVerified) {
      const userMessage = aiResult.reason || 'The screenshot does not show that you follow @OrvexFi. Please ensure the "Following" button is visible in your screenshot.';
      return NextResponse.json(
        {
          ok: false,
          error: userMessage,
          verified: false,
        },
        { status: 400 }
      );
    }

    // Only update user if verification passed
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        follow_verified: true,
        follow_verified_at: new Date().toISOString(),
        registration_complete: true,
        registration_completed_at: new Date().toISOString(),
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
        const { data: referrer } = await supabaseAdmin
          .from('users')
          .select('id, wallet_address, points')
          .eq('referral_code', user.referred_by)
          .single();

        if (referrer) {
          const { count: existingReferrals } = await supabaseAdmin
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', referrer.id)
            .eq('verified', true);

          if ((existingReferrals || 0) < MAX_REFERRALS) {
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

            await supabaseAdmin
              .from('users')
              .update({ points: (referrer.points || 0) + REFERRAL_CP_REWARD })
              .eq('id', referrer.id);

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
        console.error('Referral processing error:', refError);
      }
    }

    if (!aiVerified) {
      return NextResponse.json({
        ok: false,
        error: aiResult.reason || 'Screenshot does not show proof of following @OrvexFi. Please upload a clear screenshot showing you are following the account.',
        verified: false,
      });
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      message: 'Follow verified successfully. Registration complete!',
    });
  } catch (err) {
    console.error('Verify follow error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
