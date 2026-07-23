import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });

  const session = await verifyAuthToken(token);
  if (!session) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: session.sub,
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });
}
