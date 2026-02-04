-- Add X handle column to users table
-- Run this to add the x_handle field

ALTER TABLE users
ADD COLUMN IF NOT EXISTS x_handle TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_x_handle ON users(x_handle);

SELECT 'X handle column added!' as message;
