import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  TASK_CATEGORIES,
  TASK_TYPES,
  TaskCategory,
  TaskType,
  SubmitTaskRequest,
  ApiResponse,
  TaskSubmission,
} from '@/lib/types';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

function isValidTaskCategory(value: string): value is TaskCategory {
  return TASK_CATEGORIES.includes(value as TaskCategory);
}

function isValidTaskType(value: string): value is TaskType {
  return TASK_TYPES.includes(value as TaskType);
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<TaskSubmission>>> {
  try {
    const body: SubmitTaskRequest = await request.json();
    const { user_id, task_id, task_category, task_type, proof, cp_reward } = body;

    // Input validation
    const errors: string[] = [];

    if (!user_id || typeof user_id !== 'string') {
      errors.push('user_id is required and must be a string');
    } else if (!isValidUUID(user_id)) {
      errors.push('user_id must be a valid UUID');
    }

    if (!task_id || typeof task_id !== 'string') {
      errors.push('task_id is required and must be a string');
    } else if (!isValidUUID(task_id)) {
      errors.push('task_id must be a valid UUID');
    }

    if (!task_category || typeof task_category !== 'string') {
      errors.push('task_category is required and must be a string');
    } else if (!isValidTaskCategory(task_category)) {
      errors.push(`task_category must be one of: ${TASK_CATEGORIES.join(', ')}`);
    }

    if (!task_type || typeof task_type !== 'string') {
      errors.push('task_type is required and must be a string');
    } else if (!isValidTaskType(task_type)) {
      errors.push(`task_type must be one of: ${TASK_TYPES.join(', ')}`);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation failed',
          details: errors.join('; '),
          hint: 'Check that all required fields are provided with valid values',
        },
        { status: 400 }
      );
    }

    // Derive link_url from proof when task_type is "link"
    let link_url: string | null = null;
    if (task_type === 'link' && proof) {
      // Validate that proof looks like a URL for link-type tasks
      try {
        new URL(proof);
        link_url = proof;
      } catch {
        return NextResponse.json(
          {
            ok: false,
            error: 'Invalid proof URL',
            details: 'For link-type tasks, proof must be a valid URL',
            hint: 'Provide a valid URL starting with http:// or https://',
          },
          { status: 400 }
        );
      }
    }

    // Build insert payload
    const insertPayload = {
      user_id,
      task_id,
      task_category: task_category as TaskCategory,
      task_type: task_type as TaskType,
      proof: proof || null,
      link_url,
      status: 'pending' as const,
      cp_reward: cp_reward ?? 0,
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
    };

    // Insert into task_submissions table
    const { data, error } = await supabaseAdmin
      .from('task_submissions')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);

      // Return detailed error info for debugging
      return NextResponse.json(
        {
          ok: false,
          error: 'Database insert failed',
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
        data: data as TaskSubmission,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Submit task error:', err);

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
