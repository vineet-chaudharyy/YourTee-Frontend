import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Creates a Razorpay order server-side using secret credentials.
 * If keys are not configured, returns { demo: true } so the checkout
 * can gracefully fall back to a simulated payment locally.
 */
export async function POST(req: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const { amount, receipt } = (await req.json()) as {
    amount: number; // in rupees
    receipt?: string;
  };

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  if (!keyId || !keySecret) {
    return NextResponse.json({ demo: true });
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: receipt ?? `rcpt_${Date.now()}`,
      payment_capture: 1,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: "Gateway error", detail },
      { status: 502 }
    );
  }

  const order = (await res.json()) as {
    id: string;
    amount: number;
    currency: string;
  };

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId,
  });
}
