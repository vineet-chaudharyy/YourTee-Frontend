"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { useState } from "react";
import { LogoMark, Wordmark } from "@/components/ui/Logo";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Custom T-Shirts", href: "/customize" },
      { label: "Collections", href: "/collections" },
      { label: "Limited Drops", href: "/collections" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Process", href: "/about" },
      { label: "Sustainability", href: "/about" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track Order", href: "/track" },
      { label: "Contact", href: "/contact" },
      
      { label: "Account", href: "/account" },
    ],
  },
];

const socials = [
  { Icon: Instagram, href: "https://instagram.com/yourtee", label: "Instagram" },
  { Icon: Facebook, href: "https://facebook.com/yourtee", label: "Facebook" },
  { Icon: Twitter, href: "https://x.com/yourtee", label: "Twitter" },
  { Icon: Youtube, href: "https://youtube.com/yourtee", label: "YouTube" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const pathname = usePathname();

  if (
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return null;
  }

  return (
    <footer className="grain relative overflow-hidden border-t border-ink/10 bg-surface">
      <div className="container-luxe relative z-10 py-20">
        {/* Top */}
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark className="h-11 w-11 text-ink" />
              <Wordmark className="text-3xl" />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
              Design it. Wear it. Own it. Premium heavyweight cotton, made to order,
              designed exclusively for you.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSent(true);
              }}
              className="mt-8 flex max-w-sm items-center border border-ink/15 focus-within:border-gold"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                className="bg-gold px-5 py-3 text-xs font-semibold uppercase tracking-luxe text-[#080808]"
              >
                {sent ? "✓" : "→"}
              </button>
            </form>
            {sent && (
              <p className="mt-2 text-xs text-gold">
                Welcome to the YourTee world.
              </p>
            )}
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-luxe text-gold">
                {col.title}
              </h4>
              <ul className="mt-6 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-ink/10 pt-8 md:flex-row">
          <p className="text-xs text-muted">
            © 2026 YourTee. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-gold"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>English</span>
            <span className="h-3 w-px bg-ink/20" />
            <span>INR ₹</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
