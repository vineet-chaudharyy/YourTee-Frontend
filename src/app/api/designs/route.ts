import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Design } from "@/models/Design";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const saveSchema = z.object({
  name: z.string().trim().min(1).max(120),
  garment: z.string().max(60).optional(),
  color: z.string().max(60).optional(),
  fabric: z.string().max(60).optional(),
  price: z.number().nonnegative().optional(),
  layers: z.array(z.any()).max(100).optional(),
  preview: z.string().max(2_500_000).optional(), // data URL cap ~2.5MB
});

// List the signed-in user's saved designs
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const designs = await Design.find({ user: session.sub })
    .sort({ updatedAt: -1 })
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
      layers: d.layers ?? [],
      updatedAt: d.updatedAt,
    })),
  });
}

// Save a new design for the signed-in user
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  const design = await Design.create({ user: session.sub, ...parsed.data });

  return NextResponse.json({ id: String(design._id) }, { status: 201 });
}
