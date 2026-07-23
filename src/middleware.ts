import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "yt_token";

// Routes that require any authenticated session.
const PROTECTED = ["/account"];
// Routes that require the "admin" role.
const ADMIN = ["/admin"];

function secretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = ADMIN.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const needsAuth =
    isAdminRoute ||
    PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  let role: string | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey());
      role = (payload.role as string) ?? "user";
    } catch {
      role = null;
    }
  }

  // Not signed in → send to login
  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Signed in but not an admin on an admin route → bounce home
  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account", "/account/:path*", "/admin", "/admin/:path*"],
};
