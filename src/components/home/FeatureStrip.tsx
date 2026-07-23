"use client";

import { motion } from "framer-motion";
import { Gem, Scissors, Globe, Leaf, Package, ShieldCheck } from "lucide-react";

const features = [
  { icon: Gem, title: "Premium Fabric", sub: "Handpicked Quality" },
  { icon: Scissors, title: "Made to Order", sub: "Crafted For You" },
  { icon: Globe, title: "Worldwide Shipping", sub: "Fast & Secure" },
  { icon: Leaf, title: "Sustainable", sub: "Eco Conscious" },
  { icon: Package, title: "Luxury Packaging", sub: "Unboxing Ritual" },
  { icon: ShieldCheck, title: "Lifetime Quality", sub: "Built to Last" },
];

export function FeatureStrip() {
  return (
    <section className="border-y border-ink/10 bg-surface">
      <div className="container-luxe grid grid-cols-2 gap-px md:grid-cols-3 lg:grid-cols-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="flex flex-col items-center gap-3 py-10 text-center"
          >
            <f.icon size={22} className="text-gold" strokeWidth={1.4} />
            <div>
              <p className="text-sm font-medium">{f.title}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted">{f.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
