import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    // Try to get current user - this requires middleware to be active
    let user = null;
    try {
      user = await currentUser();
    } catch (clerkErr) {
      // If currentUser fails due to middleware, try auth() as fallback
      if (
        clerkErr?.message?.includes("clerkMiddleware") ||
        clerkErr?.message?.includes("auth()")
      ) {
        const session = await auth();
        if (!session?.userId) {
          return null;
        }
        // Continue without full user object - just use for DB lookup
        user = { id: session.userId };
      } else {
        throw clerkErr;
      }
    }

    if (!user?.id) {
      return null;
    }

    try {
      const loggedInUser = await db.user.findUnique({
        where: {
          clerkUserId: user.id,
        },
      });

      if (loggedInUser) {
        return loggedInUser;
      }

      // Only create new user if we have full user object
      if (!user.firstName) {
        return null;
      }

      const name = `${user.firstName} ${user.lastName}`;

      const newUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0].emailAddress,
        },
      });

      return newUser;
    } catch (error) {
      // More explicit server-side logging so we see errors in terminal
      console.error("checkUser DB error:", error?.message ?? String(error));

      // If there's any DB/connectivity issue, return null so the header and other
      // server components don't crash during rendering. Individual actions that
      // require the DB will return informative errors when invoked.
      return null;
    }
  } catch (clerkError) {
    // Handle any other Clerk errors gracefully
    console.warn(
      "Clerk auth check failed:",
      clerkError?.message ?? String(clerkError),
    );
    return null;
  }
};
