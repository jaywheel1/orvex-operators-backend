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
-- 4. SEED ALL TASKS (51 total across 5 categories)
-- Uses ON CONFLICT to safely update existing tasks
-- =====================

-- =====================
-- 4a. SOCIAL OPERATIONS (7 tasks - all active)
-- Category max CP: 4,400
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Follow Orvex on X', 'Follow @OrvexFi. First signal received.', 'social', 'screenshot', 100, true, 'follow-orvex', 'screenshot', 1, 'once', '{"target_account": "@OrvexFi"}', 'active'),
  ('Follow Status Network on X', 'Follow @StatusNetwork. Monitor the network.', 'social', 'screenshot', 100, true, 'follow-status', 'screenshot', 1, 'once', '{"target_account": "@StatusNetwork"}', 'active'),
  ('Join Orvex Community', 'Enter the Orvex X Community. Join the operator channel.', 'social', 'screenshot', 300, true, 'join-community', 'screenshot', 1, 'once', '{}', 'active'),
  ('Retweet Campaign Signal', 'Amplify an official Orvex signal. Retweet a campaign post.', 'social', 'link', 50, true, 'retweet', 'link', 8, 'unlimited', '{"tweet_url": ""}', 'active'),
  ('Quote Tweet with Commentary', 'Quote an Orvex post. Add your take. Minimum 20 words of original commentary.', 'social', 'link', 100, true, 'quote-tweet', 'link', 5, 'weekly', '{"tweet_url": ""}', 'active'),
  ('Create Original Content', 'Publish original Orvex content — thread, article, or video. Reviewed for quality.', 'social', 'link', 500, true, 'create-content', 'manual', 4, 'weekly', '{}', 'active'),
  ('Recruit an Operator', 'Share your recruitment link. Earn CP when new operators complete registration.', 'social', 'link', 200, true, 'refer-friend', 'auto', 5, 'unlimited', '{}', 'active')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency,
  metadata = EXCLUDED.metadata, status = EXCLUDED.status, active = EXCLUDED.active, category = EXCLUDED.category;

-- =====================
-- 4b. TRADING OPERATIONS (11 tasks - all coming soon)
-- Category max CP: 11,650
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Execute First Swap', 'Execute your first swap on the Orvex testnet.', 'trading', 'link', 200, false, 'first-swap', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Execute Swap', 'Execute a swap on any Orvex pool.', 'trading', 'link', 25, false, 'swap-testnet', 'onchain', 80, 'daily', '{}', 'coming_soon'),
  ('Route Across 5+ Pairs', 'Execute swaps across 5+ unique token pairs.', 'trading', 'link', 100, false, 'swap-pairs', 'onchain', 10, 'unlimited', '{}', 'coming_soon'),
  ('Volume Milestone: $1K', 'Cumulative swap volume reaches $1,000.', 'trading', 'link', 200, false, 'volume-1k', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Volume Milestone: $5K', 'Cumulative swap volume reaches $5,000.', 'trading', 'link', 300, false, 'volume-5k', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Volume Milestone: $10K', 'Cumulative swap volume reaches $10,000.', 'trading', 'link', 500, false, 'volume-10k', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Daily Active Operator', 'Execute at least one swap per calendar day (UTC).', 'trading', 'link', 100, false, 'daily-trader', 'onchain', 40, 'daily', '{}', 'coming_soon'),
  ('Execute Limit Order', 'Place and execute a limit order on testnet.', 'trading', 'link', 50, false, 'limit-order', 'onchain', 20, 'unlimited', '{}', 'coming_soon'),
  ('Multi-Hop Route', 'Execute a swap routed through 3+ liquidity pools.', 'trading', 'link', 75, false, 'multi-hop', 'onchain', 30, 'unlimited', '{}', 'coming_soon'),
  ('Bridge to Status Testnet', 'Bridge assets to Status Network testnet.', 'trading', 'link', 150, false, 'bridge-assets', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Test Slippage Controls', 'Adjust slippage tolerance settings and execute a swap.', 'trading', 'link', 50, false, 'test-slippage', 'onchain', 1, 'once', '{}', 'coming_soon')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency,
  metadata = EXCLUDED.metadata, status = EXCLUDED.status, active = EXCLUDED.active, category = EXCLUDED.category;

-- =====================
-- 4c. LIQUIDITY OPERATIONS (13 tasks - all coming soon)
-- Category max CP: 24,500
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Deploy First Position', 'Deploy your first liquidity position on Orvex.', 'liquidity', 'link', 300, false, 'first-lp', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Deploy Liquidity', 'Deploy liquidity to any Orvex pool.', 'liquidity', 'link', 100, false, 'provide-lp', 'onchain', 50, 'unlimited', '{}', 'coming_soon'),
  ('Deploy Across 3+ Pools', 'Maintain active positions across 3+ pools.', 'liquidity', 'link', 200, false, 'lp-3-pools', 'onchain', 8, 'unlimited', '{}', 'coming_soon'),
  ('Hold Position 7 Days', 'Maintain a deployed position for 7 consecutive days.', 'liquidity', 'link', 500, false, 'maintain-lp-7d', 'onchain', 4, 'weekly', '{}', 'coming_soon'),
  ('Hold Position 14 Days', 'Maintain a deployed position for 14 consecutive days.', 'liquidity', 'link', 1000, false, 'maintain-lp-14d', 'onchain', 2, 'unlimited', '{}', 'coming_soon'),
  ('Deployment Milestone: $500', 'Cumulative deployed liquidity reaches $500.', 'liquidity', 'link', 200, false, 'lp-volume-500', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Deployment Milestone: $2K', 'Cumulative deployed liquidity reaches $2,000.', 'liquidity', 'link', 400, false, 'lp-volume-2k', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Deployment Milestone: $5K', 'Cumulative deployed liquidity reaches $5,000.', 'liquidity', 'link', 800, false, 'lp-volume-5k', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Concentrated Position', 'Deploy a concentrated liquidity position with a defined range.', 'liquidity', 'link', 150, false, 'concentrated-lp', 'onchain', 20, 'unlimited', '{}', 'coming_soon'),
  ('Rebalance Position', 'Adjust your position range. Rebalance to optimise depth.', 'liquidity', 'link', 75, false, 'rebalance-lp', 'onchain', 40, 'unlimited', '{}', 'coming_soon'),
  ('Multi-Pool Deployment', 'Hold active positions across 3+ pools at the same time.', 'liquidity', 'link', 300, false, 'multi-pool-lp', 'onchain', 10, 'weekly', '{}', 'coming_soon'),
  ('Weekly Deployment', 'Deploy liquidity during each campaign week.', 'liquidity', 'link', 200, false, 'weekly-lp', 'onchain', 8, 'weekly', '{}', 'coming_soon'),
  ('Cycle Liquidity', 'Remove and re-deploy liquidity. Test the full cycle.', 'liquidity', 'link', 50, false, 'remove-readd-lp', 'onchain', 30, 'unlimited', '{}', 'coming_soon')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency,
  metadata = EXCLUDED.metadata, status = EXCLUDED.status, active = EXCLUDED.active, category = EXCLUDED.category;

-- =====================
-- 4d. ADVANCED OPERATIONS (11 tasks - 5 active, 6 coming soon)
-- Category max CP: 18,500
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Vote on Gauge Allocation', 'Allocate your vote to a gauge. Direct incentives.', 'advanced', 'link', 100, false, 'vote-gauge', 'onchain', 20, 'weekly', '{}', 'coming_soon'),
  ('Lock Tokens (veNFT)', 'Lock tokens to create a veNFT. Unlock governance power.', 'advanced', 'link', 300, false, 'lock-tokens', 'onchain', 5, 'unlimited', '{}', 'coming_soon'),
  ('Create New Pool', 'Deploy a new liquidity pool on Orvex testnet.', 'advanced', 'link', 500, false, 'create-pool', 'onchain', 3, 'unlimited', '{}', 'coming_soon'),
  ('Governance Vote', 'Vote on an active governance proposal.', 'advanced', 'link', 200, false, 'governance-vote', 'onchain', 8, 'unlimited', '{}', 'coming_soon'),
  ('Submit Protocol Feedback', 'Submit detailed feedback on Orvex — UI, execution, docs, or strategy. Min 100 words.', 'advanced', 'link', 150, true, 'provide-feedback', 'manual', 12, 'weekly', '{}', 'active'),
  ('Report Verified Bug', 'Report a bug with clear reproduction steps. Verified by the dev team.', 'advanced', 'link', 500, true, 'report-bug', 'manual', 6, 'unlimited', '{}', 'active'),
  ('Early Access Testing', 'Test a newly released feature. Submit findings.', 'advanced', 'link', 300, false, 'test-feature', 'manual', 8, 'unlimited', '{}', 'coming_soon'),
  ('Attend X Space / AMA', 'Join an official Orvex X Space or AMA. Engage in the discussion.', 'advanced', 'screenshot', 300, true, 'x-space', 'manual', 8, 'weekly', '{}', 'active'),
  ('Complete Training Module', 'Complete an Orvex or Status Network training module.', 'advanced', 'link', 100, true, 'complete-tutorial', 'auto', 15, 'unlimited', '{}', 'active'),
  ('Stress Test Deployment', 'Participate in a coordinated testnet stress test event.', 'advanced', 'link', 500, false, 'stress-test', 'manual', 2, 'unlimited', '{}', 'coming_soon'),
  ('Community Signal', 'Post meaningfully in the Orvex X Community. Quality over quantity.', 'advanced', 'link', 50, true, 'community-engage', 'manual', 16, 'weekly', '{}', 'active')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency,
  metadata = EXCLUDED.metadata, status = EXCLUDED.status, active = EXCLUDED.active, category = EXCLUDED.category;

-- =====================
-- 4e. CONSISTENCY BONUS (9 tasks - 2 active, 7 coming soon)
-- Category max CP: 15,900
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Weekly Active Operator', 'Execute at least one operation per campaign week.', 'consistency', 'link', 200, false, 'weekly-active', 'onchain', 8, 'weekly', '{}', 'coming_soon'),
  ('Perfect Execution Week', 'Execute a swap + deploy liquidity + vote in the same week.', 'consistency', 'link', 500, false, 'perfect-week', 'onchain', 8, 'weekly', '{}', 'coming_soon'),
  ('3-Week Operations Streak', 'Maintain active operations for 3 consecutive weeks.', 'consistency', 'link', 400, false, 'streak-3w', 'onchain', 2, 'unlimited', '{}', 'coming_soon'),
  ('5-Week Operations Streak', 'Maintain active operations for 5 consecutive weeks.', 'consistency', 'link', 1000, false, 'streak-5w', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Full Campaign Deployment', 'Active in all 8 campaign weeks. The ultimate consistency signal.', 'consistency', 'link', 3000, false, 'full-8w', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Early Deployer (Week 1)', 'Register and execute an operation in Week 1.', 'consistency', 'link', 500, true, 'early-adopter', 'auto', 1, 'once', '{}', 'active'),
  ('First 100 Operators', 'Among the first 100 operators to enter the Vortex.', 'consistency', 'link', 1000, true, 'testnet-og', 'auto', 1, 'once', '{}', 'active'),
  ('Top 50 Finish', 'Finish in the top 50 on the operator leaderboard.', 'consistency', 'link', 2000, false, 'grand-marshal', 'auto', 1, 'once', '{}', 'coming_soon'),
  ('First to Architect', 'First operator to reach Architect rank. 10x confirmed.', 'consistency', 'link', 2000, false, 'first-architect', 'auto', 1, 'once', '{}', 'coming_soon')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency,
  metadata = EXCLUDED.metadata, status = EXCLUDED.status, active = EXCLUDED.active, category = EXCLUDED.category;

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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- DONE! Verify:
-- =====================
SELECT 'Setup complete!' as status, count(*) as total_tasks FROM tasks;
SELECT task_key, name, category, status, points FROM tasks ORDER BY category, name;
