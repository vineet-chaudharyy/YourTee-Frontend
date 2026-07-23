"use client";

import { cn } from "@/lib/utils";

const items = [
  { src: "/lookbook_chase_dreams.png", label: "01 / Chase Dreams" },
  { src: "/lookbook_good_things.png", label: "02 / Good Things" },
  { src: "/lookbook_wave.png", label: "03 / The Great Wave" },
  { src: "/lookbook_mind_matter.png", label: "04 / Mind Over Matter" },
  { src: "/lookbook_stay_focus.png", label: "05 / Stay Focused" },
  { src: "/product_white_embossed.jpg", label: "06 / Embossed Canvas" },
  { src: "/product_olive_front_y.png", label: "07 / Heavyweight Olive" },
  { src: "/product_charcoal_embossed.png", label: "08 / Charcoal Embossed" },
];

export function Marquee() {
  return (
    <section className="overflow-hidden border-y border-ink/10 bg-surface/30 py-16">
      <div className="container-luxe mb-10">
        <p className="eyebrow text-gold">Archival Lookbook</p>
        <h2 className="font-serif text-3xl font-light text-ink tracking-wide">
          Atelier In Motion
        </h2>
      </div>

      <div className="flex whitespace-nowrap overflow-hidden">
        <div className="flex w-max gap-6 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing">
          {/* First loop */}
          {items.map((it, idx) => (
            <div
              key={`m1-${idx}`}
              className="relative w-80 h-[400px] shrink-0 overflow-hidden bg-[#0c0c0c] border border-ink/5 rounded-2xl group transition-all duration-500 hover:scale-[1.02] hover:border-gold/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.src}
                alt={it.label}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080808]/95 via-[#080808]/50 to-transparent p-6 pt-20">
                <p className="text-[10px] uppercase tracking-widest text-gold font-semibold leading-none">
                  {it.label}
                </p>
              </div>
            </div>
          ))}

          {/* Second loop for seamless wrap-around */}
          {items.map((it, idx) => (
            <div
              key={`m2-${idx}`}
              className="relative w-80 h-[400px] shrink-0 overflow-hidden bg-[#0c0c0c] border border-ink/5 rounded-2xl group transition-all duration-500 hover:scale-[1.02] hover:border-gold/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.src}
                alt={it.label}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080808]/95 via-[#080808]/50 to-transparent p-6 pt-20">
                <p className="text-[10px] uppercase tracking-widest text-gold font-semibold leading-none">
                  {it.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </section>
  );
}
