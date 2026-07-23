export type Product = {
  id: string;
  slug: string;
  name: string;
  collection: string;
  price: number;
  originalPrice?: number;
  description: string;
  fabric: string;
  gsm: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  image: string;
  gallery: string[];
  tag?: string | null;
  stock?: number;
  variantStock?: Record<string, number>;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  designs: number;
  image: string;
  description: string;
};

export type CartItem = {
  key: string; // unique per product+config
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  custom?: boolean;
  description?: string | null;
};

export type OrderStatus =
  | "Placed"
  | "Confirmed"
  | "In Production"
  | "Shipped"
  | "Delivered";

export type Order = {
  id: string;
  date: string; // ISO
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "razorpay" | "cod" | "demo";
  paymentId?: string;
  name?: string;
  email?: string;
  carrier: string;
  tracking: string;
};

export type JournalPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
};
