import React from 'react';
import { Entry } from '../../types/vocab';
import { Chip } from '../ui/Chip';
import { SpeakButton } from '../ui/SpeakButton';
import { MeaningBlock } from './MeaningBlock';
import { PatternChips } from './PatternChips';
import { ExampleList } from './ExampleList';
import { WordFamilyTable } from './WordFamilyTable';
import { STRINGS } from '../../constants/strings';
import { Sparkles } from 'lucide-react';

export interface WordCardProps {
  entry: Entry;
  isFlipped?: boolean;
  onFlip?: () => void;
  showAllDetails?: boolean; // For Library view
  className?: string;
}

export const WordCard: React.FC<WordCardProps> = ({
  entry,
  isFlipped = false,
  onFlip,
  showAllDetails = false,
  className = ''
}) => {
  const getPosVariant = (pos: string) => {
    const p = pos.toLowerCase();
    if (p === 'n' || p === 'noun') return 'pos-n' as const;
    if (p === 'v' || p === 'verb') return 'pos-v' as const;
    if (p === 'adj' || p === 'adjective') return 'pos-adj' as const;
    if (p === 'adv' || p === 'adverb') return 'pos-adv' as const;
    return 'default' as const;
  };

  // If showAllDetails is true (Library mode), render a flat scrollable card
  if (showAllDetails) {
    return (
      <div className={`p-5 rounded-lg bg-surface border border-border shadow-card space-y-4 ${className}`}>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-surface-2 text-text-muted">
                #{entry.srcNo}
              </span>
              {entry.pos?.map((p, idx) => (
                <Chip key={idx} label={p.toUpperCase()} variant={getPosVariant(p)} size="sm" />
              ))}
              <span className="text-xs text-text-muted">{entry.topic}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-text">{entry.headword}</h2>
            {entry.ipa?.us && <span className="text-sm text-text-muted font-mono">{entry.ipa.us}</span>}
          </div>
          <SpeakButton text={entry.headword} size="md" showSlowOption />
        </div>

        {/* Content Blocks */}
        <MeaningBlock
          meaningVi={entry.meaningVi}
          meaningEn={entry.meaningEn}
          specialSenses={entry.specialSenses}
        />

        <PatternChips patterns={entry.patterns} collocations={entry.collocations} />

        <WordFamilyTable wordFamily={entry.wordFamily} />

        <ExampleList examples={entry.examples} headword={entry.headword} />

        {entry.mnemonic && (
          <div className="p-3 rounded-md bg-surface-2/70 text-xs text-text-muted flex items-start gap-2">
            <Sparkles size={16} className="text-accent-warn shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-text">{STRINGS.card.mnemonic}: </span>
              {entry.mnemonic}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Interactive 3D Flip Flashcard for Study Sessions
  return (
    <div
      onClick={onFlip}
      className={`relative w-full max-w-md mx-auto h-[440px] cursor-pointer perspective-1000 select-none ${className}`}
    >
      <div
        className={`w-full h-full relative transition-transform duration-300 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT OF CARD */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-lg bg-surface border border-border shadow-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-medium bg-surface-2 px-2 py-0.5 rounded-sm">
              #{entry.srcNo} · {entry.topic}
            </span>
            <div className="flex gap-1">
              {entry.pos?.map((p, idx) => (
                <Chip key={idx} label={p.toUpperCase()} variant={getPosVariant(p)} size="sm" />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center my-auto py-6">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text mb-3">
              {entry.headword}
            </h1>
            {entry.ipa?.us && (
              <p className="text-base text-text-muted font-mono mb-4">{entry.ipa.us}</p>
            )}
            <SpeakButton text={entry.headword} size="lg" showSlowOption />
          </div>

          <div className="text-center text-xs text-text-muted pt-2 border-t border-border/40">
            {STRINGS.study.tapToFlip}
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg bg-surface border border-border shadow-card p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-border/40 pb-2">
              <div>
                <span className="text-xl font-bold text-text">{entry.headword}</span>
                {entry.ipa?.us && (
                  <span className="text-xs text-text-muted font-mono ml-2">{entry.ipa.us}</span>
                )}
              </div>
              <SpeakButton text={entry.headword} size="sm" />
            </div>

            <MeaningBlock
              meaningVi={entry.meaningVi}
              meaningEn={entry.meaningEn}
              specialSenses={entry.specialSenses}
            />

            <PatternChips patterns={entry.patterns} collocations={entry.collocations} />

            <WordFamilyTable wordFamily={entry.wordFamily} />

            <ExampleList examples={entry.examples} headword={entry.headword} />

            {entry.mnemonic && (
              <div className="p-2.5 rounded-md bg-surface-2/70 text-xs text-text-muted flex items-start gap-1.5">
                <Sparkles size={14} className="text-accent-warn shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text">{STRINGS.card.mnemonic}: </span>
                  {entry.mnemonic}
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-[11px] text-text-muted pt-2 mt-2 border-t border-border/30">
            {STRINGS.study.tapToFlip}
          </div>
        </div>
      </div>
    </div>
  );
};
