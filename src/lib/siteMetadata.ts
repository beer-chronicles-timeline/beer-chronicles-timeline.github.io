import type { Metadata } from "next";

const SOCIAL_IMAGE_PATH = "/images/beer-chronicles-social.png";

export function getTwitterMetadata(
  title: string,
  description: string
): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title,
    description,
    images: [SOCIAL_IMAGE_PATH],
  };
}
