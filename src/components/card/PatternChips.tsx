import React from 'react';
import { Chip } from '../ui/Chip';
import { STRINGS } from '../../constants/strings';
import { Link2, AlertCircle } from 'lucide-react';

export interface PatternChipsProps {
  patterns?: string[];
  collocations?: string[];
  fixedPrep?: string[];
}

export const PatternChips: React.FC<PatternChipsProps> = ({ patterns, collocations, fixedPrep }) => {
  const hasPatterns = patterns && patterns.length > 0;
  const hasCollocations = collocations && collocations.length > 0;
  const hasFixedPrep = fixedPrep && fixedPrep.length > 0;

  if (!hasPatterns && !hasCollocations && !hasFixedPrep) {
    return null;
  }

  const isNoPrep = fixedPrep?.includes('none');
  const validPreps = fixedPrep?.filter((p) => p !== 'none') || [];

  return (
    <div className="space-y-2.5">
      {/* Fixed Preposition Highlight Banner */}
      {hasFixedPrep && (
        <div className={`p-2.5 rounded-md border text-xs ${
          isNoPrep
            ? 'bg-accent-warn-light/70 border-accent-warn/30 text-amber-900 dark:text-amber-200'
            : 'bg-primary-light/80 border-primary/25 text-primary dark:text-primary-light'
        }`}>
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {isNoPrep ? (
              <AlertCircle size={15} className="text-accent-warn shrink-0" />
            ) : (
              <Link2 size={15} className="text-primary shrink-0" />
            )}
            <span className="uppercase tracking-wider">
              {isNoPrep ? 'Lưu ý TOEIC: Ngoại động từ' : 'Giới từ cố định:'}
            </span>
          </div>

          {isNoPrep ? (
            <p className="text-[11px] leading-relaxed">
              <span className="font-semibold underline">KHÔNG DÙNG GIỚI TỪ</span>: Đi trực tiếp với Tân ngữ (Ví dụ: <code className="font-mono font-semibold">approve the plan</code>, không dùng <code className="font-mono line-through opacity-75">approve of</code>).
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {validPreps.map((prep, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-primary text-white text-xs font-bold shadow-xs tracking-wide"
                >
                  + {prep.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Usage Patterns / Cấu trúc đi kèm */}
      {hasPatterns && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            {STRINGS.card.patterns}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {patterns.map((p, idx) => (
              <Chip key={idx} label={p} variant="pattern" />
            ))}
          </div>
        </div>
      )}

      {/* Collocations */}
      {hasCollocations && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            {STRINGS.card.collocations}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {collocations.map((c, idx) => (
              <Chip key={idx} label={c} variant="default" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
