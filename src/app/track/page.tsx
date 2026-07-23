"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  PackageCheck,
  CheckCircle2,
  Cog,
  Truck,
  MapPin,
  Search,
  Banknote,
  CreditCard,
  RotateCcw,
  Calendar,
  XCircle,
} from "lucide-react";
import { useCart } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPrice, cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const FLOW: { status: OrderStatus; label: string; icon: typeof Truck; offsetDays: number }[] = [
  { status: "Placed", label: "Placed", icon: PackageCheck, offsetDays: 0 },
  { status: "Confirmed", label: "Confirmed", icon: CheckCircle2, offsetDays: 0 },
  { status: "In Production", label: "In Production", icon: Cog, offsetDays: 1 },
  { status: "Shipped", label: "Shipped", icon: Truck, offsetDays: 3 },
  { status: "Delivered", label: "Delivered", icon: MapPin, offsetDays: 6 },
];

const RETURN_FLOW = [
  { status: "Requested", label: "Return Requested", icon: RotateCcw, offsetDays: 0 },
  { status: "Approved", label: "Approved", icon: CheckCircle2, offsetDays: 1 },
  { status: "Pickup Scheduled", label: "Pickup Scheduled", icon: Calendar, offsetDays: 2 },
  { status: "Picked Up", label: "Picked Up", icon: Truck, offsetDays: 3 },
  { status: "Refund Processed", label: "Refund Processed", icon: CheckCircle2, offsetDays: 5 },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function TrackInner() {
  const params = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState(params.get("id") ?? "");
  const [searchId, setSearchId] = useState(params.get("id") ?? "");
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!searchId.trim()) {
      setOrder(null);
      return;
    }
    setLoading(true);
    fetch(`/api/orders/${searchId.trim()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setOrder(data?.order || null);
        setLoading(false);
      })
      .catch(() => {
        setOrder(null);
        setLoading(false);
      });
  }, [searchId]);

  const isReturn = order && ["Requested", "Approved", "Pickup Scheduled", "Picked Up", "Refund Processed", "Rejected", "Return Requested", "Returned"].includes(order.status);
  const normalizedStatus = order?.status === "Return Requested" ? "Requested" : (order?.status === "Returned" ? "Refund Processed" : order?.status);
  const currentFlow = isReturn ? RETURN_FLOW : FLOW;
  const currentIndex = order ? currentFlow.findIndex((f) => f.status === normalizedStatus) : -1;

  return (
    <div className="min-h-screen pb-28">
      <PageHeader
        eyebrow="Order Tracking"
        title="Track Your Order"
        subtitle="Enter your order number to follow your piece from atelier to doorstep."
      />

      <div className="container-luxe max-w-3xl">
        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearchId(query);
          }}
          className="flex items-center border border-ink/15 focus-within:border-gold"
        >
          <Search size={18} className="ml-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. YT-10482"
            className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="bg-gold px-6 py-4 text-xs font-semibold uppercase tracking-luxe text-[#080808]"
          >
            Track
          </button>
        </form>

        {!mounted ? null : !searchId ? (
          <p className="mt-10 text-center text-sm text-muted">
            Try a sample order number:{" "}
            <button
              onClick={() => {
                setQuery("YT-10482");
                setSearchId("YT-10482");
              }}
              className="text-gold underline"
            >
              YT-10482
            </button>
          </p>
        ) : loading ? (
          <div className="mt-12 border border-ink/10 bg-card p-12 text-center">
            <p className="text-xs text-muted uppercase tracking-wider animate-pulse">Loading tracking information...</p>
          </div>
        ) : !order ? (
          <div className="mt-12 border border-ink/10 bg-card p-10 text-center">
            <p className="font-serif text-2xl">No order found</p>
            <p className="mt-2 text-sm text-muted">
              We couldn&apos;t find an order matching{" "}
              <span className="text-ink">{searchId}</span>. Check the number and try again.
            </p>
            <Link href="/shop" className="btn-outline mt-6">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            {/* Order header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border border-ink/10 bg-card p-6">
              <div>
                <p className="text-[10px] uppercase tracking-luxe text-muted">
                  Order Number
                </p>
                <p className="mt-1 font-serif text-2xl text-gold">{order.id}</p>
                <p className="mt-1 text-xs text-muted">
                  Placed {fmtDate(order.date)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "inline-block px-3 py-1 text-[10px] uppercase tracking-luxe",
                    order.status === "Delivered"
                      ? "bg-ink/5 text-muted"
                      : "bg-gold/15 text-gold"
                  )}
                >
                  {order.status}
                </span>
                <p className="mt-2 flex items-center justify-end gap-1.5 text-xs text-muted">
                  {order.paymentMethod === "cod" ? (
                    <>
                      <Banknote size={13} /> Cash on Delivery
                    </>
                  ) : (
                    <>
                      <CreditCard size={13} /> Paid Online
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Carrier */}
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Info label="Carrier" value={order.carrier} />
              <Info label="Tracking No." value={order.tracking} />
              <Info
                label={order.status === "Delivered" ? "Delivered" : "Est. Delivery"}
                value={fmtDate(
                  new Date(
                    new Date(order.date).getTime() + 6 * 86400000
                  ).toISOString()
                )}
              />
            </div>

            {/* Timeline */}
            <div className="mt-8 border border-ink/10 bg-card p-8">
              <h3 className="mb-8 font-serif text-xl">
                {isReturn ? "Return Progress" : "Progress"}
              </h3>
              <div className="relative">
                {currentFlow.map((step, i) => {
                  const done = i <= currentIndex;
                  const active = i === currentIndex;
                  const stepDate = new Date(
                    new Date(order.date).getTime() + step.offsetDays * 86400000
                  ).toISOString();
                  return (
                    <div key={step.status} className="relative flex gap-5 pb-8 last:pb-0">
                      {/* connector */}
                      {i < currentFlow.length - 1 && (
                        <span
                          className={cn(
                            "absolute left-[19px] top-10 h-full w-px",
                            done ? "bg-gold" : "bg-ink/15"
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors",
                          done
                            ? "border-gold bg-gold text-[#080808]"
                            : "border-ink/20 text-muted",
                          active && "ring-4 ring-gold/20"
                        )}
                      >
                        <step.icon size={16} />
                      </span>
                      <div className="pt-1.5">
                        <p className={cn("text-sm", done ? "text-ink" : "text-muted")}>
                          {step.label || step.status}
                        </p>
                        <p className="text-xs text-muted">
                          {done ? fmtDate(stepDate) : `Estimated ${fmtDate(stepDate)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Return Request Feature */}
            {(order.status === "Delivered" || ["Requested", "Approved", "Pickup Scheduled", "Picked Up", "Refund Processed", "Rejected", "Return Requested", "Returned"].includes(order.status)) && (
              <div className="mt-4 border border-ink/10 bg-card p-6">
                <h3 className="mb-2 font-serif text-xl">Product Return</h3>
                
                {order.status === "Delivered" && (
                  <div className="space-y-4">
                    <p className="text-xs text-muted">
                      This order has been delivered. If you are not satisfied, you can request a return.
                    </p>
                    <Link
                      href={`/return?id=${order.id}`}
                      className="btn-gold inline-block py-2.5 px-6 text-xs font-semibold uppercase tracking-luxe"
                    >
                      Request Return
                    </Link>
                  </div>
                )}

                {(order.status === "Requested" || order.status === "Return Requested") && (
                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-lg">
                    <p className="text-xs text-amber-400 font-medium">
                      ⚠️ Return requested. Awaiting administrator review and confirmation.
                    </p>
                    {order.returnReason && (
                      <p className="text-xs text-muted mt-2">
                        <strong>Reason:</strong> "{order.returnReason}"
                      </p>
                    )}
                  </div>
                )}

                {order.status === "Approved" && (
                  <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-lg">
                    <p className="text-xs text-blue-400 font-medium">
                      ✓ Return approved. Pick-up is scheduled with logistics partner (BlueDart).
                    </p>
                  </div>
                )}

                {order.status === "Pickup Scheduled" && (
                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-lg">
                    <p className="text-xs text-amber-400 font-medium">
                      🚚 Pickup Scheduled. Logistics agent will arrive at your confirmed address soon.
                    </p>
                  </div>
                )}

                {order.status === "Picked Up" && (
                  <div className="bg-teal-500/5 border border-teal-500/10 p-4 rounded-lg">
                    <p className="text-xs text-teal-400 font-medium">
                      📦 Product picked up. Refund will be initiated once verified at our warehouse.
                    </p>
                  </div>
                )}

                {(order.status === "Refund Processed" || order.status === "Returned") && (
                  <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-lg">
                    <p className="text-xs text-purple-400 font-medium">
                      ✓ Return request completed. Refund amount processed.
                    </p>
                  </div>
                )}

                {order.status === "Rejected" && (
                  <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg">
                    <p className="text-xs text-red-400 font-medium">
                      ✕ Return request was rejected by administrator. Please contact support.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            {order.items.length > 0 && (
              <div className="mt-4 border border-ink/10 bg-card p-6">
                <h3 className="mb-4 font-serif text-xl">Items</h3>
                {order.items.map((it: any, idx: number) => (
                  <div
                    key={it.key || `${it.productId}-${it.size}-${it.color}-${idx}`}
                    className="flex justify-between border-b border-ink/10 py-3 text-sm last:border-0"
                  >
                    <span>
                      {it.name} × {it.quantity}
                    </span>
                    <span className="text-gold">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border border-ink/10 bg-card px-6 py-4">
              <span className="text-sm uppercase tracking-wider">Order Total</span>
              <span className="font-serif text-2xl text-gold">
                {formatPrice(order.total)}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 bg-card p-4">
      <p className="text-[10px] uppercase tracking-luxe text-muted">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <TrackInner />
    </Suspense>
  );
}
