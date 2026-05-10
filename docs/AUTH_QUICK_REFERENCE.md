# Authentication Quick Reference

## For Developers

### Getting the Current User

#### In Server Components
```typescript
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export default async function MyComponent() {
  const session = await getServerSession(authConfig);
  
  if (!session?.user) {
    return <div>Not logged in</div>;
  }
  
  return <div>Hello {session.user.name}</div>;
}
```

#### Get Full Profile
```typescript
import { getCurrentProfile } from "@/lib/supabase/auth";

export default async function MyComponent() {
  const profile = await getCurrentProfile();
  
  if (!profile) {
    return <div>Not logged in</div>;
  }
  
  return (
    <div>
      <p>Name: {profile.full_name}</p>
      <p>Username: {profile.username}</p>
      <p>Role: {profile.role}</p>
    </div>
  );
}
```

#### Require Authentication
```typescript
import { requireProfile } from "@/lib/supabase/auth";

export default async function ProtectedPage() {
  const profile = await requireProfile(); // Redirects to /login if not authenticated
  
  return <div>Welcome {profile.full_name}</div>;
}
```

#### Require Admin
```typescript
import { requireAdmin } from "@/lib/supabase/auth";

export default async function AdminPage() {
  const profile = await requireAdmin(); // Redirects if not admin
  
  return <div>Admin Dashboard</div>;
}
```

### Authentication Actions

#### Login
```typescript
import { loginAction } from "@/actions/nextauth";

// In a form
<form action={loginAction}>
  <input name="identifier" placeholder="Email or Username" />
  <input name="password" type="password" />
  <button type="submit">Login</button>
</form>
```

#### Register
```typescript
import { registerAction } from "@/actions/nextauth";

// In a form
<form action={registerAction}>
  <input name="email" type="email" />
  <input name="fullName" />
  <input name="username" />
  <input name="phone" />
  <input name="password" type="password" />
  <input name="confirmPassword" type="password" />
  <button type="submit">Register</button>
</form>
```

#### Logout
```typescript
import { logoutAction } from "@/actions/nextauth";

// In a form
<form action={logoutAction}>
  <button type="submit">Logout</button>
</form>
```

### Protecting Routes

#### Using Middleware (Automatic)
Routes are automatically protected by `middleware.ts`:
- `/dashboard/*` - Requires authentication
- `/add-business` - Requires authentication
- `/favorites` - Requires authentication
- `/admin/*` - Requires authentication (role check in layout)

#### Manual Protection in Layout
```typescript
import { requireUser } from "@/lib/supabase/auth";

export default async function MyLayout({ children }) {
  await requireUser(); // Redirects to /login if not authenticated
  return <div>{children}</div>;
}
```

### Checking User Role

```typescript
import { getCurrentProfile } from "@/lib/supabase/auth";

export default async function MyComponent() {
  const profile = await getCurrentProfile();
  
  if (profile?.role === "admin") {
    return <AdminPanel />;
  }
  
  return <UserPanel />;
}
```

### Database Queries with User Context

```typescript
import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function getMyBusinesses() {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }
  
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id);
  
  return data || [];
}
```

### Common Patterns

#### Conditional Rendering Based on Auth
```typescript
import { getCurrentProfile } from "@/lib/supabase/auth";

export default async function Header() {
  const profile = await getCurrentProfile();
  
  return (
    <header>
      {profile ? (
        <div>
          <span>Welcome {profile.full_name}</span>
          <form action={logoutAction}>
            <button>Logout</button>
          </form>
        </div>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

#### Show Different Content for Admin
```typescript
import { isCurrentUserAdmin } from "@/lib/supabase/auth";

export default async function MyPage() {
  const isAdmin = await isCurrentUserAdmin();
  
  return (
    <div>
      <h1>My Page</h1>
      {isAdmin && <AdminControls />}
      <RegularContent />
    </div>
  );
}
```

### Available Helper Functions

From `lib/supabase/auth.ts`:

```typescript
// Get current user (id and email only)
const user = await getCurrentUser();

// Get full profile (includes username, phone, role, etc.)
const profile = await getCurrentProfile();

// Get user role
const role = await getCurrentUserRole();

// Check if user is admin
const isAdmin = await isCurrentUserAdmin();

// Require authentication (redirects if not logged in)
const user = await requireUser();
const profile = await requireProfile();

// Require admin role (redirects if not admin)
const adminProfile = await requireAdmin();
```

### TypeScript Types

```typescript
import type { CurrentProfile, ProfileRole } from "@/lib/supabase/auth";

// ProfileRole = "user" | "admin"

// CurrentProfile = {
//   id: string;
//   full_name: string;
//   username: string;
//   phone: string;
//   avatar_url: string | null;
//   role: ProfileRole;
// }
```

### Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

Optional (for Google OAuth):
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Common Errors

#### "NEXTAUTH_SECRET is not set"
Add `NEXTAUTH_SECRET` to `.env.local`:
```bash
openssl rand -hex 32
```

#### "User not found"
User might not be logged in. Use `getCurrentProfile()` and check for null:
```typescript
const profile = await getCurrentProfile();
if (!profile) {
  // Handle not logged in
}
```

#### "Unauthorized"
Check if route is protected by middleware or requires admin role.

### Testing Authentication

```bash
# Run auth test script
npx tsx scripts/test-auth.ts

# Start dev server
npm run dev

# Test registration
# Navigate to: http://localhost:3000/register

# Test login
# Navigate to: http://localhost:3000/login
```

### Best Practices

1. **Always check for null** when using `getCurrentProfile()` or `getCurrentUser()`
2. **Use `requireProfile()`** in layouts to protect entire sections
3. **Use middleware** for route-level protection
4. **Cache auth checks** - helper functions are already cached with React `cache()`
5. **Don't expose sensitive data** - only return what's needed
6. **Validate user input** - use Zod schemas for forms
7. **Rate limit auth endpoints** - already implemented in actions

### Migration Notes

If you see old code using `supabase.auth.*`:
- ❌ `supabase.auth.getUser()` → ✅ `getCurrentUser()` from `@/lib/supabase/auth`
- ❌ `supabase.auth.signIn()` → ✅ `loginAction` from `@/actions/nextauth`
- ❌ `supabase.auth.signUp()` → ✅ `registerAction` from `@/actions/nextauth`
- ❌ `supabase.auth.signOut()` → ✅ `logoutAction` from `@/actions/nextauth`

---

**Last Updated:** May 10, 2026  
**NextAuth Version:** 4.24.14
