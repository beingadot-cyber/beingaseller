import type { Metadata, Viewport } from "next";
import { Fraunces, Quicksand } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

const DESCRIPTION =
  "Trending clothes, gadgets and lifestyle picks, curated by Beingaseller. Pay securely with UPI, cards or net banking.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Beingaseller — Trending Fashion, Gadgets & Lifestyle",
    template: "%s · Beingaseller",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: "/",
    title: "Beingaseller — Trending Fashion, Gadgets & Lifestyle",
    description: DESCRIPTION,
    images: [{ url: "/brand/logo.png", alt: "Beingaseller logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beingaseller — Trending Fashion, Gadgets & Lifestyle",
    description: DESCRIPTION,
    images: ["/brand/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6fbe0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${quicksand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
