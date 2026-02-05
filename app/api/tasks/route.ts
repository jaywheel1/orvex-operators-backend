import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  try {
    // Get all tasks (active + coming_soon for display)
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .order('category', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Get user submission counts if wallet provided
    let submissionMap: Record<string, { approved: number; pending: number; rejected: number }> = {};
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
          for (const sub of subs) {
            if (!submissionMap[sub.task_id]) {
              submissionMap[sub.task_id] = { approved: 0, pending: 0, rejected: 0 };
            }
            if (sub.status === 'approved') submissionMap[sub.task_id].approved++;
            else if (sub.status === 'pending') submissionMap[sub.task_id].pending++;
            else if (sub.status === 'rejected') submissionMap[sub.task_id].rejected++;
          }
        }
      }
    }

    const enrichedTasks = (tasks || []).map((task) => {
      const counts = submissionMap[task.id] || { approved: 0, pending: 0, rejected: 0 };
      const cap = task.cap ?? 1;

      let user_status: string;
      if (task.status === 'coming_soon' || task.status === 'locked') {
        user_status = 'locked';
      } else if (counts.approved >= cap) {
        user_status = 'completed';
      } else if (counts.pending > 0) {
        user_status = 'pending';
      } else {
        user_status = 'available';
      }

      return {
        id: task.id,
        task_key: task.task_key || task.id,
        name: task.name,
        description: task.description,
        category: task.category,
        type: task.type,
        points: task.points,
        verification_type: task.verification_type || 'manual',
        cap,
        frequency: task.frequency || 'once',
        metadata: task.metadata || {},
        status: task.status || 'active',
        user_status,
        completions: counts.approved,
        pending_count: counts.pending,
      };
    });

    return NextResponse.json({ ok: true, data: enrichedTasks });
  } catch (err) {
    console.error('Tasks API error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
