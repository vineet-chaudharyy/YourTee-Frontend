import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoginPopup } from "@/components/auth/LoginPopup";
import { Cursor } from "@/components/ui/Cursor";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "arial"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: "YourTee — Design It. Wear It. Own It.",
    template: "%s — YourTee",
  },
  description:
    "An ultra-premium custom T-shirt brand. Design it, wear it, own it. Heavyweight cotton, luxury craftsmanship, designed exclusively for you.",
  keywords: [
    "custom t-shirts",
    "design your own t-shirt",
    "premium streetwear india",
    "made to order apparel",
    "t-shirt design studio",
  ],
  openGraph: {
    title: "YourTee — Design It. Wear It. Own It.",
    description:
      "Premium heavyweight cotton. Luxury craftsmanship. Designed exclusively for you.",
    type: "website",
    locale: "en_IN",
    siteName: "YourTee",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased relative">
        <div className="grain-overlay" />
        <ThemeProvider>
          <AuthProvider>
            <SmoothScroll>
              <Cursor />
              <Navbar />
              <main className="relative">{children}</main>
              <Footer />
              <LoginPopup />
            </SmoothScroll>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}