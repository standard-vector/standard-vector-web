import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: the Docker image ships only server.js + the traced
  // node_modules subset (see Dockerfile).
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
