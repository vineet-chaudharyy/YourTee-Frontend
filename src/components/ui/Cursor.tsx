"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function Cursor() {
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 400, damping: 30, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 400, damping: 30, mass: 0.4 });

  useEffect(() => {
    // Only enable on devices with a fine pointer (desktop)
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    let rafId = 0;
    let prevActive = false;
    let prevLabel = "";

    const move = (e: MouseEvent) => {
      // Position uses motion values — no React re-render.
      x.set(e.clientX);
      y.set(e.clientY);

      // Hover detection is throttled to one frame and only updates
      // state when the value actually changes (avoids re-render per pixel).
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const target = (e.target as HTMLElement)?.closest(
          "[data-cursor], a, button"
        ) as HTMLElement | null;
        const nextActive = !!target;
        const nextLabel = target?.getAttribute("data-cursor") || "";
        if (nextActive !== prevActive) {
          prevActive = nextActive;
          setActive(nextActive);
        }
        if (nextLabel !== prevLabel) {
          prevLabel = nextLabel;
          setLabel(nextLabel);
        }
      });
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[200] hidden -translate-x-1/2 -translate-y-1/2 lg:block"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="rounded-full bg-gold relative flex items-center justify-center"
        animate={{
          width: active ? 8 : 4,
          height: active ? 8 : 4,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      >
        {label && (
          <span className="absolute whitespace-nowrap bg-[#0c0a06]/95 border border-gold/30 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-gold rounded-sm translate-y-7 shadow-lg">
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
