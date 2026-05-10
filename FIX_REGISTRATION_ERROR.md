# Fix Registration Error

## Problem
You're getting "خطأ في إنشاء الحساب. حاول مرة أخرى." when trying to register.

## Root Cause
The database tables for NextAuth (`auth_users`, `nextauth_sessions`, etc.) don't exist yet in your Supabase database.

## Solution: Apply Database Migrations

### Option 1: Using Supabase Dashboard (EASIEST)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `svyltfyigguqsejligby`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Run the Migration**
   - Open the file: `supabase/migrations/APPLY_THIS_MANUALLY.sql`
   - Copy ALL the content
   - Paste it into the SQL Editor
   - Click "Run" button (or press Ctrl+Enter)

4. **Verify Success**
   - You should see a success message
   - Check "Table Editor" to see the new tables:
     - `auth_users`
     - `nextauth_sessions`
     - `nextauth_users`
     - `nextauth_accounts`
     - `nextauth_verification_tokens`

### Option 2: Using Supabase CLI

If you prefer using the CLI:

1. **Install Supabase CLI**
   ```bash
   # Windows (using Scoop)
   scoop install supabase
   
   # Or using npm
   npm install -g supabase
   ```

2. **Link to your project**
   ```bash
   supabase link --project-ref svyltfyigguqsejligby
   ```

3. **Apply migrations**
   ```bash
   supabase db push
   ```

## After Applying Migrations

1. **Test the database**
   ```bash
   npx tsx scripts/test-auth.ts
   ```
   
   You should see:
   ```
   ✅ Database connection successful
   ✅ auth_users table exists
   ✅ profiles table exists
   ✅ Password hashing works
   ✅ nextauth_sessions table exists
   ```

2. **Test registration**
   - Start dev server: `npm run dev`
   - Go to: http://localhost:3000/register
   - Fill in the form
   - Should successfully create account and login

## Troubleshooting

### Still getting errors after applying migrations?

1. **Check server logs**
   - Look at your terminal where `npm run dev` is running
   - You should see console.error messages showing the exact error

2. **Check Supabase logs**
   - Go to Supabase Dashboard → Logs
   - Look for any errors

3. **Verify tables exist**
   - Go to Supabase Dashboard → Table Editor
   - Confirm these tables exist:
     - `auth_users`
     - `profiles`
     - `nextauth_sessions`

4. **Check RLS policies**
   - The migration grants permissions to `authenticated` and `anon` roles
   - If you have strict RLS policies, you may need to adjust them

### Common Issues

**Issue: "relation 'auth_users' does not exist"**
- Solution: Run the migration SQL in Supabase dashboard

**Issue: "permission denied for table auth_users"**
- Solution: Check RLS policies or run the GRANT statements in the migration

**Issue: "foreign key constraint violation"**
- Solution: Make sure `profiles` table exists before running migration

## Quick Test

After applying migrations, try this quick test:

```bash
# Test database connection
npx tsx scripts/test-auth.ts

# Start dev server
npm run dev

# Open browser
# Go to: http://localhost:3000/register
# Try registering with:
#   - Full Name: Test User
#   - Email: test@example.com
#   - Username: testuser
#   - Phone: 0912345678
#   - Password: password123
#   - Confirm Password: password123
```

If it works, you should be automatically logged in and redirected to the home page!

## Need Help?

If you're still having issues:
1. Check the server console for error messages
2. Check Supabase Dashboard → Logs
3. Run `npx tsx scripts/test-auth.ts` and share the output
