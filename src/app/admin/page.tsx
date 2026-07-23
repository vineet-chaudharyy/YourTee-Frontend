"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Palette, Package, ShieldCheck, TrendingUp, ShoppingBag, RotateCcw, Calendar, ArrowRight, DollarSign, Activity } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Stats = {
  totalUsers: number;
  totalAdmins: number;
  totalDesigns: number;
  totalProducts: number;
  totalOrders: number;
  salesRevenue: number;
  totalReturns: number;
  newUsers7d: number;
  monthlyRevenue?: { label: string; monthNum: number; year: number; revenue: number }[];
  printShares?: {
    classic: { count: number; percent: number };
    embroidery: { count: number; percent: number };
    puff: { count: number; percent: number };
  };
};

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
};

type Order = {
  id: string;
  date: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: "Placed" | "Confirmed" | "Shipped" | "Delivered" | "Return Requested" | "Returned" | "Cancelled";
  paymentMethod: string;
  name: string;
  email: string;
  items: OrderItem[];
  createdAt: string;
};

const statusColors: Record<Order["status"], string> = {
  Placed: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Confirmed: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  Shipped: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  "Return Requested": "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  Returned: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: string; label: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json())
    ])
      .then(([statsData, ordersData]) => {
        if (statsData) setStats(statsData);
        if (ordersData?.orders) setOrders(ordersData.orders.slice(0, 4));
      })
      .catch((err) => console.error("Error loading stats:", err))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Sales Revenue",
      value: stats ? formatPrice(stats.salesRevenue) : "—",
      icon: TrendingUp,
      desc: "Gross sales excluding cancelled/returned orders",
      href: "/admin/orders",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders,
      icon: ShoppingBag,
      desc: "All time placed and processed orders",
      href: "/admin/orders",
    },
    {
      label: "Active Returns",
      value: stats?.totalReturns,
      icon: RotateCcw,
      desc: "Return requests or completed returns",
      href: "/admin/orders",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
      desc: "Registered users in community database",
      href: "/admin/users",
    },
    {
      label: "Saved Designs",
      value: stats?.totalDesigns,
      icon: Palette,
      desc: "User designs created in customizer",
      href: "/admin/designs",
    },
    {
      label: "Products Catalog",
      value: stats?.totalProducts,
      icon: Package,
      desc: "Active products in the shop catalog",
      href: "/admin/products",
    },
  ];

  // Dynamic SVG Area Graph Coordinates mapped from live database stats
  const rawMonths = stats?.monthlyRevenue || [];
  const maxRevenue = Math.max(...rawMonths.map((m) => m.revenue), 10000);

  const chartPoints = rawMonths.map((pt, idx) => {
    const x = 30 + idx * 80;
    const y = 150 - (pt.revenue / maxRevenue) * 115;
    return {
      x,
      y,
      label: pt.label,
      val: formatPrice(pt.revenue),
    };
  });

  const linePathD = chartPoints.length > 0
    ? "M " + chartPoints.map((pt) => `${pt.x} ${pt.y}`).join(" L ")
    : "M 30 150 L 430 150";

  const areaPathD = chartPoints.length > 0
    ? `M ${chartPoints[0].x} 150 L ` + chartPoints.map((pt) => `${pt.x} ${pt.y}`).join(" L ") + ` L ${chartPoints[chartPoints.length - 1].x} 150 Z`
    : "M 30 150 L 430 150 L 430 150 Z";

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Overview</p>
        <h1 className="mt-2 font-serif text-4xl font-light tracking-wide">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Live snapshot of your store logistics, catalogue, and community.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-ink/10 bg-card p-6 flex flex-col justify-between transition-all hover:border-gold/45 hover:shadow-[0_12px_30px_-15px_rgba(212,175,55,0.12)] group rounded-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-gold transition-colors">
                  {c.label}
                </span>
                <c.icon size={16} className="text-gold group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-4 font-serif text-3xl">
                {loading ? "—" : c.value}
              </p>
            </div>
            {c.desc && (
              <p className="mt-4 text-[9px] text-muted tracking-wider uppercase border-t border-ink/5 pt-3">
                {c.desc}
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* Visual Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Sales Revenue Trend SVG Graph */}
        <div className="border border-ink/10 bg-card p-6 rounded-lg relative">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-light">Sales Revenue Trend</h3>
              <p className="text-[10px] uppercase tracking-wider text-muted mt-0.5">Last 6 Months Gross Overview</p>
            </div>
            <TrendingUp size={16} className="text-gold" />
          </div>

          <div className="relative h-56 w-full">
            <svg viewBox="0 0 460 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="35" x2="430" y2="35" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="30" y1="75" x2="430" y2="75" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="30" y1="120" x2="430" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="30" y1="150" x2="430" y2="150" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

              {/* Gradient Area */}
              <path
                d={areaPathD}
                fill="url(#areaGrad)"
              />

              {/* Main Line */}
              <path
                d={linePathD}
                fill="none"
                stroke="#d4af37"
                strokeWidth="2"
              />

              {/* Axis Label details */}
              {chartPoints.map((pt, idx) => (
                <text
                  key={idx}
                  x={pt.x}
                  y="170"
                  textAnchor="middle"
                  className="fill-muted text-[10px] uppercase font-semibold font-sans"
                >
                  {pt.label}
                </text>
              ))}

              {/* Points */}
              {chartPoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.label === pt.label ? "6" : "4"}
                  fill="#d4af37"
                  stroke="#0c0a06"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* Interactive Tooltip popup */}
            {hoveredPoint && (
              <div
                className="absolute bg-surface border border-gold/30 px-3 py-1.5 rounded shadow-xl text-center pointer-events-none"
                style={{
                  left: `${(hoveredPoint.x / 460) * 100}%`,
                  top: `${(hoveredPoint.y / 180) * 100 - 30}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <p className="text-[8px] uppercase tracking-wider text-muted font-bold">{hoveredPoint.label}</p>
                <p className="text-xs font-semibold text-gold font-mono mt-0.5">{hoveredPoint.val}</p>
              </div>
            )}
          </div>
        </div>

        {/* Custom Printing Techniques Breakdown */}
        <div className="border border-ink/10 bg-card p-6 rounded-lg">
          <h3 className="font-serif text-lg font-light">Customizer Print Shares</h3>
          <p className="text-[10px] uppercase tracking-wider text-muted mt-0.5 mb-6">Preferred Atelier Techniques</p>

          <div className="space-y-5">
            {[
              { label: "Classic Ink Print (DTG)", percent: stats?.printShares?.classic?.percent ?? 60, count: `${stats?.printShares?.classic?.count ?? 0} items` },
              { label: "Bespoke Embroidery", percent: stats?.printShares?.embroidery?.percent ?? 25, count: `${stats?.printShares?.embroidery?.count ?? 0} items` },
              { label: "High-Density Puff Print", percent: stats?.printShares?.puff?.percent ?? 15, count: `${stats?.printShares?.puff?.count ?? 0} items` },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">{item.label}</span>
                  <span className="font-mono text-gold font-bold">{item.percent}% <span className="text-[10px] text-muted font-normal">({item.count})</span></span>
                </div>
                <div className="h-2 w-full bg-surface border border-ink/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Database Feed Table */}
      <div className="border border-ink/10 bg-card p-6 rounded-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-light">Recent Sales Log</h3>
            <p className="text-[10px] uppercase tracking-wider text-muted mt-0.5">Atelier Purchase Queue</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-gold hover:underline"
          >
            All Orders <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs uppercase tracking-wider text-muted animate-pulse">
            Loading recent sales feed...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-xs uppercase tracking-wider text-muted">
            No placed orders found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-ink/10 text-muted uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface/30">
                    <td className="py-3 px-4 font-mono font-bold text-ink">{o.id}</td>
                    <td className="py-3 px-4 text-muted">{o.name}</td>
                    <td className="py-3 px-4 text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gold font-mono">
                      {formatPrice(o.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${statusColors[o.status] || ""}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
