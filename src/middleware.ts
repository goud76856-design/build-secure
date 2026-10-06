import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "shipflow_enterprise_secret_auth_key_october_2026_production"
);

const SESSION_COOKIE_NAME = "shipflow_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect role-based routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isDriverRoute = pathname.startsWith("/driver");
  const isCustomerRoute = pathname.startsWith("/customer");

  if (!isAdminRoute && !isDriverRoute && !isCustomerRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const role = payload.role as string;

    if (isAdminRoute && role !== "ADMIN") {
      const target = role === "DRIVER" ? "/driver/dashboard" : "/customer/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (isDriverRoute && role !== "DRIVER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    }

    if (isCustomerRoute && role !== "CUSTOMER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/driver/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/driver/:path*",
    "/customer/:path*",
  ],
};
