# Email/Password Authentication with Role-Based Access Control

This guide explains how to set up and use the authentication system with role assignment.

## System Overview

The authentication system works as follows:

1. **User Registration**: Users sign up with email and password via Supabase Auth
2. **Pending Status**: New users are added to the `user_roles` table but marked as inactive
3. **Admin Assignment**: Admins access the Admin Portal and assign roles (manager, analyst, reviewer)
4. **Role Activation**: Once a role is assigned, the user is activated and can log in to their portal
5. **Session Management**: JWT tokens are stored in localStorage and verified on app load

## Database Setup

### Step 1: Run the Migration

The database schema is defined in `supabase/migrations/001_create_user_roles.sql`. This file creates:

- **user_roles table**: Stores email, assigned role, activation status
- **admin_users table**: Tracks who has admin access
- **RLS Policies**: Secure row-level security rules for data access

To execute the migration:

```bash
# Option 1: Execute the script (requires Node.js)
npm install  # if not already done
node scripts/setup-db.mjs

# Option 2: Manual SQL Execution
# 1. Open your Supabase project
# 2. Go to SQL Editor
# 3. Copy the contents of supabase/migrations/001_create_user_roles.sql
# 4. Paste and execute in the SQL Editor
```

### Step 2: Set Admin Email

In the migration file, there's a default admin account. Update it:

```sql
INSERT INTO admin_users (email) VALUES ('your-email@example.com')
ON CONFLICT (email) DO NOTHING;
```

Or manually add it via Supabase:
1. Go to your Supabase project
2. Open the `admin_users` table
3. Add a row with your email address

## API Endpoints

The backend (`supabase/functions/server/index.tsx`) provides these endpoints:

### Authentication Endpoints

- **POST /auth/register**: Sign up a new user
  - Body: `{ email: string, password: string }`
  - Response: User created, role pending

- **POST /auth/login**: Sign in existing user
  - Body: `{ email: string, password: string }`
  - Response: Session token + user role

- **GET /auth/me**: Get current authenticated user
  - Headers: `Authorization: Bearer {token}`
  - Response: User data + assigned role

- **POST /auth/logout**: Logout user

### Admin Endpoints

- **GET /admin/users**: List all users with roles
  - Headers: `Authorization: Bearer {token}` (admin only)
  - Response: Array of users with roles and activation status

- **POST /admin/assign-role**: Assign a role to a user
  - Headers: `Authorization: Bearer {token}` (admin only)
  - Body: `{ email: string, role: "manager" | "analyst" | "reviewer" }`
  - Response: Updated user with new role

## Frontend Flow

### Login Page (`src/app/components/LoginPage.tsx`)

Users can:
1. Sign up with email/password
2. Sign in with credentials
3. See "Awaiting admin approval" if not yet assigned

### Role-Based Portals

After login, users see portals based on their assigned role:

- **Admin**: Admin Portal (manage users and assign roles)
- **Manager**: Manager Portal (create matches, view dashboard)
- **Analyst**: Analyst Portal (analyze matches)
- **Reviewer**: Reviewer Portal (review analyses)

### Admin Portal (`src/app/components/AdminPortal.tsx`)

Admins can:
1. View all registered users
2. See pending users (not yet assigned)
3. Select a user and assign a role
4. View active users and their roles

## Testing the System

### Manual Testing Steps

1. **Create Admin User**
   - In Supabase, add your email to `admin_users` table

2. **Register a New User**
   - Go to login page
   - Click "Sign Up"
   - Enter email (e.g., manager@example.com) and password
   - Account created, status shows "Pending"

3. **Assign Role as Admin**
   - Log in with your admin account
   - Go to Admin Portal
   - Find the new user
   - Click the user to select
   - Choose role (e.g., "manager")
   - Click "Confirm Assignment"

4. **Login as Assigned User**
   - Log out
   - Log in with the new email/password
   - Should see Manager Portal with appropriate features

### Testing Different Roles

Repeat steps 2-4 with different roles:
- Create `analyst@example.com` → Assign "analyst" role
- Create `reviewer@example.com` → Assign "reviewer" role
- Create `admin2@example.com` → Add to `admin_users` table for admin access

## Session Management

- **Login**: Token stored in localStorage as `auth_token`
- **App Load**: App checks localStorage for token and validates
- **Logout**: Token removed from localStorage
- **Expiry**: Tokens expire in 1 hour (Supabase default)

## Security Features

1. **Row Level Security**: Users can only see their own role
2. **Admin-Only Endpoints**: Role assignment requires admin verification
3. **Password Hashing**: Passwords hashed by Supabase Auth
4. **JWT Tokens**: Secure session tokens with expiry

## Troubleshooting

### "Only admins can access this endpoint"
- Ensure your email is added to the `admin_users` table in Supabase

### "Your account is pending admin approval"
- Log in as an admin and assign a role to the user in the Admin Portal

### "Login failed" or "User not found"
- Check that user exists in Supabase Auth (Authentication → Users)
- Verify `user_roles` table has entry for the email

### API endpoints not responding
- Ensure Supabase functions are deployed
- Check browser console for CORS errors
- Verify API URL in requests matches your Supabase project

## Next Steps

1. Deploy the Supabase functions
2. Run the database migration
3. Add your email to `admin_users` table
4. Test the registration → assignment → login flow
5. Create test accounts for each role
