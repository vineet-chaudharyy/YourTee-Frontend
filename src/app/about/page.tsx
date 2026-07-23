"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf, Droplets, Recycle, Wind } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

const stats = [
  { value: "280", label: "GSM Heavyweight Cotton" },
  { value: "100%", label: "Made To Order" },
  { value: "0", label: "Carbon Footprint" },
  { value: "30K+", label: "Identities Created" },
];

const timeline = [
  { icon: Leaf, title: "Organic Cotton", desc: "Sourced from certified regenerative farms." },
  { icon: Droplets, title: "Low Water Usage", desc: "Closed-loop dyeing saves 90% of water." },
  { icon: Recycle, title: "Eco Inks", desc: "Water-based, biodegradable pigments only." },
  { icon: Wind, title: "Carbon Neutral", desc: "Every order ships fully offset." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-28">
      <PageHeader
        eyebrow="Our Story"
        title="A House Built On Craft"
        subtitle="We don't print. We create identity — one heavyweight garment at a time."
      />

      <div className="container-luxe">
        <Reveal>
          <div className="relative aspect-[21/9] overflow-hidden">
            <Image
              src="/hero_moodboard.jpg"
              alt="Atelier"
              fill
              sizes="100vw"
              priority
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </Reveal>

        {/* Manifesto */}
        <div className="mx-auto max-w-3xl py-24 text-center">
          <Reveal>
            <p className="font-serif text-3xl font-light leading-relaxed sm:text-4xl">
              YourTee began with a single belief — that a t-shirt could be a
              <span className="text-gold"> canvas for identity</span>, not a commodity.
              Every piece is cut, designed, and made to order in service of one person:
              <span className="text-gold"> you</span>.
            </p>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px border-y border-ink/10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="py-12 text-center"
            >
              <p className="font-serif text-5xl text-gold">{s.value}</p>
              <p className="mt-2 text-xs uppercase tracking-luxe text-muted">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Sustainability */}
        <div className="py-24">
          <Reveal className="mb-14 text-center">
            <p className="eyebrow">Sustainability</p>
            <h2 className="mt-4 font-serif text-4xl font-light sm:text-5xl">
              Luxury With A Conscience
            </h2>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border border-ink/10 bg-card p-8"
              >
                <t.icon size={26} className="text-gold" strokeWidth={1.3} />
                <h3 className="mt-5 font-serif text-xl">{t.title}</h3>
                <p className="mt-2 text-sm text-muted">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
