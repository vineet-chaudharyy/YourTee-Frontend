# THREADCOUTURE — Luxury Custom T-Shirt Fashion House

An ultra-premium, fully functional custom T-shirt ecommerce platform built with Next.js 15.
Editorial luxury design language, cinematic motion, **dark + light mode**, and a working
design studio.

## ✦ Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **TailwindCSS** (theme-aware CSS-variable tokens for dark/light)
- **Framer Motion** (reveal, parallax, magnetic cursor, page transitions)
- **next-themes** (persistent dark/light toggle)
- **Zustand** (cart + wishlist, persisted to localStorage)
- **React Hook Form + Zod** (validated contact form)
- **lucide-react** icons

## ✦ Pages (all functional)

| Route | Description |
|-------|-------------|
| `/` | Cinematic home — hero, customizer preview, collections, editorial, why-us |
| `/shop` | Filterable + sortable product grid |
| `/product/[slug]` | Gallery, color/size picker, qty, add-to-bag, accordions, related |
| `/collections` | Editorial alternating collection layout |
| `/customize` | **Design Studio** — text/image/AI/graphics layers, drag, resize, rotate, opacity, layers panel, undo/redo, garment color, fabric, live price, save, add-to-bag |
| `/about` | Brand manifesto + sustainability |
| `/journal` | Editorial magazine grid |
| `/contact` | Validated contact form |
| `/cart` | Live cart with quantities + summary |
| `/checkout` | Multi-step checkout + premium unboxing animation |
| `/account` | Dashboard — orders, saved designs, wishlist, addresses, rewards |

## ✦ Key Features

- 🌗 **Dark & Light mode** — toggle in the navbar, persists across sessions
- 🎨 **Functional customizer** — add text, upload art, AI prompt, graphics; drag, scale, rotate, set opacity & color; undo/redo; live price calculator
- 🛒 **Working cart & wishlist** — persisted via Zustand
- ✨ Custom magnetic cursor, scroll reveals, parallax, marquee
- 📱 Fully responsive + accessible + SEO metadata

## ✦ Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start   # production
```

> Product imagery is served from Unsplash (configured in `next.config.mjs`).
