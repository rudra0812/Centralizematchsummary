# Pre-Deployment Verification Checklist

Complete this checklist before deploying to production.

## 🔧 Code Quality

### TypeScript & Imports
- [ ] No missing imports
- [ ] No unused imports
- [ ] All relative paths correct (../../lib/supabase/client)
- [ ] No type errors
- [ ] All imports use createClient() pattern

### Component Files
- [ ] `src/app/App.tsx` - Session checking ✓
- [ ] `src/app/components/LoginPage.tsx` - Auth forms ✓
- [ ] `src/app/components/AdminPortal.tsx` - Role management ✓
- [ ] All portals export correctly ✓

### Backend Files
- [ ] `supabase/functions/server/index.tsx` - API endpoints ✓
- [ ] All auth endpoints defined ✓
- [ ] All admin endpoints defined ✓
- [ ] Error handling in place ✓

### Database Files
- [ ] `supabase/migrations/001_create_user_roles.sql` created ✓
- [ ] Tables: user_roles, admin_users ✓
- [ ] Indexes created ✓
- [ ] RLS policies configured ✓

---

## 🗄️ Database Setup

### Tables Created
- [ ] user_roles table exists
  - [ ] id (UUID PK)
  - [ ] email (UNIQUE)
  - [ ] role (with CHECK constraint)
  - [ ] is_active (BOOLEAN)
  - [ ] created_at, updated_at (TIMESTAMPS)

- [ ] admin_users table exists
  - [ ] id (UUID PK)
  - [ ] email (UNIQUE)
  - [ ] created_at (TIMESTAMP)

### Indexes Created
- [ ] idx_user_roles_email
- [ ] idx_user_roles_role
- [ ] idx_admin_users_email

### RLS Policies Enabled
- [ ] user_roles RLS enabled
- [ ] admin_users RLS enabled
- [ ] "Users can read their own role" policy
- [ ] "Admins can manage all roles" policy
- [ ] "Admins can read admin list" policy

### Initial Data
- [ ] At least 1 admin user created
  - [ ] Email verified to exist in system

---

## 🔐 Environment Variables

### Required Variables Set
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] SUPABASE_URL (backend)
- [ ] SUPABASE_ANON_KEY (backend)
- [ ] SUPABASE_SERVICE_ROLE_KEY (backend)

### Verification
- [ ] Variables loaded in app
- [ ] No hardcoded credentials
- [ ] Variables not in version control
- [ ] Correct values for production
- [ ] API keys not exposed in frontend

---

## 🧪 Functionality Testing

### Registration Flow
- [ ] Sign up form displays
- [ ] Password validation works (min 6 chars)
- [ ] Passwords match validation
- [ ] Email field accepts valid emails
- [ ] Success message shows
- [ ] Account created in database with is_active=false
- [ ] Sign up → Sign in toggle works

### Login Flow
- [ ] Sign in form displays
- [ ] Email field required
- [ ] Password field required
- [ ] Invalid credentials show error
- [ ] Success message shows
- [ ] Auth token stored in localStorage
- [ ] Redirects to correct portal

### Pending User Login
- [ ] User can login with Supabase Auth
- [ ] Role check detects is_active=false
- [ ] Warning message displays
- [ ] User not logged in (no portal shown)
- [ ] Returns to login page

### Admin Portal
- [ ] Admin can login
- [ ] "Admin" role shown in header
- [ ] Lock icon displays in header
- [ ] User list loads
- [ ] Pending users show with status
- [ ] Active users show with status
- [ ] Statistics update correctly
- [ ] User selection works
- [ ] Role dropdown shows options
- [ ] Assign role button works
- [ ] Success message shows
- [ ] User status updates immediately
- [ ] List refreshes after assignment
- [ ] Statistics update after assignment

### Manager Portal
- [ ] Manager can login after role assignment
- [ ] Portal displays all manager features
- [ ] Email shown in header
- [ ] Manager icon shows in header
- [ ] Logout button present and works

### Analyst Portal
- [ ] Analyst can login after role assignment
- [ ] Portal displays all analyst features
- [ ] Email shown in header
- [ ] Analyst icon shows in header
- [ ] Logout button present and works

### Reviewer Portal
- [ ] Reviewer can login after role assignment
- [ ] Portal displays all reviewer features
- [ ] Email shown in header
- [ ] Reviewer icon shows in header
- [ ] Logout button present and works

### Session Management
- [ ] Token saved to localStorage on login
- [ ] Token used in API calls
- [ ] Token cleared on logout
- [ ] Reload page keeps session
- [ ] Close browser clears session
- [ ] Invalid token shows error
- [ ] Token expiry handled

### Logout
- [ ] Logout button accessible from all portals
- [ ] Click logout returns to login
- [ ] Token cleared from localStorage
- [ ] Session cleared
- [ ] Success message shows
- [ ] Cannot access portal after logout

---

## ⚠️ Error Handling

### Form Validation
- [ ] Empty email shows error
- [ ] Empty password shows error
- [ ] Password < 6 chars shows error
- [ ] Password mismatch shows error
- [ ] Invalid email format shows error
- [ ] Error messages are clear
- [ ] Errors clear when typing

### Login Errors
- [ ] Wrong password shows error
- [ ] Non-existent account shows error
- [ ] Network error handled
- [ ] Pending user shows warning
- [ ] Error messages not generic

### Admin Errors
- [ ] Non-admin users get 403 error
- [ ] Invalid role rejected
- [ ] Missing email shows error
- [ ] Missing role shows error
- [ ] Network errors handled
- [ ] All errors show toasts

### API Errors
- [ ] 400 Bad Request handled
- [ ] 401 Unauthorized handled
- [ ] 403 Forbidden handled
- [ ] 404 Not Found handled
- [ ] 500 Server Error handled
- [ ] Network timeout handled
- [ ] CORS errors handled

---

## 🎨 UI/UX Verification

### Login Page
- [ ] Clean dark theme
- [ ] All text readable
- [ ] Buttons clearly clickable
- [ ] Form fields clearly labeled
- [ ] Error banner visible
- [ ] Loading spinner shows
- [ ] Sign up / Sign in toggle works
- [ ] Submit on Enter works
- [ ] Responsive on mobile
- [ ] No layout shifts

### Admin Portal
- [ ] Statistics cards visible
- [ ] User table formatted properly
- [ ] Colors indicate status (pending/active)
- [ ] Buttons properly sized
- [ ] Dropdown opens/closes smoothly
- [ ] Loading spinner shows
- [ ] Toast messages display
- [ ] No layout shift on load
- [ ] Responsive on mobile
- [ ] Table scrollable on small screens

### All Portals
- [ ] Header displays correctly
- [ ] Email shown in header
- [ ] Logout button visible
- [ ] Role icon displays
- [ ] Navigation clear
- [ ] Responsive layout
- [ ] No overlapping elements
- [ ] Consistent styling
- [ ] All buttons clickable
- [ ] No broken images

---

## 📱 Responsive Design

### Mobile (< 640px)
- [ ] Forms stack vertically
- [ ] Buttons full width
- [ ] Text readable without zoom
- [ ] No horizontal scroll
- [ ] Touch targets >= 44px

### Tablet (640px - 1024px)
- [ ] Layout adapts
- [ ] Forms organized well
- [ ] Tables readable
- [ ] Images scale correctly

### Desktop (> 1024px)
- [ ] Optimal layout
- [ ] All features visible
- [ ] Not stretched
- [ ] Consistent spacing

---

## 🔍 Browser Testing

### Chrome/Chromium
- [ ] No console errors
- [ ] No console warnings
- [ ] All features work
- [ ] Layout correct
- [ ] Performance good

### Firefox
- [ ] No console errors
- [ ] All features work
- [ ] Layout correct

### Safari
- [ ] No console errors
- [ ] All features work
- [ ] Layout correct

### Edge
- [ ] No console errors
- [ ] All features work
- [ ] Layout correct

---

## 🔐 Security Verification

### Authentication
- [ ] Passwords hashed on backend
- [ ] Passwords never logged
- [ ] Passwords never displayed
- [ ] Tokens validated per request
- [ ] Invalid tokens rejected

### Authorization
- [ ] Only admins access /admin/users
- [ ] Only admins access /admin/assign-role
- [ ] Non-admins get 403 Forbidden
- [ ] Role validation on backend
- [ ] RLS policies enforced

### Data Protection
- [ ] No sensitive data in localStorage (except token)
- [ ] No sensitive data in logs
- [ ] No sensitive data in error messages
- [ ] CORS headers set
- [ ] Input validation present
- [ ] SQL injection prevention

### Session Security
- [ ] Tokens not in URL
- [ ] Tokens not in cookies (localStorage)
- [ ] Tokens sent in Authorization header
- [ ] Tokens validated on backend
- [ ] Logout clears token

---

## 📊 API Endpoints Tested

### Authentication
- [ ] POST /auth/register - Works with valid data
- [ ] POST /auth/register - Rejects duplicate email
- [ ] POST /auth/register - Validates passwords
- [ ] POST /auth/login - Works with valid credentials
- [ ] POST /auth/login - Rejects invalid credentials
- [ ] GET /auth/me - Returns user data
- [ ] GET /auth/me - Requires valid token
- [ ] POST /auth/logout - Accepts request

### Admin
- [ ] GET /admin/users - Returns user list (admin only)
- [ ] GET /admin/users - Requires auth token
- [ ] GET /admin/users - Returns 403 for non-admins
- [ ] POST /admin/assign-role - Assigns role
- [ ] POST /admin/assign-role - Validates role
- [ ] POST /admin/assign-role - Requires auth
- [ ] POST /admin/assign-role - Returns 403 for non-admins

---

## 📚 Documentation Complete

- [ ] README_AUTH_SYSTEM.md ✓
- [ ] QUICK_START.md ✓
- [ ] AUTH_SETUP.md ✓
- [ ] E2E_TESTING_FLOW.md ✓
- [ ] UI_UX_POLISH.md ✓
- [ ] TESTING_CHECKLIST.md ✓
- [ ] IMPLEMENTATION_SUMMARY.md ✓
- [ ] PRE_DEPLOYMENT_CHECKLIST.md ✓

---

## ✅ Final Sign-Off

### Code Quality
- [ ] All tests passing
- [ ] No console errors
- [ ] No console warnings
- [ ] Code formatted
- [ ] Comments where needed

### Functionality
- [ ] All features working
- [ ] No known bugs
- [ ] Edge cases handled
- [ ] Error handling complete

### Documentation
- [ ] Complete and accurate
- [ ] Easy to follow
- [ ] Examples provided
- [ ] Troubleshooting included

### Performance
- [ ] Load times acceptable
- [ ] No memory leaks
- [ ] API responses fast
- [ ] Database queries optimized

### Security
- [ ] All data protected
- [ ] Authentication secure
- [ ] Authorization enforced
- [ ] No vulnerabilities known

---

## 🚀 Deployment Ready

When all items are checked:

```
✓ Code Quality
✓ Database Setup
✓ Environment Variables
✓ Functionality Testing
✓ Error Handling
✓ UI/UX
✓ Responsive Design
✓ Browser Compatibility
✓ Security
✓ API Endpoints
✓ Documentation

READY FOR PRODUCTION DEPLOYMENT
```

---

## 📝 Sign-Off

**Checked By:** _________________  
**Date:** _________________  
**Status:** [ ] APPROVED [ ] NEEDS FIXES

---

**Before deploying to production, ensure ALL checkboxes are marked ✓**

If any item is not checked, resolve the issue before deployment.
