import type { Metadata } from "next";
import { Work_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "./components/ConditionalHeader";
import { Toaster } from "sonner";
import { UserProvider } from "@/src/context/UserContext";
import { NotificationProvider } from "@/src/context/NotificationContext";

const workSans = Work_Sans({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vroom — Marketplace Automobile",
  description: "Achetez, vendez et louez des véhicules en toute confiance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${workSans.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-white text-zinc-900 min-h-screen">
        <UserProvider>
          <NotificationProvider>
            <ConditionalHeader />
            {children}
            <Toaster position="top-center" />
          </NotificationProvider>
        </UserProvider>
      </body>
    </html>
  );
}
