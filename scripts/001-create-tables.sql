-- 001: Create users, business_requests, and notifications tables

-- Users table: stores all app users with roles and approval status
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'business', 'manager', 'analyst', 'reviewer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business requests table: match requests submitted by business people
CREATE TABLE IF NOT EXISTS business_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id),
  prospect_name TEXT NOT NULL,
  num_matches INTEGER NOT NULL DEFAULT 1,
  country TEXT,
  source TEXT,
  poc TEXT,
  video_links TEXT[],
  lineup_info TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table: tracks in-app and email notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  match_id TEXT,
  business_request_id UUID REFERENCES business_requests(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_business_requests_created_by ON business_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_business_requests_status ON business_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
CREATE POLICY "Service role can do everything on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- RLS policies for business_requests table
CREATE POLICY "Service role can do everything on business_requests" ON business_requests
  FOR ALL USING (true) WITH CHECK (true);

-- RLS policies for notifications table
CREATE POLICY "Service role can do everything on notifications" ON notifications
  FOR ALL USING (true) WITH CHECK (true);
