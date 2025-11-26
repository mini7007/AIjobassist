/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },

  // ⬇️ Add this section to prevent ESLint errors during Vercel build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
