"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-28">
      {/* soft gold glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Brand */}
        <Link href="/" className="mb-8 flex flex-col items-center gap-3">
          <LogoMark className="h-14 w-14 text-ink" />
          <Wordmark className="text-3xl" />
          <span className="text-[9px] uppercase tracking-[0.35em] text-muted">
            Design It. Wear It. Own It.
          </span>
        </Link>

        <div className="border border-ink/10 bg-card p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
          <div className="mb-6 text-center">
            <h1 className="font-serif text-3xl font-light">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </motion.div>
    </div>
  );
}
