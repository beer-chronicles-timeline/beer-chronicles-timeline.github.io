// Parse the entire draft; never interpret a numeric prefix as a different year.
export function parseHistoricalYear(value: string): number | null {
  const text = value.trim();
  const bc = text.match(/^(\d+)\s*BCE?$/i);
  if (!bc && !/^[+-]?\d+$/.test(text)) return null;
  const year = bc ? -Number(bc[1]) : Number(text);
  return Number.isSafeInteger(year) && year !== 0 ? year : null;
}
