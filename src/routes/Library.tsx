import React, { useState, useMemo } from 'react';
import { Entry, EntryType } from '../types/vocab';
import { matchesQuery } from '../utils/search';
import { STRINGS } from '../constants/strings';
import { WordCard } from '../components/card/WordCard';
import { SpeakButton } from '../components/ui/SpeakButton';
import { Search, X, ChevronRight } from 'lucide-react';

export interface LibraryProps {
  allEntries: Entry[];
  initialFilter?: string;
}

export const Library: React.FC<LibraryProps> = ({ allEntries, initialFilter }) => {
  const [searchQuery, setSearchQuery] = useState(initialFilter && initialFilter !== 'weak' ? initialFilter : '');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const typeOptions: { id: string; label: string }[] = [
    { id: 'all', label: STRINGS.library.allTypes },
    { id: 'word', label: 'Từ vựng cốt lõi' },
    { id: 'collocation', label: 'Collocation' },
    { id: 'phrasal', label: 'Phrasal Verb' },
    { id: 'phrase', label: 'Cụm liên kết & Email' },
    { id: 'prep_pattern', label: 'Giới từ đi kèm' },
    { id: 'confusable', label: 'Cặp dễ nhầm' },
    { id: 'paraphrase', label: 'Paraphrase' },
    { id: 'polysemy', label: 'Từ đa nghĩa (P7)' },
    { id: 'quantifier', label: 'Lượng từ' },
    { id: 'wordfamily', label: 'Họ từ (P5)' }
  ];

  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      // Type match
      if (selectedType !== 'all' && entry.type !== (selectedType as EntryType)) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const matchesHeadword = matchesQuery(entry.headword, searchQuery);
        const matchesMeaning = matchesQuery(entry.meaningVi, searchQuery);
        const matchesTopic = entry.topic ? matchesQuery(entry.topic, searchQuery) : false;
        if (!matchesHeadword && !matchesMeaning && !matchesTopic) {
          return false;
        }
      }

      return true;
    });
  }, [allEntries, selectedType, searchQuery]);

  return (
    <div className="space-y-4 pb-24 pt-2 max-w-lg mx-auto px-4">
      {/* Top Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={STRINGS.library.searchPlaceholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface border border-border text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Type Filter Chips (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {typeOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedType(opt.id)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedType === opt.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface border border-border text-text-muted hover:text-text'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>{STRINGS.library.foundResults(filteredEntries.length)}</span>
      </div>

      {/* Entry List */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 text-center bg-surface rounded-lg border border-border space-y-2">
          <p className="text-sm text-text-muted">{STRINGS.library.emptySearch}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEntries.slice(0, 100).map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="p-3.5 rounded-md bg-surface border border-border/80 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-text truncate">{entry.headword}</span>
                  {entry.pos?.[0] && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-surface-2 text-text-muted uppercase">
                      {entry.pos[0]}
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-muted truncate">{entry.meaningVi}</div>
              </div>

              <div className="flex items-center gap-1">
                <SpeakButton text={entry.headword} size="sm" />
                <ChevronRight size={16} className="text-text-muted" />
              </div>
            </div>
          ))}

          {filteredEntries.length > 100 && (
            <div className="text-center text-xs text-text-muted py-2">
              (Đang hiển thị 100 / {filteredEntries.length} mục. Hãy nhập từ khóa để tìm cụ thể hơn)
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto p-4 relative shadow-sheet">
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-surface-2 text-text-muted hover:text-text transition-colors cursor-pointer z-10"
              aria-label="Đóng chi tiết"
            >
              <X size={20} />
            </button>
            <WordCard entry={selectedEntry} showAllDetails />
          </div>
        </div>
      )}
    </div>
  );
};
