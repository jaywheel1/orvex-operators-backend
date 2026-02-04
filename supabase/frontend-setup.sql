-- Orvex Frontend Tables Setup
-- Run this AFTER the initial setup.sql

-- 1. Users table (for registered users via wallet)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,

  -- X Verification
  tweet_url TEXT,
  verification_code TEXT,
  tweet_verified BOOLEAN DEFAULT false,
  tweet_verified_at TIMESTAMPTZ,

  -- Follow Verification
  follow_verified BOOLEAN DEFAULT false,
  follow_verified_at TIMESTAMPTZ,
  follow_screenshot_url TEXT,

  -- Registration
  registration_complete BOOLEAN DEFAULT false,
  registration_completed_at TIMESTAMPTZ,

  -- Admin
  is_banned BOOLEAN DEFAULT false,
  ip_address TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Settings table (for campaign status, etc)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tasks table (available tasks for users)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'link',
  points INTEGER DEFAULT 10,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_registration ON users(registration_complete);
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(active);

-- 5. Initial settings
INSERT INTO settings (key, value) VALUES ('campaign_live', 'false')
ON CONFLICT (key) DO NOTHING;

-- 6. Make your operator wallet an admin
UPDATE profiles SET role = 'admin' WHERE id = 'c7f5ad71-2dde-4faa-ad68-1cdc1caf3f9f';

-- 7. Create storage bucket for screenshots (run this separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('verification-screenshots', 'verification-screenshots', true);

-- 8. Sample tasks (optional)
INSERT INTO tasks (name, description, category, type, points) VALUES
  ('Post about Orvex', 'Share a tweet about Orvex with the #Orvex hashtag', 'social', 'link', 25),
  ('Join Discord', 'Join our Discord server and verify', 'social', 'screenshot', 15),
  ('Follow on X', 'Follow @OrvexOperators on X', 'social', 'screenshot', 10)
ON CONFLICT DO NOTHING;

SELECT 'Frontend tables created!' as message;
