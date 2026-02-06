import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/admin-wallets';
import { ApiResponse, TaskSubmission, ApproveRequest, CpLedgerEntry } from '@/lib/types';

interface ApproveResponseData {
  submission: TaskSubmission;
  cp_ledger_entry: CpLedgerEntry | null;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ApproveResponseData>>> {
  try {
    const body: ApproveRequest = await request.json();
    const { submission_id, operator_id, cp_reward } = body;

    // Input validation
    if (!submission_id || !operator_id) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required fields',
          details: 'submission_id and operator_id are required',
        },
        { status: 400 }
      );
    }

    // Verify the operator has operator or admin role (operator_id is wallet address)
    const isAuthorized = await verifyAdmin(operator_id);
    if (!isAuthorized) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
          details: 'Wallet does not have operator or admin role',
        },
        { status: 403 }
      );
    }

    // Get profile UUID for reviewed_by FK (optional - won't block approval)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('wallet_address', operator_id.toLowerCase())
      .single();

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

    // Create CP ledger entry FIRST before approving submission to ensure atomicity
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
        return NextResponse.json(
          {
            ok: false,
            error: `Failed to create CP ledger entry: ${ledgerError.message}`,
            details: ledgerError.message,
            hint: ledgerError.hint || undefined,
            code: ledgerError.code,
          },
          { status: 500 }
        );
      }
      cpLedgerEntry = ledgerData as CpLedgerEntry;

      // Update user's total points
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('points')
        .eq('id', submission.user_id)
        .single();

      if (userData) {
        await supabaseAdmin
          .from('users')
          .update({ points: (userData.points || 0) + rewardAmount })
          .eq('id', submission.user_id);
      }
    }

    // Now update the submission to approved
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('task_submissions')
      .update({
        status: 'approved',
        rejection_reason: null,
        reviewed_by: profile?.id || null,
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
