import type { NextConfig } from "next";

export const allowedOrigins = [
  "op.discosat.dk",
  "localhost:3000",
  "wayf.wayf.dk",
];

// detect CI
const isCI = Boolean(process.env.GITHUB_ACTIONS);

const nextConfig: NextConfig = {
  ...(isCI && {
    output: "export",
    basePath: "/nextjs-github-pages",
    assetPrefix: "/nextjs-github-pages",
  }),

  images: {
    unoptimized: true,
  },

  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
};

export default nextConfig;
