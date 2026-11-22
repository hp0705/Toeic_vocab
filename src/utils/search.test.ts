import { describe, it, expect } from 'vitest';
import { removeVietnameseDiacritics, matchesQuery } from './search';

describe('Search and Diacritic Utilities', () => {
  it('removes Vietnamese accents accurately', () => {
    expect(removeVietnameseDiacritics('Hoàn tiền')).toBe('hoan tien');
    expect(removeVietnameseDiacritics('Định hướng')).toBe('dinh huong');
    expect(removeVietnameseDiacritics('Vận chuyển & Hậu cần')).toBe('van chuyen & hau can');
  });

  it('matches non-accented query against accented target', () => {
    expect(matchesQuery('Chính sách đổi trả', 'chinh sach')).toBe(true);
    expect(matchesQuery('Hàng tồn kho', 'ton kho')).toBe(true);
    expect(matchesQuery('Warehouse', 'ware')).toBe(true);
    expect(matchesQuery('Reservation', 'xyz')).toBe(false);
  });
});
