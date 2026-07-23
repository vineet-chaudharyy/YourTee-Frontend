"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export function LoginPopup() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // If user is already logged in, do not trigger the popup
    if (user) return;

    // Check if user has already dismissed the popup in the current browser session
    const dismissed = sessionStorage.getItem("yt_login_popup_dismissed");
    if (dismissed === "true") return;

    // Set timer to trigger login popup after 20 seconds
    const timer = setTimeout(() => {
      setShow(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("yt_login_popup_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full max-w-md border border-gold/20 bg-[#0c0c0c] p-8 shadow-2xl text-center"
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 text-muted hover:text-ink transition-colors"
              aria-label="Dismiss popup"
            >
              <X size={18} />
            </button>

            {/* Premium Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/5 text-gold mb-6">
              <Sparkles size={24} />
            </div>

            {/* Header */}
            <p className="eyebrow text-gold">Unlock Exclusive Access</p>
            <h3 className="mt-2 font-serif text-3xl font-light text-ink">
              Design Your Identity
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-muted px-4">
              Sign up or log in to save your custom studio designs, access exclusive collection drops, and place orders.
            </p>

            {/* Call To Actions */}
            <div className="mt-8 space-y-3">
              <Link
                href="/register"
                onClick={handleDismiss}
                className="flex w-full items-center justify-center gap-2 border border-gold bg-gold py-3 text-xs uppercase tracking-wider text-[#0c0a06] hover:bg-gold/80 transition-colors font-medium"
              >
                <UserPlus size={14} /> Create Free Account
              </Link>
              <Link
                href="/login"
                onClick={handleDismiss}
                className="flex w-full items-center justify-center gap-2 border border-ink/15 bg-transparent py-3 text-xs uppercase tracking-wider text-ink hover:border-gold hover:text-gold transition-colors"
              >
                <LogIn size={14} /> Sign In
              </Link>
            </div>

            {/* Footer text */}
            <button
              onClick={handleDismiss}
              className="mt-6 text-[10px] uppercase tracking-wider text-muted hover:text-gold underline transition-colors"
            >
              Continue exploring as guest
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
