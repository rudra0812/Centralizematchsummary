-- 002: Promote a user to admin with approved status
-- 
-- HOW TO USE:
-- 1. Go to the app and register (Sign Up) with any role — it doesn't matter which.
-- 2. Replace 'YOUR_EMAIL@example.com' below with the email you registered with.
-- 3. Run this script once. That user will become an approved admin immediately.
-- 4. Refresh the app — you'll land on the Admin Dashboard.

UPDATE users
SET role = 'admin',
    status = 'approved',
    updated_at = now()
WHERE email = 'YOUR_EMAIL@example.com';
