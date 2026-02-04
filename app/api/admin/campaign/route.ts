import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { live, admin_wallet } = await request.json();

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', admin_wallet?.toLowerCase())
      .single();

    if (profile?.role !== 'admin') {
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
