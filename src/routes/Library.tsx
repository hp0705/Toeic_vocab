import React, { useState, useMemo } from 'react';
import { CardProgress, Entry, EntryType } from '../types/vocab';
import { matchesQuery } from '../utils/search';
import { STRINGS } from '../constants/strings';
import { WordCard } from '../components/card/WordCard';
import { SpeakButton } from '../components/ui/SpeakButton';
import { Search, X, ChevronRight, CheckCircle2, Bookmark, Flame, AlertCircle } from 'lucide-react';

export interface LibraryProps {
  allEntries: Entry[];
  progressMap?: Map<string, CardProgress>;
  initialFilter?: string;
}

export const Library: React.FC<LibraryProps> = ({ allEntries, progressMap, initialFilter }) => {
  const [searchQuery, setSearchQuery] = useState(
    initialFilter && initialFilter !== 'weak' ? initialFilter : ''
  );
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(
    initialFilter === 'weak' ? 'weak' : 'all'
  );
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(100);

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

  const statusOptions = [
    { id: 'all', label: 'Tất cả trạng thái' },
    { id: 'unstudied', label: 'Chưa học' },
    { id: 'learning', label: 'Đang nhớ' },
    { id: 'mastered', label: 'Đã thuộc' },
    { id: 'weak', label: 'Cần ôn (Từ yếu)' }
  ];

  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      // 1. Status filter
      if (selectedStatus !== 'all') {
        const p = progressMap?.get(entry.id);
        const isStudied = p && p.status !== 'new';
        if (selectedStatus === 'unstudied' && isStudied) return false;
        if (selectedStatus === 'learning' && (!p || (p.status !== 'learning' && p.status !== 'review'))) {
          return false;
        }
        if (selectedStatus === 'mastered' && (!p || p.status !== 'mastered')) return false;
        if (selectedStatus === 'weak' && (!p || !p.isWeak)) return false;
      }

      // 2. Type match
      if (selectedType !== 'all' && entry.type !== (selectedType as EntryType)) {
        return false;
      }

      // 3. Search match
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
  }, [allEntries, selectedType, selectedStatus, searchQuery, progressMap]);

  const renderStatusBadge = (entry: Entry) => {
    const p = progressMap?.get(entry.id);
    if (!p || p.status === 'new') {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-text-muted flex items-center gap-1 border border-border/50">
          <span className="w-1.5 h-1.5 rounded-full bg-text-muted/40" />
          Chưa học
        </span>
      );
    }
    if (p.isWeak) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bad-light text-bad flex items-center gap-1 border border-bad/30">
          <AlertCircle size={11} />
          Từ yếu
        </span>
      );
    }
    if (p.status === 'learning') {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pos-adj-bg text-pos-adj flex items-center gap-1 border border-pos-adj/30">
          <Flame size={11} />
          Đang nhớ
        </span>
      );
    }
    if (p.status === 'review') {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary flex items-center gap-1 border border-primary/30">
          <Bookmark size={11} />
          Ôn tập
        </span>
      );
    }
    if (p.status === 'mastered') {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ok-light text-ok flex items-center gap-1 border border-ok/30">
          <CheckCircle2 size={11} />
          Đã thuộc
        </span>
      );
    }
    return null;
  };

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

      {/* 1. Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {statusOptions.map((st) => (
          <button
            key={st.id}
            onClick={() => setSelectedStatus(st.id)}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedStatus === st.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface border border-border text-text-muted hover:text-text'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* 2. Type Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {typeOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedType(opt.id)}
            className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedType === opt.id
                ? 'bg-surface-2 text-text border border-primary font-bold'
                : 'bg-surface/60 border border-border/70 text-text-muted hover:text-text'
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
          {filteredEntries.slice(0, visibleCount).map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="p-3.5 rounded-md bg-surface border border-border/80 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-text truncate">{entry.headword}</span>
                  {entry.pos?.[0] && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-surface-2 text-text-muted uppercase">
                      {entry.pos[0]}
                    </span>
                  )}
                  {/* Status Mark (Chưa học / Đang nhớ / Đã thuộc / Từ yếu) */}
                  {renderStatusBadge(entry)}
                </div>
                <div className="text-xs text-text-muted truncate">{entry.meaningVi}</div>
              </div>

              <div className="flex items-center gap-1">
                <SpeakButton text={entry.headword} size="sm" />
                <ChevronRight size={16} className="text-text-muted" />
              </div>
            </div>
          ))}

          {filteredEntries.length > visibleCount && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <span className="text-xs text-text-muted">
                Đang hiển thị {visibleCount} / {filteredEntries.length} mục
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisibleCount((prev) => Math.min(filteredEntries.length, prev + 100))}
                  className="px-4 py-2 rounded-md bg-surface border border-border hover:bg-surface-2 text-xs font-semibold text-primary transition-colors cursor-pointer"
                >
                  Tải thêm +100 từ
                </button>
                <button
                  onClick={() => setVisibleCount(filteredEntries.length)}
                  className="px-4 py-2 rounded-md bg-primary-light border border-primary/30 text-xs font-semibold text-primary transition-colors cursor-pointer"
                >
                  Xem tất cả ({filteredEntries.length} từ)
                </button>
              </div>
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
