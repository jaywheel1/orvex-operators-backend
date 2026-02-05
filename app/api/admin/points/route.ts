import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAdminAuth(request);
    if (!auth.authorized) {
      return auth.response!;
    }

    const { wallet_address, amount } = await request.json();

    if (!wallet_address || typeof amount !== 'number') {
      return NextResponse.json(
        { ok: false, error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, points')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const newPoints = Math.max(0, (user.points || 0) + amount);

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ points: newPoints })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
    }

    await supabaseAdmin.from('cp_ledger').insert({
      user_id: user.id,
      amount,
      reason: `Admin adjustment by ${auth.walletAddress}`,
    });

    return NextResponse.json({ ok: true, newPoints });
  } catch {
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
