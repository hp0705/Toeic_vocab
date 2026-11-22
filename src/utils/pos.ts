export interface PosFormat {
  code: string;
  label: string;
  variant: 'pos-n' | 'pos-v' | 'pos-adj' | 'pos-adv' | 'primary' | 'default';
}

export function formatPos(pos: string): PosFormat {
  const p = pos.toLowerCase().trim();
  switch (p) {
    case 'n':
    case 'noun':
      return { code: 'N', label: 'Danh từ (Noun)', variant: 'pos-n' };
    case 'v':
    case 'verb':
      return { code: 'V', label: 'Động từ (Verb)', variant: 'pos-v' };
    case 'adj':
    case 'adjective':
      return { code: 'Adj', label: 'Tính từ (Adjective)', variant: 'pos-adj' };
    case 'adv':
    case 'adverb':
      return { code: 'Adv', label: 'Trạng từ (Adverb)', variant: 'pos-adv' };
    case 'prep':
    case 'preposition':
      return { code: 'Prep', label: 'Giới từ (Preposition)', variant: 'primary' };
    case 'conj':
    case 'conjunction':
      return { code: 'Conj', label: 'Liên từ (Conjunction)', variant: 'primary' };
    case 'phrase':
      return { code: 'Phrase', label: 'Cụm từ (Phrase)', variant: 'default' };
    case 'phrasal_v':
      return { code: 'Phrasal V', label: 'Cụm động từ (Phrasal V)', variant: 'pos-v' };
    case 'collocation':
      return { code: 'Collocation', label: 'Cụm kết hợp (Collocation)', variant: 'default' };
    case 'quantifier':
      return { code: 'Quantifier', label: 'Lượng từ (Quantifier)', variant: 'pos-adj' };
    default:
      return { code: pos.toUpperCase(), label: pos, variant: 'default' };
  }
}
