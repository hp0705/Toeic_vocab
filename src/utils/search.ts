/**
 * Normalize text by removing Vietnamese accents, lowering case, and trimming.
 * e.g. "hoàn tiền" -> "hoan tien", "Vận chuyển" -> "van chuyen"
 */
export function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function matchesQuery(target: string, query: string): boolean {
  if (!query) return true;
  const normTarget = removeVietnameseDiacritics(target);
  const normQuery = removeVietnameseDiacritics(query);
  return normTarget.includes(normQuery);
}
