/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    outputFileTracingIncludes: {
      "/": ["./prisma/init.sql"]
    }
  }
};

module.exports = nextConfig;
