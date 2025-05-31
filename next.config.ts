import type { NextConfig } from "next";

export const allowedOrigins = [
  "op.discosat.dk",
  "localhost:3000",
  "wayf.wayf.dk",
];

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: allowedOrigins,
    },
  },
  output: "standalone"
};

export default nextConfig;
