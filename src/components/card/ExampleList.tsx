import React, { useState } from 'react';
import { Example } from '../../types/vocab';
import { SpeakButton } from '../ui/SpeakButton';
import { STRINGS } from '../../constants/strings';

export interface ExampleListProps {
  examples: Example[];
  headword: string;
}

export const ExampleList: React.FC<ExampleListProps> = ({ examples, headword }) => {
  const [activeTab, setActiveTab] = useState<'toeic' | 'daily'>('toeic');

  if (!examples || examples.length === 0) return null;

  const currentExample =
    examples.find((e) => e.kind === activeTab) || examples[0];

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword) return text;
    // Match headword or root word case-insensitively
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="text-primary font-bold underline decoration-primary/40 underline-offset-2">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const hasBothTabs = examples.some((e) => e.kind === 'daily') && examples.some((e) => e.kind === 'toeic');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {STRINGS.card.examples}
        </h4>
        {hasBothTabs && (
          <div className="flex rounded-sm bg-surface-2 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('toeic')}
              className={`px-2.5 py-0.5 rounded-sm font-medium transition-colors ${
                activeTab === 'toeic' ? 'bg-surface text-text shadow-sm' : 'text-text-muted'
              }`}
            >
              {STRINGS.card.tabToeic}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`px-2.5 py-0.5 rounded-sm font-medium transition-colors ${
                activeTab === 'daily' ? 'bg-surface text-text shadow-sm' : 'text-text-muted'
              }`}
            >
              {STRINGS.card.tabDaily}
            </button>
          </div>
        )}
      </div>

      <div className="p-3.5 rounded-md bg-surface-2/60 border border-border/60 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium leading-relaxed text-text">
            {highlightKeyword(currentExample.en, headword)}
          </p>
          <SpeakButton text={currentExample.en} size="sm" showSlowOption />
        </div>
        {currentExample.vi && (
          <p className="text-xs text-text-muted border-t border-border/40 pt-1.5">
            {currentExample.vi}
          </p>
        )}
      </div>
    </div>
  );
};
