import { auth } from "@clerk/nextjs/server";

/**
 * Returns a resolved userId for server actions.
 * - Uses Clerk's auth when available.
 * - Falls back to DEV_USER_ID env variable when running locally (convenience for testing).
 */
export async function getEffectiveUserId() {
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch (err) {
    // swallow — we'll fall back to DEV_USER_ID if present
  }

  if (process.env.DEV_USER_ID) return process.env.DEV_USER_ID;
  return null;
}
