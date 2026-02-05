-- ============================================================
-- ORVEX COMPLETE SETUP - Run this in Supabase SQL Editor
-- ============================================================
-- This script is safe to run multiple times (idempotent)
-- It will: set up admin, add task columns, seed all tasks,
-- and create the storage bucket for screenshots.
-- ============================================================

-- =====================
-- 1. ADD ADMIN WALLET
-- =====================
-- Add wallet_address column to profiles (if not exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Insert admin profile (your wallet)
INSERT INTO profiles (id, role, wallet_address)
VALUES (gen_random_uuid(), 'admin', '0xc4a00be797e0acfe8518f795359898b01a038dc8')
ON CONFLICT DO NOTHING;

-- Also ensure if there's an existing profile for this wallet, it has admin role
UPDATE profiles SET role = 'admin'
WHERE wallet_address = '0xc4a00be797e0acfe8518f795359898b01a038dc8';

-- =====================
-- 2. EXTEND TASKS TABLE
-- =====================
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_key TEXT UNIQUE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS verification_type TEXT DEFAULT 'manual';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cap INTEGER DEFAULT 1;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'once';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_task_key ON tasks(task_key);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- =====================
-- 3. CLEAR OLD TASKS
-- =====================
-- Remove old sample/placeholder tasks that don't have a task_key
DELETE FROM tasks WHERE task_key IS NULL;

-- =====================
-- 4. SEED SOCIAL TASKS
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Follow Orvex on X', 'Follow @OrvexFi on X/Twitter', 'social', 'screenshot', 100, true, 'follow-orvex', 'screenshot', 1, 'once', '{"target_account": "@OrvexFi"}', 'active'),
  ('Follow Status Network on X', 'Follow @StatusNetwork on X/Twitter', 'social', 'screenshot', 100, true, 'follow-status', 'screenshot', 1, 'once', '{"target_account": "@StatusNetwork"}', 'active'),
  ('Join Orvex Community', 'Join the Orvex community on X', 'social', 'screenshot', 300, true, 'join-community', 'screenshot', 1, 'once', '{}', 'active'),
  ('Retweet Announcement', 'Retweet an official Orvex announcement', 'social', 'link', 50, true, 'retweet', 'link', 8, 'unlimited', '{"tweet_url": ""}', 'active'),
  ('Quote Tweet with Thoughts', 'Quote tweet an Orvex post with your thoughts', 'social', 'link', 100, true, 'quote-tweet', 'link', 5, 'weekly', '{"tweet_url": ""}', 'active'),
  ('Create Orvex Content', 'Create original content about Orvex (threads, videos, articles)', 'social', 'link', 500, true, 'create-content', 'manual', 4, 'weekly', '{}', 'active'),
  ('Refer a Friend', 'Invite a friend who completes registration', 'social', 'link', 200, true, 'refer-friend', 'auto', 5, 'unlimited', '{}', 'active')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency;

-- =====================
-- 5. SEED ADVANCED TASKS
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Provide Detailed Feedback', 'Submit detailed product feedback', 'advanced', 'link', 150, true, 'provide-feedback', 'manual', 12, 'weekly', '{}', 'active'),
  ('Report Bug', 'Report a verified bug with reproduction steps', 'advanced', 'link', 500, true, 'report-bug', 'manual', 6, 'unlimited', '{}', 'active'),
  ('Participate in X Space/AMA', 'Join and engage in an official X Space', 'advanced', 'screenshot', 300, true, 'x-space', 'manual', 8, 'weekly', '{}', 'active'),
  ('Complete Tutorial', 'Finish an education module or tutorial', 'advanced', 'link', 100, true, 'complete-tutorial', 'link', 15, 'unlimited', '{}', 'active'),
  ('Community Engagement', 'Meaningful engagement in X Community', 'advanced', 'link', 50, true, 'community-engage', 'manual', 16, 'weekly', '{}', 'active')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency;

-- =====================
-- 6. SEED CONSISTENCY TASKS
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Early Adopter (Week 1)', 'Register and participate in Week 1', 'consistency', 'link', 500, true, 'early-adopter', 'auto', 1, 'once', '{}', 'active'),
  ('Testnet OG', 'Among the first 100 users to register', 'consistency', 'link', 1000, true, 'testnet-og', 'auto', 1, 'once', '{}', 'active')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points;

-- =====================
-- 7. SEED COMING SOON TASKS
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Complete First Swap', 'Execute your first swap on the testnet', 'trading', 'link', 200, false, 'first-swap', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Swap on Testnet', 'Complete a swap transaction', 'trading', 'link', 25, false, 'swap-testnet', 'onchain', 80, 'daily', '{}', 'coming_soon'),
  ('Add First Liquidity', 'Create your first liquidity position', 'liquidity', 'link', 300, false, 'first-lp', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Weekly Active', 'Complete at least one transaction per week', 'consistency', 'link', 200, false, 'weekly-active', 'onchain', 8, 'weekly', '{}', 'coming_soon')
ON CONFLICT (task_key) DO UPDATE SET
  status = EXCLUDED.status, active = EXCLUDED.active;

-- =====================
-- 8. SETTINGS TABLE
-- =====================
INSERT INTO settings (key, value) VALUES ('ai_review_enabled', 'false')
ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('ai_registration_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- =====================
-- 9. STORAGE BUCKET
-- =====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-screenshots', 'verification-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- =====================
-- 10. TRIGGERS
-- =====================
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- DONE! Verify:
-- =====================
SELECT 'Setup complete!' as status, count(*) as total_tasks FROM tasks;
SELECT task_key, name, category, status, points FROM tasks ORDER BY category, name;
