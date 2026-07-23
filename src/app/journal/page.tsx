"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { journalPosts } from "@/lib/data";
import { PageHeader } from "@/components/ui/PageHeader";

export default function JournalPage() {
  const [feature, ...rest] = journalPosts;

  return (
    <div className="min-h-screen pb-28">
      <PageHeader
        eyebrow="The Journal"
        title="Notes On Craft"
        subtitle="Lookbooks, styling guides, and behind-the-scenes from the atelier."
      />

      <div className="container-luxe">
        {/* Feature */}
        <motion.a
          href="#"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative mb-6 grid overflow-hidden border border-ink/10 lg:grid-cols-2"
        >
          <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
            <Image
              src={feature.image}
              alt={feature.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center gap-4 p-10 lg:p-16">
            <span className="text-xs uppercase tracking-luxe text-gold">
              {feature.category} · {feature.readTime}
            </span>
            <h2 className="font-serif text-3xl font-light leading-tight sm:text-5xl">
              {feature.title}
            </h2>
            <p className="max-w-md text-muted">{feature.excerpt}</p>
            <span className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-luxe transition-colors group-hover:text-gold">
              Read Article <ArrowUpRight size={15} />
            </span>
          </div>
        </motion.a>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <motion.a
              key={post.id + i}
              href="#"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.08 }}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-card">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="mt-4 block text-[10px] uppercase tracking-luxe text-gold">
                {post.category} · {post.date}
              </span>
              <h3 className="mt-2 font-serif text-xl transition-colors group-hover:text-gold">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
