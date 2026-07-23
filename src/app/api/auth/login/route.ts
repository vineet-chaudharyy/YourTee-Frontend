import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  AUTH_COOKIE,
  cookieOptions,
  verifyPassword,
  loginSchema,
  signAuthToken,
  rateLimit,
  clientIp,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Throttle brute-force attempts (per IP + per email)
  const rl = rateLimit(`login:${clientIp(req)}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  try {
    await connectDB();
  } catch {
    return NextResponse.json(
      { error: "Service unavailable. Please try again later." },
      { status: 503 }
    );
  }

  // Include the normally-hidden passwordHash for verification
  const user = await User.findOne({ email }).select("+passwordHash");

  // Always run a bcrypt compare (even when the user is missing) so the
  // response time doesn't reveal whether the email exists.
  const dummyHash = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO0000000000000000000000000000000";
  let ok = false;
  if (user) {
    ok = await verifyPassword(password, user.passwordHash);
  } else {
    await verifyPassword(password, dummyHash);
  }

  if (!user || !ok) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const token = await signAuthToken({
    sub: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const res = NextResponse.json({
    user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set(AUTH_COOKIE, token, cookieOptions);
  return res;
}
