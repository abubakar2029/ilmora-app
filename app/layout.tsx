import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ilmora - Clarity for Every Student",
  description:
    "Ilmora helps university students gain clarity, reduce blind spots, and navigate their academic journey with confidence.",
};

export const viewport: Viewport = {
  themeColor: "#0e7c6b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${geistMono.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
