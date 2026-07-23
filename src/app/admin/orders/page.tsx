"use client";

import { useEffect, useState, Fragment } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { ChevronDown, ChevronUp, ShoppingBag, Truck, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  description?: string | null;
};

type Order = {
  id: string;
  date: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: "Placed" | "Confirmed" | "Shipped" | "Delivered" | "Return Requested" | "Returned" | "Cancelled";
  paymentMethod: string;
  paymentId: string | null;
  name: string;
  email: string;
  phone: string | null;
  carrier: string | null;
  tracking: string | null;
  items: OrderItem[];
  returnReason?: string | null;
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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    setError("");
    fetch("/api/admin/orders")
      .then(async (r) => {
        if (!r.ok) {
          let errMsg = `Failed to load orders (${r.status})`;
          if (r.status === 401 || r.status === 403) {
            errMsg = "Access denied. Please log in with your admin account!";
          } else if (r.status === 404) {
            errMsg = "API server offline. Please make sure the Express backend is running on port 5001!";
          }
          setError(errMsg);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.orders) {
          setOrders(data.orders);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load orders log from database.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o));
    } catch (err: any) {
      alert("Error updating order status: " + err.message);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div>
      <p className="eyebrow">Logistics</p>
      <h1 className="mt-2 font-serif text-4xl font-light">Orders Log</h1>
      <p className="mt-2 text-sm text-muted">
        {loading ? "Loading..." : `${orders.length} orders logged in the database`}
      </p>

      {error && (
        <div className="mt-6 border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="mt-8 border border-ink/10 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm text-left">
            <thead>
              <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-muted bg-surface/50">
                <th className="px-5 py-4 w-12"></th>
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer Details</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Order Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-muted">
                    Loading database logs...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-muted">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isExpanded = expandedOrderId === o.id;
                  const formattedDate = new Date(o.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <Fragment key={o.id}>
                      <tr
                        className={`border-b border-ink/5 transition-colors hover:bg-ink/5 cursor-pointer ${
                          isExpanded ? "bg-ink/5" : ""
                        }`}
                        onClick={() => toggleExpand(o.id)}
                      >
                        <td className="px-5 py-4 text-center">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                        <td className="px-5 py-4 font-mono font-medium text-ink">
                          {o.id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-ink">{o.name}</div>
                          <div className="text-xs text-muted">{o.email}</div>
                          {o.phone && <div className="text-[10px] text-muted">{o.phone}</div>}
                        </td>
                        <td className="px-5 py-4 text-muted text-xs">
                          {formattedDate}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono uppercase text-ink">
                            {o.paymentMethod}
                          </span>
                          {o.paymentId && (
                            <div className="text-[9px] text-muted font-mono truncate max-w-[120px]" title={o.paymentId}>
                              {o.paymentId}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gold font-medium">
                          {formatPrice(o.total)}
                        </td>
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded outline-none border transition-colors cursor-pointer bg-bg ${
                              statusColors[o.status] || ""
                            }`}
                          >
                            <option value="Placed">Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Return Requested">Return Requested</option>
                            <option value="Returned">Returned</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>

                      {/* Expanded Order Items Row */}
                      {isExpanded && (
                        <tr className="bg-surface/30">
                          <td colSpan={7} className="px-10 py-6 border-b border-ink/10">
                            <div className="grid gap-6 md:grid-cols-3">
                              {/* Items List */}
                              <div className="md:col-span-2 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-3">
                                  <ShoppingBag size={13} /> Items Breakdown
                                </h3>
                                {o.items && o.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-4 border-b border-ink/5 pb-3 last:border-0 last:pb-0">
                                    <div className="relative h-14 w-12 shrink-0 border border-ink/10 bg-bg overflow-hidden">
                                      {item.image && (
                                        <Image
                                          src={item.image}
                                          alt={item.name}
                                          fill
                                          className="object-cover"
                                          sizes="48px"
                                          unoptimized
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate text-ink">{item.name}</div>
                                      <div className="text-xs text-muted mt-0.5">
                                        Color: <span className="text-ink">{item.color}</span> · Size: <span className="text-ink">{item.size}</span>
                                      </div>
                                      {item.description && (
                                        <div className="mt-1 text-[10px] text-gold bg-gold/10 px-2 py-0.5 inline-block rounded font-mono">
                                          Instructions: {item.description}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right shrink-0">
                                      <div className="text-sm font-medium text-ink">
                                        {formatPrice(item.price * item.quantity)}
                                      </div>
                                      <div className="text-xs text-muted mt-0.5">
                                        {item.quantity} x {formatPrice(item.price)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Logistics Summary */}
                              <div className="border-t border-ink/10 pt-6 md:border-t-0 md:pt-0 md:border-l md:pl-6 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-3">
                                  <Truck size={13} /> Logistics Summary
                                </h3>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-muted">Courier Partner:</span>
                                    <span className="font-medium text-ink">{o.carrier || "BlueDart"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted">AWB Tracking ID:</span>
                                    <span className="font-mono font-medium text-gold">{o.tracking || "Pending Dispatch"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted">Items Subtotal:</span>
                                    <span className="font-medium text-ink">{formatPrice(o.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted">Shipping Charges:</span>
                                    <span className="font-medium text-ink">
                                      {o.shipping === 0 ? "FREE" : formatPrice(o.shipping)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-t border-ink/10 pt-2 font-medium">
                                    <span className="text-ink">Grand Total:</span>
                                    <span className="text-gold">{formatPrice(o.total)}</span>
                                  </div>
                                  
                                  {/* Return Reason Warning Panel */}
                                  {(o.status === "Return Requested" || o.status === "Returned") && o.returnReason && (
                                    <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-1">
                                      <p className="font-bold text-amber-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                                        ⚠️ Return Reason Provided
                                      </p>
                                      <p className="text-muted italic leading-relaxed mt-1">
                                        "{o.returnReason}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
