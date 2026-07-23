import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Design } from "@/models/Design";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  // Ensure the User model is registered for populate()
  void User;
  const designs = await Design.find({})
    .sort({ createdAt: -1 })
    .limit(300)
    .populate<{ user: { name: string; email: string } }>("user", "name email")
    .lean();

  return NextResponse.json({
    designs: designs.map((d) => ({
      id: String(d._id),
      name: d.name,
      garment: d.garment,
      color: d.color,
      fabric: d.fabric,
      price: d.price,
      preview: d.preview ?? null,
      user: d.user
        ? { name: d.user.name, email: d.user.email }
        : { name: "Unknown", email: "" },
      createdAt: d.createdAt,
    })),
  });
}
