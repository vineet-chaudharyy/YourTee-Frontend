"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Heart,
  Palette,
  MapPin,
  Gift,
  LogOut,
  User,
} from "lucide-react";
import { useCart } from "@/lib/store";
import { useAuth } from "@/components/providers/AuthProvider";
import { products } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";

const tabs = [
  { id: "orders", icon: Package, label: "Orders" },
  { id: "designs", icon: Palette, label: "Saved Designs" },
  { id: "wishlist", icon: Heart, label: "Wishlist" },
  { id: "addresses", icon: MapPin, label: "Addresses" },
  { id: "rewards", icon: Gift, label: "Rewards" },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function AccountPage() {
  const [tab, setTab] = useState("orders");
  const router = useRouter();
  const { user, logout } = useAuth();
  const wishlist = useCart((s) => s.wishlist);
  const toggle = useCart((s) => s.toggleWishlist);
  
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const saved = products.filter((p) => wishlist.includes(p.id));

  type SavedDesign = {
    id: string;
    name: string;
    color: string;
    price: number;
    preview: string | null;
  };
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  useEffect(() => {
    fetch("/api/designs")
      .then((r) => (r.ok ? r.json() : { designs: [] }))
      .then((d) => setDesigns(d.designs ?? []))
      .catch(() => {});

    // Fetch actual real-time orders from database
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => {
        setDbOrders(d.orders ?? []);
        setOrdersLoading(false);
      })
      .catch(() => setOrdersLoading(false));
  }, []);

  const deleteDesign = async (id: string) => {
    await fetch(`/api/designs/${id}`, { method: "DELETE" });
    setDesigns((ds) => ds.filter((d) => d.id !== id));
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen pb-28 pt-36">
      <div className="container-luxe">
        {/* Header */}
        <div className="flex items-center gap-5">
          <span className="grid h-16 w-16 place-items-center rounded-full border border-gold text-gold">
            <User size={26} />
          </span>
          <div>
            <p className="eyebrow">Welcome Back</p>
            <h1 className="font-serif text-3xl font-light sm:text-4xl">
              {user?.name ?? "Your Account"}
            </h1>
            {user?.email && (
              <p className="mt-1 text-sm text-muted">{user.email}</p>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit border border-ink/10 bg-card p-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                  tab === t.id
                    ? "bg-gold text-[#080808]"
                    : "text-muted hover:bg-surface hover:text-ink"
                )}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-lg border-t border-ink/10 px-4 py-3 text-sm text-muted hover:text-gold"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </aside>

          {/* Content */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {tab === "orders" && (
              <div className="space-y-4">
                {ordersLoading ? (
                  <p className="text-center py-12 text-muted text-sm uppercase tracking-wider">
                    Loading your orders...
                  </p>
                ) : dbOrders.length === 0 ? (
                  <div className="border border-ink/10 bg-card p-12 text-center">
                    <Package size={36} className="mx-auto text-muted" strokeWidth={1} />
                    <p className="mt-4 text-muted">You have no orders yet.</p>
                    <Link href="/shop" className="btn-gold mt-6">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                   dbOrders.map((o) => (
                    <div
                      key={o.id}
                      className="border border-ink/10 bg-card p-6 flex flex-col gap-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-serif text-lg">{o.id}</p>
                          <p className="text-xs text-muted">{fmtDate(o.date)}</p>
                        </div>
                        <span
                          className={cn(
                            "px-3 py-1 text-[10px] uppercase tracking-wider border",
                            o.status === "Delivered"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : o.status === "Return Requested"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : o.status === "Returned"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-gold/15 text-gold border-gold/20 animate-pulse"
                          )}
                        >
                          {o.status}
                        </span>
                        <span className="font-serif text-lg text-gold">
                          {formatPrice(o.total)}
                        </span>
                        <Link
                          href={`/track?id=${o.id}`}
                          className="text-xs uppercase tracking-luxe text-gold hover:underline"
                        >
                          Track →
                        </Link>
                      </div>

                      {/* Return Actions and Status Info */}
                      <div className="border-t border-ink/5 pt-4">
                        {o.status === "Delivered" && (
                          <Link
                            href={`/return?id=${o.id}`}
                            className="inline-block text-[10px] font-bold uppercase tracking-widest bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 px-4 py-2.5 rounded-lg transition-colors"
                          >
                            Return Product
                          </Link>
                        )}
                        
                        {(o.status === "Requested" || o.status === "Return Requested") && (
                          <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                            <p className="text-xs text-amber-400 font-medium">
                              ⚠️ Return Requested (Awaiting Admin Confirmation)
                            </p>
                            {o.returnReason && (
                              <p className="text-[10px] text-muted mt-1 italic">
                                Reason: "{o.returnReason}"
                              </p>
                            )}
                          </div>
                        )}

                        {o.status === "Approved" && (
                          <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-lg">
                            <p className="text-xs text-blue-400 font-medium">
                              ✓ Return Approved (Awaiting Pickup Scheduling)
                            </p>
                          </div>
                        )}

                        {o.status === "Pickup Scheduled" && (
                          <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg">
                            <p className="text-xs text-amber-400 font-medium">
                              🚚 Pickup Scheduled (Courier is assigned)
                            </p>
                          </div>
                        )}

                        {o.status === "Picked Up" && (
                          <div className="bg-teal-500/5 border border-teal-500/10 p-3 rounded-lg">
                            <p className="text-xs text-teal-400 font-medium">
                              📦 Product Picked Up (Awaiting Refund Processing)
                            </p>
                          </div>
                        )}

                        {(o.status === "Refund Processed" || o.status === "Returned") && (
                          <div className="bg-purple-500/5 border border-purple-500/10 p-3 rounded-lg">
                            <p className="text-xs text-purple-400 font-medium">
                              ✓ Product Returned (Refund Processed)
                            </p>
                          </div>
                        )}

                        {o.status === "Rejected" && (
                          <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                            <p className="text-xs text-red-400 font-medium">
                              ✕ Return Request Rejected by Admin
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "designs" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {designs.map((d) => (
                  <div key={d.id} className="group border border-ink/10 bg-card p-4">
                    <div className="mb-4 grid h-36 place-items-center overflow-hidden rounded-lg bg-surface">
                      {d.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.preview}
                          alt={d.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="font-serif text-xl italic text-gold">
                          {d.name}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm">{d.name}</p>
                    <p className="text-xs text-muted">
                      {d.color} · {formatPrice(d.price)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <Link
                        href="/customize"
                        className="text-xs uppercase tracking-luxe text-gold"
                      >
                        Edit →
                      </Link>
                      <button
                        onClick={() => deleteDesign(d.id)}
                        className="text-xs text-muted hover:text-gold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <Link
                  href="/customize"
                  className="grid min-h-[220px] place-items-center border border-dashed border-ink/20 p-6 text-sm text-muted hover:border-gold hover:text-gold"
                >
                  + New Design
                </Link>
              </div>
            )}

            {tab === "wishlist" && (
              <>
                {saved.length === 0 ? (
                  <div className="border border-ink/10 bg-card p-12 text-center">
                    <Heart size={36} className="mx-auto text-muted" strokeWidth={1} />
                    <p className="mt-4 text-muted">
                      Your wishlist is empty. Tap the heart on any product to save it.
                    </p>
                    <Link href="/shop" className="btn-gold mt-6">
                      Browse Shop
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {saved.map((p) => (
                      <div key={p.id} className="group">
                        <Link href={`/product/${p.slug}`}>
                          <div className="relative aspect-[4/5] overflow-hidden bg-card">
                            <Image src={p.image} alt={p.name} fill className="object-cover" />
                          </div>
                        </Link>
                        <p className="mt-3 text-sm">{p.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-gold">{formatPrice(p.price)}</span>
                          <button
                            onClick={() => toggle(p.id)}
                            className="text-xs text-muted hover:text-gold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "addresses" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-gold bg-card p-6">
                  <span className="text-[10px] uppercase tracking-luxe text-gold">
                    Default
                  </span>
                  <p className="mt-3 font-medium">Aarav Sharma</p>
                  <p className="mt-1 text-sm text-muted">
                    402 Sea Breeze, Linking Road<br />
                    Bandra West, Mumbai 400050<br />
                    Maharashtra, India
                  </p>
                </div>
                <button className="grid place-items-center border border-dashed border-ink/20 p-6 text-sm text-muted hover:border-gold hover:text-gold">
                  + Add Address
                </button>
              </div>
            )}

            {tab === "rewards" && (
              <div className="space-y-6">
                <div className="border border-ink/10 bg-card p-8">
                  <p className="text-xs uppercase tracking-luxe text-muted">
                    YourTee Points
                  </p>
                  <p className="mt-2 font-serif text-5xl text-gold">2,450</p>
                  <div className="mt-4 h-1.5 w-full rounded-full bg-ink/10">
                    <div className="h-1.5 w-[65%] rounded-full bg-gold" />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    550 points until your next reward — a free luxury gift box.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { t: "Welcome 10% Off", p: "Active" },
                    { t: "Free Shipping", p: "1,000 pts" },
                    { t: "Mystery Drop", p: "3,000 pts" },
                  ].map((c) => (
                    <div key={c.t} className="border border-ink/10 bg-card p-5 text-center">
                      <Gift size={20} className="mx-auto text-gold" strokeWidth={1.4} />
                      <p className="mt-3 text-sm">{c.t}</p>
                      <p className="text-xs text-muted">{c.p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
