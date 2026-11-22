import React from 'react';
import { Entry } from '../types/vocab';
import { useStreak, useStudyQueue, useStats } from '../db/hooks';
import { STRINGS } from '../constants/strings';
import { Button } from '../components/ui/Button';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Flame, ShieldCheck, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';

export interface TodayProps {
  allEntries: Entry[];
  onStartStudy: () => void;
  onOpenLibraryWithFilter?: (filter: string) => void;
}

export const Today: React.FC<TodayProps> = ({ allEntries, onStartStudy, onOpenLibraryWithFilter }) => {
  const { streak } = useStreak();
  const { queue, isLoading } = useStudyQueue(allEntries);
  const { stats } = useStats();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return STRINGS.today.greetingMorning;
    if (hour < 18) return STRINGS.today.greetingAfternoon;
    return STRINGS.today.greetingEvening;
  };

  const estimatedMins = Math.max(1, Math.ceil(queue.length * 0.4));
  const dailyTarget = 20;
  const todayProgressPercent = Math.min(100, Math.round(((dailyTarget - queue.length) / dailyTarget) * 100));

  return (
    <div className="space-y-6 pb-20 pt-2 max-w-lg mx-auto px-4">
      {/* Top Greeting & Streak */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">{getGreeting()}</h1>
          <p className="text-xs text-text-muted mt-0.5">{STRINGS.appSubtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-warn-light border border-accent-warn/30">
          <Flame size={18} className="text-accent-warn fill-accent-warn" />
          <span className="text-sm font-extrabold text-accent-warn">{streak.count}</span>
          {streak.freezeAvailable && (
            <span title={STRINGS.today.streakFreezeReady} className="text-primary ml-0.5">
              <ShieldCheck size={14} />
            </span>
          )}
        </div>
      </div>

      {/* Main Study Action Card */}
      <div className="p-6 rounded-lg bg-surface border border-border shadow-card relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/40 text-xs">
          <span className="font-semibold text-text-muted">Tổng kho từ vựng</span>
          <span className="font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-full">
            {allEntries.length} từ vựng (28 chủ đề)
          </span>
        </div>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {STRINGS.today.dueForReview}
            </span>
            <div className="text-4xl font-black text-text tracking-tight">
              {isLoading ? '...' : queue.length}
              <span className="text-sm font-normal text-text-muted ml-2">từ</span>
            </div>
            <div className="text-xs text-text-muted pt-1">
              {STRINGS.today.estimatedTime(estimatedMins)} (học giãn cách SRS)
            </div>
          </div>

          <ProgressRing progress={todayProgressPercent > 0 ? todayProgressPercent : 15} size={70}>
            <span className="text-xs font-bold text-text">
              {todayProgressPercent > 0 ? `${todayProgressPercent}%` : '0%'}
            </span>
          </ProgressRing>
        </div>

        <div className="mt-6">
          <Button
            size="lg"
            fullWidth
            onClick={onStartStudy}
            disabled={isLoading || queue.length === 0}
            className="text-base font-bold shadow-md"
          >
            {queue.length > 0 ? (
              <span className="flex items-center justify-center gap-2">
                <BookOpen size={18} />
                {STRINGS.today.startStudy}
              </span>
            ) : (
              STRINGS.today.studyComplete
            )}
          </Button>
        </div>
      </div>

      {/* 6-Week Roadmap Card */}
      <div className="p-4 rounded-lg bg-surface border border-border shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text">Lộ trình 6 tuần (Reading 400+)</span>
          <span className="text-primary font-semibold">Tuần 1 / 6</span>
        </div>
        <div className="text-xs text-text-muted">
          Tuần 1: Giới từ, liên từ, từ nối (Mục 15, 22, 23) + Họ từ Nhóm 1.
        </div>
        <div className="w-full bg-surface-2 rounded-full h-2.5 overflow-hidden">
          <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: '25%' }} />
        </div>
      </div>

      {/* Weak Points Suggestion if any */}
      {stats.weakCount > 0 && (
        <div
          onClick={() => onOpenLibraryWithFilter?.('weak')}
          className="p-4 rounded-lg bg-bad-light/60 border border-bad/30 flex items-center justify-between cursor-pointer hover:bg-bad-light transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-bad/10 text-bad">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-bad">Từ cần cải thiện ({stats.weakCount} từ)</div>
              <div className="text-xs text-text-muted">Bấm để xem các từ bạn hay chọn "Lại"</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-bad" />
        </div>
      )}
    </div>
  );
};
