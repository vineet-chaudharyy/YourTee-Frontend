"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function Editorial() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={ref} style={{ position: "relative" }} className="relative overflow-hidden py-36 sm:py-40">
      <div className="container-luxe grid items-center gap-12 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.div
            style={{
              y,
              backgroundImage: "url('/product_taupe_logo.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="absolute inset-0 scale-110"
          >
            <video
              src="https://assets.mixkit.co/videos/preview/mixkit-sewing-machine-needle-sewing-a-fabric-40546-large.mp4"
              poster="/product_taupe_logo.png"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover saturate-[0.75] contrast-[1.05] brightness-[0.85]"
            />
          </motion.div>
        </div>

        <div className="lg:pl-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="eyebrow"
          >
            The Editorial
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-5 font-serif text-4xl font-light leading-tight sm:text-6xl"
          >
            A Quiet Kind <br /> Of Luxury
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-md text-muted"
          >
            Each garment is a study in restraint — heavyweight cotton, considered
            proportions, and an obsession with the details no one else notices. This
            is fashion designed to be lived in, not just looked at.
          </motion.p>
          <Link
            href="/about"
            className="mt-8 inline-block border-b border-gold pb-1 text-xs uppercase tracking-luxe text-gold"
            data-cursor="Read"
          >
            Read Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}
