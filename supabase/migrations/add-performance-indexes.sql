-- Performance Optimization Indexes
-- Run these migrations in Supabase SQL Editor to improve query performance

-- Index for leaderboard queries (sort by points descending)
CREATE INDEX IF NOT EXISTS idx_users_points
ON users(points DESC)
WHERE registration_complete = true AND is_banned = false;

-- Index for user lookups by wallet address
CREATE INDEX IF NOT EXISTS idx_users_wallet_address
ON users(wallet_address);

-- Index for task submissions queries
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id
ON task_submissions(user_id);

-- Index for task submissions by status
CREATE INDEX IF NOT EXISTS idx_task_submissions_status
ON task_submissions(status);

-- Index for task submissions by created date
CREATE INDEX IF NOT EXISTS idx_task_submissions_created_at
ON task_submissions(created_at DESC);

-- Composite index for common submission queries (status + created_at)
CREATE INDEX IF NOT EXISTS idx_task_submissions_status_created
ON task_submissions(status, created_at DESC);

-- Index for referral lookups by referrer_id
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id
ON referrals(referrer_id);

-- Index for referral lookups by verified status
CREATE INDEX IF NOT EXISTS idx_referrals_verified
ON referrals(referrer_id, verified);

-- Index for CP ledger lookups by user_id
CREATE INDEX IF NOT EXISTS idx_cp_ledger_user_id
ON cp_ledger(user_id);

-- Index for registration_complete lookups
CREATE INDEX IF NOT EXISTS idx_users_registration_complete
ON users(registration_complete);
