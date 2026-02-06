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
  ('Follow Orvex on X', 'Follow @OrvexFi on X/Twitter', 'social', 'screenshot', 100, true, 'follow-orvex', 'screenshot', 1, 'once', '{"target_account": "@OrvexFi"}', 'active'),
  ('Follow Status Network on X', 'Follow @StatusNetwork on X/Twitter', 'social', 'screenshot', 100, true, 'follow-status', 'screenshot', 1, 'once', '{"target_account": "@StatusNetwork"}', 'active'),
  ('Join Orvex Community', 'Join the Orvex community on X', 'social', 'screenshot', 300, true, 'join-community', 'screenshot', 1, 'once', '{}', 'active'),
  ('Retweet Announcement', 'Retweet an official Orvex announcement', 'social', 'link', 50, true, 'retweet', 'link', 8, 'unlimited', '{"tweet_url": ""}', 'active'),
  ('Quote Tweet with Thoughts', 'Quote tweet an Orvex post with your thoughts', 'social', 'link', 100, true, 'quote-tweet', 'link', 5, 'weekly', '{"tweet_url": ""}', 'active'),
  ('Create Orvex Content', 'Create original content about Orvex (threads, videos, articles)', 'social', 'link', 500, true, 'create-content', 'manual', 4, 'weekly', '{}', 'active'),
  ('Refer a Friend', 'Invite a friend who completes registration', 'social', 'link', 200, true, 'refer-friend', 'auto', 5, 'unlimited', '{}', 'active')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency,
  metadata = EXCLUDED.metadata, status = EXCLUDED.status, active = EXCLUDED.active, category = EXCLUDED.category;

-- =====================
-- 4b. TRADING OPERATIONS (11 tasks - all coming soon)
-- Category max CP: 11,650
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Complete First Swap', 'Execute your first swap on the testnet', 'trading', 'link', 200, false, 'first-swap', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Swap on Testnet', 'Complete a swap transaction', 'trading', 'link', 25, false, 'swap-testnet', 'onchain', 80, 'daily', '{}', 'coming_soon'),
  ('Swap 5+ Different Pairs', 'Trade across 5 or more unique token pairs', 'trading', 'link', 100, false, 'swap-pairs', 'onchain', 10, 'unlimited', '{}', 'coming_soon'),
  ('Trade Volume $1K', 'Reach $1,000 in total trading volume', 'trading', 'link', 200, false, 'volume-1k', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Trade Volume $5K', 'Reach $5,000 in total trading volume', 'trading', 'link', 300, false, 'volume-5k', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Trade Volume $10K', 'Reach $10,000 in total trading volume', 'trading', 'link', 500, false, 'volume-10k', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Daily Active Trader', 'Make at least one trade per day', 'trading', 'link', 100, false, 'daily-trader', 'onchain', 40, 'daily', '{}', 'coming_soon'),
  ('Execute Limit Order', 'Place and execute a limit order', 'trading', 'link', 50, false, 'limit-order', 'onchain', 20, 'unlimited', '{}', 'coming_soon'),
  ('Multi-hop Swap', 'Execute a swap through 3+ pools', 'trading', 'link', 75, false, 'multi-hop', 'onchain', 30, 'unlimited', '{}', 'coming_soon'),
  ('Bridge Assets', 'Bridge assets to Status testnet', 'trading', 'link', 150, false, 'bridge-assets', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Test Slippage Settings', 'Adjust and test slippage tolerance', 'trading', 'link', 50, false, 'test-slippage', 'onchain', 1, 'once', '{}', 'coming_soon')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency,
  metadata = EXCLUDED.metadata, status = EXCLUDED.status, active = EXCLUDED.active, category = EXCLUDED.category;

-- =====================
-- 4c. LIQUIDITY OPERATIONS (13 tasks - all coming soon)
-- Category max CP: 24,500
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Add First Liquidity', 'Create your first liquidity position', 'liquidity', 'link', 300, false, 'first-lp', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Provide Liquidity', 'Add liquidity to any pool', 'liquidity', 'link', 100, false, 'provide-lp', 'onchain', 50, 'unlimited', '{}', 'coming_soon'),
  ('LP in 3+ Pools', 'Have active positions in 3+ different pools', 'liquidity', 'link', 200, false, 'lp-3-pools', 'onchain', 8, 'unlimited', '{}', 'coming_soon'),
  ('Maintain LP 7 Days', 'Keep liquidity position for 7 consecutive days', 'liquidity', 'link', 500, false, 'maintain-lp-7d', 'onchain', 4, 'weekly', '{}', 'coming_soon'),
  ('Maintain LP 14 Days', 'Keep liquidity position for 14 consecutive days', 'liquidity', 'link', 1000, false, 'maintain-lp-14d', 'onchain', 2, 'unlimited', '{}', 'coming_soon'),
  ('LP Volume $500', 'Reach $500 in total LP value', 'liquidity', 'link', 200, false, 'lp-volume-500', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('LP Volume $2K', 'Reach $2,000 in total LP value', 'liquidity', 'link', 400, false, 'lp-volume-2k', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('LP Volume $5K', 'Reach $5,000 in total LP value', 'liquidity', 'link', 800, false, 'lp-volume-5k', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Concentrated LP Position', 'Create a concentrated liquidity position', 'liquidity', 'link', 150, false, 'concentrated-lp', 'onchain', 20, 'unlimited', '{}', 'coming_soon'),
  ('Rebalance LP Position', 'Adjust your LP position range', 'liquidity', 'link', 75, false, 'rebalance-lp', 'onchain', 40, 'unlimited', '{}', 'coming_soon'),
  ('Multi-pool LP', 'Maintain positions in 3+ pools simultaneously', 'liquidity', 'link', 300, false, 'multi-pool-lp', 'onchain', 10, 'weekly', '{}', 'coming_soon'),
  ('Weekly LP Provider', 'Provide liquidity each week', 'liquidity', 'link', 200, false, 'weekly-lp', 'onchain', 8, 'weekly', '{}', 'coming_soon'),
  ('Remove & Re-add LP', 'Cycle liquidity to test the process', 'liquidity', 'link', 50, false, 'remove-readd-lp', 'onchain', 30, 'unlimited', '{}', 'coming_soon')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency,
  metadata = EXCLUDED.metadata, status = EXCLUDED.status, active = EXCLUDED.active, category = EXCLUDED.category;

-- =====================
-- 4d. ADVANCED OPERATIONS (11 tasks - 5 active, 6 coming soon)
-- Category max CP: 18,500
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Vote on Gauge Weights', 'Participate in gauge weight voting', 'advanced', 'link', 100, false, 'vote-gauge', 'onchain', 20, 'weekly', '{}', 'coming_soon'),
  ('Lock Tokens', 'Lock tokens for voting power', 'advanced', 'link', 300, false, 'lock-tokens', 'onchain', 5, 'unlimited', '{}', 'coming_soon'),
  ('Create Liquidity Pool', 'Create a new liquidity pool', 'advanced', 'link', 500, false, 'create-pool', 'onchain', 3, 'unlimited', '{}', 'coming_soon'),
  ('Governance Vote', 'Vote on a governance proposal', 'advanced', 'link', 200, false, 'governance-vote', 'onchain', 8, 'unlimited', '{}', 'coming_soon'),
  ('Provide Detailed Feedback', 'Submit detailed product feedback', 'advanced', 'link', 150, true, 'provide-feedback', 'manual', 12, 'weekly', '{}', 'active'),
  ('Report Bug', 'Report a verified bug with reproduction steps', 'advanced', 'link', 500, true, 'report-bug', 'manual', 6, 'unlimited', '{}', 'active'),
  ('Test New Feature', 'Participate in early access feature testing', 'advanced', 'link', 300, false, 'test-feature', 'manual', 8, 'unlimited', '{}', 'coming_soon'),
  ('Participate in X Space/AMA', 'Join and engage in an official X Space', 'advanced', 'screenshot', 300, true, 'x-space', 'manual', 8, 'weekly', '{}', 'active'),
  ('Complete Tutorial', 'Finish an education module or tutorial', 'advanced', 'link', 100, true, 'complete-tutorial', 'auto', 15, 'unlimited', '{}', 'active'),
  ('Stress Test Participation', 'Participate in coordinated stress testing', 'advanced', 'link', 500, false, 'stress-test', 'manual', 2, 'unlimited', '{}', 'coming_soon'),
  ('Community Engagement', 'Meaningful engagement in X Community', 'advanced', 'link', 50, true, 'community-engage', 'manual', 16, 'weekly', '{}', 'active')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type, cap = EXCLUDED.cap, frequency = EXCLUDED.frequency,
  metadata = EXCLUDED.metadata, status = EXCLUDED.status, active = EXCLUDED.active, category = EXCLUDED.category;

-- =====================
-- 4e. CONSISTENCY BONUS (9 tasks - 2 active, 7 coming soon)
-- Category max CP: 15,900
-- =====================
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Weekly Active', 'Complete at least one transaction per week', 'consistency', 'link', 200, false, 'weekly-active', 'onchain', 8, 'weekly', '{}', 'coming_soon'),
  ('Perfect Week', 'Trade + LP + Vote in the same week', 'consistency', 'link', 500, false, 'perfect-week', 'onchain', 8, 'weekly', '{}', 'coming_soon'),
  ('3-Week Streak', 'Maintain activity for 3 consecutive weeks', 'consistency', 'link', 400, false, 'streak-3w', 'onchain', 2, 'unlimited', '{}', 'coming_soon'),
  ('5-Week Streak', 'Maintain activity for 5 consecutive weeks', 'consistency', 'link', 1000, false, 'streak-5w', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Full 8-Week Participation', 'Active participation throughout the entire campaign', 'consistency', 'link', 3000, false, 'full-8w', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Early Adopter (Week 1)', 'Register and participate in Week 1', 'consistency', 'link', 500, true, 'early-adopter', 'auto', 1, 'once', '{}', 'active'),
  ('Testnet OG', 'Among the first 100 users to register', 'consistency', 'link', 1000, true, 'testnet-og', 'auto', 1, 'once', '{}', 'active'),
  ('Grand Marshal', 'Finish in top 50 on the leaderboard', 'consistency', 'link', 2000, false, 'grand-marshal', 'auto', 1, 'once', '{}', 'coming_soon'),
  ('First to Architect', 'First user to reach Architect rank', 'consistency', 'link', 2000, false, 'first-architect', 'auto', 1, 'once', '{}', 'coming_soon')
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
