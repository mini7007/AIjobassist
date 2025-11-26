import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
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
    console.error("checkUser error:", error?.message ?? String(error));
    console.error(error);

    // If there's any DB/connectivity issue, return null so the header and other
    // server components don't crash during rendering. Individual actions that
    // require the DB will return informative errors when invoked.
    return null;
  }
};
