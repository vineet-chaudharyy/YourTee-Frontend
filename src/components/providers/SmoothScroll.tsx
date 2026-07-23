"use client";

import { useEffect, type ReactNode } from "react";
import type Lenis from "lenis";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Respect users who prefer reduced motion — skip inertial scrolling.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: Lenis | null = null;
    let rafId = 0;
    let cancelled = false;

    // Defer init and code-split Lenis so it stays off the critical load path
    // (keeps Total Blocking Time low for first paint / Lighthouse).
    const start = async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      lenis = new Lenis({
        duration: 0.85,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
        wheelMultiplier: 1,
      });
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    const idle =
      "requestIdleCallback" in window
        ? (window.requestIdleCallback as typeof requestIdleCallback)
        : (cb: () => void) => window.setTimeout(cb, 200);
    const handle = idle(() => start());

    return () => {
      cancelled = true;
      if ("cancelIdleCallback" in window && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
