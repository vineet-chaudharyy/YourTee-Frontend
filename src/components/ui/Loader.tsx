"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoMark, Wordmark } from "@/components/ui/Logo";

export function Loader() {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show the luxury intro once per browser session.
    // Skip entirely if it already ran, or for reduced-motion users.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sessionStorage.getItem("yourtee-loaded") || reduce) {
      setDone(true);
      return;
    }
    setShow(true);
    document.body.style.overflow = "hidden";

    const start = performance.now();
    const DURATION = 700;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / DURATION) * 100);
      setProgress(Math.round(p));
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        sessionStorage.setItem("yourtee-loaded", "1");
        setTimeout(() => {
          document.body.style.overflow = "";
          setDone(true);
        }, 250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  if (done || !show) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[300] grid place-items-center overflow-hidden bg-[#080808]"
        >
          {/* Golden particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-gold"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.9, 0], scale: [0, 1.4, 0], y: [0, -40, -80] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}

          {/* Radial gold glow */}
          <div className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-gold/10 blur-[120px]" />

          <div className="relative flex flex-col items-center">
            {/* Logo reveal */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <LogoMark className="h-20 w-20 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="mt-6"
            >
              <Wordmark className="text-3xl" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-2 text-[10px] uppercase tracking-[0.35em] text-muted"
            >
              Design It. Wear It. Own It.
            </motion.p>

            {/* Progress */}
            <div className="mt-10 h-px w-56 overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-gold"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 font-serif text-sm text-gold">{progress}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
