/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
    transpilePackages: ["@repo/types","@repo/eslint-config", "@repo/typescript-config" ],
}

export default nextConfig
