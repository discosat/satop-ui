import type { NextConfig } from "next";

export const allowedOrigins = [
  "op.discosat.dk",
  "localhost:3000",
  "wayf.wayf.dk",
];

const nextConfig: NextConfig = {
  /**
   * Enable static exports.
   *
   * @see https://nextjs.org/docs/app/building-your-application/deploying/static-exports
   */
  output: "export",

  /**
   * Set base path. This is the slug of your GitHub repository.
   *
   * @see https://nextjs.org/docs/app/api-reference/next-config-js/basePath
   */
  basePath: "/nextjs-github-pages",

  /**
   * Disable server-based image optimization. Next.js does not support
   * dynamic features with static exports.
   *
   * @see https://nextjs.org/docs/app/api-reference/components/image#unoptimized
   */
  images: {
    unoptimized: true,
  },
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: allowedOrigins,
    },
  },
};

export default nextConfig;
