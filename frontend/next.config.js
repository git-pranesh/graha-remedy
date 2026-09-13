import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@swisseph/node"],
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
};

export default nextConfig;
