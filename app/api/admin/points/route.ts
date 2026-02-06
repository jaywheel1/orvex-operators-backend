import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/admin-wallets';

export async function POST(request: NextRequest) {
  try {
    const { wallet_address, amount, admin_wallet } = await request.json();

    if (!admin_wallet || !(await verifyAdmin(admin_wallet))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
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
      reason: `Admin adjustment by ${admin_wallet}`,
    });

    return NextResponse.json({ ok: true, newPoints });
  } catch {
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
