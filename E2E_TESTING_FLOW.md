# End-to-End Testing Flow for Authentication System

## Prerequisites
- Supabase project configured with environment variables set
- Database migrations executed (001_create_user_roles.sql)
- Backend Hono server running on port 3000
- Frontend React app running on port 5173

## Step 1: Database Setup & Admin User Creation
### 1.1 Execute SQL Migration
```sql
-- Run this in Supabase SQL Editor
-- This creates user_roles and admin_users tables with RLS policies
```

### 1.2 Add Your Admin Account
```sql
INSERT INTO admin_users (email) VALUES ('your-email@example.com')
ON CONFLICT (email) DO NOTHING;
```

**Expected Result:** Admin user created successfully

---

## Step 2: Test User Registration Flow
### 2.1 Sign Up Test Account #1 (Manager Role)
1. Navigate to login page
2. Click "Don't have an account? Sign Up"
3. Enter:
   - Email: `manager@test.com`
   - Password: `Test123!`
   - Confirm: `Test123!`
4. Click "Create Account"

**Expected Results:**
- ✓ Success toast: "Account created! Awaiting admin role assignment"
- ✓ Form clears
- ✓ Switch back to Sign In mode
- ✓ User entry created in `user_roles` table with role='pending', is_active=false
- ✓ Check logs for: No auth errors

### 2.2 Sign Up Test Account #2 (Analyst Role)
- Email: `analyst@test.com`
- Password: `Test123!`

### 2.3 Sign Up Test Account #3 (Reviewer Role)
- Email: `reviewer@test.com`
- Password: `Test123!`

**Expected Results:** All three accounts created in database with pending status

---

## Step 3: Test Admin Login & Role Assignment
### 3.1 Admin Login
1. Sign In with admin account:
   - Email: `your-email@example.com`
   - Password: (your password)
2. Click "Sign In"

**Expected Results:**
- ✓ User fetched from auth
- ✓ Role retrieved from database (should be 'admin')
- ✓ Session stored in localStorage as `auth_token`
- ✓ Redirected to Admin Portal
- ✓ Header shows admin email
- ✓ Admin icon (lock) displayed in header

### 3.2 View Pending Users
1. Admin Portal loads
2. Statistics show:
   - Pending Users: 3
   - Active Users: 0
3. User table displays:
   - manager@test.com - pending
   - analyst@test.com - pending
   - reviewer@test.com - pending

**Expected Results:**
- ✓ All three test accounts visible
- ✓ Status shows as "Pending"
- ✓ No errors in console

### 3.3 Assign Role to Manager
1. Click on `manager@test.com` row
2. Select role dropdown: "Manager"
3. Click "Assign Role"

**Expected Results:**
- ✓ Success toast: "Role assigned to manager@test.com"
- ✓ User status changes to "Active" with "Manager" role
- ✓ Database updated: is_active=true, role='manager'
- ✓ Pending count decreases to 2
- ✓ Active count increases to 1

### 3.4 Assign Remaining Roles
- Assign `analyst@test.com` → "Analyst"
- Assign `reviewer@test.com` → "Reviewer"

**Expected Results:**
- ✓ All three users now show Active status
- ✓ Correct roles assigned to each
- ✓ Statistics update: Pending=0, Active=3

---

## Step 4: Test Role-Based Portal Access
### 4.1 Manager Portal Access
1. Sign Out (click logout button)
2. Sign In as: `manager@test.com` / `Test123!`

**Expected Results:**
- ✓ Auth successful
- ✓ Role fetched from database
- ✓ Redirected to Manager Portal
- ✓ Header shows: `manager@test.com`
- ✓ Manager Portal features visible:
  - Create Match button
  - Matches Dashboard
  - CSV Export

### 4.2 Analyst Portal Access
1. Sign Out
2. Sign In as: `analyst@test.com` / `Test123!`

**Expected Results:**
- ✓ Redirected to Analyst Portal
- ✓ Header shows: `analyst@test.com`
- ✓ Analyst Portal features visible:
  - Assigned Matches list
  - Analysis workflow

### 4.3 Reviewer Portal Access
1. Sign Out
2. Sign In as: `reviewer@test.com` / `Test123!`

**Expected Results:**
- ✓ Redirected to Reviewer Portal
- ✓ Header shows: `reviewer@test.com`
- ✓ Reviewer Portal features visible:
  - Review queue
  - QC checks

---

## Step 5: Test Error Handling & Edge Cases
### 5.1 Invalid Credentials
1. Sign In with:
   - Email: `manager@test.com`
   - Password: `WrongPassword`
2. Click "Sign In"

**Expected Results:**
- ✓ Error toast: "Invalid login credentials" (or similar Supabase error)
- ✓ User remains on login page
- ✓ No sensitive data leaked in error message

### 5.2 Non-Existent Account
1. Sign In with:
   - Email: `nonexistent@test.com`
   - Password: `Test123!`

**Expected Results:**
- ✓ Error toast: Authentication fails
- ✓ User remains on login page

### 5.3 Pending User Login Attempt
1. Create new account: `pending@test.com`
2. Try to login immediately

**Expected Results:**
- ✓ Auth succeeds with Supabase
- ✓ Role check shows is_active=false
- ✓ Warning toast: "Your account is pending admin approval. Please check back later"
- ✓ User remains on login page
- ✓ Session is NOT stored

### 5.4 Session Persistence
1. Sign In as manager
2. Reload page (Ctrl+R or Cmd+R)

**Expected Results:**
- ✓ Auth token retrieved from localStorage
- ✓ User automatically logged in
- ✓ No login page shown
- ✓ Manager Portal displays immediately
- ✓ No flash of login page

### 5.5 Logout
1. Sign In as any user
2. Click logout button in header

**Expected Results:**
- ✓ Auth token cleared from localStorage
- ✓ User returned to login page
- ✓ Success toast: "Logged out successfully"
- ✓ Reload page shows login page (session cleared)

---

## Step 6: UI/UX Verification
### 6.1 Login Page
- [ ] Clean, professional dark theme
- [ ] Email/password fields clearly labeled
- [ ] Password field is masked
- [ ] Form validation shows errors inline
- [ ] Sign Up / Sign In toggle works smoothly
- [ ] Buttons are clearly clickable
- [ ] Error messages appear in red banner
- [ ] Loading state shows spinner
- [ ] Submit on Enter key works

### 6.2 Admin Portal
- [ ] Statistics cards show pending/active count
- [ ] User table is sortable/searchable
- [ ] User selection highlights selected row
- [ ] Role dropdown shows all valid options
- [ ] Assign button is disabled until user and role selected
- [ ] Success/error toasts appear for all actions
- [ ] Loading spinner shows during async operations
- [ ] Status badges color-coded (pending=yellow, active=green)

### 6.3 Manager Portal
- [ ] Displays all manager-specific features
- [ ] Email shown in header
- [ ] Logout button accessible
- [ ] All buttons and forms are responsive

### 6.4 Analyst Portal
- [ ] Displays all analyst-specific features
- [ ] Email shown in header
- [ ] Logout button accessible

### 6.5 Reviewer Portal
- [ ] Displays all reviewer-specific features
- [ ] Email shown in header
- [ ] Logout button accessible

---

## Step 7: Security Verification
### 7.1 Token Security
- [ ] Auth token stored in localStorage (not in cookies for this implementation)
- [ ] Token sent in Authorization header for API calls
- [ ] Token validated on backend for each request
- [ ] Invalid tokens rejected with 401 errors

### 7.2 Admin Access Control
- [ ] Only admin users can access /admin/users endpoint
- [ ] Only admin users can access /admin/assign-role endpoint
- [ ] Non-admin users trying to access admin endpoints get 403 Forbidden
- [ ] Admin endpoints require valid Bearer token

### 7.3 Role Validation
- [ ] Only valid roles accepted (admin, manager, analyst, reviewer)
- [ ] Invalid role assignments rejected
- [ ] Role validation happens on both frontend and backend

---

## Step 8: Browser Console Check
**No errors or warnings should appear:**
- [ ] No 404 errors for missing files
- [ ] No CORS errors
- [ ] No auth-related TypeErrors
- [ ] No import path errors

---

## Expected Test Results Summary
```
Total Test Scenarios: 20+
✓ Registration: 3 accounts created
✓ Admin Login: 1 admin authenticated
✓ Role Assignment: 3 roles assigned
✓ Portal Access: 3 role-based portals accessible
✓ Error Handling: 5 edge cases handled correctly
✓ UI/UX: All components render properly
✓ Security: All access controls working
✓ Console: No errors
```

---

## Debugging Checklist If Tests Fail
- [ ] Check Supabase URL and keys in .env
- [ ] Verify migration SQL executed in database
- [ ] Check admin user email matches in admin_users table
- [ ] Verify Hono backend is running and endpoints accessible
- [ ] Check browser console for import errors
- [ ] Verify Auth token format and storage
- [ ] Test Supabase Auth directly in browser console
- [ ] Check RLS policies are enabled and correct
- [ ] Review backend logs for API errors
