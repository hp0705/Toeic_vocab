import React from 'react';
import { SpecialSense } from '../../types/vocab';
import { STRINGS } from '../../constants/strings';
import { AlertCircle } from 'lucide-react';

export interface MeaningBlockProps {
  meaningVi: string;
  meaningEn?: string;
  specialSenses?: SpecialSense[];
}

export const MeaningBlock: React.FC<MeaningBlockProps> = ({
  meaningVi,
  meaningEn,
  specialSenses
}) => {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
          {STRINGS.card.meaning}
        </h4>
        <div className="text-xl font-bold text-text">{meaningVi}</div>
        {meaningEn && <div className="text-sm text-text-muted mt-0.5 italic">{meaningEn}</div>}
      </div>

      {specialSenses && specialSenses.length > 0 && (
        <div className="p-3 rounded-md bg-accent-warn-light/50 border border-accent-warn/30 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-warn">
            <AlertCircle size={15} />
            <span>{STRINGS.card.specialSense}</span>
          </div>
          <div className="text-xs text-text-muted">{STRINGS.card.specialSenseAlert}</div>
          {specialSenses.map((s, idx) => (
            <div key={idx} className="text-sm font-medium text-text pt-1">
              • {s.meaningVi} {s.note && <span className="text-text-muted">({s.note})</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
