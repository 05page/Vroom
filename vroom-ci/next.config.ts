import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Domaines externes autorisés pour <Image />. Sans cette liste, next/image
    // refuse toute URL distante (protection anti-hotlink et anti-abus du cache).
    // À retirer quand les photos viendront du backend Vroom.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
