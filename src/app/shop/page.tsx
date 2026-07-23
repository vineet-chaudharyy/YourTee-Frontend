"use client";

import { useMemo, useState, useEffect } from "react";
import { collections } from "@/lib/data";
import { ProductCard } from "@/components/ui/ProductCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const sorts = ["Featured", "Price: Low to High", "Price: High to Low"] as const;

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

export default function ShopPage() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [active, setActive] = useState("All");
  const [sort, setSort] = useState<(typeof sorts)[number]>("Featured");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data?.products) {
          setProductsList(data.products);
        }
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  const filters = useMemo(() => {
    const dbCollections = Array.from(new Set(productsList.map((p) => p.collection).filter(Boolean)));
    const staticCollections = collections.map((c) => c.name);
    return ["All", ...Array.from(new Set([...staticCollections, ...dbCollections]))];
  }, [productsList]);

  const list = useMemo(() => {
    let l = active === "All" ? productsList : productsList.filter((p) => p.collection === active);
    if (sort === "Price: Low to High") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [productsList, active, sort]);

  return (
    <div className="min-h-screen pb-28">
      <PageHeader
        eyebrow="The Shop"
        title="Wear It Your Way"
        subtitle="Every piece is made to order from heavyweight cotton — built to last a lifetime."
      />

      <div className="container-luxe">
        {/* Filter bar */}
        <div className="mb-12 flex flex-col gap-6 border-y border-ink/10 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "border px-4 py-2 text-xs uppercase tracking-wider transition-colors",
                  active === f
                    ? "border-gold bg-gold text-[#080808]"
                    : "border-ink/15 text-muted hover:border-gold hover:text-gold"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as (typeof sorts)[number])}
            className="border border-ink/15 bg-transparent px-4 py-2 text-xs uppercase tracking-wider text-muted outline-none"
          >
            {sorts.map((s) => (
              <option key={s} value={s} className="bg-bg text-ink">
                {s}
              </option>
            ))}
          </select>
        </div>

        <p className="mb-8 text-xs uppercase tracking-luxe text-muted">
          {list.length} Pieces
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4">
            {list.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
