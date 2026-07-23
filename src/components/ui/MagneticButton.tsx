"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type Ripple = { id: number; x: number; y: number };

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "gold" | "outline";
  className?: string;
  cursor?: string;
};

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "gold",
  className,
  cursor,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 250, damping: 15, mass: 0.3 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);
    x.set(mx * 0.35);
    y.set(my * 0.35);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const id = Date.now();
      setRipples((r) => [
        ...r,
        { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
      ]);
      setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650);
    }
    onClick?.();
  };

  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden px-8 py-4 text-xs font-semibold uppercase tracking-luxe transition-colors duration-300";
  const styles =
    variant === "gold"
      ? "bg-gold text-[#080808] hover:shadow-[0_0_45px_-6px_rgba(212,175,55,0.75)]"
      : "border border-ink/30 text-ink hover:border-gold hover:text-gold";

  const inner = (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={handleClick}
      data-cursor={cursor}
      className={cn(base, styles, className)}
    >
      {/* Gold glow sweep */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {/* Ripples */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/40"
          style={{ left: r.x, top: r.y, translateX: "-50%", translateY: "-50%" }}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 320, height: 320, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
      ))}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {inner}
      </Link>
    );
  }
  return inner;
}
