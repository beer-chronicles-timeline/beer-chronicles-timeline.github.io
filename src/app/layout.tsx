// app/layout.tsx

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const SOCIAL_IMAGE_PATH =
  "/images/beer-chronicles-social.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://beer-chronicles.org"),
  title: "Beer Chronicles | Interactive Beer History Timeline",
  description:
    "An interactive timeline of beer history from prehistoric brewing to the present day.",
  openGraph: {
    title:
      "Beer Chronicles | Interactive Beer History Timeline",
    description:
      "Explore beer history from prehistoric brewing to the present through a curated interactive timeline and connected storylines.",
    url: "/",
    siteName: "Beer Chronicles",
    type: "website",
    images: [
      {
        url: SOCIAL_IMAGE_PATH,
        width: 1731,
        height: 909,
        alt: "Beer Chronicles — A Timeline of Beer History",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Beer Chronicles | Interactive Beer History Timeline",
    description:
      "Explore beer history from prehistoric brewing to the present through a curated interactive timeline and connected storylines.",
    images: [SOCIAL_IMAGE_PATH],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <head>
        {/* Cloudflare Web Analytics */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "9d45a577f721475486595ada4ed25773"}'
        />

        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8D%BB%3C/text%3E%3C/svg%3E"
        />
      </head>

      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
