import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  AUTH_COOKIE,
  cookieOptions,
  hashPassword,
  registerSchema,
  signAuthToken,
  rateLimit,
  clientIp,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Throttle abusive signups
  const rl = rateLimit(`register:${clientIp(req)}`, 6, 60_000);
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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { name, email, password } = parsed.data;

  try {
    await connectDB();
  } catch {
    return NextResponse.json(
      { error: "Service unavailable. Please try again later." },
      { status: 503 }
    );
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role: "user" });

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
