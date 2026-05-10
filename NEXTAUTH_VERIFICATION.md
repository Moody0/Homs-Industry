# NextAuth + Supabase Integration Verification

## Overview
This project uses **NextAuth v4** for authentication with **Supabase** as the database backend. Supabase only stores user data - it does NOT handle authentication.

## Architecture

### Authentication Flow
1. **NextAuth** handles all authentication logic (login, register, sessions)
2. **Supabase** stores user data in two tables:
   - `auth_users`: Email and password hash
   - `profiles`: User profile information (username, phone, full name, etc.)

### Supported Authentication Methods
- ✅ Email/Password (Credentials Provider)
- ✅ Google OAuth (Optional - requires configuration)

## Configuration Checklist

### ✅ 1. Environment Variables
Check `.env.local` has these variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# NextAuth (Required)
NEXTAUTH_SECRET=your_secret_here  # Generate with: openssl rand -hex 32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### ✅ 2. Database Schema
Run all migrations in `supabase/migrations/`:

```bash
# Apply migrations to your Supabase project
supabase db push
```

Key tables created:
- `auth_users` - Stores email and password hash
- `profiles` - Stores user profile data (linked via foreign key)
- `nextauth_sessions` - Stores active sessions
- `nextauth_accounts` - Stores OAuth provider accounts

### ✅ 3. Core Files

#### Authentication Configuration
- `auth.config.ts` - NextAuth configuration with providers
- `auth.ts` - NextAuth instance export
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route

#### Server Actions
- `actions/nextauth.ts` - Register, login, logout actions

#### Components
- `components/auth/login-form.tsx` - Login form
- `components/auth/register-form.tsx` - Registration form

#### Validation
- `lib/validation/auth.ts` - Zod schemas for auth forms

### ✅ 4. Dependencies
All required packages are installed:

```json
{
  "next-auth": "^4.24.14",
  "@supabase/ssr": "^0.10.2",
  "@supabase/supabase-js": "^2.105.3",
  "bcryptjs": "^3.0.3"
}
```

## Testing the Integration

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Registration
1. Navigate to `http://localhost:3000/register`
2. Fill in the registration form:
   - Full Name: أحمد الخطيب
   - Email: test@example.com
   - Username: ahmad_test
   - Phone: 0912345678
   - Password: password123
   - Confirm Password: password123
3. Submit the form
4. Should redirect to home page with user logged in

### 3. Test Login
1. Navigate to `http://localhost:3000/login`
2. Login with:
   - Email/Username: test@example.com or ahmad_test
   - Password: password123
3. Should redirect to home page

### 4. Test Google OAuth (Optional)
1. Set up Google OAuth credentials in Google Cloud Console
2. Add credentials to `.env.local`
3. Click "Sign in with Google" button
4. Should redirect to Google login and back to app

### 5. Verify Database
Check Supabase dashboard:
1. Go to Table Editor
2. Check `auth_users` table - should have email and password_hash
3. Check `profiles` table - should have user profile data
4. Check `nextauth_sessions` table - should have active session

## Key Features

### ✅ Auto-Activation
- No email verification required
- Users are automatically logged in after registration

### ✅ Rate Limiting
- Registration: 10 attempts per email in 5 minutes
- Login: 6 attempts per identifier in 60 seconds

### ✅ Password Security
- Passwords hashed with bcrypt (10 rounds)
- Minimum 8 characters required

### ✅ Username/Email Login
- Users can login with either email or username
- Case-insensitive matching

### ✅ Syrian Phone Validation
- Accepts multiple formats: 09XXXXXXXX, +963XXXXXXXXX, etc.
- Normalizes to international format (+963XXXXXXXXX)

### ✅ Google OAuth Integration
- Auto-creates account on first login
- Generates unique username from email
- Links to existing account if email matches

## Troubleshooting

### Issue: "Missing NEXTAUTH_SECRET"
**Solution:** Add `NEXTAUTH_SECRET` to `.env.local`
```bash
openssl rand -hex 32
```

### Issue: "Database error" during registration
**Solution:** Ensure migrations are applied
```bash
supabase db push
```

### Issue: Google OAuth not working
**Solution:** 
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Add authorized redirect URI in Google Cloud Console:
   - `http://localhost:3000/api/auth/callback/google`
3. Enable Google+ API in Google Cloud Console

### Issue: "Username already exists"
**Solution:** This is expected - usernames must be unique. Try a different username.

### Issue: Session not persisting
**Solution:** 
1. Check `nextauth_sessions` table exists
2. Verify `NEXTAUTH_URL` matches your app URL
3. Clear browser cookies and try again

## Security Notes

### ✅ Password Storage
- Passwords are hashed with bcrypt (never stored in plain text)
- Google OAuth users have empty password_hash (they don't need passwords)

### ✅ Session Management
- Sessions stored in Supabase database
- Automatic session refresh
- Secure cookie handling

### ✅ Rate Limiting
- Prevents brute force attacks
- In-memory rate limiting (resets on server restart)

### ✅ Input Validation
- All inputs validated with Zod schemas
- SQL injection protection via Supabase client
- XSS protection via React

## Migration from Supabase Auth

If you previously used Supabase Auth, the migration is complete:
- ✅ Removed all `supabase.auth.*` calls
- ✅ Replaced with NextAuth `signIn()` and `signOut()`
- ✅ User data migrated to `auth_users` and `profiles` tables
- ✅ Sessions managed by NextAuth

## Next Steps

1. **Production Deployment:**
   - Update `NEXTAUTH_URL` to production URL
   - Use secure `NEXTAUTH_SECRET` (never commit to git)
   - Enable HTTPS

2. **Optional Enhancements:**
   - Add email verification (requires email service)
   - Add password reset functionality
   - Add more OAuth providers (GitHub, Facebook, etc.)
   - Add two-factor authentication

3. **Monitoring:**
   - Monitor `nextauth_sessions` table size
   - Set up session cleanup job (delete expired sessions)
   - Monitor rate limiting effectiveness

## Status: ✅ READY FOR TESTING

All components are in place and configured. The integration is ready for testing.
