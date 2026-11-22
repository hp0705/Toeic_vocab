import React from 'react';
import { Chip } from '../ui/Chip';
import { STRINGS } from '../../constants/strings';

export interface PatternChipsProps {
  patterns?: string[];
  collocations?: string[];
}

export const PatternChips: React.FC<PatternChipsProps> = ({ patterns, collocations }) => {
  if ((!patterns || patterns.length === 0) && (!collocations || collocations.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-2">
      {patterns && patterns.length > 0 && (
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

      {collocations && collocations.length > 0 && (
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
