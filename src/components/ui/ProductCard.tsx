"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/lib/store";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const wishlist = useCart((s) => s.wishlist);
  const toggle = useCart((s) => s.toggleWishlist);
  const saved = wishlist.includes(product.id);

  const secondImage = product.gallery[1] ?? product.image;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link href={`/product/${product.slug}`} data-cursor="View">
        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setSpotlightPos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="relative aspect-[4/5] overflow-hidden rounded-sm bg-card transition-shadow duration-500 group-hover:shadow-[0_30px_70px_-20px_rgba(212,175,55,0.28)]"
        >
          {/* Dynamic Gold Spotlight Glow */}
          {hovering && (
            <div
              className="pointer-events-none absolute inset-0 z-10 opacity-70 transition-opacity duration-350"
              style={{
                background: `radial-gradient(circle 120px at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(212, 175, 55, 0.18), transparent 80%)`,
              }}
            />
          )}

          {/* Primary image */}
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={index < 2}
            className="object-cover transition-all duration-700 group-hover:scale-108 group-hover:opacity-0"
          />
          {/* Second image on hover — hidden (and not fetched) on touch/mobile */}
          <Image
            src={secondImage}
            alt=""
            aria-hidden
            fill
            loading="lazy"
            sizes="25vw"
            className="hidden scale-100 object-cover opacity-0 transition-all duration-700 group-hover:scale-108 group-hover:opacity-100 md:block"
          />
          {/* Glow border */}
          <div className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-inset ring-transparent transition-all duration-300 group-hover:ring-gold" />

          {/* Badges */}
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            {isOutOfStock && (
              <span className="w-fit bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-luxe text-white">
                OUT OF STOCK
              </span>
            )}
            {product.tag && (
              <span className="w-fit bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-luxe text-[#080808]">
                {product.tag}
              </span>
            )}
            {discount > 0 && (
              <span className="w-fit bg-[#080808] px-3 py-1 text-[10px] font-semibold uppercase tracking-luxe text-gold ring-1 ring-gold/40">
                -{discount}%
              </span>
            )}
          </div>

          {/* Quick View / Out of Stock Trigger */}
          <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {isOutOfStock ? (
              <span className="flex items-center justify-center gap-2 bg-red-950/90 py-3 text-[10px] font-bold uppercase tracking-luxe text-red-400 border border-red-500/30 backdrop-blur-md rounded-sm cursor-not-allowed">
                Out of Stock
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 bg-[#0c0a06]/90 py-3 text-[10px] font-bold uppercase tracking-luxe text-gold border border-gold/30 hover:bg-gold hover:text-[#0c0a06] transition-colors duration-300 backdrop-blur-md rounded-sm">
                <Eye size={14} /> Quick View
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        aria-label="Wishlist"
        onClick={() => toggle(product.id)}
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-bg/70 backdrop-blur transition-colors hover:text-gold"
      >
        <Heart size={16} className={cn(saved ? "fill-gold text-gold" : "text-ink")} />
      </button>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-luxe text-muted">
            {product.collection}
          </p>
          <Link href={`/product/${product.slug}`}>
            <h3 className="mt-1 font-serif text-lg leading-tight transition-colors group-hover:text-gold">
              {product.name}
            </h3>
          </Link>
          <div className="mt-2 flex flex-col gap-1">
            {product.colors && product.colors.length > 0 && (
              <div className="flex gap-1.5 items-center">
                {product.colors.map((c) => (
                  <span
                    key={c.name}
                    className="h-2.5 w-2.5 rounded-full border border-ink/20 shrink-0 block"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <p className="text-[9px] uppercase tracking-widest text-muted font-mono mt-0.5">
                {product.sizes.join(" • ")}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="block font-serif text-lg text-gold">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
