export function normalizePayerName(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}
