import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookieName, verifySessionToken } from "@backend/session-token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(getSessionCookieName())?.value;
    if (!verifySessionToken(token)) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
