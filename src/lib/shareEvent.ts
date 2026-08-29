export type ShareEventData = {
  title: string;
  text: string;
  url: string;
};

type ShareEventCapabilities = {
  share?: (data: ShareEventData) => Promise<void>;
  copy: (url: string) => Promise<boolean>;
};

export type ShareEventResult =
  | "shared"
  | "copied"
  | "cancelled"
  | "failed";

function isShareCancellation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}

export async function shareEvent(
  data: ShareEventData,
  capabilities: ShareEventCapabilities
): Promise<ShareEventResult> {
  if (capabilities.share) {
    try {
      await capabilities.share(data);
      return "shared";
    } catch (error) {
      if (isShareCancellation(error)) {
        return "cancelled";
      }
    }
  }

  return (await capabilities.copy(data.url)) ? "copied" : "failed";
}
