import { NextResponse } from "next/server";
import { auth } from "./auth"; // Ensure you have `auth.ts` configured for NextAuth

export async function middleware(req: Request) {
  const session = await auth(); // Get the session

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url)); // Redirect unauthenticated users
  }

  return NextResponse.next(); // Allow access if authenticated
}

// Define protected routes
export const config = {
  matcher: ["/chat", "/room/:slug*", "/dashboard"], // Secure these routes
};
