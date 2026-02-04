// Task category enum - must match DB constraint
export const TASK_CATEGORIES = ['social', 'trading', 'liquidity', 'advanced', 'consistency'] as const;
export type TaskCategory = typeof TASK_CATEGORIES[number];

// Task type enum - must match DB constraint
export const TASK_TYPES = ['screenshot', 'link', 'form', 'auto'] as const;
export type TaskType = typeof TASK_TYPES[number];

// Submission status enum
export const SUBMISSION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type SubmissionStatus = typeof SUBMISSION_STATUSES[number];

// Task submission record
export interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  task_category: TaskCategory;
  task_type: TaskType;
  proof: string | null;
  link_url: string | null;
  status: SubmissionStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// CP Ledger entry
export interface CpLedgerEntry {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  submission_id: string | null;
  created_at: string;
}

// API response types
export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
  details?: string;
  hint?: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Request body types
export interface SubmitTaskRequest {
  user_id: string;
  task_id: string;
  task_category: string;
  task_type: string;
  proof?: string;
  cp_reward?: number;
}

export interface RejectRequest {
  submission_id: string;
  operator_id: string;
  rejection_reason: string;
}

export interface ApproveRequest {
  submission_id: string;
  operator_id: string;
  cp_reward?: number;
}
