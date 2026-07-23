"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import type { Product } from "@/types";

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col gap-4">
    <div className="aspect-[4/5] w-full bg-surface border border-ink/5 rounded-sm" />
    <div className="space-y-2.5">
      <div className="h-2 w-16 bg-surface/80 rounded" />
      <div className="h-4 w-36 bg-surface/80 rounded" />
      <div className="h-3.5 w-12 bg-surface/60 rounded" />
    </div>
  </div>
);

export function FeaturedProducts() {
  const [featuredList, setFeaturedList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data?.products) {
          // slice first 8 products
          setFeaturedList(data.products.slice(0, 8));
        }
      })
      .catch((err) => console.error("Error loading featured products:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-36 sm:py-40">
      <div className="container-luxe">
        <Reveal className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">The Wardrobe</p>
            <h2 className="mt-4 font-serif text-4xl font-light sm:text-5xl">
              Signature Pieces
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-2 text-xs uppercase tracking-luxe text-muted transition-colors hover:text-gold sm:flex"
            data-cursor="Shop All"
          >
            Shop All <ArrowRight size={14} />
          </Link>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {featuredList.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
