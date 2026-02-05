import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/admin-wallets';

export async function POST(request: NextRequest) {
  try {
    const { live, admin_wallet } = await request.json();

    if (!admin_wallet || !(await verifyAdmin(admin_wallet))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({ key: 'campaign_live', value: live.toString() }, { onConflict: 'key' });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, live });
  } catch {
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
