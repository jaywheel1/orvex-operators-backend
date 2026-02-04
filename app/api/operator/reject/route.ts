import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, TaskSubmission, RejectRequest } from '@/lib/types';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TaskSubmission>>> {
  try {
    const body: RejectRequest = await request.json();
    const { submission_id, operator_id, rejection_reason } = body;

    // Input validation
    const errors: string[] = [];

    if (!submission_id || typeof submission_id !== 'string') {
      errors.push('submission_id is required');
    } else if (!isValidUUID(submission_id)) {
      errors.push('submission_id must be a valid UUID');
    }

    if (!operator_id || typeof operator_id !== 'string') {
      errors.push('operator_id is required');
    } else if (!isValidUUID(operator_id)) {
      errors.push('operator_id must be a valid UUID');
    }

    if (!rejection_reason || typeof rejection_reason !== 'string' || rejection_reason.trim().length === 0) {
      errors.push('rejection_reason is required and must be non-empty');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation failed',
          details: errors.join('; '),
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

    // Check if submission exists and is pending
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('task_submissions')
      .select('*')
      .eq('id', submission_id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Submission not found',
          details: 'No submission found with the provided ID',
        },
        { status: 404 }
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Cannot reject',
          details: `Submission has already been ${submission.status}`,
          hint: 'Only pending submissions can be rejected',
        },
        { status: 400 }
      );
    }

    // Update the submission to rejected
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('task_submissions')
      .update({
        status: 'rejected',
        rejection_reason: rejection_reason.trim(),
        reviewed_by: operator_id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submission_id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        {
          ok: false,
          error: 'Database update failed',
          details: updateError.message,
          hint: updateError.hint || undefined,
          code: updateError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: updated as TaskSubmission,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Reject submission error:', err);

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
