"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [previewItem, setPreviewItem] = useState<CartItem | null>(null);
  const items = useCart((s) => s.items);
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());

  useEffect(() => setMounted(true), []);

  const shipping = subtotal > 2999 || subtotal === 0 ? 0 : 149;
  const total = subtotal + shipping;

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <div className="min-h-screen pb-28 pt-36">
      <div className="container-luxe">
        <h1 className="font-serif text-4xl font-light sm:text-5xl">Your Bag</h1>
        <p className="mt-2 text-sm text-muted">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-28 text-center">
            <ShoppingBag size={48} className="text-muted" strokeWidth={1} />
            <p className="font-serif text-2xl">Your bag is empty</p>
            <Link href="/shop" className="btn-gold">
              Explore The Shop
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            {/* Items */}
            <div className="space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="flex gap-5 border-b border-ink/10 pb-6"
                  >
                    <div className="relative h-32 w-28 shrink-0 overflow-hidden bg-card">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-lg">{item.name}</h3>
                          <p className="mt-1 text-xs uppercase tracking-wider text-muted">
                            {item.color} · {item.size}
                            {item.custom && <span className="text-gold"> · Custom</span>}
                          </p>
                          {item.custom && (
                            <button
                              onClick={() => setPreviewItem(item)}
                              className="mt-2.5 block text-[10px] uppercase tracking-widest text-gold hover:text-gold/80 hover:underline font-semibold"
                            >
                              🔍 Preview Design
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="text-muted hover:text-gold"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center border border-ink/15">
                          <button
                            onClick={() => updateQty(item.key, item.quantity - 1)}
                            className="grid h-9 w-9 place-items-center text-muted hover:text-gold"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-9 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.key, item.quantity + 1)}
                            className="grid h-9 w-9 place-items-center text-muted hover:text-gold"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="font-serif text-lg text-gold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="h-fit border border-ink/10 bg-card p-8 lg:sticky lg:top-28">
              <h2 className="font-serif text-2xl">Order Summary</h2>
              <div className="mt-6 space-y-3 text-sm">
                <Row label="Subtotal" value={formatPrice(subtotal)} />
                <Row
                  label="Shipping"
                  value={shipping === 0 ? "Free" : formatPrice(shipping)}
                />
                <p className="text-xs text-muted">
                  {subtotal > 2999
                    ? "You've unlocked free shipping across India."
                    : `Spend ${formatPrice(2999 - subtotal)} more for free shipping.`}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-6">
                <span className="text-sm uppercase tracking-wider">Total</span>
                <span className="font-serif text-3xl text-gold">{formatPrice(total)}</span>
              </div>
              <Link href="/checkout" className="btn-gold mt-6 w-full">
                Checkout <ArrowRight size={14} />
              </Link>
              <Link
                href="/shop"
                className="mt-3 block text-center text-xs uppercase tracking-luxe text-muted hover:text-gold"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
      {/* Dynamic Cart Item Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-[#0c0a06]/85 backdrop-blur-md p-4 md:p-10 overflow-y-auto">
          <div className="relative w-full max-w-4xl my-auto rounded-2xl border border-ink/10 bg-bg p-6 md:p-8 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-6 right-6 text-muted hover:text-ink text-xs font-semibold uppercase tracking-wider bg-[#0c0a06]/5 border border-ink/10 px-3 py-1.5 rounded transition-all"
            >
              ✕ Close
            </button>

            {/* Header */}
            <div>
              <p className="eyebrow text-gold font-bold">Your Custom Tee</p>
              <h2 className="mt-1 font-serif text-2xl font-light text-ink">{previewItem.name}</h2>
              <p className="text-xs text-muted mt-1 uppercase tracking-wide">
                Color: {previewItem.color} · Size: {previewItem.size} · Quantity: {previewItem.quantity}
              </p>
            </div>

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Front Look */}
              <div className="rounded-xl border border-ink/10 bg-card p-4 space-y-3 flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Front Look</span>
                <div className="relative w-full aspect-[3/4] border border-ink/5 bg-[#0c0a06]/5 overflow-hidden flex items-center justify-center rounded-lg">
                  {previewItem.image ? (
                    <Image
                      src={previewItem.image}
                      alt="Front Look"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <span className="text-xs text-muted">No front preview</span>
                  )}
                </div>
              </div>

              {/* Back Look */}
              <div className="rounded-xl border border-ink/10 bg-card p-4 space-y-3 flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Back Look</span>
                <div className="relative w-full aspect-[3/4] border border-ink/5 bg-[#0c0a06]/5 overflow-hidden flex items-center justify-center rounded-lg">
                  {previewItem.backImage ? (
                    <Image
                      src={previewItem.backImage}
                      alt="Back Look"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-[10px] uppercase text-muted block">No back print</span>
                      <span className="text-[8px] text-muted/65 mt-1 block">Tee is blank on rear</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
