// proxy.js

import {NextResponse} from "next/server";
import {jwtVerify} from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("admin_token")?.value;

  // If already logged in, don't allow access to login/setup pages.
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/setup"
  ) {
    if (token) {
      try {
        await jwtVerify(token, secret);

        return NextResponse.redirect(
          new URL("/admin", request.url)
        );
      } catch {
        // Invalid or expired token.
        // Allow the user to access login/setup.
      }
    }

    return NextResponse.next();
  }

  // All other /admin pages require authentication.
  if (!token) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  try {
    await jwtVerify(token, secret);

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );

    response.cookies.delete("admin_token");

    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};