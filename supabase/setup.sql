-- Orvex Operators Database Setup
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Profiles table (for user roles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'operator', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Task submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  task_id UUID NOT NULL,
  task_category TEXT NOT NULL CHECK (task_category IN ('social', 'trading', 'liquidity', 'advanced', 'consistency')),
  task_type TEXT NOT NULL CHECK (task_type IN ('screenshot', 'link', 'form', 'auto')),
  proof TEXT,
  link_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  cp_reward INTEGER DEFAULT 0,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CP Ledger table (tracks community points)
CREATE TABLE IF NOT EXISTS cp_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  submission_id UUID REFERENCES task_submissions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON task_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON task_submissions(status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_created_at ON task_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cp_ledger_user_id ON cp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_cp_ledger_submission_id ON cp_ledger(submission_id);

-- 5. Create the operator profile (replace with your actual operator UUID if different)
INSERT INTO profiles (id, role)
VALUES ('c7f5ad71-2dde-4faa-ad68-1cdc1caf3f9f', 'operator')
ON CONFLICT (id) DO UPDATE SET role = 'operator';

-- 6. Create a test user profile (for testing submissions)
INSERT INTO profiles (id, role)
VALUES ('11111111-1111-1111-1111-111111111111', 'user')
ON CONFLICT (id) DO NOTHING;

-- 7. Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Apply trigger to tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_submissions_updated_at ON task_submissions;
CREATE TRIGGER update_task_submissions_updated_at
  BEFORE UPDATE ON task_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify setup
SELECT 'Setup complete! Tables created:' as message;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'task_submissions', 'cp_ledger');
