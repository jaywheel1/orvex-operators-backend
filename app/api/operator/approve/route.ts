import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, TaskSubmission, ApproveRequest, CpLedgerEntry } from '@/lib/types';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

interface ApproveResponseData {
  submission: TaskSubmission;
  cp_ledger_entry: CpLedgerEntry | null;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ApproveResponseData>>> {
  try {
    const body: ApproveRequest = await request.json();
    const { submission_id, operator_id, cp_reward } = body;

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

    if (cp_reward !== undefined && (typeof cp_reward !== 'number' || cp_reward < 0)) {
      errors.push('cp_reward must be a non-negative number if provided');
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
          error: 'Cannot approve',
          details: `Submission has already been ${submission.status}`,
          hint: 'Only pending submissions can be approved',
        },
        { status: 400 }
      );
    }

    // Determine CP reward amount - use provided value, submission's stored value, or default to 10
    const rewardAmount = cp_reward ?? submission.cp_reward ?? 10;

    // Update the submission to approved
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('task_submissions')
      .update({
        status: 'approved',
        rejection_reason: null,
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

    // Create CP ledger entry for the reward
    let cpLedgerEntry: CpLedgerEntry | null = null;

    if (rewardAmount > 0) {
      const { data: ledgerData, error: ledgerError } = await supabaseAdmin
        .from('cp_ledger')
        .insert({
          user_id: submission.user_id,
          amount: rewardAmount,
          reason: `Task approved: ${submission.task_category} - ${submission.task_type}`,
          submission_id: submission_id,
        })
        .select()
        .single();

      if (ledgerError) {
        console.error('CP ledger insert error:', ledgerError);
        // Note: submission is already approved, so we log the error but don't fail
        // In production, you might want to use a transaction or compensation logic
        console.warn('Submission approved but CP ledger entry failed. Manual intervention may be needed.');
      } else {
        cpLedgerEntry = ledgerData as CpLedgerEntry;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          submission: updated as TaskSubmission,
          cp_ledger_entry: cpLedgerEntry,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Approve submission error:', err);

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
