"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export function SearchDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const results = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.collection.toLowerCase().includes(query.toLowerCase()) ||
          (p.tag && p.tag.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col bg-[#080808]/98 p-6 md:p-12 backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink/10 pb-6 max-w-4xl w-full mx-auto">
            <div className="flex flex-1 items-center gap-3">
              <Search size={22} className="text-gold" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, collections, designs..."
                className="w-full bg-transparent text-xl font-light text-ink outline-none placeholder:text-muted/60"
              />
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-ink transition-colors p-2"
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>

          {/* Results container */}
          <div className="flex-1 overflow-y-auto py-10">
            {query.trim() === "" ? (
              <div className="text-center py-20 text-muted">
                <p className="font-serif text-lg">Type to start searching...</p>
                <p className="mt-2 text-xs uppercase tracking-wider opacity-60">e.g. White, Embossed, Olive, Drop</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20 text-muted">
                <p className="font-serif text-lg">No results found for &ldquo;{query}&rdquo;</p>
                <p className="mt-2 text-xs uppercase tracking-wider opacity-60">Try searching for something else</p>
              </div>
            ) : (
              <div className="max-w-4xl w-full mx-auto">
                <p className="text-[10px] uppercase tracking-wider text-muted mb-6">{results.length} results found</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  {results.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={onClose}
                      className="group flex gap-4 border border-ink/5 bg-card/55 p-3 hover:border-gold/30 transition-all rounded-lg"
                    >
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-surface rounded-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] uppercase tracking-wider text-muted">{p.collection}</span>
                        <h4 className="font-serif text-md font-light text-ink group-hover:text-gold transition-colors mt-0.5">{p.name}</h4>
                        <span className="text-sm text-gold mt-1">{formatPrice(p.price)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
