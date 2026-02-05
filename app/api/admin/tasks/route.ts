import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/admin-wallets';

// GET all tasks (admin view)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet || !(await verifyAdmin(wallet))) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
  }

  const { data: tasks, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .order('category', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: tasks });
}

// POST create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { admin_wallet, name, description, category, verification_type, points, cap, frequency, metadata, status } = body;

    if (!admin_wallet || !(await verifyAdmin(admin_wallet))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    if (!name || !category) {
      return NextResponse.json({ ok: false, error: 'Name and category are required' }, { status: 400 });
    }

    // Generate task_key from name
    const task_key = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        name,
        description: description || '',
        category,
        type: verification_type === 'screenshot' ? 'screenshot' : 'link',
        points: points || 10,
        active: status !== 'coming_soon',
        task_key,
        verification_type: verification_type || 'manual',
        cap: cap || 1,
        frequency: frequency || 'once',
        metadata: metadata || {},
        status: status || 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: task });
  } catch (err) {
    console.error('Create task error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

// PUT update existing task
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { admin_wallet, task_id, ...updates } = body;

    if (!admin_wallet || !(await verifyAdmin(admin_wallet))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    if (!task_id) {
      return NextResponse.json({ ok: false, error: 'task_id is required' }, { status: 400 });
    }

    // Build update object with only allowed fields
    const allowedFields: Record<string, unknown> = {};
    if (updates.name !== undefined) allowedFields.name = updates.name;
    if (updates.description !== undefined) allowedFields.description = updates.description;
    if (updates.category !== undefined) allowedFields.category = updates.category;
    if (updates.points !== undefined) allowedFields.points = updates.points;
    if (updates.verification_type !== undefined) allowedFields.verification_type = updates.verification_type;
    if (updates.cap !== undefined) allowedFields.cap = updates.cap;
    if (updates.frequency !== undefined) allowedFields.frequency = updates.frequency;
    if (updates.metadata !== undefined) allowedFields.metadata = updates.metadata;
    if (updates.status !== undefined) {
      allowedFields.status = updates.status;
      allowedFields.active = updates.status === 'active';
    }

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .update(allowedFields)
      .eq('id', task_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: task });
  } catch (err) {
    console.error('Update task error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

// DELETE remove a task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const task_id = searchParams.get('task_id');

    if (!wallet || !(await verifyAdmin(wallet))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 });
    }

    if (!task_id) {
      return NextResponse.json({ ok: false, error: 'task_id is required' }, { status: 400 });
    }

    // Check if task has any submissions
    const { count } = await supabaseAdmin
      .from('task_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', task_id);

    if (count && count > 0) {
      // Soft delete - just deactivate
      const { error } = await supabaseAdmin
        .from('tasks')
        .update({ active: false, status: 'locked' })
        .eq('id', task_id);

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        message: 'Task deactivated (has existing submissions)',
      });
    }

    // Hard delete if no submissions
    const { error } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', task_id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
