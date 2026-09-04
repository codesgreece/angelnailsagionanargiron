import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Great_Vibes } from "next/font/google";
import "./globals.css";
import { getSeoSettings, getSiteSettings } from "@/lib/services/content";
import { buildMetadata } from "@/lib/seo/metadata";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeoSettings(), getSiteSettings()]);
  return {
    ...buildMetadata({ seo, ogImage: settings.heroImageUrl || seo.ogImageUrl }),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="el">
      <body className={`${dmSans.variable} ${cormorant.variable} ${greatVibes.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
