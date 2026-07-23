"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RotateCcw, AlertTriangle, CheckCircle2, ArrowLeft, Upload, FileText, MapPin, Building, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPrice } from "@/lib/utils";

function ReturnRequestInner() {
  const params = useSearchParams();
  const queryId = params.get("id");

  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Loaded order details
  const [order, setOrder] = useState<any | null>(null);

  // Return Form State
  const [reason, setReason] = useState("Size issue (too tight / too loose)");
  const [customReason, setCustomReason] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  
  // Bank Details for COD Refunds
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [holderName, setHolderName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (queryId) {
      setOrderId(queryId);
      setLoading(true);
      fetch(`/api/orders/${queryId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.order) {
            if (data.order.status === "Delivered") {
              setOrder(data.order);
              setPickupAddress(data.order.returnAddress || `${data.order.name}, ${data.order.email}`);
            } else {
              setError(`Only Delivered orders can be returned. This order is currently: ${data.order.status}`);
            }
          } else {
            setError("Order not found. Please verify your Order ID.");
          }
        })
        .catch(() => setError("Failed to find order."))
        .finally(() => setLoading(false));
    }
  }, [queryId]);

  const lookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? "Order not found. Please verify your Order ID." : "Server error looking up order.");
      }
      
      const data = await res.json();
      const o = data?.order;
      
      if (!o) {
        throw new Error("Order not found.");
      }

      if (o.status !== "Delivered") {
        throw new Error(`Only Delivered orders can be returned. This order is currently: ${o.status}`);
      }

      setOrder(o);
      setPickupAddress(o.returnAddress || `${o.name}, ${o.email}`);
    } catch (err: any) {
      setError(err.message || "Failed to find order.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoName(file.name);

    // Read file as base64 mock upload preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!pickupAddress.trim()) {
      setError("Please confirm the pickup address.");
      return;
    }

    if (order.paymentMethod === "cod" && (!bankName || !accountNumber || !ifscCode || !holderName)) {
      setError("Please fill in all bank details to process your COD refund.");
      return;
    }

    setSubmitting(true);
    setError("");

    const finalReason = reason === "Other" ? `Other: ${customReason}` : reason;
    const bankDetailsPayload = order.paymentMethod === "cod" ? JSON.stringify({
      bankName,
      accountNumber,
      ifscCode,
      holderName
    }) : null;

    try {
      const res = await fetch(`/api/orders/${order.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: finalReason,
          image: photo,
          pickupAddress: pickupAddress.trim(),
          bankDetails: bankDetailsPayload
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit return request.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-28 pt-36 bg-bg">
      <PageHeader
        eyebrow="Customer Care"
        title="Request a Return"
        subtitle="Initiate returns, verify pickup logistics, and input bank refund options."
      />

      <div className="container-luxe max-w-2xl">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Order lookup card */}
              {!order && (
                <div className="border border-ink/10 bg-card p-8 rounded-2xl">
                  <h3 className="font-serif text-lg mb-4">Enter Order ID</h3>
                  <form onSubmit={lookupOrder} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="e.g. YT-39482"
                        className="w-full bg-surface border border-ink/10 rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-gold text-ink"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gold hover:bg-gold/90 text-[#0c0a06] text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-lg transition-colors"
                    >
                      {loading ? "Searching..." : "Lookup"}
                    </button>
                  </form>

                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 rounded-lg">
                      <AlertTriangle size={14} />
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* Form card */}
              {order && (
                <form onSubmit={submitReturn} className="space-y-6">
                  {/* Order Summary banner */}
                  <div className="border border-ink/10 bg-card p-6 rounded-2xl flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted">Order ID</p>
                      <h4 className="font-serif text-xl text-gold mt-1">{order.id}</h4>
                      <p className="text-xs text-muted mt-1">Placed on: {new Date(order.date).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-muted">Amount Paid</p>
                      <p className="font-serif text-xl mt-1 text-ink">{formatPrice(order.total)}</p>
                      <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-bold text-muted bg-surface px-2.5 py-0.5 rounded border border-ink/5">
                        {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                      </span>
                    </div>
                  </div>

                  {/* Return details card */}
                  <div className="border border-ink/10 bg-card p-8 rounded-2xl space-y-6">
                    <h3 className="font-serif text-xl border-b border-ink/5 pb-4">Return Details</h3>

                    {/* Reasons */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-muted font-bold">
                        Reason for Return
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-surface border border-ink/10 rounded-lg px-4 py-3 text-xs outline-none focus:border-gold text-ink"
                      >
                        <option value="Size issue (too tight / too loose)">Size issue (too tight / too loose)</option>
                        <option value="Color mismatch (slightly different from studio photos)">Color mismatch (slightly different from studio photos)</option>
                        <option value="Defective product (damaged stitching / print error)">Defective product (damaged stitching / print error)</option>
                        <option value="Wrong item delivered">Wrong item delivered</option>
                        <option value="Other">Other (specify below)</option>
                      </select>
                    </div>

                    {reason === "Other" && (
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-muted font-bold">
                          Specify Reason
                        </label>
                        <input
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="Please specify your return reason..."
                          className="w-full bg-surface border border-ink/10 rounded-lg px-4 py-3 text-xs outline-none focus:border-gold text-ink"
                          required
                        />
                      </div>
                    )}

                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-muted font-bold">
                        Product Condition Photo (Proof)
                      </label>
                      <div className="border-2 border-dashed border-ink/10 rounded-xl p-6 text-center hover:border-gold/50 transition-colors relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <Upload size={24} className="text-gold" />
                          <p className="text-xs text-ink font-semibold">
                            {photoName ? photoName : "Click to upload product image"}
                          </p>
                          <p className="text-[10px] text-muted">Supports JPG, PNG (Max 5MB)</p>
                        </div>
                      </div>

                      {photo && (
                        <div className="relative w-28 h-28 border border-ink/10 rounded-lg mt-2 overflow-hidden bg-surface">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt="Return preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>

                    {/* Address details */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-muted font-bold flex items-center gap-1">
                        <MapPin size={12} className="text-gold" /> Confirm Pickup Address
                      </label>
                      <textarea
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="Please input full pickup address with pincode..."
                        className="w-full bg-surface border border-ink/10 rounded-lg px-4 py-3 text-xs outline-none focus:border-gold h-20 text-ink resize-none"
                      />
                    </div>
                  </div>

                  {/* COD Bank Details Section */}
                  {order.paymentMethod === "cod" && (
                    <div className="border border-ink/10 bg-card p-8 rounded-2xl space-y-6">
                      <h3 className="font-serif text-lg border-b border-ink/5 pb-4 flex items-center gap-2">
                        <Building size={16} className="text-gold" /> Refund Account Details
                      </h3>
                      <p className="text-xs text-muted leading-relaxed">
                        Since this order was paid via Cash on Delivery, please share your bank details. Refund will be processed via IMPS/NEFT transfer directly to this account once pickup is approved.
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-[9px] uppercase tracking-widest text-muted font-bold">Bank Name</label>
                          <input
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. HDFC Bank"
                            className="w-full bg-surface border border-ink/10 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-gold text-ink"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[9px] uppercase tracking-widest text-muted font-bold">Account Holder Name</label>
                          <input
                            value={holderName}
                            onChange={(e) => setHolderName(e.target.value)}
                            placeholder="Full name as in passbook"
                            className="w-full bg-surface border border-ink/10 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-gold text-ink"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[9px] uppercase tracking-widest text-muted font-bold">Account Number</label>
                          <input
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="Account Number"
                            className="w-full bg-surface border border-ink/10 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-gold text-ink"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[9px] uppercase tracking-widest text-muted font-bold">IFSC Code</label>
                          <input
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                            placeholder="e.g. HDFC0000282"
                            className="w-full bg-surface border border-ink/10 rounded-lg px-3.5 py-2.5 text-xs outline-none focus:border-gold text-ink"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Online payment info message */}
                  {order.paymentMethod !== "cod" && (
                    <div className="border border-ink/10 bg-card p-6 rounded-2xl flex items-center gap-3">
                      <CreditCard size={18} className="text-gold shrink-0" />
                      <p className="text-xs text-muted">
                        Refund will be processed back to your **original payment method** (UPI / Card / Net Banking) within 3-5 business days once pickup is complete.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 rounded-lg">
                      <AlertTriangle size={14} />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setOrder(null)}
                      className="border border-ink/10 text-muted px-8 py-3 text-xs font-bold uppercase tracking-widest rounded-lg hover:text-ink transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-gold hover:bg-gold/90 text-[#0c0a06] text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-lg transition-colors shadow-md"
                    >
                      {submitting ? "Submitting..." : "Submit Return Request"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="success-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-gold/20 bg-card p-12 text-center rounded-2xl shadow-xl max-w-lg mx-auto"
            >
              <CheckCircle2 size={48} className="mx-auto text-gold" />
              <h3 className="font-serif text-2xl mt-6">Return Requested Successfully</h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                Your request has been logged in the system under status **`Requested`**. A courier pick-up will be scheduled with our logistics partner once the admin approves.
              </p>
              
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href={`/track?id=${order?.id}`}
                  className="bg-gold text-[#0c0a06] px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-lg shadow"
                >
                  Track Status
                </Link>
                <Link
                  href="/"
                  className="border border-ink/10 text-muted hover:text-ink px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-lg"
                >
                  Return Home
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ReturnRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-36 text-center text-sm uppercase tracking-wider text-muted animate-pulse">Loading return center...</div>}>
      <ReturnRequestInner />
    </Suspense>
  );
}
