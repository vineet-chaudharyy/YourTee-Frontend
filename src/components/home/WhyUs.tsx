"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Gem, Box, Leaf, Sparkles, Ruler } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const reasons = [
  { icon: Gem, title: "Luxury Materials", desc: "Only the finest fabrics for unmatched comfort." },
  { icon: Box, title: "Custom Made", desc: "Every piece is made especially for you." },
  { icon: Leaf, title: "Sustainable", desc: "Eco-friendly production for a better tomorrow." },
  { icon: Sparkles, title: "Durable Prints", desc: "Long-lasting prints that stay perfect." },
  { icon: Ruler, title: "Perfect Fit", desc: "Tailored to your style and comfort." },
];

export function WhyUs() {
  const bgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bgRef,
    offset: ["start end", "end start"],
  });
  const bgX = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  return (
    <section ref={bgRef} style={{ position: "relative" }} className="relative overflow-hidden border-y border-ink/10 bg-surface py-36 sm:py-40">
      {/* Parallax background watermark */}
      <motion.div
        style={{ x: bgX }}
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[130px] font-bold uppercase tracking-[0.3em] text-ink/[0.025] dark:text-white/[0.012] z-0"
      >
        ARCHIVAL ATELIER
      </motion.div>

      {/* Golden grid lines overlay */}
      <div className="absolute inset-x-0 inset-y-0 pointer-events-none flex justify-between z-0 opacity-20">
        <span className="w-px h-full border-l border-dashed border-ink/10" />
        <span className="w-px h-full border-l border-dashed border-ink/10 hidden md:block" />
        <span className="w-px h-full border-l border-dashed border-ink/10 hidden md:block" />
        <span className="w-px h-full border-l border-dashed border-ink/10" />
      </div>

      <div className="container-luxe relative z-10 grid items-center gap-16 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="eyebrow">Why Choose YourTee</p>
            <h2 className="mt-5 font-serif text-4xl font-light leading-tight sm:text-5xl">
              More Than <br /> Just A T-Shirt
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4"
              >
                <r.icon size={24} className="shrink-0 text-gold" strokeWidth={1.4} />
                <div>
                  <h3 className="font-medium">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Reveal delay={0.15}>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/product_olive_front_y.png"
              alt="Craftsmanship"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <p className="font-serif text-2xl text-white">Our Craftsmanship</p>
              <p className="text-xs uppercase tracking-luxe text-white/70">Made For You</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
