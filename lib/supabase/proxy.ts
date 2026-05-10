import { NextResponse, type NextRequest } from "next/server";

/**
 * This file is kept for backward compatibility but is no longer used.
 * Session management is now handled by NextAuth in the root proxy.ts file.
 * 
 * @deprecated Use NextAuth session management instead
 */
export async function updateSession(request: NextRequest) {
  // NextAuth handles session management automatically
  return NextResponse.next({ request });
}
