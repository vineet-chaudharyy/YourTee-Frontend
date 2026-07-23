"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Search, Heart, User, ShoppingBag, Menu, X, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SearchDrawer } from "@/components/layout/SearchDrawer";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/customize", label: "Customize" },
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const count = useCart((s) => s.count());
  const wishlist = useCart((s) => s.wishlist.length);
  const lastY = useRef(0);

  // Scroll-progress bar
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Hide when scrolling down past the hero, reveal when scrolling up
      if (y > lastY.current && y > 220 && !open) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  // Hide the marketing chrome on admin + auth pages
  if (
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return null;
  }

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-[100] w-full transition-[background-color,padding,border-color,box-shadow] duration-500",
        scrolled
          ? "border-b border-ink/5 bg-surface/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      {/* Top Announcement Bar */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="hidden sm:block border-b border-ink/5 bg-surface/80 py-2 text-[10px] uppercase tracking-wider text-muted overflow-hidden"
          >
            <div className="container-luxe flex justify-between items-center">
              <p>
                Sign up for 10% off your first order.{" "}
                <Link href="/register" className="text-gold hover:underline font-semibold ml-1">
                  Sign Up
                </Link>
              </p>
              <div className="flex gap-4">
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Contact
                </Link>
                <span className="text-muted/65">India (INR ₹)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className={cn(
          "container-luxe transition-all duration-300",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <div className="grid grid-cols-3 items-center w-full">
          {/* Left Column: Desktop navigation links */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {links.slice(0, 4).map((l) => {
                const isActive = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      data-cursor="View"
                      className={cn(
                        "group relative text-sm font-semibold uppercase tracking-wider transition-colors hover:text-gold",
                        isActive ? "text-gold" : "text-ink"
                      )}
                    >
                      {l.label}
                      <span
                        className={cn(
                          "absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-300 group-hover:w-full",
                          isActive ? "w-full" : "w-0"
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Mobile drawer trigger */}
          <div className="lg:hidden flex items-center">
            <button
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center text-ink"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Center Column: Centered Logo */}
          <div className="flex justify-center items-center">
            <Link href="/" className="group flex items-center gap-3" data-cursor="Home">
              <LogoMark className="h-10 w-10 text-ink transition-transform group-hover:scale-105" />
              <span className="flex flex-col leading-none">
                <Wordmark className="text-xl font-bold" />
                <span className="mt-0.5 text-[8px] uppercase tracking-wider text-muted">
                  Design It. Wear It. Own It.
                </span>
              </span>
            </Link>
          </div>

          {/* Right Column: Actions & Remaining Links */}
          <div className="flex items-center justify-end gap-1 sm:gap-3">
            {/* Desktop right-aligned links */}
            <ul className="hidden lg:flex items-center gap-8 mr-4">
              {links.slice(4).map((l) => {
                const isActive = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      data-cursor="View"
                      className={cn(
                        "group relative text-sm font-semibold uppercase tracking-wider transition-colors hover:text-gold",
                        isActive ? "text-gold" : "text-ink"
                      )}
                    >
                      {l.label}
                      <span
                        className={cn(
                          "absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-300 group-hover:w-full",
                          isActive ? "w-full" : "w-0"
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Utility Icons */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden h-9 w-9 place-items-center text-ink transition-colors hover:text-gold sm:grid"
              data-cursor="Search"
            >
              <Search size={19} />
            </button>
            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "Account" : "Sign in"}
              className="relative hidden h-9 w-9 place-items-center text-ink transition-colors hover:text-gold sm:grid"
              data-cursor={user ? "Account" : "Sign In"}
            >
              <User size={19} />
            </Link>
            {mounted && user?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden h-9 w-9 place-items-center text-gold transition-colors hover:opacity-75 sm:grid"
                data-cursor="Admin"
              >
                <ShieldCheck size={19} />
              </Link>
            )}
            <ThemeToggle />
            <Link
              href="/cart"
              className="relative grid h-9 w-9 place-items-center text-ink transition-colors hover:text-gold"
              data-cursor="Bag"
            >
              <ShoppingBag size={19} />
              {mounted && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-[#080808]">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-y-auto max-h-[78vh] border-t border-ink/10 bg-bg/98 backdrop-blur-xl lg:hidden"
          >
            <div className="container-luxe pt-6 pb-24 flex flex-col gap-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
                <input
                  type="text"
                  placeholder="Search products, collections..."
                  onClick={() => {
                    setOpen(false);
                    setSearchOpen(true);
                  }}
                  className="w-full bg-surface border border-ink/10 pl-10 pr-4 py-2.5 text-xs rounded-lg outline-none cursor-pointer"
                  readOnly
                />
              </div>

              {/* Navigation Links */}
              <ul className="flex flex-col border-y border-ink/5 py-4">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="block py-3 font-serif text-xl text-ink hover:text-gold transition-colors"
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Account Section */}
              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-muted">Authorized Session</span>
                    <h4 className="font-serif text-lg text-ink font-light mt-0.5 truncate">{user.name}</h4>
                    <p className="text-[10px] text-muted truncate select-all">{user.email}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-2">
                    <Link
                      href="/account"
                      onClick={() => setOpen(false)}
                      className="text-xs uppercase tracking-luxe text-ink hover:text-gold flex items-center justify-between"
                    >
                      My Account & Orders <span className="text-gold">→</span>
                    </Link>
                    <Link
                      href="/track"
                      onClick={() => setOpen(false)}
                      className="text-xs uppercase tracking-luxe text-ink hover:text-gold flex items-center justify-between"
                    >
                      Track Shipment <span className="text-gold">→</span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="text-xs uppercase tracking-luxe text-gold flex items-center justify-between font-semibold"
                      >
                        Admin Control Panel <span className="text-gold">→</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setOpen(false);
                        fetch("/api/auth/logout", { method: "POST" })
                          .then(() => window.location.reload());
                      }}
                      className="text-left text-xs uppercase tracking-luxe text-gold/80 hover:text-gold mt-2 leading-none"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-muted">Welcome to YourTee</span>
                    <p className="text-[10px] text-muted mt-0.5">Sign in to customize products and track design orders.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex-1 text-center bg-gold py-2.5 text-xs font-semibold uppercase tracking-luxe text-[#080808] hover:bg-gold-soft transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="flex-1 text-center border border-ink/20 py-2.5 text-xs font-semibold uppercase tracking-luxe text-ink hover:border-gold hover:text-gold transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                  
                  <Link
                    href="/track"
                    onClick={() => setOpen(false)}
                    className="text-center text-[10px] uppercase tracking-luxe text-muted hover:text-ink transition-colors mt-2"
                  >
                    Track Orders without Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: progress }}
        className={cn(
          "absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gold transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0"
        )}
      />

      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.header>
  );
}
