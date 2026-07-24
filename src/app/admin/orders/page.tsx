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
  backImage?: string | null;
  color: string;
  size: string;
  quantity: number;
  description?: string | null;
  layers?: any[] | null;
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
  const [selectedReviewItem, setSelectedReviewItem] = useState<OrderItem | null>(null);
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
                                        <div className="mt-1 text-[10px] text-gold bg-gold/10 px-2 py-0.5 inline-block rounded font-mono block w-fit">
                                          Instructions: {item.description}
                                        </div>
                                      )}
                                      {item.productId === "custom" && (
                                        <button
                                          onClick={() => setSelectedReviewItem(item)}
                                          className="mt-2 block text-[10px] uppercase tracking-wider text-gold hover:text-gold/80 border border-gold/30 hover:border-gold px-2.5 py-1 rounded bg-gold/5 transition-all font-semibold"
                                        >
                                          🔍 Review Custom Design
                                        </button>
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
      {/* Dynamic Design Review Lightbox Modal */}
      {selectedReviewItem && (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-[#0c0a06]/85 backdrop-blur-md p-4 md:p-10 overflow-y-auto">
          <div className="relative w-full max-w-5xl my-auto rounded-2xl border border-ink/10 bg-bg p-6 md:p-8 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedReviewItem(null)}
              className="absolute top-6 right-6 text-muted hover:text-ink text-sm font-semibold uppercase tracking-wider bg-[#0c0a06]/5 border border-ink/10 px-3 py-1.5 rounded transition-all"
            >
              ✕ Close
            </button>

            {/* Header */}
            <div>
              <p className="eyebrow text-gold font-bold">Deep Analysis</p>
              <h2 className="mt-1 font-serif text-3xl font-light text-ink">Design Review Panel</h2>
              <p className="text-xs text-muted mt-1.5 uppercase tracking-wide">
                Reviewing custom silhouette layout configurations for order production.
              </p>
            </div>

            {/* Content Grid */}
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left Side: Front and Back large high-def looks */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted border-b border-ink/5 pb-2">
                  Garment Mockup Previews
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Front Look */}
                  <div className="rounded-xl border border-ink/10 bg-card p-4 space-y-3 flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Front Look</span>
                    <div className="relative w-full aspect-[3/4] border border-ink/5 bg-[#0c0a06]/5 overflow-hidden flex items-center justify-center rounded-lg">
                      {selectedReviewItem.image ? (
                        <Image
                          src={selectedReviewItem.image}
                          alt="Front View"
                          fill
                          className="object-contain p-2"
                          unoptimized
                        />
                      ) : (
                        <span className="text-xs text-muted">No front preview</span>
                      )}
                    </div>
                  </div>

                  {/* Back Look */}
                  <div className="rounded-xl border border-ink/10 bg-card p-4 space-y-3 flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Back Look</span>
                    <div className="relative w-full aspect-[3/4] border border-ink/5 bg-[#0c0a06]/5 overflow-hidden flex items-center justify-center rounded-lg">
                      {selectedReviewItem.backImage ? (
                        <Image
                          src={selectedReviewItem.backImage}
                          alt="Back View"
                          fill
                          className="object-contain p-2"
                          unoptimized
                        />
                      ) : (
                        <div className="text-center p-4">
                          <span className="text-[10px] uppercase text-muted block">No back print</span>
                          <span className="text-[8px] text-muted/65 mt-1 block">Tee is blank on rear</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Deep Layer analysis & properties */}
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted border-b border-ink/5 pb-2">
                  Detailed Layer Analysis
                </h3>

                {/* Fabric & Spec Details */}
                <div className="rounded-xl border border-ink/10 bg-card p-5 space-y-3.5">
                  <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Garment Specifications</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted block text-[10px]">T-Shirt Base:</span>
                      <span className="font-semibold text-ink">{selectedReviewItem.name}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px]">Garment Color:</span>
                      <span className="font-semibold text-ink">{selectedReviewItem.color}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px]">Requested Size:</span>
                      <span className="font-semibold text-ink font-mono">{selectedReviewItem.size}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px]">Quantity ordered:</span>
                      <span className="font-semibold text-ink font-mono">{selectedReviewItem.quantity} unit(s)</span>
                    </div>
                  </div>
                  {selectedReviewItem.description && (
                    <div className="border-t border-ink/5 pt-3">
                      <span className="text-muted block text-[10px] uppercase tracking-wider font-bold">Special Instructions:</span>
                      <p className="text-gold font-mono text-xs mt-1.5 bg-gold/5 border border-gold/15 p-3 rounded">
                        "{selectedReviewItem.description}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Layer List Breakdown */}
                <div className="rounded-xl border border-ink/10 bg-card p-5 space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">Placed Layers list</h4>
                  
                  {selectedReviewItem.layers && selectedReviewItem.layers.length > 0 ? (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                      {selectedReviewItem.layers.map((l: any, i: number) => (
                        <div key={l.id || i} className="border border-ink/5 bg-bg p-3 text-xs space-y-2 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-bold uppercase tracking-wider text-muted text-[9px] bg-ink/5 px-2 py-0.5 rounded">
                              Layer {i + 1}: {l.type}
                            </span>
                            <span className="text-[8px] uppercase tracking-widest text-gold font-bold">
                              Placed on: {l.side || "front"}
                            </span>
                          </div>
                          
                          {l.type === "text" ? (
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="col-span-2">
                                <span className="text-muted">Content:</span>
                                <span className="font-mono font-bold text-ink block border border-ink/5 bg-surface p-1.5 mt-1 rounded text-center">
                                  {l.content}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted">Font Family:</span>
                                <span className="font-medium text-ink block truncate">{l.font}</span>
                              </div>
                              <div>
                                <span className="text-muted">Stitch Color:</span>
                                <span className="font-medium text-ink block">{l.color}</span>
                              </div>
                              <div>
                                <span className="text-muted">Curvature:</span>
                                <span className="font-medium text-ink block font-mono">{l.curvature ? `${l.curvature}°` : "Flat"}</span>
                              </div>
                              <div>
                                <span className="text-muted">Format:</span>
                                <span className="font-medium text-ink block">
                                  {l.bold ? "Bold " : ""}{l.italic ? "Italic " : ""}{l.uppercase ? "ALLCAPS" : ""}
                                </span>
                              </div>
                            </div>
                          ) : l.type === "image" ? (
                            <div className="space-y-2">
                              <div>
                                <span className="text-muted text-[10px]">Source Image:</span>
                                <div className="relative w-16 h-16 border border-ink/5 bg-surface/50 overflow-hidden rounded flex items-center justify-center mt-1">
                                  <img src={l.content} alt="Upload thumb" className="object-contain max-w-full max-h-full" />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-[10px] text-muted font-mono">
                                <div>Scale: {Math.round(l.scale * 100)}%</div>
                                <div>Rotation: {Math.round(l.rotation)}°</div>
                                <div>Opacity: {Math.round(l.opacity * 100)}%</div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="col-span-2">
                                <span className="text-muted">Artwork Name/Source:</span>
                                <span className="font-medium text-ink block truncate font-mono">{l.content}</span>
                              </div>
                              <div>
                                <span className="text-muted">Scale:</span>
                                <span className="font-medium text-ink block font-mono">{Math.round(l.scale * 100)}%</span>
                              </div>
                              <div>
                                <span className="text-muted">Rotation:</span>
                                <span className="font-medium text-ink block font-mono">{Math.round(l.rotation)}°</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted italic">
                      No metadata layers cataloged for this custom tee. Rely on mockup images for rendering.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
