"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { Plus, X, Trash2, Edit3 } from "lucide-react";

export default function AdminProducts() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [collection, setCollection] = useState("Minimal");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("");
  const [gsm, setGsm] = useState("240");
  const [image, setImage] = useState("");
  const [galleryList, setGalleryList] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [stock, setStock] = useState("50");
  const [variantStockMap, setVariantStockMap] = useState<Record<string, number>>({});
  
  // Dynamic colors
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([
    { name: "Onyx", hex: "#0d0d0d" }
  ]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#ffffff");

  // Sizes selection
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data?.products) {
          setProductsList(data.products);
        }
      })
      .catch((err) => console.error("Error loading products:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddColor = () => {
    if (newColorName.trim()) {
      setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
      setNewColorName("");
      setNewColorHex("#ffffff");
    }
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleToggleSize = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setGalleryList((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCollection(p.collection);
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
    setDescription(p.description);
    setFabric(p.fabric);
    setGsm(String(p.gsm));
    setImage(p.image);
    const additionalImages = p.gallery.filter((img) => img !== p.image);
    setGalleryList(additionalImages);
    setTag(p.tag || "");
    setStock(String(p.stock !== undefined && p.stock !== null ? p.stock : 50));
    setVariantStockMap(p.variantStock || {});
    setColors(p.colors || [{ name: "Onyx", hex: "#0d0d0d" }]);
    setSizes(p.sizes || ["S", "M", "L", "XL"]);
    setFormError("");
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setName("");
    setCollection("Minimal");
    setPrice("");
    setOriginalPrice("");
    setDescription("");
    setFabric("");
    setGsm("240");
    setImage("");
    setGalleryList([]);
    setTag("");
    setStock("50");
    setVariantStockMap({});
    setColors([{ name: "Onyx", hex: "#0d0d0d" }]);
    setSizes(["S", "M", "L", "XL"]);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) return setFormError("Product name is required.");
    if (!price || Number(price) <= 0) return setFormError("Valid price is required.");
    if (!description.trim()) return setFormError("Product description is required.");
    if (!fabric.trim()) return setFormError("Fabric description is required.");
    if (!gsm || Number(gsm) <= 0) return setFormError("GSM value is required.");
    if (colors.length === 0) return setFormError("At least one product color is required.");
    if (sizes.length === 0) return setFormError("At least one size is required.");
    if (!image.trim()) return setFormError("Product image is required.");

    // Parse gallery
    let gallery = [image.trim()];
    if (galleryList.length > 0) {
      gallery = [...gallery, ...galleryList];
    }

    // Prepare variant stock maps and aggregate sum
    const finalVariantStock: Record<string, number> = {};
    let sumStock = 0;
    colors.forEach((c) => {
      sizes.forEach((s) => {
        const key = `${c.name}-${s}`;
        const qtyVal = variantStockMap[key] !== undefined && variantStockMap[key] !== null ? Number(variantStockMap[key]) : 50;
        finalVariantStock[key] = qtyVal;
        sumStock += qtyVal;
      });
    });

    setSaving(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          collection,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : null,
          description: description.trim(),
          fabric: fabric.trim(),
          gsm: Number(gsm),
          colors,
          sizes,
          image: image.trim(),
          gallery,
          tag: tag.trim() || null,
          stock: sumStock,
          variantStock: finalVariantStock,
        }),
      });

      if (!res.ok) {
        let errMsg = editingProduct ? "Failed to update product" : "Failed to create product";
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const d = await res.json();
          errMsg = d.error || errMsg;
        } else {
          errMsg = `Server error (${res.status}). Make sure your Express backend server is running on port 5001!`;
        }
        throw new Error(errMsg);
      }

      // Reset Form & Close Modal
      setName("");
      setPrice("");
      setOriginalPrice("");
      setDescription("");
      setFabric("");
      setGsm("240");
      setImage("");
      setGalleryList([]);
      setTag("");
      setStock("50");
      setVariantStockMap({});
      setColors([{ name: "Onyx", hex: "#0d0d0d" }]);
      setSizes(["S", "M", "L", "XL"]);
      setEditingProduct(null);
      setShowModal(false);
      
      // Refresh list
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while saving the product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let errMsg = "Failed to delete product";
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } else {
          errMsg = `Server error (${res.status}). Make sure your Express backend server is running on port 5001!`;
        }
        throw new Error(errMsg);
      }
      setProductsList((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-2 font-serif text-4xl font-light">Products</h1>
          <p className="mt-2 text-sm text-muted">
            {loading ? "Loading..." : `${productsList.length} products in the store`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCollectionsModal(true)}
            className="flex items-center gap-2 border border-ink/20 px-4 py-2.5 text-xs uppercase tracking-wider text-muted hover:border-gold hover:text-gold transition-colors"
          >
            <Trash2 size={14} /> Delete Collections
          </button>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 border border-gold px-4 py-2.5 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-[#0c0a06] transition-colors"
          >
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="mt-8 overflow-x-auto border border-ink/10 bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-luxe text-muted">
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Collection</th>
              <th className="px-5 py-4">Fabric</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Stock</th>
              <th className="px-5 py-4">Tag</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted">
                  Loading catalogue...
                </td>
              </tr>
            ) : productsList.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted">
                  No products in database. Add one to get started!
                </td>
              </tr>
            ) : (
              productsList.map((p) => (
                <tr key={p.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-surface border border-ink/10">
                        {p.image && (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        )}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{p.collection}</td>
                  <td className="px-5 py-3 text-muted">
                    {p.fabric} · {p.gsm} GSM
                  </td>
                  <td className="px-5 py-3 text-gold">
                    {formatPrice(p.price)}
                    {p.originalPrice && (
                      <span className="ml-2 text-xs line-through text-muted">
                        {formatPrice(p.originalPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {p.stock === undefined || p.stock === null ? (
                      <span className="text-muted">—</span>
                    ) : p.stock <= 0 ? (
                      <span className="text-red-400 font-bold bg-red-400/10 px-2 py-0.5 inline-block rounded text-[11px]">
                        Out of Stock ({p.stock})
                      </span>
                    ) : p.stock < 10 ? (
                      <span className="text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 inline-block rounded text-[11px]">
                        Low Stock ({p.stock})
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 inline-block rounded text-[11px]">
                        In Stock ({p.stock})
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {p.tag ? (
                      <span className="bg-ink/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted">
                        {p.tag}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="text-gold hover:text-gold/80 transition-colors inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold mr-3"
                      title="Edit Product"
                    >
                      <Edit3 size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-400 hover:text-red-500 transition-colors inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold"
                      title="Delete Product"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl border border-ink/15 bg-surface p-4 sm:p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <h2 className="font-serif text-2xl font-light">
                {editingProduct ? "Edit Product" : "Add New Product"}
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
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vintage Arch Tee"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Collection *</label>
                  <select
                    value={
                      collection === "Minimal" ||
                      collection === "Artistic" ||
                      collection === "Streetwear" ||
                      collection === "Typography" ||
                      collection === "Nature" ||
                      collection === "Limited Drops"
                        ? collection
                        : "Custom"
                    }
                    onChange={(e) => {
                      if (e.target.value === "Custom") {
                        setCollection("");
                      } else {
                        setCollection(e.target.value);
                      }
                    }}
                    className="w-full border border-ink/15 bg-bg px-3 py-2 text-sm outline-none focus:border-gold"
                  >
                    <option value="Minimal">Minimal</option>
                    <option value="Artistic">Artistic</option>
                    <option value="Streetwear">Streetwear</option>
                    <option value="Typography">Typography</option>
                    <option value="Nature">Nature</option>
                    <option value="Limited Drops">Limited Drops</option>
                    <option value="Custom">Custom / Add New...</option>
                  </select>
                  {!(
                    collection === "Minimal" ||
                    collection === "Artistic" ||
                    collection === "Streetwear" ||
                    collection === "Typography" ||
                    collection === "Nature" ||
                    collection === "Limited Drops"
                  ) && (
                    <input
                      type="text"
                      required
                      value={collection}
                      onChange={(e) => setCollection(e.target.value)}
                      placeholder="Type custom collection name..."
                      className="mt-2 w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold animate-fadeIn"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1999"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Original Price (₹ - Optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 2999"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Fabric *</label>
                  <input
                    type="text"
                    required
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. Premium Combed Cotton"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">GSM Weight *</label>
                  <input
                    type="number"
                    required
                    value={gsm}
                    onChange={(e) => setGsm(e.target.value)}
                    placeholder="e.g. 240"
                    className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product drape, fit, printing method..."
                  className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold resize-none"
                />
              </div>

              {/* Colors Manager */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">Colors Catalogue *</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {colors.map((c, i) => (
                    <span key={i} className="flex items-center gap-1.5 border border-ink/10 bg-bg px-2.5 py-1 text-xs text-muted">
                      <span className="h-3 w-3 rounded-full border border-ink/20" style={{ backgroundColor: c.hex }} />
                      {c.name}
                      <button type="button" onClick={() => handleRemoveColor(i)} className="ml-1 text-red-400 hover:text-red-300">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Color Name (e.g. Sage)"
                    className="flex-1 border border-ink/15 bg-transparent px-3 py-1.5 text-xs outline-none focus:border-gold"
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="h-8 w-12 border border-ink/15 bg-transparent p-0.5 outline-none cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="border border-gold px-3 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-[#0c0a06] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Sizes Available *</label>
                <div className="flex gap-2">
                  {availableSizes.map((s) => {
                    const active = sizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleToggleSize(s)}
                        className={`h-9 w-11 border text-xs transition-colors ${
                          active
                            ? "border-gold bg-gold text-[#090909]"
                            : "border-ink/15 text-muted hover:border-gold hover:text-gold"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Product Main Image *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={image.startsWith("data:") ? "Image selected successfully" : image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Paste Image URL..."
                      className="flex-1 border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold text-ellipsis overflow-hidden"
                    />
                    <label className="border border-gold px-3 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-[#0c0a06] transition-colors cursor-pointer flex items-center justify-center select-none">
                      Browse
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {image.startsWith("data:") && (
                    <div className="mt-1.5 relative h-16 w-14 border border-ink/10 bg-surface overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Total Aggregate Stock (Auto-calculated)</label>
                    <input
                      type="number"
                      disabled
                      value={
                        colors.reduce((sum, c) => {
                          return sum + sizes.reduce((subSum, s) => {
                            const key = `${c.name}-${s}`;
                            return subSum + (variantStockMap[key] !== undefined ? Number(variantStockMap[key]) : 50);
                          }, 0);
                        }, 0)
                      }
                      className="w-full border border-ink/10 bg-ink/5 px-3 py-2 text-sm outline-none cursor-not-allowed text-gold font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Tag (e.g. New, Bestseller)</label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="e.g. New"
                      className="w-full border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Variant-Level Stock Inventory Manager */}
                <div className="border border-ink/10 bg-surface/50 p-4 rounded-md space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold">
                    Variant-Level Stock (Size & Color combinations)
                  </h4>
                  <p className="text-[10px] text-muted leading-relaxed">
                    Specify stock limits for each item combination. Blank variants default to 50.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 max-h-56 overflow-y-auto pr-1">
                    {colors.flatMap((c) =>
                      sizes.map((s) => {
                        const key = `${c.name}-${s}`;
                        const val = variantStockMap[key] !== undefined ? variantStockMap[key] : 50;
                        return (
                          <div key={key} className="flex items-center justify-between gap-3 border border-ink/5 bg-bg p-2 rounded-sm">
                            <span className="text-xs font-medium text-ink flex items-center gap-1.5 truncate">
                              <span className="h-2.5 w-2.5 rounded-full border border-ink/20 shrink-0" style={{ backgroundColor: c.hex }} />
                              {c.name} - {s}
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={val}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const numeric = raw === "" ? 0 : Math.max(0, parseInt(raw) || 0);
                                setVariantStockMap((prev) => ({
                                  ...prev,
                                  [key]: numeric,
                                }));
                              }}
                              className="w-20 border border-ink/15 bg-transparent px-2 py-1 text-xs text-right outline-none focus:border-gold text-ink"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Field */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Additional Gallery Images</label>
                
                {galleryList.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mb-3 border border-ink/10 bg-bg p-3">
                    {galleryList.map((url, i) => (
                      <div key={i} className="relative h-16 w-14 border border-ink/15 bg-surface overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Gallery item" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(i)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Upload files from your device gallery..."
                    disabled
                    className="flex-1 border border-ink/15 bg-transparent px-3 py-2 text-sm outline-none text-muted select-none"
                  />
                  <label className="border border-gold px-4 py-2 text-xs uppercase tracking-wider text-gold hover:bg-gold hover:text-[#0c0a06] transition-colors cursor-pointer flex items-center justify-center select-none">
                    Upload Files
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
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
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collections Manager Modal */}
      {showCollectionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-md border border-ink/15 bg-surface p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <h2 className="font-serif text-2xl font-light">Manage Collections</h2>
              <button onClick={() => setShowCollectionsModal(false)} className="text-muted hover:text-ink">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-[11px] text-muted mt-3 leading-relaxed">
              Below are all active collections found in your catalogue. Deleting a collection will reset all its assigned products back to <strong>"Minimal"</strong>.
            </p>

            <div className="mt-6 space-y-2 max-h-64 overflow-y-auto pr-1">
              {Array.from(new Set(productsList.map((p) => p.collection).filter(Boolean))).map((colName) => {
                const prodCount = productsList.filter((p) => p.collection === colName).length;
                return (
                  <div key={colName} className="flex items-center justify-between border border-ink/5 bg-card/45 p-3 rounded-sm">
                    <div>
                      <p className="text-sm font-medium text-ink">{colName}</p>
                      <p className="text-[10px] text-muted">{prodCount} products</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm(`Are you sure you want to delete the collection "${colName}"? The ${prodCount} products in it will be reset to "Minimal".`)) return;
                        try {
                          const res = await fetch(`/api/admin/collections/${encodeURIComponent(colName)}`, { method: "DELETE" });
                          if (!res.ok) throw new Error("Failed to delete collection");
                          alert(`Collection "${colName}" has been deleted.`);
                          fetchProducts(); // Refresh listings
                        } catch (err: any) {
                          alert(err.message || "An error occurred.");
                        }
                      }}
                      className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete Collection"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
