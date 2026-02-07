import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileLayout from "@/components/MobileLayout";
import SyncProvider from "@/components/SyncProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fitness Scribe",
  description: "Your local-first fitness tracker",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon/favicon-32x32.png",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fitness Scribe"
  },
};

export const viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SyncProvider />
        <MobileLayout>
          {children}
        </MobileLayout>
      </body>
    </html>
  );
}
