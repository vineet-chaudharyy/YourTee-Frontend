"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, Type, Shapes, Layers, Sparkles, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const tools = [
  { icon: Upload, label: "Upload" },
  { icon: Type, label: "Text" },
  { icon: Shapes, label: "Graphics" },
  { icon: Sparkles, label: "AI Design" },
  { icon: Layers, label: "Layers" },
];

export function CustomizerPreview() {
  return (
    <section className="relative overflow-hidden py-36 sm:py-40">
      <div className="container-luxe grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Copy */}
        <div>
          <Reveal>
            <p className="eyebrow">Built By You</p>
            <h2 className="mt-5 font-serif text-4xl font-light leading-tight sm:text-5xl">
              The Freedom <br /> To Create
            </h2>
            <p className="mt-6 max-w-md text-muted">
              An advanced design studio with limitless possibilities. Upload art,
              set type, generate AI designs, and control every detail — rendered in
              real time on a heavyweight canvas.
            </p>
            <Link href="/customize" className="btn-gold mt-8" data-cursor="Design">
              Design Now <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>

        {/* Mock studio */}
        <Reveal delay={0.15}>
          <div className="relative rounded-xl border border-ink/10 bg-card p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
            <div className="grid gap-6 sm:grid-cols-[auto_1fr_auto]">
              {/* Toolbar */}
              <div className="flex flex-row gap-2 sm:flex-col">
                {tools.map((t, i) => (
                  <motion.button
                    key={t.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="group flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-xs text-muted transition-colors hover:border-gold hover:text-gold"
                  >
                    <t.icon size={15} />
                    <span className="hidden sm:inline">{t.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Shirt preview */}
              <div className="relative grid place-items-center rounded-lg bg-surface py-8">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="relative"
                >
                  <TshirtSVG />
                </motion.div>
              </div>

              {/* Properties */}
              <div className="w-full space-y-4 sm:w-44">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-wider text-muted">Color</p>
                  <div className="flex gap-2">
                    {["#0d0d0d", "#ece7dd", "#9a6f4e", "#4b4f54"].map((c) => (
                      <span
                        key={c}
                        className="h-6 w-6 rounded-full border border-ink/20"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-wider text-muted">Opacity</p>
                  <div className="h-1 w-full rounded-full bg-ink/10">
                    <div className="h-1 w-3/4 rounded-full bg-gold" />
                  </div>
                </div>
                <button className="w-full bg-gold py-3 text-[11px] font-semibold uppercase tracking-luxe text-[#080808]">
                  Add to Cart — ₹1,499
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TshirtSVG() {
  return (
    <svg width="170" height="190" viewBox="0 0 170 190" fill="none">
      <path
        d="M55 12 L30 28 L10 55 L28 72 L42 60 L42 178 L128 178 L128 60 L142 72 L160 55 L140 28 L115 12 C108 26 62 26 55 12 Z"
        fill="rgb(var(--surface))"
        stroke="#D4AF37"
        strokeWidth="1.5"
      />
      <text
        x="85"
        y="105"
        textAnchor="middle"
        fill="#D4AF37"
        fontFamily="serif"
        fontSize="22"
        fontStyle="italic"
      >
        CHAOS
      </text>
    </svg>
  );
}
