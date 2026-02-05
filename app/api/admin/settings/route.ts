import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

async function verifyAdmin(wallet: string): Promise<boolean> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', wallet.toLowerCase())
    .single();
  return profile?.role === 'admin';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet || !(await verifyAdmin(wallet))) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
  }

  const { data } = await supabaseAdmin
    .from('settings')
    .select('key, value')
    .in('key', ['ai_review_enabled']);

  const settings: Record<string, string> = {};
  data?.forEach(row => { settings[row.key] = row.value; });

  return NextResponse.json({
    ok: true,
    ai_review_enabled: settings.ai_review_enabled === 'true',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { admin_wallet, key, value } = body;

    if (!admin_wallet || !(await verifyAdmin(admin_wallet))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    const allowedKeys = ['ai_review_enabled'];
    if (!allowedKeys.includes(key)) {
      return NextResponse.json({ ok: false, error: 'Invalid setting key' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Settings update error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
