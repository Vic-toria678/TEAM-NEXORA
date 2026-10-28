import type { NextConfig } from "next";

const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/transcribe", destination: `${apiBaseUrl}/api/transcribe` }];
  },
};

export default nextConfig;
