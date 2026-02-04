import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
      .select('id, tweet_verified, follow_verified')
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

    if (user.follow_verified) {
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

    const aiVerified = true;

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
