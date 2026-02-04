import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const REFERRAL_CP_REWARD = 1000;
const MAX_REFERRALS = 5;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ ok: false, error: 'Missing wallet' }, { status: 400 });
  }

  try {
    // Get user with referral code
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, referral_code, referred_by')
      .eq('wallet_address', wallet.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get referral count and stats
    const { data: referrals, error: refError } = await supabaseAdmin
      .from('referrals')
      .select('id, referee_wallet, verified, cp_awarded, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (refError) {
      return NextResponse.json({ ok: false, error: 'Failed to fetch referrals' }, { status: 500 });
    }

    const verifiedCount = referrals?.filter(r => r.verified).length || 0;
    const totalCpEarned = referrals?.reduce((sum, r) => sum + (r.cp_awarded || 0), 0) || 0;
    const remainingSlots = Math.max(0, MAX_REFERRALS - verifiedCount);

    return NextResponse.json({
      ok: true,
      data: {
        referral_code: user.referral_code,
        referral_link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://orvex.fi'}/register?ref=${user.referral_code}`,
        total_referrals: referrals?.length || 0,
        verified_referrals: verifiedCount,
        remaining_slots: remainingSlots,
        max_referrals: MAX_REFERRALS,
        cp_per_referral: REFERRAL_CP_REWARD,
        total_cp_earned: totalCpEarned,
        referrals: referrals?.map(r => ({
          wallet: r.referee_wallet.slice(0, 6) + '...' + r.referee_wallet.slice(-4),
          verified: r.verified,
          cp_awarded: r.cp_awarded,
          date: r.created_at,
        })) || [],
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
