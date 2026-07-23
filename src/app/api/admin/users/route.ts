import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Design } from "@/models/Design";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const users = await User.find({}).sort({ createdAt: -1 }).limit(200).lean();

  // design counts per user
  const counts = await Design.aggregate([
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return NextResponse.json({
    users: users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      designs: countMap.get(String(u._id)) ?? 0,
      createdAt: u.createdAt,
    })),
  });
}
