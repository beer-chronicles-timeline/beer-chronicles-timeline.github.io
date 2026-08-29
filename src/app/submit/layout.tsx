import type { Metadata } from "next";
import { getTwitterMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
  title: "Submit a Beer History Entry | Beer Chronicles",
  description:
    "Submit a beer history event, correction, or additional source for human review and possible inclusion in Beer Chronicles.",
  alternates: {
    canonical: "/submit",
  },
  openGraph: {
    title: "Submit a Beer History Entry | Beer Chronicles",
    description:
      "Submit a beer history event, correction, or additional source for review by Beer Chronicles.",
    url: "/submit",
    siteName: "Beer Chronicles",
    type: "website",
    images: [
      {
        url: "/images/beer-chronicles-social.png",
        width: 1731,
        height: 909,
        alt: "Beer Chronicles — A Timeline of Beer History",
      },
    ],
  },
  twitter: getTwitterMetadata(
    "Submit a Beer History Entry | Beer Chronicles",
    "Submit a beer history event, correction, or additional source for review by Beer Chronicles."
  ),
};

export default function SubmitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
