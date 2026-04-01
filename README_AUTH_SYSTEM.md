# Email/Password Authentication with Role-Based Access Control

A complete, production-ready authentication system for the Centralize Match Summary platform featuring email/password authentication, admin-managed role assignment, and role-based portal access.

## 🎯 Overview

This implementation provides:
- **User Registration** - Email and password-based account creation
- **Secure Login** - Supabase Auth with JWT tokens
- **Admin Dashboard** - Manage users and assign roles
- **Role-Based Access** - 4 user roles with dedicated portals
- **Session Management** - Persistent sessions with auto-logout
- **Full Error Handling** - User-friendly error messages and validation

## 🚀 Quick Start (5 Minutes)

### 1. Database Setup
```bash
# Open Supabase SQL Editor and execute:
supabase/migrations/001_create_user_roles.sql

# Add yourself as admin:
INSERT INTO admin_users (email) VALUES ('your-email@example.com');
```

### 2. Start the App
```bash
npm install
npm run dev
```

### 3. Test the Flow
- Sign up with a test account
- Login as admin and assign roles
- Login as test user to access role portal

**For detailed setup, see `QUICK_START.md`**

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `QUICK_START.md` | 5-minute setup guide |
| `AUTH_SETUP.md` | Detailed configuration |
| `E2E_TESTING_FLOW.md` | Complete testing scenarios |
| `UI_UX_POLISH.md` | Design guidelines |
| `IMPLEMENTATION_SUMMARY.md` | Technical overview |

---

## 🔐 User Roles

| Role | Description | Access |
|------|-------------|--------|
| **Admin** | Manage users and assign roles | Admin Portal |
| **Manager** | Create matches and manage team | Manager Portal |
| **Analyst** | Analyze matches and submit details | Analyst Portal |
| **Reviewer** | Review analysis and QC tasks | Reviewer Portal |

---

## 🔄 Authentication Flow

```
┌─────────────────────────────────────────┐
│   User Lands on Login Page              │
└─────────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   Sign Up or Sign In? │
        └───────────────────────┘
           ↙                   ↘
    Sign Up                Sign In
      ↓                        ↓
Create Email/Pwd      Enter Email/Pwd
      ↓                        ↓
Account Created       Validate Credentials
(Status: Pending)              ↓
      ↓                Check Active Status
Admin Assigns Role             ↓
      ↓                   ✓ Active
Activate User           ✓ Pending
      ↓                   ↘  ↙
User Can Login         ✓ Logged In
      ↓                   ↓
Portal Access      Role-Based Portal
```

---

## 🛠️ Architecture

### Frontend
```
src/app/
├── App.tsx                    # Main app + session checking
├── components/
│   ├── LoginPage.tsx         # Auth forms
│   ├── AdminPortal.tsx       # User management
│   ├── ManagerPortal.tsx     # Manager features
│   ├── AnalystPortal.tsx     # Analyst features
│   └── ReviewerPortal.tsx    # Reviewer features
```

### Backend
```
supabase/functions/server/
├── index.tsx                  # Hono API endpoints
├── Auth endpoints:
│   ├── POST /auth/register
│   ├── POST /auth/login
│   ├── GET /auth/me
│   └── POST /auth/logout
└── Admin endpoints:
    ├── GET /admin/users
    └── POST /admin/assign-role
```

### Database
```
PostgreSQL (Supabase)
├── user_roles table
│   ├── id (UUID)
│   ├── email (unique)
│   ├── role (admin|manager|analyst|reviewer)
│   ├── is_active (boolean)
│   └── created_at, updated_at
└── admin_users table
    ├── id (UUID)
    ├── email (unique)
    └── created_at
```

---

## 🔧 Configuration

### Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup
1. Create project in Supabase
2. Get URL and Anon Key
3. Set environment variables
4. Execute migration SQL

---

## 📋 API Endpoints

### Authentication
```
POST /auth/register
  Body: { email, password }
  Response: { success, user, message }

POST /auth/login
  Body: { email, password }
  Response: { success, user, session, role, isActive }

GET /auth/me
  Headers: { Authorization: Bearer TOKEN }
  Response: { success, user, role, isActive }

POST /auth/logout
  Response: { success, message }
```

### Admin (Requires Auth + Admin Role)
```
GET /admin/users
  Headers: { Authorization: Bearer TOKEN }
  Response: { success, users }

POST /admin/assign-role
  Headers: { Authorization: Bearer TOKEN }
  Body: { email, role }
  Response: { success, user, message }
```

---

## 🧪 Testing

### Quick Test (5 min)
```bash
# 1. Sign up 3 accounts
# 2. Login as admin
# 3. Assign roles
# 4. Test each portal
```

### Full E2E Testing
See `E2E_TESTING_FLOW.md` for 20+ test scenarios covering:
- Registration flow
- Admin role assignment
- Portal access
- Error handling
- Session management
- Security features

### Test Checklist
```
✓ Setup & Config     (5 min)
✓ User Registration  (5 min)
✓ Role Assignment    (5 min)
✓ Portal Access      (5 min)
✓ Edge Cases         (5 min)
✓ UI/UX              (5 min)
```

---

## 🎨 UI/UX Features

### Design
- Dark theme with green accent (#22c55e)
- Clean, modern interface
- Responsive layout (mobile-friendly)
- Accessibility best practices

### Components
- Clean login form with validation
- Admin user management dashboard
- Role-specific portals
- Real-time notifications (toasts)
- Error banners with icons
- Loading spinners
- Status badges

### User Experience
- Smooth sign up / sign in toggle
- Helpful error messages
- Auto-save sessions
- Quick role assignment workflow
- Visual status indicators
- Intuitive navigation

---

## 🔐 Security

### Authentication
- ✓ Supabase Auth (bcrypt password hashing)
- ✓ JWT token validation
- ✓ Secure token storage
- ✓ Session management

### Authorization
- ✓ Role-based access control (RBAC)
- ✓ Admin-only endpoints
- ✓ RLS policies on database
- ✓ Per-request token validation

### Data Protection
- ✓ CORS headers
- ✓ Input validation
- ✓ SQL injection prevention
- ✓ Secure error messages

---

## 📊 Statistics

- **Lines of Code:** ~1500
- **Components:** 5 (LoginPage, AdminPortal, 3x Portal)
- **API Endpoints:** 6 (4 auth + 2 admin)
- **Database Tables:** 2 (user_roles, admin_users)
- **Test Scenarios:** 20+
- **Documentation Pages:** 5

---

## 🚀 Deployment

### Pre-Deployment
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Environment variables set
- [ ] Database migrations executed
- [ ] Admin user created
- [ ] Error logging configured

### Deploy to Vercel
```bash
git push origin main
# Automatic deployment via GitHub integration
```

### Post-Deployment
- [ ] Test on production
- [ ] Monitor error logs
- [ ] Verify email/password auth
- [ ] Check admin dashboard
- [ ] Test role assignment
- [ ] Verify portal access

---

## ✨ Features

### Implemented
- ✓ Email/password authentication
- ✓ User registration
- ✓ Secure login
- ✓ Role-based access control
- ✓ Admin user management
- ✓ Role assignment workflow
- ✓ Session persistence
- ✓ Logout functionality
- ✓ Error handling
- ✓ Form validation
- ✓ Toast notifications
- ✓ Dark theme
- ✓ Responsive design

### Future Enhancements
- [ ] Password reset
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] OAuth/Social login
- [ ] Audit logging
- [ ] User deactivation
- [ ] Bulk user import
- [ ] Role hierarchy

---

## 🆘 Troubleshooting

### "Cannot find module" Error
```
✓ Check import paths (use ../../lib/supabase/client)
✓ Verify file exists
✓ Restart dev server
```

### "Failed to fetch users" Error
```
✓ Check auth token in localStorage
✓ Verify Supabase permissions
✓ Check database tables exist
✓ Verify user is admin
```

### User Stuck on Login
```
✓ Admin hasn't assigned role
✓ Check admin panel for pending users
✓ Verify is_active=true after assignment
```

### Session Not Persisting
```
✓ Check localStorage enabled
✓ Verify auth_token saved
✓ Check token validity
✓ Test in incognito mode
```

See `AUTH_SETUP.md` and `E2E_TESTING_FLOW.md` for more solutions.

---

## 📞 Support Resources

1. **Quick Setup:** `QUICK_START.md`
2. **Detailed Config:** `AUTH_SETUP.md`
3. **Testing Guide:** `E2E_TESTING_FLOW.md`
4. **Design/UX:** `UI_UX_POLISH.md`
5. **Technical Details:** `IMPLEMENTATION_SUMMARY.md`

---

## 📈 Monitoring & Maintenance

### Regular Checks
- [ ] Monitor login success rates
- [ ] Check for auth errors in logs
- [ ] Verify role assignments complete
- [ ] Review failed login attempts
- [ ] Check database performance

### Maintenance Tasks
- [ ] Update security patches
- [ ] Review and adjust RLS policies
- [ ] Archive old user records
- [ ] Audit admin accounts
- [ ] Update documentation

---

## 🎓 Learning Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [React Authentication Patterns](https://react.dev)
- [JWT Tokens](https://jwt.io)
- [RBAC Best Practices](https://www.cloudflare.com/learning/access-management/role-based-access-control-rbac/)

---

## 📄 License

This authentication system is part of the Centralize Match Summary project.

---

## ✅ Status

**Ready for Production** ✓

All features implemented, tested, and documented. Follow `QUICK_START.md` to get started.

---

**Last Updated:** April 1, 2026  
**Version:** 1.0.0  
**Maintainer:** Development Team
