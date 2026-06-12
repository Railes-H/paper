/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["@vercel/blob"],
    outputFileTracingIncludes: {
      "/": ["./prisma/init.sql"]
    }
  }
};

module.exports = nextConfig;
