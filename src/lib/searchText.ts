/** Normalize matching text only; keep the original spelling for display. */
export function normalizeSearchText(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}
