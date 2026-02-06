-- Orvex Tasks V2 Setup
-- Extends the tasks table with full task system support
-- Run this AFTER frontend-setup.sql

-- 1. Add new columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_key TEXT UNIQUE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS verification_type TEXT NOT NULL DEFAULT 'manual'
  CHECK (verification_type IN ('auto', 'manual', 'screenshot', 'link', 'onchain'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cap INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'once'
  CHECK (frequency IN ('once', 'daily', 'weekly', 'unlimited'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'coming_soon', 'locked'));

-- 2. Create index on task_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_tasks_task_key ON tasks(task_key);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- 3. Remove old sample tasks
DELETE FROM tasks WHERE task_key IS NULL;

-- 4. Seed active Social Operations tasks
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Follow Orvex on X', 'Follow @OrvexFi on X/Twitter', 'social', 'screenshot', 100, true, 'follow-orvex', 'screenshot', 1, 'once', '{"target_account": "@OrvexFi"}', 'active'),
  ('Follow Status Network on X', 'Follow @StatusNetwork on X/Twitter', 'social', 'screenshot', 100, true, 'follow-status', 'screenshot', 1, 'once', '{"target_account": "@StatusNetwork"}', 'active'),
  ('Join Orvex Community', 'Join the Orvex community on X', 'social', 'screenshot', 300, true, 'join-community', 'screenshot', 1, 'once', '{}', 'active'),
  ('Retweet Announcement', 'Retweet an official Orvex announcement', 'social', 'link', 50, true, 'retweet', 'link', 8, 'unlimited', '{"tweet_url": ""}', 'active'),
  ('Quote Tweet with Thoughts', 'Quote tweet an Orvex post with your thoughts', 'social', 'link', 100, true, 'quote-tweet', 'link', 5, 'weekly', '{"tweet_url": ""}', 'active'),
  ('Create Orvex Content', 'Create original content about Orvex (threads, videos, articles)', 'social', 'link', 500, true, 'create-content', 'manual', 4, 'weekly', '{}', 'active'),
  ('Refer a Friend', 'Invite a friend who completes registration', 'social', 'link', 200, true, 'refer-friend', 'auto', 5, 'unlimited', '{}', 'active')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type,
  cap = EXCLUDED.cap,
  frequency = EXCLUDED.frequency;

-- 5. Seed active Advanced Operations tasks
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Provide Detailed Feedback', 'Submit detailed product feedback', 'advanced', 'link', 150, true, 'provide-feedback', 'manual', 12, 'weekly', '{}', 'active'),
  ('Report Bug', 'Report a verified bug with reproduction steps', 'advanced', 'link', 500, true, 'report-bug', 'manual', 6, 'unlimited', '{}', 'active'),
  ('Participate in X Space/AMA', 'Join and engage in an official X Space', 'advanced', 'screenshot', 300, true, 'x-space', 'manual', 8, 'weekly', '{}', 'active'),
  ('Complete Tutorial', 'Finish an education module or tutorial', 'advanced', 'link', 100, true, 'complete-tutorial', 'link', 15, 'unlimited', '{}', 'active'),
  ('Community Engagement', 'Meaningful engagement in X Community', 'advanced', 'link', 50, true, 'community-engage', 'manual', 16, 'weekly', '{}', 'active')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  verification_type = EXCLUDED.verification_type,
  cap = EXCLUDED.cap,
  frequency = EXCLUDED.frequency;

-- 6. Seed active Consistency Bonus tasks
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Early Adopter (Week 1)', 'Register and participate in Week 1', 'consistency', 'link', 500, true, 'early-adopter', 'auto', 1, 'once', '{}', 'active'),
  ('Testnet OG', 'Among the first 100 users to register', 'consistency', 'link', 1000, true, 'testnet-og', 'auto', 1, 'once', '{}', 'active')
ON CONFLICT (task_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  points = EXCLUDED.points;

-- 7. Seed coming_soon tasks (for display only)
INSERT INTO tasks (name, description, category, type, points, active, task_key, verification_type, cap, frequency, metadata, status) VALUES
  ('Complete First Swap', 'Execute your first swap on the testnet', 'trading', 'link', 200, false, 'first-swap', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Swap on Testnet', 'Complete a swap transaction', 'trading', 'link', 25, false, 'swap-testnet', 'onchain', 80, 'daily', '{}', 'coming_soon'),
  ('Add First Liquidity', 'Create your first liquidity position', 'liquidity', 'link', 300, false, 'first-lp', 'onchain', 1, 'once', '{}', 'coming_soon'),
  ('Weekly Active', 'Complete at least one transaction per week', 'consistency', 'link', 200, false, 'weekly-active', 'onchain', 8, 'weekly', '{}', 'coming_soon')
ON CONFLICT (task_key) DO UPDATE SET
  status = EXCLUDED.status,
  active = EXCLUDED.active;

-- 8. Update task_submissions to use text task_id for compatibility
-- (task_id stays UUID for existing rows, new submissions will reference tasks.id)

-- 9. Add trigger for tasks updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Tasks V2 setup complete!' as message;
