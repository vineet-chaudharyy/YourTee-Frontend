import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Design } from "@/models/Design";
import { requireAdmin } from "@/lib/auth";
import { products } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const [totalUsers, totalAdmins, totalDesigns] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "admin" }),
    Design.countDocuments({}),
  ]);

  const since = new Date(Date.now() - 7 * 86400000);
  const newUsers7d = await User.countDocuments({ createdAt: { $gte: since } });

  return NextResponse.json({
    totalUsers,
    totalAdmins,
    totalDesigns,
    totalProducts: products.length,
    newUsers7d,
  });
}
