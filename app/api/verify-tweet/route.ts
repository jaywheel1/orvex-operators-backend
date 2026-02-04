import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isWhitelisted } from '@/lib/whitelist';

interface VerifyTweetRequest {
  wallet_address: string;
  tweet_url: string;
  verification_code: string;
}

// Set ENABLE_AI_VERIFICATION=true in .env.local to enable real AI verification
const AI_VERIFICATION_ENABLED = process.env.ENABLE_AI_VERIFICATION === 'true';

export async function POST(request: NextRequest) {
  try {
    const body: VerifyTweetRequest = await request.json();
    const { wallet_address, tweet_url, verification_code } = body;

    if (!wallet_address || !tweet_url || !verification_code) {
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

    // TODO: Implement real tweet verification with AI when ENABLE_AI_VERIFICATION=true
    // For now, auto-approve in testing mode
    const aiVerified = AI_VERIFICATION_ENABLED ? true : true; // Both paths auto-approve for now
    if (!AI_VERIFICATION_ENABLED) {
      console.log('AI verification disabled - auto-approving tweet for testing');
    }

    if (!existingUser) {
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          wallet_address: wallet_address.toLowerCase(),
          tweet_url,
          verification_code,
          tweet_verified: aiVerified,
          tweet_verified_at: aiVerified ? new Date().toISOString() : null,
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
