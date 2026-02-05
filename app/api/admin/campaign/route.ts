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

    const { live } = await request.json();

    if (typeof live !== 'boolean') {
      return NextResponse.json(
        { ok: false, error: 'Invalid request parameters' },
        { status: 400 }
      );
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
