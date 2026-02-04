import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ ok: false, error: 'Missing wallet' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', wallet.toLowerCase())
      .single();

    if (error || !data) {
      return NextResponse.json({
        ok: true,
        data: {
          wallet_address: wallet,
          points: 0,
          registration_complete: false,
          tasks_completed: 0,
        },
      });
    }

    const { count: tasksCompleted } = await supabaseAdmin
      .from('task_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', data.id)
      .eq('status', 'approved');

    return NextResponse.json({
      ok: true,
      data: {
        ...data,
        tasks_completed: tasksCompleted || 0,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
