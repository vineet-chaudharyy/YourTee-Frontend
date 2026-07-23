"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  Plus,
  Minus,
  ChevronDown,
} from "lucide-react";
import { useCart, productToCartItem } from "@/lib/store";
import { formatPrice, cn } from "@/lib/utils";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/types";

const accordions = [
  { title: "Fabric & Care", body: "Machine wash cold, inside out. Tumble dry low. Do not iron print. Made from premium combed cotton for a soft, durable hand-feel." },
  { title: "Printing & Embroidery", body: "Choose between water-based DTG printing for a soft vintage finish or premium embroidery for raised, textured detail. Both are built to outlast the garment." },
  { title: "Shipping & Returns", body: "Made to order and dispatched within 3–5 business days. Free carbon-neutral shipping across India on orders over ₹2,999. Easy 30-day returns." },
];

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const addItem = useCart((s) => s.addItem);
  const wishlist = useCart((s) => s.wishlist);
  const toggleWishlist = useCart((s) => s.toggleWishlist);

  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [openAcc, setOpenAcc] = useState<number | null>(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [reviews, setReviews] = useState([
    { name: "Aarav S.", rating: 5, date: "July 12, 2026", comment: "The quality is absolutely top-tier. Heavyweight cotton feels extremely premium and the embossed print doesn't fade at all after washing." },
    { name: "Devansh K.", rating: 5, date: "July 08, 2026", comment: "Perfect boxy streetwear fit. The vintage taupe shade matches all my dark trousers. Highly recommend YourTee!" },
    { name: "Meera R.", rating: 4, date: "June 28, 2026", comment: "Beautiful texture and drape. Shipping took a few days since it is custom-made to order, but it was well worth the wait." }
  ]);
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newComment) return;
    const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    setReviews([{ name: newName, rating: newRating, date: today, comment: newComment }, ...reviews]);
    setNewName("");
    setNewComment("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const getDeliveryEstimate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'short' } as const;
    const date = new Date();
    date.setDate(date.getDate() + 6);
    return date.toLocaleDateString("en-IN", options);
  };

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data?.products) {
          setProductsList(data.products);
          const found = data.products.find((p: Product) => p.slug === slug);
          if (found) {
            setProduct(found);
            setColor(found.colors[0]?.name || "");
          }
        }
      })
      .catch((err) => console.error("Error loading product:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const variantKey = `${color}-${size}`;
  const activeStock = (product && product.variantStock) 
    ? (product.variantStock[variantKey] !== undefined ? Number(product.variantStock[variantKey]) : 50) 
    : 50;

  useEffect(() => {
    if (activeStock > 0 && qty > activeStock) {
      setQty(activeStock);
    }
  }, [color, size, activeStock, qty]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-xs uppercase tracking-wider text-muted animate-pulse">Loading Product Details...</span>
      </div>
    );
  }

  if (!product) return notFound();

  const related = productsList.filter((p) => p.id !== product.id).slice(0, 4);
  const saved = wishlist.includes(product.id);

  const handleAdd = () => {
    addItem(productToCartItem(product, color, size, qty));
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen pb-28 pt-32"
    >
      <div className="container-luxe">
        {/* Breadcrumb */}
        <nav className="mb-8 text-xs uppercase tracking-luxe text-muted">
          <Link href="/" className="hover:text-gold">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-gold">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Gallery */}
          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            <div className="flex gap-3 sm:flex-col">
              {product.gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "relative h-20 w-16 overflow-hidden border transition-colors",
                    activeImg === i ? "border-gold" : "border-ink/10"
                  )}
                >
                  <Image src={g} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
            <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImg}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.gallery[activeImg]}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              {product.tag && (
                <span className="absolute left-4 top-4 bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-luxe text-[#090909]">
                  {product.tag}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:pl-8">
            <p className="eyebrow">{product.collection}</p>
            <h1 className="mt-3 font-serif text-4xl font-light sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="font-serif text-3xl text-gold">{formatPrice(product.price)}</span>
              {activeStock <= 0 ? (
                <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
                  Out of Stock
                </span>
              ) : activeStock < 10 ? (
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded animate-pulse">
                  Only {activeStock} items left!
                </span>
              ) : (
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
                  In Stock
                </span>
              )}
            </div>
            <p className="mt-6 max-w-md leading-relaxed text-muted">
              {product.description}
            </p>

            <div className="mt-6 flex gap-6 text-xs uppercase tracking-wider text-muted">
              <span>{product.fabric}</span>
              <span className="text-gold">{product.gsm} GSM</span>
            </div>

            {/* Colors */}
            <div className="mt-8">
              <p className="mb-3 text-xs uppercase tracking-luxe text-muted">
                Color — <span className="text-ink">{color}</span>
              </p>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full border-2 transition-all",
                      color === c.name ? "border-gold" : "border-transparent"
                    )}
                  >
                    <span
                      className="h-7 w-7 rounded-full border border-ink/20"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-luxe text-muted">
                  Size — <span className="text-ink">{size}</span>
                </p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs uppercase tracking-wider text-gold hover:underline"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "h-11 w-12 border text-sm transition-colors",
                      size === s
                        ? "border-gold bg-gold text-[#090909]"
                        : "border-ink/15 hover:border-gold"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Add */}
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-ink/15">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={activeStock <= 0}
                    className="grid h-12 w-12 place-items-center text-muted hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center">{activeStock <= 0 ? 0 : qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(activeStock, q + 1))}
                    disabled={activeStock <= 0 || qty >= activeStock}
                    className="grid h-12 w-12 place-items-center text-muted hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                <motion.button
                  whileTap={activeStock <= 0 ? undefined : { scale: 0.96 }}
                  onClick={activeStock <= 0 ? undefined : handleAdd}
                  disabled={activeStock <= 0}
                  className="btn-gold flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-cursor={activeStock <= 0 ? "Default" : "Add"}
                >
                  {activeStock <= 0 ? (
                    <span>Out of Stock</span>
                  ) : added ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Check size={14} /> Added to Bag
                    </span>
                  ) : (
                    <span>Add to Bag — {formatPrice(product.price * qty)}</span>
                  )}
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Wishlist"
                  className="grid h-12 w-12 place-items-center border border-ink/15 transition-colors hover:border-gold"
                >
                  <Heart size={16} className={cn(saved && "fill-gold text-gold")} />
                </motion.button>
              </div>

              {/* Delivery Estimate */}
              <div className="flex items-center gap-2 border border-ink/5 bg-surface/30 px-4 py-3 rounded-sm text-xs text-muted">
                <Truck size={14} className="text-gold shrink-0 animate-[pulse_2s_infinite]" />
                <span>Estimated Delivery: <strong className="text-ink">{getDeliveryEstimate()}</strong> (Free inside India)</span>
              </div>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Link
                href="/customize"
                className="btn-outline mt-3 w-full block text-center"
                data-cursor="Customize"
              >
                Customize This Piece
              </Link>
            </motion.div>

            {/* Trust */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-ink/10 pt-6 text-center">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: RotateCcw, label: "30-Day Returns" },
                { icon: ShieldCheck, label: "Lifetime Quality" },
              ].map((t) => (
                <div key={t.label} className="flex flex-col items-center gap-2">
                  <t.icon size={18} className="text-gold" strokeWidth={1.4} />
                  <span className="text-[10px] uppercase tracking-wider text-muted">
                    {t.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="mt-8 border-t border-ink/10">
              {accordions.map((a, i) => (
                <div key={a.title} className="border-b border-ink/10">
                  <button
                    onClick={() => setOpenAcc(openAcc === i ? null : i)}
                    className="flex w-full items-center justify-between py-5 text-left text-sm font-medium"
                  >
                    {a.title}
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform",
                        openAcc === i && "rotate-180 text-gold"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {openAcc === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 text-sm leading-relaxed text-muted">
                          {a.body}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="mt-28">
          <h2 className="mb-10 font-serif text-3xl font-light">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-28 border-t border-ink/10 pt-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            {/* Reviews Summary & Form */}
            <div>
              <h2 className="font-serif text-3xl font-light">Customer Reviews</h2>
              <div className="mt-4 flex items-center gap-3">
                <span className="font-serif text-5xl text-gold">4.9</span>
                <div>
                  <div className="text-gold text-lg">★★★★★</div>
                  <p className="text-xs text-muted">Average rating across 124 reviews</p>
                </div>
              </div>

              {/* Submit a Review Form */}
              <form onSubmit={handleReviewSubmit} className="mt-10 border border-ink/10 bg-surface/30 p-6 rounded-lg">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-4">Share Your Thoughts</h3>
                {submitted && (
                  <p className="text-xs text-gold mb-4">✓ Thank you! Your review has been added.</p>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Your Name</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Rahul M."
                      className="w-full bg-bg border border-ink/10 px-3 py-2 text-xs rounded outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Rating</label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="w-full bg-bg border border-ink/10 px-3 py-2 text-xs rounded outline-none focus:border-gold"
                    >
                      <option value="5">5 Stars — Excellent</option>
                      <option value="4">4 Stars — Very Good</option>
                      <option value="3">3 Stars — Good</option>
                      <option value="2">2 Stars — Average</option>
                      <option value="1">1 Star — Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Comment</label>
                    <textarea
                      required
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your review details here..."
                      className="w-full bg-bg border border-ink/10 px-3 py-2 text-xs rounded outline-none focus:border-gold resize-none"
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="w-full bg-gold py-2.5 text-xs font-bold uppercase tracking-luxe text-[#080808]"
                  >
                    Submit Review
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4 border-b border-ink/10 pb-3">Latest Reviews</h3>
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
                {reviews.map((r, idx) => (
                  <div key={idx} className="border-b border-ink/5 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-ink mr-2">{r.name}</span>
                        <span className="inline-block bg-gold/10 text-gold px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-semibold rounded border border-gold/10">Verified Buyer</span>
                      </div>
                      <span className="text-[10px] text-muted">{r.date}</span>
                    </div>
                    <div className="text-gold text-xs mt-1">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                    <p className="mt-3 text-xs leading-relaxed text-muted">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg border border-ink/10 bg-bg p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="absolute right-6 top-6 text-muted hover:text-ink text-xs uppercase tracking-wider"
              >
                ✕ Close
              </button>
              <h3 className="font-serif text-2xl font-light text-ink uppercase mb-2">Size Guide Matrix</h3>
              <p className="text-xs text-muted mb-6">All measurements are in inches. Standard relaxed streetwear drape.</p>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-ink/10 text-muted uppercase">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest Width</th>
                    <th className="py-2">Body Length</th>
                    <th className="py-2">Sleeve Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {[
                    { s: "S", w: "42", l: "27.5", sl: "8.5" },
                    { s: "M", w: "44", l: "28.5", sl: "9" },
                    { s: "L", w: "46", l: "29.5", sl: "9.5" },
                    { s: "XL", w: "48", l: "30.5", sl: "10" },
                    { s: "XXL", w: "50", l: "31.5", sl: "10.5" },
                  ].map((row) => (
                    <tr key={row.s} className="hover:bg-surface/30">
                      <td className="py-3 font-semibold text-ink">{row.s}</td>
                      <td className="py-3 text-muted">{row.w} in</td>
                      <td className="py-3 text-muted">{row.l} in</td>
                      <td className="py-3 text-muted">{row.sl} in</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
