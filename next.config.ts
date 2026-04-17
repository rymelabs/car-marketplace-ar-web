import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.18.10", "192.168.18.18"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
