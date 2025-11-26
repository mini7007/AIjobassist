import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Return a small, safe subset of user info for diagnostics
    const payload = {
      authenticated: true,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddresses?.[0]?.emailAddress ?? null,
      imageUrl: user.imageUrl ?? null,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Error while reading Clerk currentUser:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
