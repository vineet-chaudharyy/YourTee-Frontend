import { cn } from "@/lib/utils";

/**
 * YourTee monogram — a "YT" lockup (Y in ink, T in gold) beneath a small
 * clothes-hanger hook, echoing the brand mark. Uses currentColor for the Y
 * so it adapts to light/dark themes.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* hanger hook */}
      <path
        d="M26 11a2.6 2.6 0 1 0-2.6 2.6"
        stroke="#D4AF37"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      {/* Y (ink) */}
      <path
        d="M9 15 L18 26 L18 39"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 15 L18 26"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* T (gold) */}
      <path
        d="M25 20 L39 20 M32 20 L32 39"
        stroke="#D4AF37"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** "YourTee" wordmark — Your in ink, Tee in gold. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-serif tracking-wide", className)}>
      Your<span className="text-gold">Tee</span>
    </span>
  );
}

export const TAGLINE = "Design It. Wear It. Own It.";
