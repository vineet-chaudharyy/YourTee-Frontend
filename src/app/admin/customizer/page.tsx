"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AdminCustomizerSettings() {
  const [basePrice, setBasePrice] = useState("1499");
  const [textPrice, setTextPrice] = useState("200");
  const [imagePrice, setImagePrice] = useState("500");
  const [graphicPrice, setGraphicPrice] = useState("150");
  const [designPrice, setDesignPrice] = useState("200");
  const [embroiderySurcharge, setEmbroiderySurcharge] = useState("350");
  const [puffSurcharge, setPuffSurcharge] = useState("250");
  const [heavyCottonPrice, setHeavyCottonPrice] = useState("0");
  const [oversizedBoxyPrice, setOversizedBoxyPrice] = useState("400");
  const [supimaLuxuryPrice, setSupimaLuxuryPrice] = useState("800");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/customizer-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setBasePrice(String(data.settings.basePrice));
          setTextPrice(String(data.settings.textPrice));
          setImagePrice(String(data.settings.imagePrice));
          setGraphicPrice(String(data.settings.graphicPrice));
          setDesignPrice(String(data.settings.designPrice));
          setEmbroiderySurcharge(String(data.settings.embroiderySurcharge));
          setPuffSurcharge(String(data.settings.puffSurcharge));
          setHeavyCottonPrice(String(data.settings.heavyCottonPrice));
          setOversizedBoxyPrice(String(data.settings.oversizedBoxyPrice));
          setSupimaLuxuryPrice(String(data.settings.supimaLuxuryPrice));
        }
      })
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/customizer-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePrice: Number(basePrice),
          textPrice: Number(textPrice),
          imagePrice: Number(imagePrice),
          graphicPrice: Number(graphicPrice),
          designPrice: Number(designPrice),
          embroiderySurcharge: Number(embroiderySurcharge),
          puffSurcharge: Number(puffSurcharge),
          heavyCottonPrice: Number(heavyCottonPrice),
          oversizedBoxyPrice: Number(oversizedBoxyPrice),
          supimaLuxuryPrice: Number(supimaLuxuryPrice),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update customizer settings.");
      }

      setMessage("Customizer pricing settings updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="eyebrow">Studio Controls</p>
      <h1 className="mt-2 font-serif text-4xl font-light">Customizer Pricing</h1>
      <p className="mt-2 text-sm text-muted">
        Configure the base garment prices and active surcharges applied dynamically during t-shirt customization.
      </p>

      {message && (
        <div className="mt-6 border border-gold/30 bg-gold/5 px-4 py-3 text-xs uppercase tracking-wider text-gold">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs uppercase tracking-wider text-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="rounded-xl border border-ink/10 bg-card p-6 space-y-5">
          <h3 className="font-serif text-lg text-ink font-light border-b border-ink/5 pb-3">Garment Base Pricing</h3>
          
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Base T-Shirt Price (₹)</label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="mt-2 w-full border border-ink/15 bg-surface px-4 py-3 text-xs outline-none focus:border-gold rounded font-mono"
              required
              min="0"
            />
            <p className="mt-1.5 text-[9px] text-muted">Baseline cost of a standard blank custom t-shirt before overlays or surcharges are added.</p>
          </div>
        </div>

        <div className="rounded-xl border border-ink/10 bg-card p-6 space-y-5">
          <h3 className="font-serif text-lg text-ink font-light border-b border-ink/5 pb-3">Element Placement Cost (₹)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Text Add-On Cost (₹)</label>
              <input
                type="number"
                value={textPrice}
                onChange={(e) => setTextPrice(e.target.value)}
                className="mt-2 w-full border border-ink/15 bg-surface px-4 py-3 text-xs outline-none focus:border-gold rounded font-mono"
                required
                min="0"
              />
              <p className="mt-1.5 text-[9px] text-muted">Price added per custom text layer placed by user.</p>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Image Upload Cost (₹)</label>
              <input
                type="number"
                value={imagePrice}
                onChange={(e) => setImagePrice(e.target.value)}
                className="mt-2 w-full border border-ink/15 bg-surface px-4 py-3 text-xs outline-none focus:border-gold rounded font-mono"
                required
                min="0"
              />
              <p className="mt-1.5 text-[9px] text-muted">Price added per custom uploaded picture/artwork layer.</p>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Graphic Vector Cost (₹)</label>
              <input
                type="number"
                value={graphicPrice}
                onChange={(e) => setGraphicPrice(e.target.value)}
                className="mt-2 w-full border border-ink/15 bg-surface px-4 py-3 text-xs outline-none focus:border-gold rounded font-mono"
                required
                min="0"
              />
              <p className="mt-1.5 text-[9px] text-muted">Price added per custom selected graphic icon layer.</p>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted font-semibold block">In-House Design Cost (₹)</label>
              <input
                type="number"
                value={designPrice}
                onChange={(e) => setDesignPrice(e.target.value)}
                className="mt-2 w-full border border-ink/15 bg-surface px-4 py-3 text-xs outline-none focus:border-gold rounded font-mono"
                required
                min="0"
              />
              <p className="mt-1.5 text-[9px] text-muted">Price added per dynamic pre-designed template selection.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-ink/10 bg-card p-6 space-y-5">
          <h3 className="font-serif text-lg text-ink font-light border-b border-ink/5 pb-3">Fabric Specification Surcharges (₹)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Heavy Cotton (₹)</label>
              <input
                type="number"
                value={heavyCottonPrice}
                onChange={(e) => setHeavyCottonPrice(e.target.value)}
                className="mt-2 w-full border border-ink/15 bg-surface px-4 py-3 text-xs outline-none focus:border-gold rounded font-mono"
                required
                min="0"
              />
              <p className="mt-1.5 text-[9px] text-muted">Surcharge applied for Heavy Cotton (240 GSM) specification.</p>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Oversized Boxy (₹)</label>
              <input
                type="number"
                value={oversizedBoxyPrice}
                onChange={(e) => setOversizedBoxyPrice(e.target.value)}
                className="mt-2 w-full border border-ink/15 bg-surface px-4 py-3 text-xs outline-none focus:border-gold rounded font-mono"
                required
                min="0"
              />
              <p className="mt-1.5 text-[9px] text-muted">Surcharge applied for Oversized Boxy (280 GSM) specification.</p>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Supima Luxury (₹)</label>
              <input
                type="number"
                value={supimaLuxuryPrice}
                onChange={(e) => setSupimaLuxuryPrice(e.target.value)}
                className="mt-2 w-full border border-ink/15 bg-surface px-4 py-3 text-xs outline-none focus:border-gold rounded font-mono"
                required
                min="0"
              />
              <p className="mt-1.5 text-[9px] text-muted">Surcharge applied for Supima Luxury (200 GSM) specification.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-ink/10 bg-card p-6 space-y-5">
          <h3 className="font-serif text-lg text-ink font-light border-b border-ink/5 pb-3">Special Print Styles Premium (₹)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Embroidery Surcharge (₹)</label>
              <input
                type="number"
                value={embroiderySurcharge}
                onChange={(e) => setEmbroiderySurcharge(e.target.value)}
                className="mt-2 w-full border border-ink/15 bg-surface px-4 py-3 text-xs outline-none focus:border-gold rounded font-mono"
                required
                min="0"
              />
              <p className="mt-1.5 text-[9px] text-muted">Premium premium surcharge applied when buyer selects Embroidery.</p>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted font-semibold block">Puff Print Surcharge (₹)</label>
              <input
                type="number"
                value={puffSurcharge}
                onChange={(e) => setPuffSurcharge(e.target.value)}
                className="mt-2 w-full border border-ink/15 bg-surface px-4 py-3 text-xs outline-none focus:border-gold rounded font-mono"
                required
                min="0"
              />
              <p className="mt-1.5 text-[9px] text-muted">Premium surcharge applied when buyer selects Puff Printing.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-gold min-w-[180px] flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
