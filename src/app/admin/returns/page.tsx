"use client";

import { useEffect, useState, Fragment } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { ChevronDown, ChevronUp, RotateCcw, AlertTriangle, CheckCircle2, User, MapPin, Building, Image as ImageIcon, Check, X, Truck, Calendar } from "lucide-react";

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
  status: "Placed" | "Confirmed" | "Shipped" | "Delivered" | "Return Requested" | "Returned" | "Cancelled" | "Requested" | "Approved" | "Pickup Scheduled" | "Picked Up" | "Refund Processed" | "Rejected";
  paymentMethod: string;
  paymentId: string | null;
  name: string;
  email: string;
  phone: string | null;
  carrier: string | null;
  tracking: string | null;
  returnReason: string | null;
  returnImage: string | null;
  returnAddress: string | null;
  bankDetails: string | null;
  items: OrderItem[];
  createdAt: string;
};

const statusLabels: Record<Order["status"], string> = {
  Placed: "Placed",
  Confirmed: "Confirmed",
  Shipped: "Shipped",
  Delivered: "Delivered",
  "Return Requested": "Requested",
  Returned: "Refund Processed",
  Cancelled: "Cancelled",
  Requested: "Return Requested",
  Approved: "Approved",
  "Pickup Scheduled": "Pickup Scheduled",
  "Picked Up": "Picked Up",
  "Refund Processed": "Refund Processed",
  Rejected: "Rejected",
};

const statusColors: Record<Order["status"], string> = {
  Placed: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Confirmed: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  Shipped: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  "Return Requested": "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  Returned: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
  Requested: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  Approved: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "Pickup Scheduled": "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "Picked Up": "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  "Refund Processed": "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function AdminReturnsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Photo modal preview
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const fetchReturns = () => {
    setLoading(true);
    setError("");
    fetch("/api/admin/orders")
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load logs (${r.status})`);
        return r.json();
      })
      .then((data) => {
        if (data?.orders) {
          // Filter only orders with return statuses
          const returnStatuses = ["Return Requested", "Returned", "Requested", "Approved", "Pickup Scheduled", "Picked Up", "Refund Processed", "Rejected"];
          const filtered = data.orders.filter((o: Order) => returnStatuses.includes(o.status));
          setOrders(filtered);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load return requests from backend.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to update return status");
      }
      
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div>
      <p className="eyebrow">Customer Care</p>
      <h1 className="mt-2 font-serif text-4xl font-light">Returns Center</h1>
      <p className="mt-2 text-sm text-muted">
        {loading ? "Loading..." : `${orders.length} return requests found in database`}
      </p>

      {error && (
        <div className="mt-6 border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Table grid */}
      <div className="mt-8 border border-ink/10 bg-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm text-left">
            <thead>
              <tr className="border-b border-ink/10 text-[10px] uppercase tracking-widest text-muted bg-surface/50">
                <th className="px-5 py-4 w-12"></th>
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Return Reason</th>
                <th className="px-5 py-4">Refund Mode</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Refund Value</th>
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
                    No active product return requests found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isExpanded = expandedOrderId === o.id;
                  const parsedBank = o.bankDetails ? JSON.parse(o.bankDetails) : null;
                  
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
                        <td className="px-5 py-4 font-mono font-bold text-ink">
                          {o.id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-ink">{o.name}</div>
                          <div className="text-xs text-muted">{o.email}</div>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted truncate max-w-[200px]" title={o.returnReason || ""}>
                          {o.returnReason || "—"}
                        </td>
                        <td className="px-5 py-4 text-xs font-mono uppercase text-muted">
                          {o.paymentMethod === "cod" ? "COD (Bank details shared)" : "Original Mode (Online)"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${statusColors[o.status] || ""}`}>
                            {statusLabels[o.status] || o.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-gold font-bold font-mono">
                          {formatPrice(o.total)}
                        </td>
                      </tr>

                      {/* Expanded View */}
                      {isExpanded && (
                        <tr className="bg-surface/30">
                          <td colSpan={7} className="px-10 py-6 border-b border-ink/10">
                            <div className="grid gap-8 md:grid-cols-3">
                              
                              {/* Left Pane: Reason & Verification */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-ink/5 pb-2">
                                  <User size={13} /> Verification Panel
                                </h4>
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <span className="text-muted font-semibold block mb-1">Return Reason:</span>
                                    <p className="bg-bg border border-ink/5 p-3 rounded text-ink italic">
                                      "{o.returnReason}"
                                    </p>
                                  </div>

                                  {o.returnImage && (
                                    <div>
                                      <span className="text-muted font-semibold block mb-1">Uploaded Proof:</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPreviewPhoto(o.returnImage);
                                        }}
                                        className="relative h-20 w-20 border border-ink/10 bg-bg rounded overflow-hidden flex items-center justify-center group"
                                      >
                                        <Image
                                          src={o.returnImage}
                                          alt="Proof thumbnail"
                                          fill
                                          className="object-contain group-hover:opacity-75 transition-opacity"
                                        />
                                        <ImageIcon size={14} className="absolute text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </button>
                                    </div>
                                  )}

                                  <div>
                                    <span className="text-muted font-semibold block mb-1 flex items-center gap-1">
                                      <MapPin size={12} className="text-gold" /> Pickup Address:
                                    </span>
                                    <p className="text-ink bg-bg border border-ink/5 p-3 rounded">
                                      {o.returnAddress || "Default customer details address"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Center Pane: Bank Details for COD */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-ink/5 pb-2">
                                  <Building size={13} /> Refund Method
                                </h4>
                                
                                {o.paymentMethod === "cod" && parsedBank ? (
                                  <div className="space-y-3 bg-bg border border-ink/5 p-4 rounded-xl text-xs">
                                    <p className="text-[10px] uppercase font-bold text-gold tracking-wider">COD Refund Account Info</p>
                                    <div className="flex justify-between">
                                      <span className="text-muted">Bank Name:</span>
                                      <span className="font-semibold text-ink">{parsedBank.bankName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted">Account Holder:</span>
                                      <span className="font-semibold text-ink">{parsedBank.holderName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted">Account Number:</span>
                                      <span className="font-mono font-semibold text-ink">{parsedBank.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted">IFSC Code:</span>
                                      <span className="font-mono font-semibold text-gold">{parsedBank.ifscCode}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-bg border border-ink/5 rounded-xl text-xs leading-relaxed text-muted flex gap-2">
                                    <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
                                    <span>
                                      Online Payment Order. Refund will be dispatched directly to the **original payment gateway ID** (`{o.paymentId || "Razorypay Transaction ID"}`).
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Right Pane: Actions workflow */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-ink/5 pb-2">
                                  <Truck size={13} /> Returns Workflow
                                </h4>

                                <div className="space-y-3">
                                  {/* Requested -> Approve/Reject */}
                                  {(o.status === "Requested" || o.status === "Return Requested") && (
                                    <div className="flex flex-col gap-2">
                                      <button
                                        onClick={() => handleStatusUpdate(o.id, "Approved")}
                                        disabled={updatingId === o.id}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                                      >
                                        <Check size={14} /> Approve Return
                                      </button>
                                      <button
                                        onClick={() => handleStatusUpdate(o.id, "Rejected")}
                                        disabled={updatingId === o.id}
                                        className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-xs font-bold uppercase py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                                      >
                                        <X size={14} /> Reject Request
                                      </button>
                                    </div>
                                  )}

                                  {/* Approved -> Schedule Pickup */}
                                  {o.status === "Approved" && (
                                    <button
                                      onClick={() => handleStatusUpdate(o.id, "Pickup Scheduled")}
                                      disabled={updatingId === o.id}
                                      className="w-full bg-amber-500 hover:bg-amber-600 text-[#0c0a06] text-xs font-bold uppercase py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                      <Calendar size={14} /> Schedule Pickup
                                    </button>
                                  )}

                                  {/* Pickup Scheduled -> Mark Picked Up */}
                                  {o.status === "Pickup Scheduled" && (
                                    <button
                                      onClick={() => handleStatusUpdate(o.id, "Picked Up")}
                                      disabled={updatingId === o.id}
                                      className="w-full bg-teal-500 hover:bg-teal-600 text-[#0c0a06] text-xs font-bold uppercase py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                      <Truck size={14} /> Mark Picked Up
                                    </button>
                                  )}

                                  {/* Picked Up -> Process Refund */}
                                  {o.status === "Picked Up" && (
                                    <button
                                      onClick={() => handleStatusUpdate(o.id, "Refund Processed")}
                                      disabled={updatingId === o.id}
                                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                      <CheckCircle2 size={14} /> Process Refund
                                    </button>
                                  )}

                                  {/* Final Refund Processed info */}
                                  {o.status === "Refund Processed" && (
                                    <div className="bg-purple-500/10 border border-purple-500/25 p-3 rounded-lg text-xs text-purple-400 text-center font-medium">
                                      ✓ Refund processed and closed.
                                    </div>
                                  )}

                                  {/* Rejected info */}
                                  {o.status === "Rejected" && (
                                    <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-lg text-xs text-red-400 text-center font-medium">
                                      ✕ Request rejected and closed.
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

      {/* Image Modal Lightbox */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewPhoto} alt="Verification Zoom" className="object-contain max-w-full max-h-full" />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-0 right-0 m-4 bg-surface text-ink p-2 rounded-full border border-ink/10 hover:text-gold"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
