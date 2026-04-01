# System Architecture - Authentication & Role-Based Access Control

## 🏗️ Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CENTRALIZE MATCH SUMMARY                        │
│                    Email/Password Authentication System                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React)                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │    LoginPage     │  │  AdminPortal     │  │   App.tsx        │      │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤      │
│  │ • Email Input    │  │ • User List      │  │ • Auth Token     │      │
│  │ • Password Input │  │ • Role Dropdown  │  │ • Session Check  │      │
│  │ • Sign Up Form   │  │ • Assign Button  │  │ • Route Control  │      │
│  │ • Sign In Form   │  │ • Statistics     │  │ • Portal Render  │      │
│  │ • Validation     │  │ • Status Badges  │  │ • Logout Handler │      │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘      │
│           │                     │                     │                 │
│           └─────────────────────┴─────────────────────┘                 │
│                        Uses Supabase Auth                               │
│                        + API Endpoints                                  │
│                                                                          │
└─────────────────────┬──────────────────────────────────────────────────┘
                      │
                      │ HTTPS
                      │
┌─────────────────────┴──────────────────────────────────────────────────┐
│                    BACKEND (Hono + Deno)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Authentication Endpoints                                       │  │
│  │  ──────────────────────────────────────────────────────────────  │  │
│  │  • POST   /auth/register      → Create user account             │  │
│  │  • POST   /auth/login         → Authenticate user               │  │
│  │  • GET    /auth/me            → Get current user + role         │  │
│  │  • POST   /auth/logout        → Logout user                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Admin Endpoints (Protected)                                    │  │
│  │  ──────────────────────────────────────────────────────────────  │  │
│  │  • GET    /admin/users        → List all users (admin only)     │  │
│  │  • POST   /admin/assign-role  → Assign role (admin only)        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Core Functionality                                             │  │
│  │  ──────────────────────────────────────────────────────────────  │  │
│  │  • Token validation on every request                            │  │
│  │  • User role fetching from database                             │  │
│  │  • Admin status verification                                    │  │
│  │  • Role assignment logic                                        │  │
│  │  • Error handling & logging                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────┬──────────────────────────────────────────────────┘
                      │
                      │ SQL
                      │
┌─────────────────────┴──────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL / Supabase)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Supabase Auth (Built-in)                                       │  │
│  │  ─────────────────────────────────────────────────────────────   │  │
│  │  • Users table (managed by Supabase)                            │  │
│  │  • Password hashing (bcrypt)                                    │  │
│  │  • JWT token generation                                         │  │
│  │  • Session management                                           │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  user_roles Table (Custom)                                      │  │
│  │  ─────────────────────────────────────────────────────────────   │  │
│  │  • id (UUID Primary Key)                                        │  │
│  │  • email (TEXT UNIQUE)                                          │  │
│  │  • role (admin | manager | analyst | reviewer)                  │  │
│  │  • is_active (BOOLEAN)                                          │  │
│  │  • created_at, updated_at (TIMESTAMPS)                          │  │
│  │  • Indexes: email, role                                         │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  admin_users Table (Custom)                                     │  │
│  │  ─────────────────────────────────────────────────────────────   │  │
│  │  • id (UUID Primary Key)                                        │  │
│  │  • email (TEXT UNIQUE)                                          │  │
│  │  • created_at (TIMESTAMP)                                       │  │
│  │  • Index: email                                                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Security (RLS - Row Level Security)                            │  │
│  │  ─────────────────────────────────────────────────────────────   │  │
│  │  ✓ Users can read their own role                                │  │
│  │  ✓ Admins can manage all roles                                  │  │
│  │  ✓ Admins can read admin list                                   │  │
│  │  ✓ Only admins can modify admin_users                           │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### User Registration Flow
```
┌─────────────────┐
│   User Visits   │
│   Login Page    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Enters Email & │
│    Password     │
└────────┬────────┘
         │
         ▼
┌────────────────────────────┐
│  Client-side Validation    │
│  • Password >= 6 chars     │
│  • Passwords match         │
│  • Valid email format      │
└────────┬───────────────────┘
         │ ✓
         ▼
┌─────────────────────────────┐
│  POST /auth/register        │
│  → Supabase Auth            │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Supabase Creates User      │
│  • Hash password (bcrypt)   │
│  • Store in auth.users      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend Creates user_roles │
│  • email (from request)     │
│  • role = 'pending'         │
│  • is_active = false        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Success Response           │
│  • Return user object       │
│  • Show success toast       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  User Awaits Role           │
│  Assignment from Admin      │
└─────────────────────────────┘
```

### User Login Flow
```
┌─────────────────┐
│   User Visits   │
│   Login Page    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Enters Email & │
│    Password     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│  POST /auth/login            │
│  → Supabase Auth             │
└────────┬─────────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Supabase Validates        │
│  • Check user exists       │
│  • Verify password         │
│  • Generate JWT token      │
└────────┬───────────────────┘
         │
         ├─ ✗ Invalid Credentials
         │   └─ Return 401 Error
         │
         ▼
┌────────────────────────────┐
│  ✓ Return JWT + User       │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Get User Role             │
│  SELECT * FROM user_roles  │
│  WHERE email = ?           │
└────────┬───────────────────┘
         │
         ├─ Role NOT Found (Pending)
         │   └─ Return is_active=false
         │
         ▼
┌────────────────────────────────┐
│  Check is_active Status        │
└────────┬───────────────────────┘
         │
         ├─ ✗ is_active = false
         │   └─ "Awaiting admin..."
         │       Return to login
         │
         ├─ ✓ is_active = true
         │   └─ Proceed
         │
         ▼
┌────────────────────────────────┐
│  Store Token in localStorage   │
│  auth_token = JWT              │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Route to Role Portal          │
│  • admin → AdminPortal         │
│  • manager → ManagerPortal     │
│  • analyst → AnalystPortal     │
│  • reviewer → ReviewerPortal   │
└────────────────────────────────┘
```

### Admin Role Assignment Flow
```
┌───────────────────┐
│  Admin Logs In    │
│  (is_active=true) │
└────────┬──────────┘
         │
         ▼
┌───────────────────────────────┐
│  Routes to Admin Portal       │
└────────┬──────────────────────┘
         │
         ▼
┌───────────────────────────────────┐
│  GET /admin/users                 │
│  • Authorization: Bearer TOKEN    │
│  • Backend validates admin status │
└────────┬──────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  SELECT * FROM user_roles   │
│  WHERE is_active = false    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Display Pending Users      │
│  • manager@test.com         │
│  • analyst@test.com         │
│  • reviewer@test.com        │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Admin Selects User          │
│  Admin Selects Role          │
│  Admin Clicks "Assign"       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  POST /admin/assign-role         │
│  • Authorization: Bearer TOKEN   │
│  • Body: { email, role }         │
└────────┬───────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Backend Validation          │
│  • Verify user is admin      │
│  • Validate role value       │
│  • Check user exists         │
└────────┬───────────────────┘
         │
         ├─ ✗ Not admin
         │   └─ Return 403
         │
         ├─ ✗ Invalid role
         │   └─ Return 400
         │
         ▼
┌──────────────────────────────┐
│  UPDATE user_roles           │
│  • role = assigned_role      │
│  • is_active = true          │
│  • updated_at = NOW()        │
└────────┬───────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Return Updated User         │
│  Show Success Toast          │
└────────┬───────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Update UI Immediately       │
│  • Status → Active           │
│  • Role → Assigned role      │
│  • Remove from Pending       │
│  • Add to Active section     │
│  • Update statistics         │
└──────────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                           │
└────────────────────────────────────────────────────────────┘

Layer 1: Client-Side
─────────────────────
  ✓ Form validation
  ✓ Input sanitization
  ✓ Client-side checks (before API call)
  ✓ Secure token storage (localStorage)
  ✓ No sensitive data in URLs

Layer 2: Transport
──────────────────
  ✓ HTTPS/TLS encryption
  ✓ CORS headers validation
  ✓ Secure headers

Layer 3: API/Backend
────────────────────
  ✓ Token validation on every request
  ✓ Admin role verification
  ✓ Input validation
  ✓ Error handling (no data leaks)
  ✓ Rate limiting ready

Layer 4: Database
─────────────────
  ✓ Supabase Auth (bcrypt passwords)
  ✓ Row Level Security (RLS)
  ✓ User data isolation
  ✓ Admin-only access policies
  ✓ Encrypted connections

Layer 5: Authorization
──────────────────────
  ✓ Role-based access (RBAC)
  ✓ Admin-only endpoints
  ✓ User-specific data access
  ✓ RLS policies on tables
```

---

## 📦 Component Dependencies

```
App.tsx (Root)
├── Imports: createClient, supabase
├── Uses: React hooks, toast notifications
└── Routes:
    ├─ Not Logged In → LoginPage
    ├─ Logged In:
    │  ├─ role='admin' → AdminPortal
    │  ├─ role='manager' → ManagerPortal
    │  ├─ role='analyst' → AnalystPortal
    │  └─ role='reviewer' → ReviewerPortal
    │
LoginPage.tsx
├── Imports: createClient, supabase
├── Exports: LoginPage component
└── Handles:
    ├─ Registration (POST /auth/register)
    ├─ Login (POST /auth/login)
    └─ Session storage

AdminPortal.tsx
├── Imports: createClient, supabase, projectId
├── Exports: AdminPortal component
└── Handles:
    ├─ Fetch users (GET /admin/users)
    ├─ Assign roles (POST /admin/assign-role)
    └─ Update UI

ManagerPortal.tsx
├── Imports: UI components
├── Exports: ManagerPortal component
└── Displays: Match management features

AnalystPortal.tsx
├── Imports: UI components
├── Exports: AnalystPortal component
└── Displays: Analysis features

ReviewerPortal.tsx
├── Imports: UI components
├── Exports: ReviewerPortal component
└── Displays: Review features
```

---

## 🗂️ File Organization

```
/vercel/share/v0-project/
│
├── src/app/
│   ├── App.tsx                      (Main component)
│   └── components/
│       ├── LoginPage.tsx            (Auth forms)
│       ├── AdminPortal.tsx          (Role management)
│       ├── ManagerPortal.tsx        (Manager portal)
│       ├── AnalystPortal.tsx        (Analyst portal)
│       ├── ReviewerPortal.tsx       (Reviewer portal)
│       └── ui/                      (shadcn components)
│
├── lib/
│   └── supabase/
│       └── client.ts                (Supabase client)
│
├── supabase/
│   ├── functions/
│   │   └── server/
│   │       ├── index.tsx            (Hono API)
│   │       └── kv_store.tsx         (KV helpers)
│   └── migrations/
│       └── 001_create_user_roles.sql (Schema)
│
├── scripts/
│   └── setup-db.mjs                 (Setup script)
│
└── Documentation/
    ├── README_AUTH_SYSTEM.md        (Overview)
    ├── QUICK_START.md               (Setup)
    ├── AUTH_SETUP.md                (Config)
    ├── E2E_TESTING_FLOW.md          (Testing)
    ├── UI_UX_POLISH.md              (Design)
    ├── IMPLEMENTATION_SUMMARY.md    (Technical)
    ├── PRE_DEPLOYMENT_CHECKLIST.md  (Checklist)
    ├── DELIVERY_SUMMARY.md          (This)
    └── SYSTEM_ARCHITECTURE.md       (Architecture)
```

---

## 📊 Database Schema Diagram

```
┌─────────────────────────────────────────────┐
│              SUPABASE AUTH                   │
│          (Managed by Supabase)               │
├─────────────────────────────────────────────┤
│ users                                       │
├─────────────────────────────────────────────┤
│ • id (UUID PK)                              │
│ • email (VARCHAR)                           │
│ • password_hash (VARCHAR - encrypted)       │
│ • created_at (TIMESTAMP)                    │
│ • updated_at (TIMESTAMP)                    │
│ • jwt_token (generated per session)         │
└─────────────────────────────────────────────┘
              ▲
              │ Links to
              │
┌─────────────────────────────────────────────┐
│           USER_ROLES TABLE                   │
│         (Custom Table)                       │
├─────────────────────────────────────────────┤
│ • id (UUID PK)                              │
│ • email (VARCHAR UNIQUE) ←──────────────────┤ Foreign reference
│ • role (VARCHAR)                            │
│   Constraint: admin | manager |             │
│               analyst | reviewer            │
│ • is_active (BOOLEAN)                       │
│ • created_at (TIMESTAMP)                    │
│ • updated_at (TIMESTAMP)                    │
│                                             │
│ Indexes:                                    │
│ • idx_user_roles_email                      │
│ • idx_user_roles_role                       │
│                                             │
│ RLS Policies:                               │
│ • Users can read their own role             │
│ • Admins can manage all roles               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│          ADMIN_USERS TABLE                   │
│         (Custom Table)                       │
├─────────────────────────────────────────────┤
│ • id (UUID PK)                              │
│ • email (VARCHAR UNIQUE) ←─────────┐        │
│ • created_at (TIMESTAMP)           │        │
│                                    │        │
│ Indexes:                           │        │
│ • idx_admin_users_email            │        │
│                                    │        │
│ RLS Policies:                      │        │
│ • Admins can read admin list       │        │
│ • Only admins can modify           │        │
└─────────────────────────────────────────────┘
                                     │
        (Reference to user_roles)────┘
```

---

## 🔄 State Management Flow

```
┌────────────────────────────┐
│     localStorage            │
│  ┌──────────────────────┐  │
│  │  auth_token = JWT    │  │
│  └──────────────────────┘  │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│      React Component State (App.tsx)       │
├────────────────────────────────────────────┤
│ • user: { role, email }                    │
│ • loading: boolean                         │
│ • session checked: boolean                 │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│    Component-Specific State                │
├────────────────────────────────────────────┤
│ LoginPage:                                 │
│ • email, password, confirmPassword         │
│ • isSignUp, loading, error                 │
│                                            │
│ AdminPortal:                               │
│ • users[], selectedUser, assigningRole     │
│ • loading, isAssigning                     │
│                                            │
│ Portals:                                   │
│ • Various feature-specific state           │
└────────────────────────────────────────────┘
```

---

## ✨ Key Design Decisions

### Why localStorage for Auth Token?
- Simplicity for MVP
- Works with SPA architecture
- Easy to clear on logout
- **Future:** Consider httpOnly cookies for additional security

### Why Supabase Auth + Custom user_roles Table?
- Supabase Auth handles password security
- Custom table provides role flexibility
- Easy to add custom role properties later
- RLS policies handle data isolation

### Why Hono for Backend?
- Lightweight and fast
- Perfect for Supabase Functions
- Easy CORS and middleware handling
- Good TypeScript support

### Why Admin-Managed Roles?
- Security: Prevents unauthorized role elevation
- Control: Admins review users before granting access
- Workflow: Clear admin approval process
- Future: Can be enhanced with role requests

---

## 🎯 Performance Considerations

```
Frontend:
  ✓ Component lazy loading
  ✓ Minimal re-renders
  ✓ Efficient state updates
  ✓ Optimized imports

Backend:
  ✓ Database indexes on email, role
  ✓ Single query per request
  ✓ Minimal data transfers
  ✓ Connection pooling (Supabase)

Database:
  ✓ Strategic indexes
  ✓ RLS policies optimized
  ✓ Query optimization
  ✓ Connection limits

Caching:
  ✓ Session tokens in localStorage
  ✓ Role data fetched on login
  ✓ Minimal repeated queries
```

---

This completes the architecture overview of your authentication system!
