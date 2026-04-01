# Authentication System Testing Checklist

## Pre-Setup

- [ ] Database migration executed (`supabase/migrations/001_create_user_roles.sql`)
- [ ] Your email added to `admin_users` table in Supabase
- [ ] Supabase environment variables configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Backend server running (Supabase Functions deployed)

## User Registration Flow

### Test 1: Sign Up New User
- [ ] Navigate to login page
- [ ] Click "Sign Up"
- [ ] Enter email: `test.manager@example.com`
- [ ] Enter password: `TestPassword123`
- [ ] Confirm password matches
- [ ] Click "Create Account"
- [ ] Verify success message: "Account created! Awaiting admin role assignment."
- [ ] User appears in Supabase Auth → Users
- [ ] User appears in `user_roles` table with `is_active = false`

### Test 2: Sign Up with Invalid Data
- [ ] Try sign up with existing email → Should error
- [ ] Try sign up with password < 6 chars → Should error
- [ ] Try sign up with mismatched passwords → Should error
- [ ] Try sign up with invalid email format → Should error

## Authentication & Login Flow

### Test 3: Login with New (Unapproved) User
- [ ] Try to log in with `test.manager@example.com`
- [ ] Enter correct password
- [ ] Click "Sign In"
- [ ] Verify message: "Your account is pending admin approval. Please check back later."
- [ ] Not logged in, still on login page

### Test 4: Admin Login
- [ ] Log in with admin email
- [ ] Enter correct password
- [ ] Click "Sign In"
- [ ] Verify redirected to Admin Portal
- [ ] Header shows "admin" role badge
- [ ] All user management features visible

## Admin Portal & Role Assignment

### Test 5: View Users in Admin Portal
- [ ] In Admin Portal, check "Users" section
- [ ] Verify `test.manager@example.com` appears in the list
- [ ] User status shows "Pending"
- [ ] Stats show: +1 pending user

### Test 6: Assign Manager Role
- [ ] Click on `test.manager@example.com` in user list
- [ ] User row highlights in green
- [ ] "Assign Role" panel appears below
- [ ] Click "manager" button to select role
- [ ] "manager" button shows as selected (green highlight)
- [ ] Click "Confirm Assignment"
- [ ] Verify success toast: "Role assigned to test.manager@example.com"
- [ ] User status updates to green "manager" badge
- [ ] Stats update: pending -1, active +1

### Test 7: Assign Analyst Role
- [ ] Sign up new user: `test.analyst@example.com`
- [ ] Log in as admin
- [ ] In Admin Portal, click on new user
- [ ] Select "analyst" role
- [ ] Click "Confirm Assignment"
- [ ] User status updates correctly

### Test 8: Assign Reviewer Role
- [ ] Sign up new user: `test.reviewer@example.com`
- [ ] Log in as admin
- [ ] Assign "reviewer" role
- [ ] Verify assignment successful

## Role-Based Access

### Test 9: Manager Portal Access
- [ ] Log out as admin
- [ ] Log in as `test.manager@example.com`
- [ ] Verify redirected to Manager Portal
- [ ] Header shows "manager" role badge
- [ ] Manager-specific features visible (create matches, etc.)

### Test 10: Analyst Portal Access
- [ ] Log out
- [ ] Log in as `test.analyst@example.com`
- [ ] Verify redirected to Analyst Portal
- [ ] Header shows "analyst" role badge
- [ ] Analyst-specific features visible

### Test 11: Reviewer Portal Access
- [ ] Log out
- [ ] Log in as `test.reviewer@example.com`
- [ ] Verify redirected to Reviewer Portal
- [ ] Header shows "reviewer" role badge
- [ ] Reviewer-specific features visible

## Session Management

### Test 12: Session Persistence
- [ ] Log in as manager
- [ ] Verify logged in successfully
- [ ] Refresh page (F5)
- [ ] Verify still logged in (no redirect to login)
- [ ] User data preserved in header

### Test 13: Logout
- [ ] While logged in, click "Logout" button
- [ ] Verify redirected to login page
- [ ] Verify localStorage cleared (no auth_token)
- [ ] Try going back with browser back button → Should not re-login

### Test 14: Session Expiry
- [ ] Log in as manager
- [ ] Wait for token to expire (1 hour) OR manually clear localStorage
- [ ] Refresh page
- [ ] Verify redirected to login page
- [ ] Verify error handling is graceful

## Error Handling

### Test 15: Invalid Credentials
- [ ] Try login with wrong password
- [ ] Verify error message shown
- [ ] Try login with non-existent email
- [ ] Verify error message shown
- [ ] Application remains stable

### Test 16: Network Errors
- [ ] Simulate network failure (DevTools)
- [ ] Try to log in
- [ ] Verify appropriate error message
- [ ] Try again when network restored
- [ ] Should work normally

## Cross-Browser/Device Testing

### Test 17: Different Browsers
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Verify authentication works consistently

### Test 18: Mobile Device
- [ ] Access on mobile phone or tablet
- [ ] Sign up flow works on small screens
- [ ] Admin Portal responsive on mobile
- [ ] Portals accessible on mobile

## Security Spot Checks

### Test 19: Password Security
- [ ] Passwords never logged or displayed in console
- [ ] Password field masked (dots/asterisks)
- [ ] No password in URLs or local storage

### Test 20: Token Security
- [ ] JWT token in localStorage (check DevTools)
- [ ] Token included in Authorization header for API calls
- [ ] Token expires appropriately

## Final Verification

### Test 21: Complete User Lifecycle
- [ ] Create new account
- [ ] Verify in pending state
- [ ] Assign role as admin
- [ ] Log in with new account
- [ ] Verify correct portal shown
- [ ] Logout
- [ ] Verify returned to login

### Test 22: Multiple Simultaneous Users
- [ ] Open app in 2 browser windows
- [ ] Log in as different users in each
- [ ] Verify each sees correct portal
- [ ] No data leakage between users

## Performance

### Test 23: Load Times
- [ ] Login page loads quickly
- [ ] Redirect to portal is instant
- [ ] Admin Portal loads user list in reasonable time
- [ ] No lag when assigning roles

## Sign-Off

- **Tester Name**: ________________
- **Date**: ________________
- **All Tests Passed**: ☐ Yes ☐ No
- **Issues Found**: (describe any issues)

---

If all tests pass, the authentication system is ready for production use.
