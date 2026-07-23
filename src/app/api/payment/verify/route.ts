import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * Verifies the Razorpay payment signature server-side.
 * signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 */
export async function POST(req: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    (await req.json()) as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

  if (!keySecret) {
    // No keys configured — demo mode, nothing to verify against.
    return NextResponse.json({ valid: false, demo: true });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const valid =
    expected.length === razorpay_signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(razorpay_signature)
    );

  return NextResponse.json({ valid });
}
