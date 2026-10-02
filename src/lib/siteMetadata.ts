import type { Metadata } from "next";

const SOCIAL_IMAGE_PATH = "/images/beer-chronicles-social.png";

export function getOpenGraphImageMetadata(): Pick<
  NonNullable<Metadata["openGraph"]>,
  "images"
> {
  return {
    images: [
      {
        url: SOCIAL_IMAGE_PATH,
        width: 1731,
        height: 909,
        alt: "Beer Chronicles — A Timeline of Beer History",
      },
    ],
  };
}

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
