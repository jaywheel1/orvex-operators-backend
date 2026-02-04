import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error || !task) {
      return NextResponse.json(
        { ok: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: task });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
