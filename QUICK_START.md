# Quick Start Guide - Authentication System

## 🚀 Installation & Setup (5 minutes)

### Step 1: Database Setup
1. Open Supabase SQL Editor
2. Copy and paste contents of `supabase/migrations/001_create_user_roles.sql`
3. Execute the query
4. Verify tables created:
   - `user_roles` table
   - `admin_users` table

### Step 2: Add Admin User
```sql
-- Replace 'your-email@example.com' with your actual email
INSERT INTO admin_users (email) VALUES ('your-email@example.com')
ON CONFLICT (email) DO NOTHING;
```

### Step 3: Environment Variables
Ensure these are set in `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Start the App
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Backend automatically starts with Supabase functions
```

---

## 📋 User Types & Access

| Role | Features | Access |
|------|----------|--------|
| **Admin** | Manage users & assign roles | Admin Portal |
| **Manager** | Create matches, view dashboard, export CSV | Manager Portal |
| **Analyst** | Analyze matches, submit details | Analyst Portal |
| **Reviewer** | Review analysis, QC checks | Reviewer Portal |

---

## 🔐 Authentication Flow

```
User Registration
    ↓
Email + Password Sign Up
    ↓
Account Created (Status: Pending)
    ↓
Admin Assigns Role
    ↓
User Logs In
    ↓
Access Granted to Role-Based Portal
```

---

## 📝 Testing Checklist (Copy & Paste)

### Phase 1: Setup (5 min)
- [ ] Database migration executed
- [ ] Admin user added to admin_users table
- [ ] Environment variables configured
- [ ] App starts without errors

### Phase 2: Registration (5 min)
- [ ] Sign up as: manager@test.com
- [ ] Sign up as: analyst@test.com
- [ ] Sign up as: reviewer@test.com
- [ ] Verify users appear in admin panel

### Phase 3: Admin Role Assignment (5 min)
- [ ] Login as admin (your email)
- [ ] View pending users (should show 3)
- [ ] Assign Manager role to manager@test.com
- [ ] Assign Analyst role to analyst@test.com
- [ ] Assign Reviewer role to reviewer@test.com
- [ ] Verify status changes to Active

### Phase 4: Portal Access (5 min)
- [ ] Login as manager@test.com → Manager Portal
- [ ] Login as analyst@test.com → Analyst Portal
- [ ] Login as reviewer@test.com → Reviewer Portal
- [ ] Logout and verify return to login

### Phase 5: Edge Cases (5 min)
- [ ] Try wrong password → Error message
- [ ] Try pending user login → "Awaiting approval" message
- [ ] Reload page → User stays logged in
- [ ] Close browser, reopen → User logged out (session cleared)

---

## 🎨 UI Components

### Login Page
- Clean dark theme
- Email/Password fields
- Sign up / Sign in toggle
- Error handling with toasts

### Admin Portal
- Pending/Active user statistics
- User list with role assignment
- Real-time status updates
- Role dropdown selector

### Role Portals
- Manager: Match creation & management
- Analyst: Analysis workflow
- Reviewer: QC and review tasks

---

## 🛠️ Troubleshooting

### Error: "Failed to resolve import"
- [ ] Check relative import paths
- [ ] Ensure `lib/supabase/client.ts` exists
- [ ] Use `createClient()` function, not direct import

### Error: "Cannot fetch users"
- [ ] Verify auth token in localStorage
- [ ] Check Supabase API keys
- [ ] Verify RLS policies enabled on tables
- [ ] Check admin user exists in admin_users table

### User stuck on login after sign up
- [ ] Admin hasn't assigned role yet
- [ ] User is in "pending" state
- [ ] Check admin panel for pending users

### Session not persisting
- [ ] Check localStorage for `auth_token`
- [ ] Verify browser allows localStorage
- [ ] Check token is valid JWT

### Portal doesn't show after login
- [ ] Wrong role assigned
- [ ] User record not created in user_roles table
- [ ] Check browser console for errors

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `AUTH_SETUP.md` | Detailed setup instructions |
| `E2E_TESTING_FLOW.md` | Complete testing scenarios |
| `UI_UX_POLISH.md` | Design & UX guidelines |
| `TESTING_CHECKLIST.md` | Testing verification points |

---

## 🔄 Typical Workflow

### Day 1: Setup
1. Execute database migration
2. Add your admin email
3. Start the app
4. Verify compilation succeeds

### Day 2: User Management
1. Create admin account
2. Create 3 test user accounts
3. Assign roles in admin panel
4. Test each portal

### Day 3: Deployment
1. Deploy to Vercel
2. Run E2E tests in production
3. Share login credentials with team
4. Monitor for errors

---

## ✅ Success Criteria

You'll know it's working when:

1. ✓ No compilation errors
2. ✓ Login page loads cleanly
3. ✓ Can sign up new account
4. ✓ Can login as admin
5. ✓ Can see pending users in admin panel
6. ✓ Can assign roles successfully
7. ✓ Users can login with their assigned roles
8. ✓ Users see their correct portal
9. ✓ Logout works and session clears
10. ✓ No errors in browser console

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `E2E_TESTING_FLOW.md` for detailed steps
3. Check browser console for error messages
4. Verify all environment variables are set
5. Re-run database migration if needed

---

## 🎯 Next Steps

After authentication is working:
1. Customize role permissions (if needed)
2. Add additional admin users
3. Set up audit logging
4. Configure email notifications
5. Add password reset functionality
6. Implement 2FA (optional)
7. Set up monitoring/alerts

Happy coding! 🚀
