"use client";

import { useEffect, useState } from "react";
import { Palette, CheckCircle, AlertCircle, ShoppingBag, Trash2, Edit3, Eye, X } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  garment: string;
  color: string;
  fabric: string;
  price: number;
  preview: string | null;
  previewBack?: string | null;
  user: { name: string; email: string };
  createdAt: string;
};

// Helper to resolve color hex code by name for product creation
const colorHexMap: Record<string, string> = {
  Onyx: "#101010",
  Bone: "#ece7dd",
  Clay: "#9a6f4e",
  Slate: "#4b4f54",
  "Vintage White": "#f3efe7",
  "Washed Black": "#1a1a1a",
  Asphalt: "#2b2b2b",
  Sand: "#cbb79a",
  Forest: "#2f3b30",
  Ivory: "#efe9dd",
  Ink: "#101010",
  Sage: "#9aa388",
  Obsidian: "#0a0a0a",
  Champagne: "#d8c39a",
  White: "#f6f3ee",
  Charcoal: "#33363a",
  Camel: "#b08d5b",
  "Off White": "#f0ece2",
  Black: "#121212",
};

export default function AdminDesigns() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Customizer admin management states
  const [lightboxImages, setLightboxImages] = useState<{ front: string; back: string | null } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDesign, setEditingDesign] = useState<Row | null>(null);
  const [editName, setEditName] = useState("");
  const [editGarment, setEditGarment] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editFabric, setEditFabric] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const fetchDesigns = () => {
    setLoading(true);
    fetch("/api/admin/designs")
      .then((r) => r.json())
      .then((d) => setRows(d.designs ?? []))
      .catch((err) => console.error("Error fetching designs:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleMakeProduct = async (d: Row) => {
    if (!d.preview) {
      setNotification({ type: "error", message: "Cannot convert a design without a preview image." });
      return;
    }

    setConvertingId(d.id);
    setNotification(null);

    const colorHex = colorHexMap[d.color] || "#101010";
    const payload = {
      name: `${d.name} (Custom)`,
      collection: "Minimal", // Default category
      price: d.price,
      originalPrice: null,
      description: `A custom-tailored designer tee created by ${d.user.name} (${d.user.email}). Fabric: ${d.fabric}.`,
      fabric: d.fabric || "Premium Combed Cotton",
      gsm: 280, // standard custom weight
      colors: [{ name: d.color, hex: colorHex }],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      image: d.preview,
      gallery: [d.preview],
      tag: "Custom",
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to publish product");
      }

      setNotification({
        type: "success",
        message: `Successfully created store product: "${payload.name}"!`,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "An error occurred while publishing the product.",
      });
    } finally {
      setConvertingId(null);
    }
  };

  const handleDeleteDesign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom design?")) return;
    try {
      const res = await fetch(`/api/admin/designs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete design");
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      setNotification({ type: "success", message: "Design deleted successfully." });
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to delete design." });
    }
  };

  const handleEditClick = (d: Row) => {
    setEditingDesign(d);
    setEditName(d.name);
    setEditGarment(d.garment);
    setEditColor(d.color);
    setEditFabric(d.fabric);
    setEditPrice(String(d.price));
    setNotification(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesign) return;
    try {
      const res = await fetch(`/api/admin/designs/${editingDesign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          garment: editGarment.trim(),
          color: editColor.trim(),
          fabric: editFabric.trim(),
          price: Number(editPrice),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update design");
      }
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingDesign.id
            ? {
                ...r,
                name: editName.trim(),
                garment: editGarment.trim(),
                color: editColor.trim(),
                fabric: editFabric.trim(),
                price: Number(editPrice),
              }
            : r
        )
      );
      setShowEditModal(false);
      setEditingDesign(null);
      setNotification({ type: "success", message: "Design updated successfully." });
    } catch (err: any) {
      alert(err.message || "Failed to update design.");
    }
  };

  return (
    <div>
      <p className="eyebrow">Customer Creations</p>
      <h1 className="mt-2 font-serif text-4xl font-light">Designs</h1>
      <p className="mt-2 text-sm text-muted">
        {rows.length} designs saved by customers
      </p>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`mt-6 border p-4 text-sm flex items-center gap-2.5 transition-opacity ${
            notification.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : "border-red-500/20 bg-red-500/5 text-red-400"
          }`}
        >
          {notification.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="mt-10 border border-ink/10 bg-card p-12 text-center">
          <Palette size={36} className="mx-auto text-muted" strokeWidth={1} />
          <p className="mt-4 text-muted">
            No customer designs yet. They appear here once users save from the
            customizer.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((d) => {
            const isSaving = convertingId === d.id;
            return (
              <div key={d.id} className="border border-ink/10 bg-card flex flex-col justify-between">
                <div>
                  <div
                    onClick={() => {
                      if (d.preview) {
                        setLightboxImages({ front: d.preview, back: d.previewBack || null });
                      }
                    }}
                    className="relative aspect-square overflow-hidden bg-surface border-b border-ink/10 group cursor-zoom-in"
                  >
                    {d.preview ? (
                      <>
                        {/* Front View */}
                        <img
                          src={d.preview}
                          alt={d.name}
                          className={cn(
                            "absolute inset-0 h-full w-full object-contain transition-opacity duration-500",
                            d.previewBack ? "group-hover:opacity-0" : ""
                          )}
                        />
                        {/* Back View (Cross-fade on hover) */}
                        {d.previewBack && (
                          <img
                            src={d.previewBack}
                            alt={`${d.name} Back`}
                            className="absolute inset-0 h-full w-full object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <span className="flex items-center gap-1.5 border border-white px-3 py-1.5 text-[10px] uppercase tracking-wider text-white">
                            <Eye size={12} /> Preview Both Sides
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="grid h-full place-items-center">
                        <span className="font-serif text-lg italic text-gold">
                          {d.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="truncate font-medium">{d.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {d.color} · {formatPrice(d.price)}
                    </p>
                    <p className="mt-2 truncate text-[10px] text-muted uppercase tracking-wider">
                      by {d.user.name}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border-t border-ink/5 bg-surface/30">
                  <button
                    disabled={isSaving}
                    onClick={() => handleMakeProduct(d)}
                    className="w-full flex items-center justify-center gap-1.5 border border-gold bg-transparent py-2 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-[#0c0a06] disabled:opacity-50 transition-colors mb-2"
                  >
                    <ShoppingBag size={12} />
                    {isSaving ? "Converting..." : "Make Product"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(d)}
                      className="flex-1 flex items-center justify-center gap-1 border border-ink/15 py-2 text-[10px] uppercase tracking-wider text-muted hover:text-ink transition-colors font-semibold"
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDesign(d.id)}
                      className="flex-1 flex items-center justify-center gap-1 border border-red-500/20 py-2 text-[10px] uppercase tracking-wider text-red-400 hover:bg-red-500/5 transition-colors font-semibold"
                    >
                      <Trash2 size={10} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {lightboxImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-10 overflow-y-auto">
          <button
            onClick={() => setLightboxImages(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white z-10 bg-zinc-900 border border-zinc-800 p-2.5 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col md:flex-row gap-6 max-w-5xl w-full my-auto items-center justify-center">
            {/* Front View Card */}
            <div className="relative flex-1 bg-zinc-950 border border-zinc-800 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-3 w-full">
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Front Look</span>
              <div className="relative w-full aspect-square max-h-[60vh] flex items-center justify-center">
                <img
                  src={lightboxImages.front}
                  alt="Front Design Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Back View Card */}
            {lightboxImages.back && (
              <div className="relative flex-1 bg-zinc-950 border border-zinc-800 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-3 w-full">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Back Look</span>
                <div className="relative w-full aspect-square max-h-[60vh] flex items-center justify-center">
                  <img
                    src={lightboxImages.back}
                    alt="Back Design Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Design Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-md border border-ink/15 bg-surface p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <h2 className="font-serif text-2xl font-light">Edit Custom Design</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDesign(null);
                }}
                className="text-muted hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Design Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Garment *</label>
                  <input
                    type="text"
                    required
                    value={editGarment}
                    onChange={(e) => setEditGarment(e.target.value)}
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Color *</label>
                  <input
                    type="text"
                    required
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Fabric *</label>
                <input
                  type="text"
                  required
                  value={editFabric}
                  onChange={(e) => setEditFabric(e.target.value)}
                  className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Price (INR) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-ink/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDesign(null);
                  }}
                  className="border border-ink/15 px-4 py-2 text-xs uppercase tracking-wider text-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="border border-gold bg-gold px-6 py-2 text-xs uppercase tracking-wider text-[#0c0a06] hover:bg-gold/80 transition-colors"
                >
                  Update Design
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
