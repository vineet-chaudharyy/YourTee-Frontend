"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Type,
  Shapes,
  Images,
  Layers as LayersIcon,
  Sparkles,
  Undo2,
  Redo2,
  Trash2,
  RotateCw,
  Check,
  Download,
  Save,
  Eye,
  Copy,
  FlipHorizontal2,
  MoveUp,
  MoveDown,
  AlignCenter,
  Loader2,
} from "lucide-react";
import { useCart } from "@/lib/store";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatPrice, cn } from "@/lib/utils";

type LayerType = "text" | "image" | "graphic" | "design";
type Side = "front" | "back" | "left" | "right";

type Layer = {
  id: string;
  type: LayerType;
  content: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  color: string;
  font: string;
  side: Side;
  flipX?: boolean;
  curvature?: number; // Optional arc rotation value between -180 and 180 degrees
  bold?: boolean;
  italic?: boolean;
  letterSpacing?: number;
  uppercase?: boolean;
};

const SHIRT_COLORS = [
  { name: "White", hex: "#ffffff" },
  { name: "Black", hex: "#101010" },
  { name: "Beige", hex: "#ece7dd" },
  { name: "Navy", hex: "#1c2a38" },
  { name: "Brown", hex: "#5c4033" },
  { name: "Grey", hex: "#808080" },
];

const FONTS = [
  { label: "Playfair", value: "var(--font-playfair), serif" },
  { label: "Inter", value: "var(--font-inter), sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier", value: "'Courier New', monospace" },
  { label: "Impact", value: "Impact, sans-serif" },
];

const GRAPHICS = ["★", "✦", "♦", "✕", "❋", "☼", "➤", "⚡"];

const AI_EXAMPLES = [
  "roaring tiger, ink art",
  "vintage rose, line art",
  "astronaut skull",
  "japanese wave, gold",
];

// Curated in-house design gallery. Each is a recolorable vector using
// `currentColor`, so it inherits the layer color and reads on any shirt.
const DESIGNS: { id: string; name: string; svg: string }[] = [
  {
    id: "bolt",
    name: "Bolt",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M56 4 L18 56 L44 56 L36 96 L82 40 L54 40 Z"/></svg>`,
  },
  {
    id: "star",
    name: "Star",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M50 5 L61 38 L96 38 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 L39 38 Z"/></svg>`,
  },
  {
    id: "sparkle",
    name: "Sparkle",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M50 4 C53 34 66 47 96 50 C66 53 53 66 50 96 C47 66 34 53 4 50 C34 47 47 34 50 4 Z"/></svg>`,
  },
  {
    id: "crown",
    name: "Crown",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 78 L12 34 L34 54 L50 24 L66 54 L88 34 L88 78 Z"/><rect x="12" y="82" width="76" height="10"/></svg>`,
  },
  {
    id: "gem",
    name: "Gem",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M28 20 H72 L92 42 L50 92 L8 42 Z"/><path d="M8 42 H92 M36 20 L28 42 L50 92 M64 20 L72 42 L50 92"/></svg>`,
  },
  {
    id: "eye",
    name: "Eye",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6 50 Q50 14 94 50 Q50 86 6 50 Z"/><circle cx="50" cy="50" r="13" fill="currentColor" stroke="none"/></svg>`,
  },
  {
    id: "mountain",
    name: "Peak",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="72" cy="30" r="12"/><path d="M6 86 L36 34 L52 62 L64 44 L94 86 Z"/></svg>`,
  },
  {
    id: "heart",
    name: "Heart",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M50 88 C6 58 10 22 34 22 C44 22 50 32 50 40 C50 32 56 22 66 22 C90 22 94 58 50 88 Z"/></svg>`,
  },
  {
    id: "sun",
    name: "Sun",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="18" fill="currentColor" stroke="none"/><path d="M50 8 V22 M50 78 V92 M8 50 H22 M78 50 H92 M20 20 L30 30 M70 70 L80 80 M80 20 L70 30 M30 70 L20 80"/></svg>`,
  },
  {
    id: "anchor",
    name: "Anchor",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="16" r="7"/><path d="M50 23 V86 M30 44 H70 M18 60 Q22 86 50 88 Q78 86 82 60"/></svg>`,
  },
  {
    id: "flame",
    name: "Flame",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M50 6 C58 30 78 38 74 62 C72 82 58 92 50 92 C40 92 26 82 26 62 C26 48 38 46 40 34 C48 42 44 22 50 6 Z"/></svg>`,
  },
  {
    id: "wave",
    name: "Wave",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg"><path d="M6 40 Q28 14 50 40 T94 40"/><path d="M6 60 Q28 34 50 60 T94 60"/><path d="M6 80 Q28 54 50 80 T94 80"/></svg>`,
  },
];

const FABRICS = [
  { name: "Heavy Cotton", weight: "240 GSM", price: 0 },
  { name: "Oversized Boxy", weight: "280 GSM", price: 400 },
  { name: "Supima Luxury", weight: "200 GSM", price: 800 },
];

const uid = () => Math.random().toString(36).slice(2, 9);

const TOOLS = [
  { id: "upload", icon: Upload, label: "Upload" },
  { id: "text", icon: Type, label: "Text" },
  { id: "gallery", icon: Images, label: "Gallery" },
  { id: "graphic", icon: Shapes, label: "Graphics" },
  { id: "ai", icon: Sparkles, label: "AI Design" },
  { id: "layers", icon: LayersIcon, label: "Layers" },
] as const;

export default function CustomizePage() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [history, setHistory] = useState<Layer[][]>([[]]);
  const [hIndex, setHIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [side, setSide] = useState<Side>("front");
  const [shirt, setShirt] = useState(SHIRT_COLORS[0]);
  const [fabric, setFabric] = useState(FABRICS[1]);
  const [qty, setQty] = useState(1);
  const [tool, setTool] = useState<string>("text");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState("");
  
  // Advanced features state declarations
  const [printStyle, setPrintStyle] = useState<"dtg" | "embroidery" | "puff">("dtg");
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  // 360 drag rotation states
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartAngle, setDragStartAngle] = useState(0);

  // User design description state
  const [customDescription, setCustomDescription] = useState("");

  // Keyboard listeners for fine-tuning layer positioning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        return;
      }

      if (!selected) return;

      const layer = layers.find((l) => l.id === selected && l.side === side);
      if (!layer) return;

      const step = e.shiftKey ? 5 : 1;
      let newX = layer.x;
      let newY = layer.y;
      let newRotation = layer.rotation;
      let newScale = layer.scale;
      let updated = false;

      if (e.key === "ArrowLeft") {
        newX -= step;
        updated = true;
      } else if (e.key === "ArrowRight") {
        newX += step;
        updated = true;
      } else if (e.key === "ArrowUp") {
        newY -= step;
        updated = true;
      } else if (e.key === "ArrowDown") {
        newY += step;
        updated = true;
      } else if (e.key === "+" || e.key === "=") {
        newScale = Math.min(3, layer.scale + 0.05);
        updated = true;
      } else if (e.key === "-" || e.key === "_") {
        newScale = Math.max(0.3, layer.scale - 0.05);
        updated = true;
      } else if (e.key === "[" || e.key === "{") {
        newRotation = Math.max(-180, layer.rotation - 2);
        updated = true;
      } else if (e.key === "]" || e.key === "}") {
        newRotation = Math.min(180, layer.rotation + 2);
        updated = true;
      }

      if (updated) {
        e.preventDefault();
        updateLayer(selected, { x: newX, y: newY, rotation: newRotation, scale: newScale });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, layers, side]);

  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const shirtRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (printRef.current?.contains(target) || target.closest(".cursor-grab")) {
      return;
    }
    setIsRotating(true);
    setDragStartX(e.clientX);
    setDragStartAngle(rotationAngle);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isRotating) {
      const dx = e.clientX - dragStartX;
      const newAngle = dragStartAngle + dx * 0.8;
      setRotationAngle(newAngle);

      const norm = ((newAngle % 360) + 360) % 360;
      let targetSide: Side = "front";
      if (norm >= 90 && norm < 270) targetSide = "back";
      else targetSide = "front";

      if (side !== targetSide) {
        setSide(targetSide);
        setSelected(null);
      }
    } else {
      if (!shirtRef.current) return;
      const rect = shirtRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePos({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (isRotating) {
      setIsRotating(false);
      const snapAngle = Math.round(rotationAngle / 180) * 180;
      setRotationAngle(snapAngle);

      const norm = ((snapAngle % 360) + 360) % 360;
      let targetSide: Side = "front";
      if (norm === 180) targetSide = "back";
      else targetSide = "front";
      setSide(targetSide);
    }
  };

  const sideLayers = layers.filter((l) => l.side === side);
  const sel = layers.find((l) => l.id === selected) ?? null;

  // ---- history ----
  const commit = useCallback(
    (next: Layer[]) => {
      setLayers(next);
      setHistory((h) => {
        const trimmed = h.slice(0, hIndex + 1);
        const newH = [...trimmed, next].slice(-50);
        setHIndex(newH.length - 1);
        return newH;
      });
    },
    [hIndex]
  );

  const undo = () => {
    if (hIndex > 0) {
      const i = hIndex - 1;
      setHIndex(i);
      setLayers(history[i]);
      setSelected(null);
    }
  };
  const redo = () => {
    if (hIndex < history.length - 1) {
      const i = hIndex + 1;
      setHIndex(i);
      setLayers(history[i]);
    }
  };

  // ---- layer ops ----
  const addLayer = (partial: Partial<Layer> & { type: LayerType; content: string }) => {
    const layer: Layer = {
      id: uid(),
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      color: shirt.hex === "#101010" ? "#ece7dd" : "#101010",
      font: FONTS[0].value,
      side,
      curvature: 0,
      ...partial,
    };
    commit([...layers, layer]);
    setSelected(layer.id);
  };

  const updateLayer = (id: string, patch: Partial<Layer>, record = true) => {
    const next = layers.map((l) => (l.id === id ? { ...l, ...patch } : l));
    if (record) commit(next);
    else setLayers(next);
  };

  const removeLayer = (id: string) => {
    commit(layers.filter((l) => l.id !== id));
    if (selected === id) setSelected(null);
  };

  const duplicateLayer = (id: string) => {
    const l = layers.find((x) => x.id === id);
    if (!l) return;
    const copy = { ...l, id: uid(), x: l.x + 16, y: l.y + 16 };
    commit([...layers, copy]);
    setSelected(copy.id);
  };

  const flipLayer = (id: string) => {
    const l = layers.find((x) => x.id === id);
    if (l) updateLayer(id, { flipX: !l.flipX });
  };

  const reorderLayer = (id: string, dir: "up" | "down") => {
    const idx = layers.findIndex((x) => x.id === id);
    if (idx < 0) return;
    const target = dir === "up" ? idx + 1 : idx - 1;
    if (target < 0 || target >= layers.length) return;
    const next = [...layers];
    [next[idx], next[target]] = [next[target], next[idx]];
    commit(next);
  };

  const centerLayer = (id: string) => updateLayer(id, { x: 0, y: 0 });

  const removeImageBackground = async (layerId: string, base64Src: string) => {
    setIsRemovingBg(true);
    showToast("AI analyzing layout for transparency...");
    
    await new Promise((r) => setTimeout(r, 1200));

    try {
      const img = new Image();
      img.src = base64Src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsRemovingBg(false);
          showToast("Chroma extraction failed");
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample the four corner pixels and take average background reference color
        const corners = [
          [0, 1, 2], // Top-Left
          [(canvas.width - 1) * 4, (canvas.width - 1) * 4 + 1, (canvas.width - 1) * 4 + 2], // Top-Right
          [data.length - 4, data.length - 3, data.length - 2] // Bottom-Right
        ];
        
        const rRef = Math.round(corners.reduce((sum, c) => sum + data[c[0]], 0) / corners.length);
        const gRef = Math.round(corners.reduce((sum, c) => sum + data[c[1]], 0) / corners.length);
        const bRef = Math.round(corners.reduce((sum, c) => sum + data[c[2]], 0) / corners.length);

        // Threshold tolerance
        const tolerance = 60;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const dist = Math.sqrt(
            Math.pow(r - rRef, 2) +
            Math.pow(g - gRef, 2) +
            Math.pow(b - bRef, 2)
          );

          if (dist < tolerance) {
            data[i + 3] = 0; // make transparent
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const result = canvas.toDataURL("image/png");
        updateLayer(layerId, { content: result });
        setIsRemovingBg(false);
        showToast("Background removed successfully");
      };
      img.onerror = () => {
        setIsRemovingBg(false);
        showToast("Error loading source asset");
      };
    } catch (err) {
      console.error(err);
      setIsRemovingBg(false);
      showToast("Background removal error");
    }
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => addLayer({ type: "image", content: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const runAI = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt || aiLoading) return;
    setAiLoading(true);
    showToast("Generating your design…");

    // Real text-to-image via Pollinations (free, no API key).
    // Style hints steer it toward clean, printable t-shirt artwork.
    const styled = `${prompt}, bold t-shirt graphic, high detail, centered composition, isolated subject, clean plain background, vector sticker art`;
    const seed = Math.floor(Math.random() * 1_000_000);
    const url =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(styled)}` +
      `?width=768&height=768&nologo=true&model=flux&seed=${seed}`;

    try {
      // Fetch and inline as a data URL so the layer survives save/export.
      const res = await fetch(url);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const blob = await res.blob();
      const dataUrl: string = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
      });
      addLayer({ type: "image", content: dataUrl });
      setAiPrompt("");
      showToast("AI design added to your shirt");
    } catch {
      // Fallback: let the <img> load the remote URL directly.
      try {
        addLayer({ type: "image", content: url });
        setAiPrompt("");
        showToast("AI design added");
      } catch {
        showToast("Generation failed — please try again");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  // ---- price ----
  const textCount = layers.filter((l) => l.type === "text").length;
  const imgCount = layers.filter((l) => l.type === "image").length;
  const graphicCount = layers.filter((l) => l.type === "graphic").length;
  const designCount = layers.filter((l) => l.type === "design").length;
  const styleSurcharge = printStyle === "embroidery" ? 350 : printStyle === "puff" ? 250 : 0;
  const unit =
    1499 +
    fabric.price +
    textCount * 200 +
    imgCount * 500 +
    graphicCount * 150 +
    designCount * 200 +
    styleSurcharge;
  const total = unit * qty;

  const addToCart = useCart((s) => s.addItem);
  const handleAddToCart = async () => {
    if (!layers.length) {
      showToast("Add a design first");
      return;
    }

    let previewUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80";

    if (shirtRef.current) {
      try {
        // Deselect layer to hide dashed border lines in the preview
        setSelected(null);
        setIsCapturing(true);
        
        // Wait for React re-render and browser paint cycle to display flat unrotated t-shirt
        await new Promise((resolve) => setTimeout(resolve, 120));

        const canvas = await html2canvas(shirtRef.current, {
          backgroundColor: null,
          logging: false,
          useCORS: true,
          scale: 3,
        });
        previewUrl = canvas.toDataURL("image/png");

        setIsCapturing(false);
      } catch (err) {
        console.error("Failed to generate design preview:", err);
        setIsCapturing(false);
      }
    }

    addToCart({
      key: `custom-${uid()}`,
      productId: "custom",
      name: `Custom Tee (${printStyle === "dtg" ? "Classic" : printStyle === "embroidery" ? "Embroidery" : "Puff Print"}) — ${shirt.name}`,
      price: unit,
      image: previewUrl,
      color: shirt.name,
      size: "M",
      quantity: qty,
      custom: true,
      description: customDescription.trim() || null,
    });
    showToast("Custom design added to bag");
  };

  const [saving, setSaving] = useState(false);
  const saveDesign = async () => {
    if (!layers.length) {
      showToast("Add a design first");
      return;
    }

    setSaving(true);
    let previewUrl = null;

    if (shirtRef.current) {
      try {
        setSelected(null);
        setIsCapturing(true);
        await new Promise((resolve) => setTimeout(resolve, 120));

        const canvas = await html2canvas(shirtRef.current, {
          backgroundColor: null,
          logging: false,
          useCORS: true,
          scale: 3,
        });
        previewUrl = canvas.toDataURL("image/png");

        setIsCapturing(false);
      } catch (err) {
        console.error("Failed to generate design preview:", err);
        setIsCapturing(false);
      }
    }

    const payload = {
      name: `Custom ${shirt.name} Tee`,
      garment: "Custom Tee",
      color: shirt.name,
      fabric: fabric.name,
      price: unit,
      layers,
      preview: previewUrl,
    };

    if (user) {
      try {
        const res = await fetch("/api/designs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) showToast("Design saved to your account");
        else showToast("Couldn't save — please try again");
      } catch {
        showToast("Couldn't save — please try again");
      } finally {
        setSaving(false);
      }
    } else {
      localStorage.setItem(
        "yourtee-design",
        JSON.stringify({ layers, shirt, fabric, preview: previewUrl })
      );
      showToast("Saved on this device — sign in to save to your account");
      setSaving(false);
    }
  };

  const downloadPreview = async () => {
    if (shirtRef.current) {
      showToast("Generating preview...");
      try {
        setSelected(null);
        setIsCapturing(true);
        await new Promise((resolve) => setTimeout(resolve, 120));

        const canvas = await html2canvas(shirtRef.current, {
          backgroundColor: null,
          useCORS: true,
          scale: 3,
        });
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `YourTee-Custom-${shirt.name}.png`;
        a.click();
        showToast("Preview downloaded");

        setIsCapturing(false);
      } catch (err) {
        console.error("Failed to download preview:", err);
        showToast("Failed to export preview");
        setIsCapturing(false);
      }
    }
  };

  return (
    <div className="min-h-screen pt-28 bg-gradient-to-b from-surface via-bg to-bg relative">
      {/* Blueprint grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      <div className="container-luxe pb-6 relative z-10">
        <p className="eyebrow font-medium tracking-widest text-gold">Designer Atelier</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mt-2 font-serif text-4xl font-light tracking-wide">T-Shirt Studio</h1>
            <p className="mt-1.5 text-xs text-muted">
              Design a bespoke heavyweight silhouette. Every element is crafted to your specifications.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={hIndex === 0}
              className="grid h-10 w-10 place-items-center border border-ink/15 disabled:opacity-30 enabled:hover:border-gold rounded-md transition-colors bg-surface/20"
              aria-label="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              disabled={hIndex === history.length - 1}
              className="grid h-10 w-10 place-items-center border border-ink/15 disabled:opacity-30 enabled:hover:border-gold rounded-md transition-colors bg-surface/20"
              aria-label="Redo"
            >
              <Redo2 size={16} />
            </button>
            <button
              onClick={saveDesign}
              disabled={saving}
              className="flex h-10 items-center gap-2 border border-ink/15 px-4 text-xs uppercase tracking-wider hover:border-gold disabled:opacity-60 rounded-md transition-colors bg-surface/20"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </div>
      </div>

      {/* Split Screen Grid Layout */}
      <div className="container-luxe grid gap-10 pb-20 lg:grid-cols-[1.15fr_0.85fr] items-start relative z-10">
        
        {/* LEFT COLUMN: 360° Live Interactive Preview Viewport */}
        <div className="flex flex-col items-center lg:sticky lg:top-32">
          <div className="relative w-full flex flex-col items-center rounded-xl border border-ink/10 bg-card/65 backdrop-blur-md p-8 min-h-[520px] justify-center overflow-hidden">
            {/* 360° View Toggles */}
            <div className="absolute top-6 flex items-center gap-1 rounded-full border border-ink/10 p-1 bg-[#0c0a06]/90 backdrop-blur-sm z-20">
              {(["front", "back"] as Side[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSide(s);
                    setSelected(null);
                    if (s === "front") setRotationAngle(0);
                    if (s === "back") setRotationAngle(180);
                  }}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all",
                    side === s ? "bg-gold text-[#0c0a06]" : "text-muted hover:text-ink"
                  )}
                >
                  {s} View
                </button>
              ))}
            </div>

            {/* shirt viewport container with 3D tilt tracking & 360° rotation */}
            <div
              ref={shirtRef}
              className={cn(
                "relative my-6 select-none overflow-hidden rounded-2xl p-6",
                isRotating ? "cursor-grabbing" : "cursor-grab"
              )}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                setMousePos({ x: 0, y: 0 });
                handleMouseUp();
              }}
              onClick={() => setSelected(null)}
              style={{
                transform: isCapturing
                  ? "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
                  : isHovered
                  ? `perspective(1000px) rotateX(${mousePos.y * -10}deg) rotateY(${rotationAngle + mousePos.x * 10}deg) scale3d(1.02, 1.02, 1.02)`
                  : `perspective(1000px) rotateX(0deg) rotateY(${rotationAngle}deg) scale3d(1, 1, 1)`,
                transition: isRotating || isCapturing ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <ShirtMock color={shirt.hex} side={side} />
              
              {/* Dynamic glare shine overlay */}
              {isHovered && (
                <div
                  className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${((mousePos.x + 1) / 2) * 100}% ${((mousePos.y + 1) / 2) * 100}%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 65%)`,
                  }}
                />
              )}

              {/* print area */}
              <div
                ref={printRef}
                className="absolute left-1/2 top-[26%] h-[46%] w-[44%] -translate-x-1/2 overflow-visible"
              >
                {sideLayers.map((l) => {
                  const isCurved = l.type === "text" && l.curvature && l.curvature !== 0;
                  const arcTotal = l.curvature ?? 0;
                  const chars = l.content.split("");
                  const radius = 120 * (180 / Math.max(15, Math.abs(arcTotal)));
                  
                  const styleFilter =
                    printStyle === "embroidery"
                      ? "drop-shadow(0.6px 0.6px 0.2px rgba(0,0,0,0.5)) drop-shadow(-0.3px -0.3px 0.2px rgba(255,255,255,0.15)) contrast(1.1)"
                      : printStyle === "puff"
                      ? "drop-shadow(2px 2px 0px rgba(0,0,0,0.25)) drop-shadow(-0.5px -0.5px 0.2px rgba(255,255,255,0.05))"
                      : undefined;

                  return (
                    <motion.div
                      key={l.id}
                      drag
                      dragConstraints={printRef}
                      dragMomentum={false}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setSelected(l.id);
                      }}
                      onDragEnd={(_, info) =>
                        updateLayer(l.id, {
                          x: l.x + info.offset.x,
                          y: l.y + info.offset.y,
                        })
                      }
                      animate={{ x: l.x, y: l.y }}
                      transition={{ duration: 0 }}
                      className="absolute left-1/2 top-1/2"
                    >
                      <div
                        style={{
                          transform: `translate(-50%, -50%) rotate(${l.rotation}deg) scale(${(l.flipX ? -1 : 1) * l.scale}, ${l.scale})`,
                          opacity: l.opacity,
                          filter: styleFilter,
                        }}
                        className={cn(
                          "relative cursor-grab active:cursor-grabbing select-none",
                          selected === l.id && "outline-dashed outline-1 outline-gold"
                        )}
                      >
                        {l.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={l.content}
                            alt="art"
                            draggable={false}
                            className="pointer-events-none w-28 select-none"
                          />
                        ) : l.type === "design" ? (
                          <span
                            className="pointer-events-none block h-24 w-24 select-none [&>svg]:h-full [&>svg]:w-full"
                            style={{ color: l.color }}
                            dangerouslySetInnerHTML={{ __html: l.content }}
                          />
                        ) : isCurved ? (
                          <div
                            className={cn(
                              "pointer-events-none block select-none whitespace-nowrap text-2xl leading-none text-center",
                              l.bold ? "font-bold" : "font-normal"
                            )}
                            style={{
                              height: arcTotal > 0 ? "auto" : `${radius}px`,
                              paddingBottom: arcTotal > 0 ? `${radius}px` : "0px",
                              fontStyle: l.italic ? "italic" : "normal",
                            }}
                          >
                            {chars.map((char, idx) => {
                              const angle =
                                -arcTotal / 2 +
                                (arcTotal / Math.max(1, chars.length - 1)) * idx;
                              const rad = (angle * Math.PI) / 180;
                              const tx = Math.sin(rad) * radius;
                              const ty = (1 - Math.cos(rad)) * radius * (arcTotal > 0 ? 1 : -1);

                              return (
                                <span
                                  key={idx}
                                  className="inline-block transition-transform"
                                  style={{
                                    color: l.color,
                                    fontFamily: l.font,
                                    transform: `translate3d(${tx}px, ${ty}px, 0) rotate(${angle}deg)`,
                                    transformOrigin: "center bottom",
                                    letterSpacing: l.letterSpacing ? `${l.letterSpacing}px` : undefined,
                                  }}
                                >
                                  {char === " " ? "\u00A0" : l.uppercase ? char.toUpperCase() : char}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span
                            className={cn(
                              "pointer-events-none block select-none whitespace-nowrap text-2xl leading-none",
                              l.bold ? "font-bold" : "font-normal"
                            )}
                            style={{
                              color: l.color,
                              fontFamily: l.font,
                              fontStyle: l.italic ? "italic" : "normal",
                              letterSpacing: l.letterSpacing ? `${l.letterSpacing}px` : undefined,
                            }}
                          >
                            {l.uppercase ? l.content.toUpperCase() : l.content}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <p className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted">
              <Eye size={12} className="text-gold" /> Drag elements · click to select
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Configuration Controls */}
        <aside className="space-y-6">
          
          {/* A. Dynamic Design Tool Tabs */}
          <div className="rounded-xl border border-ink/10 bg-card p-5">
            <div className="flex gap-1.5 overflow-x-auto pb-3.5 scrollbar-none border-b border-ink/5">
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[10px] uppercase tracking-widest font-semibold transition-all",
                    tool === t.id
                      ? "bg-gold text-[#0c0a06]"
                      : "text-muted hover:text-ink border border-ink/10"
                  )}
                >
                  <t.icon size={11} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Tool Area Container */}
            <div className="mt-5">
              {tool === "text" && (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Typography</p>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => addLayer({ type: "text", content: "YOUR TEXT" })}
                    className="w-full bg-[#0c0a06] hover:bg-[#0c0a06]/90 border border-gold/40 text-gold py-3 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors"
                  >
                    + Insert Text Layer
                  </motion.button>
                  <p className="text-[10px] leading-relaxed text-muted">
                    Click placed text layers on the shirt to edit font family, curvature, scaling, and stitch color properties.
                  </p>
                </div>
              )}

              {tool === "upload" && (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Artwork Uploader</p>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border border-dashed border-ink/20 hover:border-gold bg-surface/30 backdrop-blur-sm p-7 rounded-lg text-center cursor-pointer transition-colors group"
                  >
                    <Upload className="mx-auto text-muted group-hover:text-gold transition-colors mb-2.5" size={24} />
                    <p className="text-xs font-semibold text-ink">Drag & Drop your artwork</p>
                    <p className="text-[9px] text-muted mt-0.5">PNG / SVG / JPG (Max 10 MB)</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={onUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {tool === "graphic" && (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Vector Accents</p>
                  <div className="grid grid-cols-4 gap-2">
                    {GRAPHICS.map((g) => (
                      <button
                        key={g}
                        onClick={() => addLayer({ type: "graphic", content: g })}
                        className="grid aspect-square place-items-center border border-ink/10 text-xl hover:border-gold hover:text-gold transition-colors rounded-md bg-surface/30"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tool === "gallery" && (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Premium Vector Studio</p>
                  <div className="grid grid-cols-4 gap-2.5">
                    {DESIGNS.map((d) => (
                      <button
                        key={d.id}
                        title={d.name}
                        onClick={() => addLayer({ type: "design", content: d.svg })}
                        className="grid aspect-square place-items-center border border-ink/10 p-2 text-ink transition-colors hover:border-gold hover:text-gold rounded-md bg-surface/30"
                      >
                        <span
                          className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                          dangerouslySetInnerHTML={{ __html: d.svg }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tool === "ai" && (
                <div className="space-y-3.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold flex items-center gap-1">
                    <Sparkles size={11} className="text-gold animate-pulse" /> Generate Preview with AI
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runAI();
                      }}
                      placeholder="e.g. Minimal black anime design..."
                      className="flex-1 bg-surface border border-ink/10 px-3.5 py-2.5 text-xs rounded outline-none focus:border-gold"
                    />
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={runAI}
                      disabled={aiLoading}
                      className="bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black rounded flex items-center gap-1.5"
                    >
                      {aiLoading ? <Loader2 size={13} className="animate-spin" /> : "Generate"}
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setAiPrompt(ex)}
                        className="rounded-full border border-ink/10 bg-surface/20 px-2.5 py-0.5 text-[9px] text-muted hover:border-gold hover:text-gold transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tool === "layers" && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Placed Elements ({sideLayers.length})</p>
                  {sideLayers.length === 0 && (
                    <p className="text-[10px] text-muted">No custom layers on this side view yet.</p>
                  )}
                  {sideLayers.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => setSelected(l.id)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors",
                        selected === l.id
                          ? "border-gold text-gold bg-gold/5"
                          : "border-ink/10 text-muted hover:border-ink/30"
                      )}
                    >
                      <span className="truncate">
                        {l.type === "image"
                          ? "Uploaded Artwork"
                          : l.type === "design"
                          ? "Vector Graphic"
                          : l.content}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLayer(l.id);
                        }}
                        className="text-muted hover:text-gold transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* B. Selected Layer Properties Panel */}
          <div className="rounded-xl border border-ink/10 bg-card p-5">
            <p className="mb-3.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted font-bold">
              Adjust Layer
              {sel && (
                <button onClick={() => removeLayer(sel.id)} className="text-muted hover:text-gold transition-colors">
                  <Trash2 size={13} />
                </button>
              )}
            </p>

            {!sel && (
              <p className="text-[10px] text-muted">
                Select any custom text, design, or logo layer on the shirt to adjust its position and rotation coordinates.
              </p>
            )}

            {sel && (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { icon: Copy, label: "Duplicate", fn: () => duplicateLayer(sel.id) },
                    { icon: FlipHorizontal2, label: "Flip", fn: () => flipLayer(sel.id) },
                    { icon: MoveUp, label: "Forward", fn: () => reorderLayer(sel.id, "up") },
                    { icon: MoveDown, label: "Backward", fn: () => reorderLayer(sel.id, "down") },
                    { icon: AlignCenter, label: "Center", fn: () => centerLayer(sel.id) },
                  ].map((a) => (
                    <button
                      key={a.label}
                      onClick={a.fn}
                      title={a.label}
                      className="grid aspect-square place-items-center rounded-md border border-ink/10 text-muted transition-colors hover:border-gold hover:text-gold bg-surface/30"
                    >
                      <a.icon size={13} />
                    </button>
                  ))}
                </div>

                {sel.type === "text" && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Text Content</label>
                      <input
                        value={sel.content}
                        onChange={(e) => updateLayer(sel.id, { content: e.target.value })}
                        className="mt-1.5 w-full border border-ink/15 bg-surface px-3 py-2.5 text-xs outline-none focus:border-gold rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Font Family</label>
                      <select
                        value={sel.font}
                        onChange={(e) => updateLayer(sel.id, { font: e.target.value })}
                        className="mt-1.5 w-full border border-ink/15 bg-surface px-3 py-2 text-xs outline-none focus:border-gold rounded"
                      >
                        {FONTS.map((f) => (
                          <option key={f.label} value={f.value} className="bg-bg">
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Text Styling Options</label>
                      <div className="flex gap-2 items-center mt-1.5">
                        <button
                          type="button"
                          onClick={() => updateLayer(sel.id, { bold: !sel.bold })}
                          className={cn(
                            "flex-1 border py-2 text-[10px] uppercase tracking-wider transition-colors rounded font-semibold",
                            sel.bold ? "border-gold text-gold bg-gold/5" : "border-ink/10 text-muted hover:border-gold hover:text-gold bg-surface/20"
                          )}
                        >
                          Bold
                        </button>
                        <button
                          type="button"
                          onClick={() => updateLayer(sel.id, { italic: !sel.italic })}
                          className={cn(
                            "flex-1 border py-2 text-[10px] uppercase tracking-wider transition-colors rounded italic",
                            sel.italic ? "border-gold text-gold bg-gold/5" : "border-ink/10 text-muted hover:border-gold hover:text-gold bg-surface/20"
                          )}
                        >
                          Italic
                        </button>
                        <button
                          type="button"
                          onClick={() => updateLayer(sel.id, { uppercase: !sel.uppercase })}
                          className={cn(
                            "flex-1 border py-2 text-[10px] uppercase tracking-wider transition-colors rounded",
                            sel.uppercase ? "border-gold text-gold bg-gold/5" : "border-ink/10 text-muted hover:border-gold hover:text-gold bg-surface/20"
                          )}
                        >
                          ALL CAPS
                        </button>
                      </div>
                    </div>
                    <Slider
                      label="Letter Spacing"
                      min={-4}
                      max={24}
                      step={1}
                      value={sel.letterSpacing ?? 0}
                      onChange={(v) => updateLayer(sel.id, { letterSpacing: v }, false)}
                      onCommit={(v) => updateLayer(sel.id, { letterSpacing: v })}
                    />
                  </div>
                )}

                {sel.type !== "image" && (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Thread Color</label>
                    <input
                      type="color"
                      value={sel.color}
                      onChange={(e) => updateLayer(sel.id, { color: e.target.value })}
                      className="mt-1.5 h-8 w-full cursor-pointer border border-ink/15 bg-surface rounded"
                    />
                  </div>
                )}

                {sel.type === "image" && (
                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={isRemovingBg}
                      onClick={() => removeImageBackground(sel.id, sel.content)}
                      className="flex w-full items-center justify-center gap-2 border border-dashed border-gold/45 bg-gold/5 py-2 text-[10px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition-colors disabled:opacity-50"
                    >
                      {isRemovingBg ? (
                        <>
                          <Loader2 size={12} className="animate-spin" /> Analyzing art...
                        </>
                      ) : (
                        "Remove Image Background"
                      )}
                    </button>
                  </div>
                )}

                {sel.type === "text" && (
                  <Slider
                    label="Arc Curvature"
                    min={-180}
                    max={180}
                    step={5}
                    value={sel.curvature ?? 0}
                    onChange={(v) => updateLayer(sel.id, { curvature: v }, false)}
                    onCommit={(v) => updateLayer(sel.id, { curvature: v })}
                  />
                )}

                <div className="space-y-2 border-t border-ink/10 pt-4">
                  <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Preset Positions</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["Center", "Badge", "Back Collar", "Lower"].map((pType) => (
                      <button
                        key={pType}
                        type="button"
                        onClick={() => {
                          if (pType === "Center") updateLayer(sel.id, { x: 0, y: 0 });
                          if (pType === "Badge") updateLayer(sel.id, { x: -35, y: -45 });
                          if (pType === "Back Collar") {
                            setSide("back");
                            updateLayer(sel.id, { x: 0, y: -80, side: "back" });
                            setSelected(sel.id);
                          }
                          if (pType === "Lower") updateLayer(sel.id, { x: 0, y: 70 });
                        }}
                        className="border border-ink/10 py-1.5 text-[9px] uppercase tracking-wider text-muted hover:border-gold hover:text-gold transition-colors rounded bg-surface/20"
                      >
                        {pType}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-ink/10 pt-4">
                  <label className="text-[10px] uppercase tracking-wider text-muted font-medium">Fine-Tune Position</label>
                  <div className="flex gap-4 items-center">
                    <div className="grid grid-cols-3 gap-1 w-24 shrink-0">
                      <div />
                      <button
                        type="button"
                        onClick={() => updateLayer(sel.id, { y: sel.y - 1 })}
                        className="border border-ink/10 p-1.5 text-xs text-muted hover:border-gold hover:text-gold rounded flex items-center justify-center bg-surface/20"
                        title="Nudge Up"
                      >
                        ▲
                      </button>
                      <div />
                      <button
                        type="button"
                        onClick={() => updateLayer(sel.id, { x: sel.x - 1 })}
                        className="border border-ink/10 p-1.5 text-xs text-muted hover:border-gold hover:text-gold rounded flex items-center justify-center bg-surface/20"
                        title="Nudge Left"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        onClick={() => centerLayer(sel.id)}
                        className="border border-ink/10 p-1.5 text-[9px] text-muted hover:border-gold hover:text-gold rounded flex items-center justify-center bg-surface/20 font-bold"
                        title="Center Horizontally"
                      >
                        •
                      </button>
                      <button
                        type="button"
                        onClick={() => updateLayer(sel.id, { x: sel.x + 1 })}
                        className="border border-ink/10 p-1.5 text-xs text-muted hover:border-gold hover:text-gold rounded flex items-center justify-center bg-surface/20"
                        title="Nudge Right"
                      >
                        ▶
                      </button>
                      <div />
                      <button
                        type="button"
                        onClick={() => updateLayer(sel.id, { y: sel.y + 1 })}
                        className="border border-ink/10 p-1.5 text-xs text-muted hover:border-gold hover:text-gold rounded flex items-center justify-center bg-surface/20"
                        title="Nudge Down"
                      >
                        ▼
                      </button>
                      <div />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[9px] text-muted uppercase tracking-wider font-mono">
                        X: <span className="text-gold font-bold">{sel.x}px</span>, Y: <span className="text-gold font-bold">{sel.y}px</span>
                      </p>
                      <p className="text-[8px] text-muted leading-tight">
                        Use Arrow keys on your keyboard for 1px adjustments (hold Shift for 5px leaps).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-ink/10 pt-4">
                  <Slider
                    label="Scale Size"
                    min={0.3}
                    max={3}
                    step={0.05}
                    value={sel.scale}
                    onChange={(v) => updateLayer(sel.id, { scale: v }, false)}
                    onCommit={(v) => updateLayer(sel.id, { scale: v })}
                  />
                </div>
                
                <Slider
                  label="Rotation Angle"
                  min={-180}
                  max={180}
                  step={1}
                  value={sel.rotation}
                  icon={<RotateCw size={11} />}
                  onChange={(v) => updateLayer(sel.id, { rotation: v }, false)}
                  onCommit={(v) => updateLayer(sel.id, { rotation: v })}
                />
                
                <Slider
                  label="Layer Opacity"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={sel.opacity}
                  onChange={(v) => updateLayer(sel.id, { opacity: v }, false)}
                  onCommit={(v) => updateLayer(sel.id, { opacity: v })}
                />
              </div>
            )}
          </div>

          {/* C. Luxury Swatch Color Picker */}
          <div className="rounded-xl border border-ink/10 bg-card p-5">
            <p className="mb-3.5 text-[10px] uppercase tracking-wider text-muted font-bold">Choose Fabric Shade</p>
            <div className="grid grid-cols-6 gap-3">
              {SHIRT_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setShirt(c)}
                  className="group flex flex-col items-center gap-1.5 transition-transform"
                >
                  <span
                    className={cn(
                      "h-8 w-8 rounded-full border transition-all duration-300 group-hover:scale-110",
                      shirt.name === c.name ? "ring-2 ring-gold ring-offset-2 ring-offset-bg scale-105" : "border-ink/10"
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[8px] uppercase tracking-wider text-muted scale-95 transition-colors group-hover:text-gold">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* D. Print Technique Selection */}
          <div className="rounded-xl border border-ink/10 bg-card p-5">
            <p className="mb-3.5 text-[10px] uppercase tracking-wider text-muted font-bold">Print Technique</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "dtg", label: "Classic Ink", desc: "No charge" },
                { id: "embroidery", label: "Embroidery", desc: "+₹350" },
                { id: "puff", label: "Puff Print", desc: "+₹250" },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setPrintStyle(style.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center border p-2 text-center transition-colors rounded-lg",
                    printStyle === style.id
                      ? "border-gold bg-gold/5 text-gold font-semibold"
                      : "border-ink/10 text-muted hover:border-ink/30"
                  )}
                >
                  <span className="text-[9px] uppercase tracking-wider">{style.label}</span>
                  <span className="mt-0.5 text-[8px] opacity-75">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* E. Premium Fabric Cards (Hover Translate) */}
          <div className="rounded-xl border border-ink/10 bg-card p-5">
            <p className="mb-3.5 text-[10px] uppercase tracking-wider text-muted font-bold">Select Fabric Specification</p>
            <div className="grid grid-cols-3 gap-2.5">
              {FABRICS.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setFabric(f)}
                  className={cn(
                    "flex flex-col text-left p-3.5 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md rounded-lg",
                    fabric.name === f.name
                      ? "border-gold bg-gold/5 text-ink"
                      : "border-ink/10 text-muted hover:border-ink/30"
                  )}
                >
                  <span className="text-[8px] uppercase tracking-wider text-muted">{f.weight}</span>
                  <span className="font-serif text-xs text-ink font-semibold mt-1 truncate">{f.name}</span>
                  <span className="text-[9px] text-gold font-mono mt-2">{f.price ? `+₹${f.price}` : "Base Price"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* F. Checkout Block (Price Animation & Trust Badges) */}
          <div className="rounded-xl border border-ink/10 bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted">Quantity</span>
              <div className="flex items-center border border-ink/15">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 text-muted hover:text-gold"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="h-8 w-8 text-muted hover:text-gold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Design Notes & Instructions */}
            <div className="mt-4 pt-4 border-t border-ink/10">
              <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5 font-semibold">
                Special Instructions (Optional)
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Describe any special request (e.g. 'metallic gold thread', 'make chest logo 3 inches lower')"
                className="w-full h-20 text-[11px] border border-ink/15 bg-transparent p-3 outline-none focus:border-gold rounded-md placeholder-muted/40 resize-none transition-colors"
                maxLength={450}
              />
            </div>

            <div className="mt-4 border-t border-ink/10 pt-4">
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-wider text-muted">Total Price</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={total}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.25 }}
                    className="font-serif text-2xl text-gold"
                  >
                    {formatPrice(total)}
                  </motion.span>
                </AnimatePresence>
              </div>
              <p className="mt-1 text-[9px] text-muted">
                {formatPrice(unit)} each · {textCount + imgCount + graphicCount + designCount} custom elements placed
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAddToCart}
              className="btn-gold mt-4 w-full"
            >
              <Check size={14} /> Add custom design to bag
            </motion.button>
            
            <button
              onClick={downloadPreview}
              className="mt-2 flex w-full items-center justify-center gap-2 border border-ink/15 py-3 text-xs uppercase tracking-wider hover:border-gold rounded-md"
            >
              <Download size={13} /> Export Mockup Image
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3.5 border-t border-ink/10 mt-5 pt-5 text-[9px] uppercase tracking-wider text-muted">
              <div className="flex items-center gap-1.5"><Check size={10} className="text-gold" /> Premium Combed Cotton</div>
              <div className="flex items-center gap-1.5"><Check size={10} className="text-gold" /> 5-7 Days Dispatch</div>
              <div className="flex items-center gap-1.5"><Check size={10} className="text-gold" /> Made in India</div>
              <div className="flex items-center gap-1.5"><Check size={10} className="text-gold" /> Secure checkout</div>
            </div>
          </div>
        </aside>
      </div>

      {/* YOURTEE STUDIO Luxury Panel */}
      <div className="border-t border-ink/10 mt-10 pt-16 pb-28 text-center max-w-2xl mx-auto px-6">
        <h2 className="font-serif text-3xl font-light uppercase tracking-wider text-ink">YOURTEE STUDIO</h2>
        <p className="text-xs uppercase tracking-[0.25em] text-gold mt-2">Create your own identity.</p>
        <div className="grid grid-cols-3 gap-6 mt-12 text-xs text-muted">
          <div>
            <h4 className="font-serif text-base text-ink font-light uppercase">Premium Fabrics</h4>
            <p className="mt-2 leading-relaxed text-[11px]">280 GSM luxury heavyweight double-combed long-staple cotton.</p>
          </div>
          <div>
            <h4 className="font-serif text-base text-ink font-light uppercase">Personalized Printing</h4>
            <p className="mt-2 leading-relaxed text-[11px]">High-definition puff prints and bespoke metallic thread embroidery.</p>
          </div>
          <div>
            <h4 className="font-serif text-base text-ink font-light uppercase">Delivered Worldwide</h4>
            <p className="mt-2 leading-relaxed text-[11px]">Express carbon-neutral shipping straight from our atelier.</p>
          </div>
        </div>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 z-[120] -translate-x-1/2 bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-luxe text-[#080808] shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  icon,
  onChange,
  onCommit,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  icon?: React.ReactNode;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted">
        {icon} {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onPointerUp={(e) => onCommit(parseFloat((e.target as HTMLInputElement).value))}
        className="mt-2 w-full accent-gold"
      />
    </div>
  );
}

function ShirtMock({ color, side }: { color: string; side: Side }) {
  const dark = color === "#101010" || color === "#1c2a38" || color === "#5c4033" || color === "#808080";
  const isBack = side === "back";
  const isLeft = side === "left";
  const isRight = side === "right";

  if (isLeft || isRight) {
    // Stylized sleeve silhouette path
    return (
      <svg width="300" height="340" viewBox="0 0 300 340" fill="none" className="transition-all duration-500">
        <defs>
          <filter id="mock-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.08" />
          </filter>
        </defs>
        {/* Sleeve profile silhouette */}
        <path
          d="M60 40 L240 40 L210 240 L90 240 Z"
          fill={color}
          stroke={dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)"}
          strokeWidth="1.5"
          filter="url(#mock-shadow)"
        />
        {/* Stitching cuff line */}
        <path
          d="M90 220 H210"
          stroke={dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.16)"}
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        {/* Shoulder curve seam */}
        <path
          d="M60 40 C100 60 200 60 240 40"
          fill="none"
          stroke={dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"}
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg width="300" height="340" viewBox="0 0 300 340" fill="none" className="transition-all duration-500">
      <defs>
        <filter id="mock-shadow-full" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.08" />
        </filter>
      </defs>
      <path
        d="M100 18 L55 44 L18 96 L52 128 L74 106 L74 320 L226 320 L226 106 L248 128 L282 96 L245 44 L200 18 C188 42 112 42 100 18 Z"
        fill={color}
        stroke={dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)"}
        strokeWidth="1.5"
        filter="url(#mock-shadow-full)"
      />
      {!isBack ? (
        <path
          d="M100 18 C112 42 188 42 200 18"
          fill="none"
          stroke={dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)"}
          strokeWidth="1.5"
        />
      ) : (
        <path
          d="M100 18 C120 28 180 28 200 18"
          fill="none"
          stroke={dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)"}
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}
