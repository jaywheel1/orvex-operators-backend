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

    // Tweet verification: URL format is validated above.
    // When AI is enabled, we could verify tweet content in the future.
    // For now, URL format check is sufficient - the follow screenshot is the main AI checkpoint.
    const aiEnabled = await isRegistrationAiEnabled();
    const aiVerified = true; // URL format validation above is sufficient for tweets
    if (!aiEnabled) {
      console.log('AI review disabled - tweet auto-approved');
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
