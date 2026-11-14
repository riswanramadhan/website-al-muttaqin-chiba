import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSerwist } from "@serwist/turbopack";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Default 60 detik terlalu ketat untuk mesin build yang lambat; 607 halaman statis dirender saat build.
  staticPageGenerationTimeout: 180,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Hemat kuota Image Optimization (Vercel Hobby): satu format, lebih sedikit ukuran turunan,
    // dan hasil optimasi disimpan 31 hari. Unggahan admin (Supabase Storage) sudah dikompres di
    // browser dan ditampilkan `unoptimized`, jadi tidak pernah lewat pengoptimal ini.
    formats: ["image/webp"],
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default withSerwist(withNextIntl(nextConfig));
