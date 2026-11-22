import React from 'react';
import { WordFamily } from '../../types/vocab';
import { SpeakButton } from '../ui/SpeakButton';
import { STRINGS } from '../../constants/strings';

export interface WordFamilyTableProps {
  wordFamily?: WordFamily;
}

export const WordFamilyTable: React.FC<WordFamilyTableProps> = ({ wordFamily }) => {
  if (!wordFamily) return null;

  const rows = [
    { label: 'N (Danh từ)', items: wordFamily.n, hint: 'sau a/an/the, tính từ' },
    { label: 'V (Động từ)', items: wordFamily.v, hint: 'vị ngữ chính' },
    { label: 'Adj (Tính từ)', items: wordFamily.adj, hint: 'trước N hoặc sau to be' },
    { label: 'Adv (Trạng từ)', items: wordFamily.adv, hint: 'sau V, bổ nghĩa Adj/V' },
    { label: 'Người (-er/-ee)', items: wordFamily.person, hint: 'người làm/nhận' },
    { label: 'Hành động/Việc', items: wordFamily.action, hint: 'sự việc' }
  ].filter((r) => r.items && r.items.length > 0);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {STRINGS.card.wordFamily}
      </h4>
      <div className="overflow-hidden rounded-md border border-border bg-surface text-xs">
        <table className="w-full text-left border-collapse">
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-border/50 last:border-none hover:bg-surface-2/40">
                <td className="py-2 px-3 font-semibold text-text-muted w-28 bg-surface-2/30">
                  {row.label}
                </td>
                <td className="py-2 px-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {row.items?.map((item, i) => (
                      <span key={i} className="inline-flex items-center gap-1 font-medium text-text">
                        {item}
                        <SpeakButton text={item} size="sm" />
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
