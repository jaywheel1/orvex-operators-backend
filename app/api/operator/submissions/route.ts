import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, TaskSubmission } from '@/lib/types';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TaskSubmission[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const operator_id = searchParams.get('operator_id');
    const status = searchParams.get('status'); // optional filter: pending, approved, rejected
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate operator_id
    if (!operator_id) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing operator_id',
          details: 'operator_id query parameter is required',
          hint: 'Add ?operator_id=<uuid> to the request URL',
        },
        { status: 400 }
      );
    }

    if (!isValidUUID(operator_id)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid operator_id',
          details: 'operator_id must be a valid UUID',
        },
        { status: 400 }
      );
    }

    // Verify the operator has operator or admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', operator_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Operator not found',
          details: 'No profile found for the provided operator_id',
        },
        { status: 404 }
      );
    }

    if (profile.role !== 'operator' && profile.role !== 'admin') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
          details: 'User does not have operator or admin role',
        },
        { status: 403 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('task_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        {
          ok: false,
          error: 'Database query failed',
          details: error.message,
          hint: error.hint || undefined,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: data as TaskSubmission[],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Get submissions error:', err);

    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
        details: message,
      },
      { status: 500 }
    );
  }
}
