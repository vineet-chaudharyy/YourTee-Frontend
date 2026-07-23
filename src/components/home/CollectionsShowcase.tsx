"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { collections } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";

function DropTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 45,
    seconds: 10,
  });

  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 2);
    target.setHours(target.getHours() + 14);

    const interval = setInterval(() => {
      const difference = target.getTime() - new Date().getTime();
      if (difference <= 0) {
        clearInterval(interval);
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNum = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="mb-14 border border-gold/15 bg-surface/30 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur">
      <div>
        <span className="inline-block bg-gold/10 px-3 py-1 text-[9px] uppercase tracking-wider text-gold rounded-full border border-gold/20 mb-2 font-medium">
          ATELIER SERIES 04
        </span>
        <h3 className="font-serif text-2xl font-light text-ink tracking-wide">Next Drop Scarcity</h3>
        <p className="mt-1.5 text-xs text-muted max-w-md leading-relaxed">
          A highly limited release of bespoke embroidery heavyweight tees. Once the drop window closes, these designs will never be produced again.
        </p>
      </div>
      
      <div className="flex gap-4 items-center">
        {[
          { label: "Days", val: timeLeft.days },
          { label: "Hours", val: timeLeft.hours },
          { label: "Mins", val: timeLeft.minutes },
          { label: "Secs", val: timeLeft.seconds },
        ].map((t, idx) => (
          <div key={t.label} className="flex items-center">
            <div className="text-center min-w-[50px]">
              <span className="font-serif text-3xl md:text-4xl text-gold font-light tracking-wider">
                {formatNum(t.val)}
              </span>
              <span className="block text-[8px] uppercase tracking-wider text-muted mt-1 font-medium">
                {t.label}
              </span>
            </div>
            {idx < 3 && (
              <span className="text-2xl font-light text-gold/30 mx-3 md:mx-4 -mt-3">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CollectionsShowcase() {
  return (
    <section className="py-36 sm:py-40">
      <div className="container-luxe">
        <Reveal className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Explore Collections</p>
            <h2 className="mt-4 font-serif text-4xl font-light sm:text-5xl">
              Curated For You
            </h2>
          </div>
          <Link
            href="/collections"
            className="hidden items-center gap-2 text-xs uppercase tracking-luxe text-muted transition-colors hover:text-gold sm:flex"
            data-cursor="View All"
          >
            View All Collections <ArrowRight size={14} />
          </Link>
        </Reveal>

        <DropTimer />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {collections.slice(0, 5).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <Link href={`/collections`} className="group block" data-cursor="Explore">
                <div className="relative aspect-[3/4] overflow-hidden bg-card">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width:768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-transparent transition-all group-hover:ring-gold" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-serif text-xl text-white">{c.name}</h3>
                    <p className="text-[10px] uppercase tracking-luxe text-white/60">
                      {c.designs} Designs
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
