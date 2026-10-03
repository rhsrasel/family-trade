// proxy.js

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;

  const adminToken = request.cookies.get("admin_token")?.value;

  const userToken = request.cookies.get("user_token")?.value;

  // Admin login/setup pages
  if (pathname === "/admin/login" || pathname === "/admin/setup") {
    if (adminToken) {
      try {
        await jwtVerify(adminToken, secret);

        return NextResponse.redirect(new URL("/admin", request.url));
      } catch {
        // Invalid or expired token.
      }
    }

    return NextResponse.next();
  }

  // User login page
  if (pathname === "/user/login") {
    if (userToken) {
      try {
        await jwtVerify(userToken, secret);

        return NextResponse.redirect(new URL("/ledger", request.url));
      } catch {
        // Invalid or expired token.
      }
    }

    return NextResponse.next();
  }

  // All other /admin pages require admin authentication.
  if (pathname.startsWith("/admin/")) {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(adminToken, secret);

      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );

      response.cookies.delete("admin_token");

      return response;
    }
  }

  // Ledger pages require either admin or user authentication.
  if (pathname === "/ledger" || pathname.startsWith("/ledger/")) {
    if (adminToken) {
      try {
        await jwtVerify(adminToken, secret);

        return NextResponse.next();
      } catch {
        // Invalid admin token.
      }
    }

    if (userToken) {
      try {
        await jwtVerify(userToken, secret);

        return NextResponse.next();
      } catch {
        // Invalid user token.
      }
    }

    return NextResponse.redirect(new URL("/user/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/login", "/ledger/:path*"],
};
