import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAiReviewEnabled, verifyScreenshotTask, verifyLinkTask } from '@/lib/ai-verify';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const wallet_address = formData.get('wallet_address') as string;
    const task_id = formData.get('task_id') as string;
    const proof_url = formData.get('proof_url') as string | null;
    const proof_text = formData.get('proof_text') as string | null;
    const screenshot = formData.get('screenshot') as File | null;

    if (!wallet_address || !task_id) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!proof_url && !screenshot && !proof_text) {
      return NextResponse.json(
        { ok: false, error: 'Please provide proof (URL, screenshot, or description)' },
        { status: 400 }
      );
    }

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, is_banned')
      .eq('wallet_address', wallet_address.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, error: 'User not found. Please complete registration first.' },
        { status: 404 }
      );
    }

    if (user.is_banned) {
      return NextResponse.json(
        { ok: false, error: 'Your account has been suspended.' },
        { status: 403 }
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

    if (task.status !== 'active') {
      return NextResponse.json(
        { ok: false, error: 'This task is not currently active' },
        { status: 400 }
      );
    }

    // Check submission counts for repeatable tasks
    const cap = task.cap ?? 1;
    const { data: existingSubs } = await supabaseAdmin
      .from('task_submissions')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('task_id', task_id);

    const approvedCount = existingSubs?.filter(s => s.status === 'approved').length || 0;
    const pendingCount = existingSubs?.filter(s => s.status === 'pending').length || 0;

    if (approvedCount >= cap) {
      return NextResponse.json(
        { ok: false, error: `You have already completed this task${cap > 1 ? ` the maximum ${cap} times` : ''}` },
        { status: 400 }
      );
    }

    if (pendingCount > 0) {
      return NextResponse.json(
        { ok: false, error: 'You already have a pending submission for this task' },
        { status: 400 }
      );
    }

    // Handle screenshot upload
    let screenshotData: string | null = null;
    let imageBase64: string | null = null;
    let mediaType: string | null = null;
    if (screenshot) {
      const bytes = await screenshot.arrayBuffer();
      const buffer = Buffer.from(bytes);
      mediaType = screenshot.type || 'image/png';
      imageBase64 = buffer.toString('base64');

      // Upload to Supabase storage
      const fileName = `tasks/${wallet_address.toLowerCase()}/${task.task_key || task_id}_${Date.now()}.${screenshot.type.split('/')[1] || 'png'}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('verification-screenshots')
        .upload(fileName, buffer, { contentType: screenshot.type, upsert: true });

      if (uploadError) {
        console.error('Screenshot upload error:', uploadError);
      }

      screenshotData = fileName;
    }

    // Determine proof content
    const proofContent = proof_url || proof_text || screenshotData;

    // Check if AI review is enabled
    const aiEnabled = await isAiReviewEnabled();
    let status = 'pending';
    let aiReason = '';

    if (aiEnabled && task.verification_type !== 'manual' && task.verification_type !== 'auto') {
      // Run AI verification
      if (screenshot && imageBase64 && mediaType && task.verification_type === 'screenshot') {
        const result = await verifyScreenshotTask(
          imageBase64,
          mediaType,
          task.name,
          task.description,
          task.metadata || {}
        );
        status = result.verified ? 'approved' : 'pending';
        aiReason = result.reason;
      } else if (proof_url && task.verification_type === 'link') {
        const result = await verifyLinkTask(
          proof_url,
          task.name,
          task.description,
          task.metadata || {}
        );
        status = result.verified ? 'approved' : 'pending';
        aiReason = result.reason;
      }
    }

    // Create submission
    const { data: submission, error: insertError } = await supabaseAdmin
      .from('task_submissions')
      .insert({
        user_id: user.id,
        task_id: task_id,
        task_category: task.category,
        task_type: screenshot ? 'screenshot' : proof_url ? 'link' : 'form',
        proof: proofContent,
        link_url: proof_url || null,
        status,
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

    // If AI auto-approved, award CP
    if (status === 'approved') {
      await supabaseAdmin.from('cp_ledger').insert({
        user_id: user.id,
        amount: task.points,
        reason: `Task auto-approved (AI): ${task.name}`,
        submission_id: submission.id,
      });

      // Update user points
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('points')
        .eq('id', user.id)
        .single();

      await supabaseAdmin
        .from('users')
        .update({ points: (userData?.points || 0) + task.points })
        .eq('id', user.id);
    }

    return NextResponse.json({
      ok: true,
      data: submission,
      ai_reviewed: aiEnabled && status === 'approved',
      ai_reason: aiReason || undefined,
      message: status === 'approved'
        ? `Task verified and approved! +${task.points} CP`
        : 'Submission received. It will be reviewed shortly.',
    });
  } catch (err) {
    console.error('Submit task error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
