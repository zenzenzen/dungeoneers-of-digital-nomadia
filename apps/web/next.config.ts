import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ddn/content", "@ddn/engine", "@ddn/ui"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
