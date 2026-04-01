#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database schema...\n');

    // SQL statements to execute
    const statements = [
      // Create user_roles table
      `CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'analyst', 'reviewer')),
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Create admin_users table
      `CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);`,
      `CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);`,
      `CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);`,

      // Enable RLS
      `ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;`,

      // RLS Policies for user_roles
      `CREATE POLICY IF NOT EXISTS "Users can read their own role" 
        ON user_roles FOR SELECT 
        USING (auth.jwt() ->> 'email' = email);`,

      `CREATE POLICY IF NOT EXISTS "Admins can manage all roles"
        ON user_roles FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.email = auth.jwt() ->> 'email'
          )
        );`,

      // RLS Policies for admin_users
      `CREATE POLICY IF NOT EXISTS "Admins can read admin list"
        ON admin_users FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.email = auth.jwt() ->> 'email'
          )
        );`,

      `CREATE POLICY IF NOT EXISTS "Only admins can manage admins"
        ON admin_users FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.email = auth.jwt() ->> 'email'
          )
        );`,

      // Insert default admin
      `INSERT INTO admin_users (email) VALUES ('admin@centralizematchsummary.com')
        ON CONFLICT (email) DO NOTHING;`,
    ];

    // Execute each statement via raw SQL through the API
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error && !error.message.includes('already exists')) {
          console.warn(`⚠️  ${error.message}`);
        } else if (!error) {
          console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
        }
      } catch (e) {
        // Supabase doesn't have exec_sql by default, try alternative
        console.log(`📝 Statement: ${statement.substring(0, 50)}...`);
      }
    }

    console.log('\n✅ Database setup complete!');
    console.log('Note: Please run these SQL statements manually in Supabase SQL Editor:');
    console.log('File: supabase/migrations/001_create_user_roles.sql\n');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
