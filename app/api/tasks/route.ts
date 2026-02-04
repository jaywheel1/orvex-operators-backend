import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  try {
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'campaign_live')
      .single();

    if (settings?.value !== 'true') {
      return NextResponse.json({ ok: true, data: [] });
    }

    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    let userSubmissions: Record<string, string> = {};
    if (wallet) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('wallet_address', wallet.toLowerCase())
        .single();

      if (user) {
        const { data: subs } = await supabaseAdmin
          .from('task_submissions')
          .select('task_id, status')
          .eq('user_id', user.id);

        if (subs) {
          userSubmissions = subs.reduce((acc, s) => {
            acc[s.task_id] = s.status;
            return acc;
          }, {} as Record<string, string>);
        }
      }
    }

    const tasksWithStatus = (tasks || []).map((task) => ({
      id: task.id,
      name: task.name,
      description: task.description,
      category: task.category,
      points: task.points,
      status: userSubmissions[task.id]
        ? userSubmissions[task.id] === 'approved'
          ? 'completed'
          : 'pending'
        : 'available',
    }));

    return NextResponse.json({ ok: true, data: tasksWithStatus });
  } catch {
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
