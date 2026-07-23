/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    // Serve modern, smaller formats; cache optimized images for 30 days
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    // Tree-shake large icon/animation libs so only used modules ship
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "http://localhost:5001/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
