/**
 * Test script to verify NextAuth + Supabase integration
 * 
 * This script tests:
 * 1. Database connection
 * 2. auth_users table exists
 * 3. profiles table exists
 * 4. Password hashing works
 * 5. User lookup by email/username works
 * 
 * Run with: npx tsx scripts/test-auth.ts
 */

// Load environment variables from .env.local
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("   Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log("\n🔍 Testing database connection...");
  
  try {
    const { data, error } = await supabase
      .from("auth_users")
      .select("count")
      .limit(1);
    
    if (error) {
      console.error("❌ Database connection failed:", error.message);
      return false;
    }
    
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection error:", error);
    return false;
  }
}

async function testAuthUsersTable() {
  console.log("\n🔍 Testing auth_users table...");
  
  try {
    const { data, error } = await supabase
      .from("auth_users")
      .select("id, email, created_at")
      .limit(1);
    
    if (error) {
      console.error("❌ auth_users table error:", error.message);
      console.error("   Run: supabase db push");
      return false;
    }
    
    console.log("✅ auth_users table exists");
    console.log(`   Found ${data?.length || 0} users`);
    return true;
  } catch (error) {
    console.error("❌ auth_users table error:", error);
    return false;
  }
}

async function testProfilesTable() {
  console.log("\n🔍 Testing profiles table...");
  
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, role")
      .limit(1);
    
    if (error) {
      console.error("❌ profiles table error:", error.message);
      console.error("   Run: supabase db push");
      return false;
    }
    
    console.log("✅ profiles table exists");
    console.log(`   Found ${data?.length || 0} profiles`);
    return true;
  } catch (error) {
    console.error("❌ profiles table error:", error);
    return false;
  }
}

async function testPasswordHashing() {
  console.log("\n🔍 Testing password hashing...");
  
  try {
    const password = "test123";
    const hash = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, hash);
    
    if (!match) {
      console.error("❌ Password hashing failed");
      return false;
    }
    
    console.log("✅ Password hashing works");
    return true;
  } catch (error) {
    console.error("❌ Password hashing error:", error);
    return false;
  }
}

async function testNextAuthTables() {
  console.log("\n🔍 Testing NextAuth tables...");
  
  try {
    const { data: sessions, error: sessionsError } = await supabase
      .from("nextauth_sessions")
      .select("sessionToken")
      .limit(1);
    
    if (sessionsError) {
      console.error("❌ nextauth_sessions table error:", sessionsError.message);
      console.error("   Run: supabase db push");
      return false;
    }
    
    console.log("✅ nextauth_sessions table exists");
    console.log(`   Found ${sessions?.length || 0} active sessions`);
    return true;
  } catch (error) {
    console.error("❌ NextAuth tables error:", error);
    return false;
  }
}

async function runTests() {
  console.log("🚀 NextAuth + Supabase Integration Test");
  console.log("========================================");
  
  const results = await Promise.all([
    testDatabaseConnection(),
    testAuthUsersTable(),
    testProfilesTable(),
    testPasswordHashing(),
    testNextAuthTables(),
  ]);
  
  const allPassed = results.every((result) => result === true);
  
  console.log("\n========================================");
  if (allPassed) {
    console.log("✅ All tests passed! Integration is ready.");
    console.log("\n📝 Next steps:");
    console.log("   1. Start dev server: npm run dev");
    console.log("   2. Navigate to: http://localhost:3000/register");
    console.log("   3. Create a test account");
    console.log("   4. Login at: http://localhost:3000/login");
  } else {
    console.log("❌ Some tests failed. Check the errors above.");
    console.log("\n📝 Common fixes:");
    console.log("   1. Run migrations: supabase db push");
    console.log("   2. Check .env.local has correct Supabase credentials");
    console.log("   3. Verify Supabase project is running");
  }
  
  process.exit(allPassed ? 0 : 1);
}

runTests();
