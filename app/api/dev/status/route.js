import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  const env = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
  };

  // Test DB connectivity
  let dbStatus = { ok: false, message: null };
  try {
    // try a harmless query
    await db.$queryRaw`SELECT 1`;
    dbStatus.ok = true;
  } catch (err) {
    dbStatus.ok = false;
    dbStatus.message = err?.message ?? String(err);
  }

  return NextResponse.json({ env, db: dbStatus });
}
