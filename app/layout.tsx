import type { Metadata } from "next";
import "@fontsource/spectral/400.css";
import "@fontsource/spectral/400-italic.css";
import "@fontsource/spectral/500.css";
import "@fontsource/marcellus/400.css";
import "@fontsource/amiri/arabic-400.css";
import "@fontsource/amiri/arabic-700.css";
import "@fontsource/scheherazade-new/arabic-400.css";
import "./globals.css";
import { SITE_URL } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bait al-Elmi Learning Centre",
    template: "%s · Bait al-Elmi",
  },
  description:
    "Bait al-Elmi Learning Centre: Qur’an, Hadith, Tafseer, Islamic jurisprudence and Seerah classes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
