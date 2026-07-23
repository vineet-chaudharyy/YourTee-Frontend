import type { Product, Collection, JournalPost } from "@/types";

const img = (id: string, w = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const collections: Collection[] = [
  {
    id: "c1",
    slug: "minimal",
    name: "Minimal",
    designs: 12,
    image: "/product_white_embossed.jpg",
    description: "Quiet luxury. Clean lines, considered negative space, and tonal restraint.",
  },
  {
    id: "c2",
    slug: "artistic",
    name: "Artistic",
    designs: 18,
    image: "/product_white_face.png",
    description: "Hand-painted expression translated onto heavyweight cotton canvases.",
  },
  {
    id: "c3",
    slug: "streetwear",
    name: "Streetwear",
    designs: 22,
    image: "/product_olive_front_y.png",
    description: "Oversized silhouettes engineered for the city and built to outlast trends.",
  },
  {
    id: "c4",
    slug: "typography",
    name: "Typography",
    designs: 15,
    image: "/product_black_logo.png",
    description: "Letterforms as art. Editorial statements rendered in archival ink.",
  },
  {
    id: "c5",
    slug: "nature",
    name: "Nature",
    designs: 14,
    image: "/product_taupe_logo.png",
    description: "Organic motifs and botanical study pieces printed with eco inks.",
  },
  {
    id: "c6",
    slug: "limited",
    name: "Limited Drops",
    designs: 6,
    image: "/product_charcoal_embossed.png",
    description: "Numbered, archival, and gone forever once the drop closes.",
  },
];

export const products: Product[] = [
  {
    id: "p1",
    slug: "legacy-heavyweight-tee",
    name: "Legacy Heavyweight Tee",
    collection: "Minimal",
    price: 1999,
    description:
      "Our signature 280 GSM heavyweight tee. Bio-washed Egyptian cotton with a boxy, structured drape and double-needle stitching engineered to last a lifetime.",
    fabric: "Egyptian Combed Cotton",
    gsm: 280,
    colors: [
      { name: "Onyx", hex: "#0d0d0d" },
      { name: "Bone", hex: "#ece7dd" },
      { name: "Clay", hex: "#9a6f4e" },
      { name: "Slate", hex: "#4b4f54" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    image: img("photo-1583743814966-8936f5b7be1a"),
    gallery: [
      img("photo-1583743814966-8936f5b7be1a"),
      img("photo-1576566588028-4147f3842f27"),
      img("photo-1521572163474-6864f9cf17ab"),
    ],
    tag: "Bestseller",
  },
  {
    id: "p2",
    slug: "chaos-oversized-tee",
    name: "Chaos Oversized Tee",
    collection: "Artistic",
    price: 2499,
    originalPrice: 3299,
    description:
      "A wearable canvas. Hand-illustrated classical motif printed with water-based pigment for a soft, vintage hand-feel that ages beautifully.",
    fabric: "Organic Ringspun Cotton",
    gsm: 240,
    colors: [
      { name: "Vintage White", hex: "#f3efe7" },
      { name: "Washed Black", hex: "#1a1a1a" },
    ],
    sizes: ["S", "M", "L", "XL"],
    image: img("photo-1503341504253-dff4815485f1"),
    gallery: [
      img("photo-1503341504253-dff4815485f1"),
      img("photo-1556821840-3a63f95609a7"),
      img("photo-1618354691373-d851c5c3a990"),
    ],
    tag: "New",
  },
  {
    id: "p3",
    slug: "metropolis-boxy-tee",
    name: "Metropolis Boxy Tee",
    collection: "Streetwear",
    price: 2299,
    originalPrice: 2899,
    description:
      "Dropped shoulders, extended length, and a heavyweight body. The cornerstone of a considered streetwear wardrobe.",
    fabric: "Heavyweight French Cotton",
    gsm: 300,
    colors: [
      { name: "Asphalt", hex: "#2b2b2b" },
      { name: "Sand", hex: "#cbb79a" },
      { name: "Forest", hex: "#2f3b30" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: img("photo-1556821840-3a63f95609a7"),
    gallery: [
      img("photo-1556821840-3a63f95609a7"),
      img("photo-1620799140408-edc6dcb6d633"),
      img("photo-1521572163474-6864f9cf17ab"),
    ],
    tag: "Bestseller",
  },
  {
    id: "p4",
    slug: "manifesto-type-tee",
    name: "Manifesto Type Tee",
    collection: "Typography",
    price: 2199,
    description:
      "An editorial statement piece. Archival serif typography set with magazine precision and printed in matte black ink.",
    fabric: "Combed Cotton Jersey",
    gsm: 220,
    colors: [
      { name: "Ivory", hex: "#efe9dd" },
      { name: "Ink", hex: "#101010" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    image: img("photo-1576566588028-4147f3842f27"),
    gallery: [
      img("photo-1576566588028-4147f3842f27"),
      img("photo-1503341504253-dff4815485f1"),
      img("photo-1583743814966-8936f5b7be1a"),
    ],
  },
  {
    id: "p5",
    slug: "flora-study-tee",
    name: "Flora Study Tee",
    collection: "Nature",
    price: 2399,
    description:
      "A botanical study rendered in soft tonal pigment. Made to order with carbon-neutral shipping and recyclable packaging.",
    fabric: "Organic Slub Cotton",
    gsm: 230,
    colors: [
      { name: "Bone", hex: "#ece7dd" },
      { name: "Sage", hex: "#9aa388" },
    ],
    sizes: ["S", "M", "L", "XL"],
    image: img("photo-1618354691373-d851c5c3a990"),
    gallery: [
      img("photo-1618354691373-d851c5c3a990"),
      img("photo-1583743814966-8936f5b7be1a"),
      img("photo-1576566588028-4147f3842f27"),
    ],
    tag: "New",
  },
  {
    id: "p6",
    slug: "archive-no-05-drop",
    name: "Archive No. 05 — Drop",
    collection: "Limited Drops",
    price: 3999,
    originalPrice: 4999,
    description:
      "A numbered limited edition of 200. Premium 320 GSM body, embroidered crest, and a custom woven neck label. Once it's gone, it's gone.",
    fabric: "Premium Loopback Cotton",
    gsm: 320,
    colors: [
      { name: "Obsidian", hex: "#0a0a0a" },
      { name: "Champagne", hex: "#d8c39a" },
    ],
    sizes: ["S", "M", "L", "XL"],
    image: img("photo-1620799140408-edc6dcb6d633"),
    gallery: [
      img("photo-1620799140408-edc6dcb6d633"),
      img("photo-1556821840-3a63f95609a7"),
      img("photo-1503341504253-dff4815485f1"),
    ],
    tag: "Limited",
  },
  {
    id: "p7",
    slug: "atelier-pocket-tee",
    name: "Atelier Pocket Tee",
    collection: "Minimal",
    price: 1899,
    description:
      "An everyday essential refined. Reinforced chest pocket, tonal stitching, and a tailored regular fit.",
    fabric: "Pima Cotton",
    gsm: 210,
    colors: [
      { name: "White", hex: "#f6f3ee" },
      { name: "Charcoal", hex: "#33363a" },
      { name: "Camel", hex: "#b08d5b" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    image: img("photo-1521572163474-6864f9cf17ab"),
    gallery: [
      img("photo-1521572163474-6864f9cf17ab"),
      img("photo-1583743814966-8936f5b7be1a"),
      img("photo-1618354691373-d851c5c3a990"),
    ],
  },
  {
    id: "p8",
    slug: "kinetic-graphic-tee",
    name: "Kinetic Graphic Tee",
    collection: "Artistic",
    price: 2499,
    description:
      "Abstract motion captured in pigment. A bold artistic statement on a relaxed heavyweight body.",
    fabric: "Organic Ringspun Cotton",
    gsm: 250,
    colors: [
      { name: "Off White", hex: "#f0ece2" },
      { name: "Black", hex: "#121212" },
    ],
    sizes: ["S", "M", "L", "XL"],
    image: img("photo-1503342217505-b0a15ec3261c"),
    gallery: [
      img("photo-1503342217505-b0a15ec3261c"),
      img("photo-1503341504253-dff4815485f1"),
      img("photo-1556821840-3a63f95609a7"),
    ],
  },
];

export const journalPosts: JournalPost[] = [
  {
    id: "j1",
    slug: "the-anatomy-of-a-heavyweight-tee",
    title: "The Anatomy of a Heavyweight Tee",
    category: "Craft",
    excerpt:
      "We deconstruct the 280 GSM body that defines our signature silhouette — from yarn to stitch.",
    date: "June 2026",
    readTime: "6 min",
    image: "/product_charcoal_embossed.png",
  },
  {
    id: "j2",
    slug: "behind-the-archive-no-05",
    title: "Behind the Archive — No. 05",
    category: "Lookbook",
    excerpt:
      "A behind-the-scenes look at our most ambitious limited drop, shot on location at dawn.",
    date: "May 2026",
    readTime: "4 min",
    image: "/product_white_atelier.png",
  },
  {
    id: "j3",
    slug: "styling-the-oversized-silhouette",
    title: "Styling the Oversized Silhouette",
    category: "Styling Guide",
    excerpt:
      "Three editorial ways to wear the boxy tee — from monochrome minimalism to layered streetwear.",
    date: "May 2026",
    readTime: "5 min",
    image: "/product_white_face.png",
  },
  {
    id: "j4",
    slug: "the-texture-of-embossed-canvas",
    title: "The Texture of Embossed Canvas",
    category: "Design",
    excerpt:
      "Exploring the tactile sensation and depth behind our high-definition puff-print designs.",
    date: "April 2026",
    readTime: "3 min",
    image: "/product_white_embossed.jpg",
  },
  {
    id: "j5",
    slug: "color-theory-in-minimalism",
    title: "Color Theory in Minimalism",
    category: "Atelier Notes",
    excerpt:
      "How raw bone, taupe, and clay hues establish visual calm in high-end streetwear capsules.",
    date: "April 2026",
    readTime: "4 min",
    image: "/product_beige_yg.png",
  },
  {
    id: "j6",
    slug: "botanical-studies-and-organic-ink",
    title: "Organic Motifs & Ecological Inks",
    category: "Sustainability",
    excerpt:
      "A deep dive into our screen-printing print shop using eco-friendly non-toxic soy inks.",
    date: "March 2026",
    readTime: "7 min",
    image: "/product_taupe_logo.png",
  },
  {
    id: "j7",
    slug: "the-modern-customizer-atelier",
    title: "The Atelier Studio Configurator",
    category: "Studio Notes",
    excerpt:
      "How high-end digital studios empower custom wear with tactile stitching and embroidery tools.",
    date: "March 2026",
    readTime: "5 min",
    image: "/product_black_logo.png",
  },
];

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);

export const getCollection = (slug: string) =>
  collections.find((c) => c.slug === slug);
