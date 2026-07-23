"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SIGNATURE_ITEMS = [
  {
    id: "atelier",
    category: "Studio Atelier",
    title: "Atelier Tee",
    desc: "Luxury heavy cotton with high-definition raised embroidery.",
    image: "/product_white_atelier.png",
    bgGradient: "from-[#eae7df] to-[#f4f1e9]",
    textColor: "text-[#2e2b26]",
    accentColor: "text-gold",
    href: "/product/atelier-oversized-tee",
    wavesColor: "rgba(212,175,55,0.06)",
  },
  {
    id: "column",
    category: "Core Streetwear",
    title: "Column Tee",
    desc: "Comfort redefined. Premium oversized silhouette in vintage olive shade.",
    image: "/product_olive_front_y.png",
    bgGradient: "from-[#e2e6df] to-[#edf0eb]",
    textColor: "text-[#2c302a]",
    accentColor: "text-[#4f5e4c]",
    href: "/product/classic-column-tee",
    wavesColor: "rgba(79,94,76,0.06)",
  },
  {
    id: "graphic",
    category: "Studio Edition",
    title: "Y-Graphic Tee",
    desc: "Double-combed streetwear fit with signature back architectural graphic.",
    image: "/product_beige_yg.png",
    bgGradient: "from-[#ebdcc8] to-[#f6ebd9]",
    textColor: "text-[#353028]",
    accentColor: "text-gold",
    href: "/product/architectural-y-tee",
    wavesColor: "rgba(212,175,55,0.07)",
  },
];

export function SignaturePieces() {
  const [activeIdx, setActiveIdx] = useState(0);

  const next = () => {
    setActiveIdx((prev) => (prev + 1) % SIGNATURE_ITEMS.length);
  };

  const prev = () => {
    setActiveIdx((prev) => (prev - 1 + SIGNATURE_ITEMS.length) % SIGNATURE_ITEMS.length);
  };

  return (
    <section className="py-28 relative overflow-hidden bg-bg">
      {/* Decorative background label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none font-serif text-[12vw] font-light leading-none opacity-[0.02] text-ink uppercase tracking-widest">
        Atelier
      </div>

      <div className="container-luxe relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="eyebrow text-gold">Exclusive Editions</p>
          <h2 className="mt-3 font-serif text-4xl font-light tracking-wide uppercase">Signature Pieces</h2>
          <p className="mt-3 text-sm text-muted">
            Crafted for identity. Explore our flagship silhouettes with 3D offset detailing.
          </p>
        </div>

        {/* Carousel Viewport Wrapper */}
        <div className="relative flex items-center justify-center min-h-[480px]">
          {/* Navigation Arrow Left */}
          <button
            onClick={prev}
            className="absolute left-0 lg:left-6 z-20 grid h-12 w-12 place-items-center rounded-full border border-ink/10 bg-bg/85 text-muted hover:border-gold hover:text-gold transition-colors shadow-sm"
            aria-label="Previous signature piece"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Slider Content */}
          <div className="relative w-full max-w-4xl px-12 md:px-20 overflow-visible flex justify-center">
            <AnimatePresence mode="wait">
              {SIGNATURE_ITEMS.map((item, idx) => {
                if (idx !== activeIdx) return null;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 50, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.98 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "relative w-full max-w-2xl h-[360px] md:h-[400px] rounded-3xl overflow-visible shadow-lg border border-ink/5 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br",
                      item.bgGradient
                    )}
                  >
                    {/* Wavy abstract line vector overlay */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                      <svg
                        viewBox="0 0 400 300"
                        className="absolute bottom-0 left-0 w-full h-full opacity-65"
                        fill="none"
                        style={{ color: item.wavesColor }}
                      >
                        <path
                          d="M-20 280 Q80 200 200 240 T420 200"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M-20 260 Q80 180 200 220 T420 180"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M-20 240 Q80 160 200 200 T420 160"
                          stroke="currentColor"
                          strokeWidth="1"
                        />
                        <path
                          d="M-20 220 Q80 140 200 180 T420 140"
                          stroke="currentColor"
                          strokeWidth="0.8"
                        />
                      </svg>
                    </div>

                    {/* Left details pane */}
                    <div className="max-w-[55%] relative z-10 flex flex-col items-start h-full justify-between">
                      <div>
                        <span className={cn("text-[9px] font-bold uppercase tracking-widest", item.accentColor)}>
                          {item.category}
                        </span>
                        <h3 className={cn("font-serif text-3xl md:text-4xl font-light tracking-wide mt-2", item.textColor)}>
                          {item.title}
                        </h3>
                        <p className="mt-4 text-xs md:text-sm leading-relaxed text-muted/90 max-w-sm">
                          {item.desc}
                        </p>
                      </div>

                      <motion.div whileTap={{ scale: 0.96 }} className="mt-6">
                        <Link
                          href={item.href}
                          className="inline-block bg-[#0c0a06] hover:bg-[#0c0a06]/90 border border-gold/45 text-gold px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-md transition-colors"
                        >
                          Explore Piece
                        </Link>
                      </motion.div>
                    </div>

                    {/* Right pane popped-out sticker cutout model */}
                    <div className="absolute bottom-0 right-4 w-[42%] h-[118%] pointer-events-none select-none z-10 overflow-visible">
                      <div className="relative w-full h-full overflow-visible flex items-end">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain object-bottom select-none pointer-events-none"
                          style={{
                            // Custom CSS Drop-Shadow outlines to generate the sticker outline pops!
                            filter: "drop-shadow(2.5px 2.5px 0px #fff) drop-shadow(-2.5px -2.5px 0px #fff) drop-shadow(2.5px -2.5px 0px #fff) drop-shadow(-2.5px 2.5px 0px #fff) drop-shadow(0px 15px 30px rgba(0,0,0,0.22))",
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Navigation Arrow Right */}
          <button
            onClick={next}
            className="absolute right-0 lg:right-6 z-20 grid h-12 w-12 place-items-center rounded-full border border-ink/10 bg-bg/85 text-muted hover:border-gold hover:text-gold transition-colors shadow-sm"
            aria-label="Next signature piece"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Page Dots Indicator Indicator */}
        <div className="flex justify-center items-center gap-2.5 mt-10">
          {SIGNATURE_ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === activeIdx ? "w-6 bg-gold" : "w-2 bg-ink/10 hover:bg-ink/30"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
