"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, X, Trash2, Edit3, Sparkles } from "lucide-react";

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  link: string;
  glow: string;
  watermark: string;
  coord: string;
  sortOrder: number;
};

export default function AdminHero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Form states
  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("/shop");
  const [glow, setGlow] = useState("rgba(212,175,55,0.15)");
  const [watermark, setWatermark] = useState("");
  const [coord, setCoord] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSlides = () => {
    setLoading(true);
    fetch("/api/hero")
      .then((r) => r.json())
      .then((data) => {
        if (data?.slides) {
          setSlides(data.slides);
        }
      })
      .catch((err) => console.error("Error fetching hero slides:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleEditClick = (s: HeroSlide) => {
    setEditingSlide(s);
    setEyebrow(s.eyebrow);
    setTitle(s.title);
    setDescription(s.description);
    setImage(s.image);
    setLink(s.link);
    setGlow(s.glow);
    setWatermark(s.watermark);
    setCoord(s.coord);
    setSortOrder(String(s.sortOrder));
    setFormError("");
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingSlide(null);
    setEyebrow("");
    setTitle("");
    setDescription("");
    setImage("");
    setLink("/shop");
    setGlow("rgba(212,175,55,0.15)");
    setWatermark("");
    setCoord("");
    setSortOrder("0");
    setFormError("");
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!eyebrow.trim()) return setFormError("Eyebrow text is required.");
    if (!title.trim()) return setFormError("Title is required.");
    if (!description.trim()) return setFormError("Description is required.");
    if (!image.trim()) return setFormError("Image is required.");
    if (!watermark.trim()) return setFormError("Watermark is required.");
    if (!coord.trim()) return setFormError("Coordinates display is required.");

    setSaving(true);
    try {
      const url = editingSlide ? `/api/hero/${editingSlide.id}` : "/api/hero";
      const method = editingSlide ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow: eyebrow.trim(),
          title: title.trim(),
          description: description.trim(),
          image: image.trim(),
          link: link.trim() || "/shop",
          glow: glow.trim() || "rgba(212,175,55,0.15)",
          watermark: watermark.trim(),
          coord: coord.trim(),
          sortOrder: Number(sortOrder) || 0,
        }),
      });

      if (!res.ok) {
        let errMsg = editingSlide ? "Failed to update hero slide" : "Failed to create hero slide";
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const d = await res.json();
          errMsg = d.error || errMsg;
        }
        throw new Error(errMsg);
      }

      // Reset
      setShowModal(false);
      fetchSlides();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    try {
      const res = await fetch(`/api/hero/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete slide.");
      setSlides((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete slide.");
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Homepage Config</p>
          <h1 className="mt-2 font-serif text-4xl font-light">Hero Banner</h1>
          <p className="mt-2 text-sm text-muted">
            {loading ? "Loading..." : `${slides.length} slides configured`}
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 border border-gold px-4 py-2.5 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-[#0c0a06] transition-colors"
        >
          <Plus size={14} /> Add Slide
        </button>
      </div>

      {/* Slides Table */}
      <div className="mt-8 overflow-x-auto border border-ink/10 bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-luxe text-muted">
              <th className="px-5 py-4">Image</th>
              <th className="px-5 py-4">Slide Content</th>
              <th className="px-5 py-4">Watermark / Coordinates</th>
              <th className="px-5 py-4">Sort Order</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted">
                  Loading banner data...
                </td>
              </tr>
            ) : slides.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted">
                  No slides active. Add a slide to overwrite fallback defaults!
                </td>
              </tr>
            ) : (
              slides.map((s) => (
                <tr key={s.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-3">
                    <div className="relative h-14 w-20 bg-surface border border-ink/10 overflow-hidden">
                      {s.image && (
                        <Image
                          src={s.image}
                          alt={s.title}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gold font-medium bg-gold/10 px-1.5 py-0.5 rounded">
                        {s.eyebrow}
                      </span>
                      <h4 className="font-serif font-medium mt-1 text-ink text-base">{s.title}</h4>
                      <p className="text-xs text-muted mt-1 max-w-sm line-clamp-2">{s.description}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-0.5 font-mono text-xs text-muted">
                      <p>WM: <span className="text-ink">{s.watermark}</span></p>
                      <p>Coord: <span className="text-ink">{s.coord}</span></p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink font-mono">{s.sortOrder}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(s)}
                        className="text-muted hover:text-gold p-1.5 hover:bg-card/85 transition-colors"
                        title="Edit Slide"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-muted hover:text-red-400 p-1.5 hover:bg-card/85 transition-colors"
                        title="Delete Slide"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide Modal Editor */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl border border-ink/15 bg-surface p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <h2 className="font-serif text-2xl font-light">
                {editingSlide ? "Edit Hero Slide" : "Add Hero Slide"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {formError && (
                <div className="border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Slide Eyebrow *</label>
                  <input
                    type="text"
                    required
                    value={eyebrow}
                    onChange={(e) => setEyebrow(e.target.value)}
                    placeholder="e.g. Premium Collection"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Slide Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. THE SIGNATURE CANVAS"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Slide Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the highlight piece (e.g. Heavyweight cotton...)"
                  className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Call to Action Link</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g. /shop"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Glow Color (Hex/RGBA)</label>
                  <input
                    type="text"
                    value={glow}
                    onChange={(e) => setGlow(e.target.value)}
                    placeholder="e.g. rgba(212,175,55,0.15)"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Watermark Text *</label>
                  <input
                    type="text"
                    required
                    value={watermark}
                    onChange={(e) => setWatermark(e.target.value)}
                    placeholder="e.g. ARCHIVE 01"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Coordinates *</label>
                  <input
                    type="text"
                    required
                    value={coord}
                    onChange={(e) => setCoord(e.target.value)}
                    placeholder="e.g. [45.38° N, 12.06° E]"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    placeholder="e.g. 0"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Banner Image Selection */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Slide Image *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={image.startsWith("data:") ? "Uploaded image selected" : image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Paste Image URL..."
                    className="flex-1 border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold text-ellipsis overflow-hidden"
                  />
                  <label className="border border-gold px-3 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-[#0c0a06] transition-colors cursor-pointer flex items-center justify-center select-none">
                    Browse
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {image && (
                  <div className="mt-2 relative h-20 w-32 border border-ink/10 bg-surface overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="Preview" className="h-full w-full object-contain p-1" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end border-t border-ink/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border border-ink/15 px-4 py-2.5 text-xs uppercase tracking-wider text-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="border border-gold bg-gold px-6 py-2.5 text-xs uppercase tracking-wider text-[#0c0a06] hover:bg-gold/80 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : editingSlide ? "Update Slide" : "Save Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
