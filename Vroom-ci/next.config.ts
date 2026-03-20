import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclut pusher-js du bundle SSR — trop lourd (6.7MB) et inutile côté serveur
  // Sans ça, Next.js parse pusher-js à chaque recompilation → ~34s de Fast Refresh
  serverExternalPackages: ["pusher-js"],
  images: {
    remotePatterns: [{
      protocol: 'http',
      hostname: 'localhost',
      port: '8000',
      pathname: '/storage/**'
    }]

  }
};

export default nextConfig;
