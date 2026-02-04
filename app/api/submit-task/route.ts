import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const wallet_address = formData.get('wallet_address') as string;
    const task_id = formData.get('task_id') as string;
    const proof_url = formData.get('proof_url') as string | null;
    const screenshot = formData.get('screenshot') as File | null;

    // Validate required fields
    if (!wallet_address || !task_id) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!proof_url && !screenshot) {
      return NextResponse.json(
        { ok: false, error: 'Please provide a proof URL or screenshot' },
        { status: 400 }
      );
    }

    // Get user by wallet address
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: 'User not found. Please complete registration first.' },
        { status: 404 }
      );
    }

    // Get task details
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', task_id)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { ok: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if user already submitted this task
    const { data: existingSubmission } = await supabaseAdmin
      .from('task_submissions')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('task_id', task_id)
      .single();

    if (existingSubmission) {
      if (existingSubmission.status === 'pending') {
        return NextResponse.json(
          { ok: false, error: 'You already have a pending submission for this task' },
          { status: 400 }
        );
      }
      if (existingSubmission.status === 'approved') {
        return NextResponse.json(
          { ok: false, error: 'You have already completed this task' },
          { status: 400 }
        );
      }
      // If rejected, allow resubmission by deleting old submission
      await supabaseAdmin
        .from('task_submissions')
        .delete()
        .eq('id', existingSubmission.id);
    }

    // Handle screenshot upload (store as base64 for simplicity)
    let screenshot_data: string | null = null;
    if (screenshot) {
      const bytes = await screenshot.arrayBuffer();
      const buffer = Buffer.from(bytes);
      screenshot_data = `data:${screenshot.type};base64,${buffer.toString('base64')}`;
    }

    // Create submission
    const { data: submission, error: insertError } = await supabaseAdmin
      .from('task_submissions')
      .insert({
        user_id: user.id,
        task_id: task_id,
        task_category: task.category,
        task_type: proof_url ? 'link' : 'screenshot',
        proof: proof_url || screenshot_data,
        link_url: proof_url || null,
        status: 'pending',
        cp_reward: task.points,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { ok: false, error: 'Failed to submit task', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: submission,
    });
  } catch (err) {
    console.error('Submit task error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
