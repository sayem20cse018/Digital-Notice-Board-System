import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
    ],
    unoptimized: true,
  },
  // Ensures server-side env vars are available at runtime (not build time)
  serverExternalPackages: ["mongodb", "bcrypt"],
};

export default nextConfig;
