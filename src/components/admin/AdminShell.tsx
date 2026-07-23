"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Palette,
  Package,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  Sliders,
} from "lucide-react";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/designs", label: "Designs", icon: Palette },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/hero", label: "Hero Banner", icon: Sparkles },
  { href: "/admin/customizer", label: "Customizer Settings", icon: Sliders },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: { name: string; email: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-ink/10 bg-surface transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 border-b border-ink/10 px-6 py-5">
          <LogoMark className="h-9 w-9 text-ink" />
          <div className="flex flex-col leading-none">
            <Wordmark className="text-xl" />
            <span className="mt-0.5 text-[8px] uppercase tracking-luxe text-gold">
              Admin
            </span>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 p-4">
          {nav.map((n) => {
            const active =
              n.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                  active
                    ? "bg-gold text-[#0c0a06]"
                    : "text-muted hover:bg-card hover:text-ink"
                )}
              >
                <n.icon size={17} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink/10 p-4">
          <p className="px-2 text-xs font-medium text-ink">{admin.name}</p>
          <p className="mb-3 px-2 text-[11px] text-muted">{admin.email}</p>
          <Link
            href="/"
            className="mb-1 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-muted hover:text-gold"
          >
            <ExternalLink size={15} /> View Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-muted hover:text-gold"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-ink/10 bg-surface px-5 py-4 lg:hidden">
        <button onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Wordmark className="text-lg" />
      </div>

      {/* Content */}
      <main className="min-w-0 p-6 lg:p-10">{children}</main>

      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}
    </div>
  );
}
