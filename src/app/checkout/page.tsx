"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Truck, Gift, CreditCard, Banknote } from "lucide-react";
import { useCart } from "@/lib/store";
import { loadRazorpay } from "@/lib/razorpay";
import { LogoMark } from "@/components/ui/Logo";
import { formatPrice, cn } from "@/lib/utils";
import type { Order } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

const steps = ["Address", "Shipping", "Payment", "Review"];

const genId = () => `YT-${Math.floor(10000 + Math.random() * 89999)}`;
const genTracking = () =>
  `BD${Math.floor(10000000 + Math.random() * 89999999)}IN`;

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, loading, router]);
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [payMethod, setPayMethod] = useState<"online" | "cod">("online");

  // Contact details used for the order record + gateway prefill.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const addOrder = useCart((s) => s.addOrder);

  useEffect(() => setMounted(true), []);

  const shipping = subtotal > 2999 ? 0 : 149;
  const total = subtotal + shipping;

  const saveOrderToDB = async (order: Order) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          items: order.items.map(i => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            image: i.image,
            backImage: i.backImage || null,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
            description: i.description || null,
            layers: i.layers || null
          })),
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          paymentMethod: order.paymentMethod,
          paymentId: order.paymentId || null,
          name: order.name,
          email: order.email,
          phone: phone || null,
          carrier: order.carrier,
          tracking: order.tracking,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save order");
      }
    } catch (err: any) {
      console.error("Order save failure:", err);
      throw err;
    }
  };

  const finalize = async (order: Order) => {
    setError("");
    setProcessing(true);
    try {
      await saveOrderToDB(order);
      addOrder(order);
      setPlaced(order);
      clear();
    } catch (err: any) {
      setError(err.message || "Failed to place your order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const buildOrder = (): Order => ({
    id: genId(),
    date: new Date().toISOString(),
    items,
    subtotal,
    shipping,
    total,
    status: "Placed",
    paymentMethod: "cod",
    name: name || "Guest",
    email,
    carrier: "BlueDart",
    tracking: genTracking(),
  });

  const placeOrder = async () => {
    setError("");
    const order = buildOrder();

    if (payMethod === "cod") {
      await finalize({ ...order, paymentMethod: "cod", status: "Placed" });
      return;
    }

    setProcessing(true);
    try {
      const r = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, receipt: order.id }),
      });
      const data = await r.json();

      // No keys configured → graceful simulated payment.
      if (data.demo) {
        finalize({ ...order, paymentMethod: "demo", status: "Confirmed" });
        setProcessing(false);
        return;
      }

      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) {
        setError("Couldn't load the secure payment gateway. Check your connection.");
        setProcessing(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "YourTee",
        description: `Order ${order.id}`,
        prefill: { name, email, contact: phone },
        theme: { color: "#D4AF37" },
        handler: async (resp) => {
          const v = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resp),
          });
          const vr = await v.json();
          if (vr.valid) {
            finalize({
              ...order,
              paymentMethod: "razorpay",
              paymentId: resp.razorpay_payment_id,
              status: "Confirmed",
            });
          } else {
            setError("Payment could not be verified. You have not been charged.");
          }
          setProcessing(false);
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      rzp.open();
    } catch {
      setError("Something went wrong starting the payment. Please try again.");
      setProcessing(false);
    }
  };

  const next = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else placeOrder();
  };

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen pt-36 pb-28 flex flex-col items-center justify-center bg-bg">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-ink/10 rounded mb-4" />
          <div className="h-4 w-64 bg-ink/10 rounded" />
        </div>
      </div>
    );
  }
  if (placed) return <OrderSuccess order={placed} />;

  if (items.length === 0)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
        <p className="font-serif text-3xl">Nothing to check out</p>
        <Link href="/shop" className="btn-gold">
          Explore The Shop
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen pb-28 pt-36">
      <div className="container-luxe max-w-5xl">
        <h1 className="font-serif text-4xl font-light sm:text-5xl">Checkout</h1>

        {/* Stepper */}
        <div className="mt-10 flex items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border text-xs transition-colors",
                    i <= step
                      ? "border-gold bg-gold text-[#080808]"
                      : "border-ink/20 text-muted"
                  )}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-xs uppercase tracking-wider sm:block",
                    i <= step ? "text-ink" : "text-muted"
                  )}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "mx-4 h-px flex-1 transition-colors",
                    i < step ? "bg-gold" : "bg-ink/15"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          {/* Step content */}
          <div className="min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl">Shipping Address</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Inp
                        ph="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Inp
                        ph="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Inp ph="Address" full />
                      <Inp ph="City" />
                      <Inp ph="State" />
                      <Inp ph="PIN code" />
                      <Inp
                        ph="Phone (+91)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        full
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl">Shipping Method</h2>
                    {[
                      { icon: Truck, t: "Standard", d: "5–7 business days", p: "Free" },
                      { icon: Truck, t: "Express", d: "2–3 business days", p: "₹299" },
                      { icon: Gift, t: "Luxury Courier", d: "Next day · gift wrapped", p: "₹999" },
                    ].map((o, i) => (
                      <label
                        key={o.t}
                        className="flex cursor-pointer items-center gap-4 border border-ink/15 p-4 hover:border-gold has-[:checked]:border-gold"
                      >
                        <input type="radio" name="ship" defaultChecked={i === 0} className="accent-gold" />
                        <o.icon size={18} className="text-gold" />
                        <div className="flex-1">
                          <p className="text-sm">{o.t}</p>
                          <p className="text-xs text-muted">{o.d}</p>
                        </div>
                        <span className="text-sm text-gold">{o.p}</span>
                      </label>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl">Payment Method</h2>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Lock size={13} /> 256-bit encrypted · powered by Razorpay
                    </div>

                    <button
                      onClick={() => setPayMethod("online")}
                      className={cn(
                        "flex w-full items-center gap-4 border p-4 text-left transition-colors",
                        payMethod === "online"
                          ? "border-gold"
                          : "border-ink/15 hover:border-ink/40"
                      )}
                    >
                      <CreditCard size={20} className="text-gold" />
                      <div className="flex-1">
                        <p className="text-sm">Pay Online</p>
                        <p className="text-xs text-muted">
                          Cards · UPI · Net Banking · Wallets
                        </p>
                      </div>
                      <span
                        className={cn(
                          "grid h-5 w-5 place-items-center rounded-full border",
                          payMethod === "online" ? "border-gold" : "border-ink/30"
                        )}
                      >
                        {payMethod === "online" && (
                          <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                        )}
                      </span>
                    </button>

                    <button
                      onClick={() => setPayMethod("cod")}
                      className={cn(
                        "flex w-full items-center gap-4 border p-4 text-left transition-colors",
                        payMethod === "cod"
                          ? "border-gold"
                          : "border-ink/15 hover:border-ink/40"
                      )}
                    >
                      <Banknote size={20} className="text-gold" />
                      <div className="flex-1">
                        <p className="text-sm">Cash on Delivery</p>
                        <p className="text-xs text-muted">
                          Pay in cash when your order arrives
                        </p>
                      </div>
                      <span
                        className={cn(
                          "grid h-5 w-5 place-items-center rounded-full border",
                          payMethod === "cod" ? "border-gold" : "border-ink/30"
                        )}
                      >
                        {payMethod === "cod" && (
                          <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                        )}
                      </span>
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl">Review Your Order</h2>
                    {items.map((it) => (
                      <div
                        key={it.key}
                        className="flex justify-between border-b border-ink/10 py-3 text-sm"
                      >
                        <span>
                          {it.name} × {it.quantity}
                        </span>
                        <span className="text-gold">
                          {formatPrice(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2 text-sm">
                      <span className="text-muted">Payment:</span>
                      <span>
                        {payMethod === "online"
                          ? "Pay Online (Razorpay)"
                          : "Cash on Delivery"}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      By placing this order you agree to our terms of service and refund policy.
                    </p>
                    {error && (
                      <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                        {error}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex gap-3">
              {step > 0 && !processing && (
                <button onClick={() => setStep((s) => s - 1)} className="btn-outline">
                  Back
                </button>
              )}
              <button
                onClick={next}
                disabled={processing}
                className="btn-gold flex-1 disabled:opacity-60"
              >
                {processing
                  ? "Processing…"
                  : step === steps.length - 1
                  ? payMethod === "cod"
                    ? "Place Order"
                    : `Pay ${formatPrice(total)}`
                  : "Continue"}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="h-fit border border-ink/10 bg-card p-8 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl">Summary</h2>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-6">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <span className="font-serif text-3xl text-gold">{formatPrice(total)}</span>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-luxe text-muted">
              <Lock size={12} /> Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inp({
  ph,
  full,
  value,
  onChange,
  type = "text",
}: {
  ph: string;
  full?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={ph}
      value={value}
      onChange={onChange}
      className={cn(
        "border border-ink/15 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-gold",
        full && "sm:col-span-2"
      )}
    />
  );
}

function OrderSuccess({ order }: { order: Order }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Unboxing animation */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="grid h-40 w-40 place-items-center border-2 border-gold bg-card"
        >
          <motion.div
            initial={{ rotateX: 0 }}
            animate={{ rotateX: [-0, -120, -120] }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{ transformOrigin: "top", transformStyle: "preserve-3d" }}
            className="absolute inset-x-0 top-0 h-6 border-b-2 border-gold bg-gold/20"
          />
          <LogoMark className="h-20 w-20 text-ink" />
        </motion.div>
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-gold"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: Math.cos((i / 8) * Math.PI * 2) * 90,
              y: Math.sin((i / 8) * Math.PI * 2) * 90,
            }}
            transition={{ delay: 0.8, duration: 1, repeat: Infinity, repeatDelay: 1 }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="eyebrow mt-12">Order Confirmed</p>
        <h1 className="mt-4 font-serif text-4xl font-light sm:text-5xl">
          Your Identity Is On Its Way
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Thank you for your order. Each piece is now being handcrafted in our atelier.
        </p>
        <div className="mx-auto mt-6 w-fit border border-ink/10 bg-card px-6 py-4">
          <p className="text-[10px] uppercase tracking-luxe text-muted">Order Number</p>
          <p className="mt-1 font-serif text-2xl text-gold">{order.id}</p>
          <p className="mt-1 text-xs text-muted">
            {order.paymentMethod === "cod"
              ? "Cash on Delivery"
              : order.paymentMethod === "razorpay"
              ? `Paid · ${order.paymentId}`
              : "Payment confirmed"}
          </p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={`/track?id=${order.id}`} className="btn-gold">
            Track Order
          </Link>
          <Link href="/shop" className="btn-outline">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
