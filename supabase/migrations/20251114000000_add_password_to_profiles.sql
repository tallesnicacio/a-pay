-- Add password field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- Update existing profiles to have a default password hash (should be changed by users)
-- This is bcrypt hash for 'changeme123'
UPDATE profiles
SET password = '$2a$10$qKvF5rXzE0vZkJKpT5n7s.gZnH6X7IZX4YCxIRqJY8PZN0oXnZ0qS'
WHERE password IS NULL;

-- Make password NOT NULL after setting defaults
ALTER TABLE profiles ALTER COLUMN password SET NOT NULL;
