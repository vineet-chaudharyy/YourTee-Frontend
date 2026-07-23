"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { collections } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Product } from "@/types";

export default function CollectionsPage() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data?.products) {
          setProductsList(data.products);
        }
      })
      .catch((err) => console.error("Error loading products:", err))
      .finally(() => setLoading(false));
  }, []);

  const dynamicCollections = useMemo(() => {
    // Clone static list
    const list = collections.map((c) => ({ ...c }));
    
    // Find unique collection names from database
    const dbCollectionNames = Array.from(new Set(productsList.map((p) => p.collection).filter(Boolean)));
    
    dbCollectionNames.forEach((name) => {
      const exists = collections.some((c) => c.name.toLowerCase() === name.toLowerCase());
      const prodCount = productsList.filter((p) => p.collection === name).length;
      
      if (!exists) {
        // Find first product in this collection to use its image as cover
        const firstProd = productsList.find((p) => p.collection === name);
        list.push({
          id: `db-${name}`,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: name,
          designs: prodCount,
          image: firstProd?.image || "/product_white_embossed.jpg",
          description: `Custom curated series of ${prodCount} designs prepared according to catalog inventory and stock requirements.`,
        });
      } else {
        // Update designs count for static collection based on database products
        const match = list.find((c) => c.name.toLowerCase() === name.toLowerCase());
        if (match) {
          match.designs = prodCount;
        }
      }
    });
    
    return list;
  }, [productsList]);

  return (
    <div className="min-h-screen pb-28">
      <PageHeader
        eyebrow="The Archive"
        title="Curated Collections"
        subtitle="Each collection is a chapter — a distinct world of fabric, form, and feeling."
      />

      <div className="container-luxe space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-xs uppercase tracking-wider text-muted animate-pulse">Loading Collections Archive...</span>
          </div>
        ) : dynamicCollections.length === 0 ? (
          <div className="text-center py-20 text-muted text-sm">
            No collections found in database.
          </div>
        ) : (
          dynamicCollections.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.1 }}
            >
              <Link
                href="/shop"
                data-cursor="Explore"
                className="group relative grid items-center overflow-hidden border border-ink/10 md:grid-cols-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:h-full md:min-h-[340px] bg-card">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={i === 0}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className={`flex flex-col justify-center gap-4 p-10 lg:p-16 ${i % 2 ? "md:order-first" : ""}`}>
                  <span className="text-xs uppercase tracking-luxe text-gold">
                    {String(i + 1).padStart(2, "0")} — {c.designs} Designs
                  </span>
                  <h2 className="font-serif text-4xl font-light leading-tight sm:text-5xl">
                    {c.name}
                  </h2>
                  <p className="max-w-md text-muted">{c.description}</p>
                  <span className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-luxe text-ink transition-colors group-hover:text-gold">
                    Explore Collection
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
