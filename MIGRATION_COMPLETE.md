# ✅ NextAuth Migration Complete

## Summary

Successfully migrated from **Supabase Auth** to **NextAuth v4** with Supabase as the database backend.

## What Changed

### ✅ Authentication System
- **Before:** Supabase Auth handled authentication
- **After:** NextAuth handles authentication, Supabase stores user data

### ✅ User Data Storage
- **Before:** `auth.users` table (managed by Supabase)
- **After:** `auth_users` and `profiles` tables (managed by us)

### ✅ Session Management
- **Before:** Supabase Auth sessions
- **After:** NextAuth sessions stored in `nextauth_sessions` table

### ✅ Password Storage
- **Before:** Supabase Auth handled password hashing
- **After:** We hash passwords with bcrypt (10 rounds)

## Files Modified

### Core Authentication
- ✅ `auth.config.ts` - NextAuth configuration with Credentials and Google providers
- ✅ `auth.ts` - NextAuth instance export
- ✅ `app/api/auth/[...nextauth]/route.ts` - NextAuth API route handler
- ✅ `actions/nextauth.ts` - Register, login, logout server actions
- ✅ `lib/supabase/auth.ts` - Updated to use NextAuth `auth()` instead of `supabase.auth.getUser()`
- ✅ `middleware.ts` - Route protection middleware

### Components
- ✅ `components/auth/login-form.tsx` - Uses `loginAction` from `actions/nextauth.ts`
- ✅ `components/auth/register-form.tsx` - Uses `registerAction` from `actions/nextauth.ts`
- ✅ `components/layout/user-menu.tsx` - Uses `logoutAction` from `actions/nextauth.ts`

### Database
- ✅ `supabase/migrations/0012_nextauth_setup.sql` - Creates all required tables

### Configuration
- ✅ `.env.example` - Added NextAuth and Google OAuth variables
- ✅ `.env.local` - Contains actual credentials (not committed)

### Files Removed
- ❌ `actions/auth.ts` - Old Supabase Auth actions (deleted)

## Database Schema

### `auth_users` Table
Stores authentication credentials:
```sql
- id (uuid, primary key)
- email (text, unique)
- password_hash (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### `profiles` Table
Stores user profile data (linked to `auth_users` via foreign key):
```sql
- id (uuid, foreign key to auth_users.id)
- full_name (text)
- username (text, unique)
- phone (text, unique)
- avatar_url (text, nullable)
- role (text: 'user' or 'admin')
- created_at (timestamptz)
- updated_at (timestamptz)
```

### `nextauth_sessions` Table
Stores active sessions:
```sql
- sessionToken (text, primary key)
- userId (text, foreign key)
- expires (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### `nextauth_accounts` Table
Stores OAuth provider accounts (Google, etc.):
```sql
- userId (text, foreign key)
- type (text)
- provider (text)
- providerAccountId (text)
- refresh_token (text, nullable)
- access_token (text, nullable)
- expires_at (integer, nullable)
- ... (other OAuth fields)
```

## Environment Variables

### Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# NextAuth
NEXTAUTH_SECRET=your_secret_here  # Generate with: openssl rand -hex 32
NEXTAUTH_URL=http://localhost:3000
```

### Optional (for Google OAuth)
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Features

### ✅ Email/Password Authentication
- Registration with email, username, phone, password
- Login with email OR username
- Auto-login after registration
- Password hashing with bcrypt

### ✅ Google OAuth (Optional)
- One-click Google sign-in
- Auto-creates account on first login
- Generates unique username from email
- No password required for Google users

### ✅ Session Management
- Sessions stored in database
- Automatic session refresh
- Secure cookie handling
- Session expires after inactivity

### ✅ Rate Limiting
- Registration: 10 attempts per email in 5 minutes
- Login: 6 attempts per identifier in 60 seconds
- Prevents brute force attacks

### ✅ Route Protection
- Middleware protects `/dashboard`, `/add-business`, `/favorites`
- Admin routes require admin role
- Redirects to login if not authenticated
- Redirects to home if already logged in (on auth pages)

### ✅ Syrian Phone Validation
- Accepts multiple formats: 09XXXXXXXX, +963XXXXXXXXX, etc.
- Normalizes to international format (+963XXXXXXXXX)
- Validates Syrian phone numbers only

### ✅ Username/Email Login
- Users can login with either email or username
- Case-insensitive matching
- Unique username validation

## Testing

### 1. Run Test Script
```bash
npx tsx scripts/test-auth.ts
```

This will verify:
- Database connection
- Tables exist
- Password hashing works
- NextAuth tables are set up

### 2. Manual Testing

#### Register a New User
1. Navigate to `http://localhost:3000/register`
2. Fill in the form:
   - Full Name: أحمد الخطيب
   - Email: test@example.com
   - Username: ahmad_test
   - Phone: 0912345678
   - Password: password123
   - Confirm Password: password123
3. Submit → Should redirect to home page logged in

#### Login with Email
1. Navigate to `http://localhost:3000/login`
2. Enter:
   - Email/Username: test@example.com
   - Password: password123
3. Submit → Should redirect to home page

#### Login with Username
1. Navigate to `http://localhost:3000/login`
2. Enter:
   - Email/Username: ahmad_test
   - Password: password123
3. Submit → Should redirect to home page

#### Test Google OAuth (if configured)
1. Navigate to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Complete Google authentication
4. Should redirect to home page with account created

#### Test Protected Routes
1. Logout
2. Try to access `http://localhost:3000/dashboard`
3. Should redirect to login page
4. Login and try again
5. Should access dashboard successfully

#### Test Admin Routes
1. Login as admin user
2. Access `http://localhost:3000/admin`
3. Should see admin dashboard
4. Login as regular user
5. Try to access admin
6. Should redirect to home page

## Security

### ✅ Password Security
- Passwords hashed with bcrypt (10 rounds)
- Never stored in plain text
- Google OAuth users have empty password_hash

### ✅ Session Security
- Sessions stored in database (not in JWT)
- Secure cookie settings
- Automatic session expiration
- CSRF protection via NextAuth

### ✅ Input Validation
- All inputs validated with Zod schemas
- SQL injection protection via Supabase client
- XSS protection via React
- Rate limiting on auth endpoints

### ✅ Environment Security
- Secrets in `.env.local` (not committed)
- Service role key never exposed to client
- NEXTAUTH_SECRET required for production

## Troubleshooting

### "Missing NEXTAUTH_SECRET"
**Solution:** Add to `.env.local`:
```bash
openssl rand -hex 32
```

### "Database error" during registration
**Solution:** Run migrations:
```bash
supabase db push
```

### Google OAuth not working
**Solution:**
1. Verify credentials in `.env.local`
2. Add redirect URI in Google Cloud Console:
   - `http://localhost:3000/api/auth/callback/google`
3. Enable Google+ API

### Session not persisting
**Solution:**
1. Check `nextauth_sessions` table exists
2. Verify `NEXTAUTH_URL` matches your app URL
3. Clear browser cookies

### "Username already exists"
**Solution:** Try a different username (usernames must be unique)

## Next Steps

### For Development
1. ✅ Start dev server: `npm run dev`
2. ✅ Test registration and login
3. ✅ Verify database entries in Supabase dashboard
4. ✅ Test protected routes

### For Production
1. Update `NEXTAUTH_URL` to production URL
2. Generate new `NEXTAUTH_SECRET` (never reuse dev secret)
3. Enable HTTPS
4. Set up session cleanup job (delete expired sessions)
5. Monitor rate limiting effectiveness

### Optional Enhancements
- [ ] Add email verification
- [ ] Add password reset functionality
- [ ] Add more OAuth providers (GitHub, Facebook)
- [ ] Add two-factor authentication
- [ ] Add account deletion
- [ ] Add profile editing

## Status: ✅ READY FOR TESTING

All components are in place and configured. The migration is complete and ready for testing.

## Support

If you encounter any issues:
1. Check this document for troubleshooting steps
2. Review `NEXTAUTH_VERIFICATION.md` for detailed verification steps
3. Run `npx tsx scripts/test-auth.ts` to diagnose issues
4. Check Supabase logs in dashboard
5. Check browser console for errors

---

**Migration Date:** May 10, 2026  
**NextAuth Version:** 4.24.14  
**Supabase Version:** 2.105.3
