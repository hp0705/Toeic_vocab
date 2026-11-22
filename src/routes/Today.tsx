import React from 'react';
import { Entry } from '../types/vocab';
import { useStreak, useStudyQueue, useStats, useSettings } from '../db/hooks';
import { STRINGS } from '../constants/strings';
import { Button } from '../components/ui/Button';
import { ProgressRing } from '../components/ui/ProgressRing';
import {
  Flame,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Clock,
  CloudCheck,
  HardDrive
} from 'lucide-react';

export interface TodayProps {
  allEntries: Entry[];
  onStartStudy: () => void;
  onOpenLibraryWithFilter?: (filter: string) => void;
}

export const Today: React.FC<TodayProps> = ({ allEntries, onStartStudy, onOpenLibraryWithFilter }) => {
  const { streak } = useStreak();
  const { settings } = useSettings();
  const { queue, isLoading, addMoreNewCards } = useStudyQueue(allEntries);
  const { stats } = useStats(allEntries);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return STRINGS.today.greetingMorning;
    if (hour < 18) return STRINGS.today.greetingAfternoon;
    return STRINGS.today.greetingEvening;
  };

  const dailyTarget = settings.newCardsPerDay || 15;
  const todayProgressPercent = Math.min(
    100,
    Math.round((stats.studiedTodayCount / dailyTarget) * 100)
  );

  const handleStudyMore = () => {
    addMoreNewCards(5);
    setTimeout(() => {
      onStartStudy();
    }, 100);
  };

  const formatTime = (ts?: number) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5 pb-24 pt-2 max-w-lg mx-auto px-4">
      {/* Top Greeting & Streak */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">{getGreeting()}</h1>
          <p className="text-xs text-text-muted mt-0.5">{STRINGS.appSubtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-warn-light border border-accent-warn/30 shadow-sm">
          <Flame size={18} className="text-accent-warn fill-accent-warn" />
          <span className="text-sm font-extrabold text-accent-warn">{streak.count}</span>
          <span className="text-[11px] font-semibold text-accent-warn">ngày</span>
          {streak.freezeAvailable && (
            <span title={STRINGS.today.streakFreezeReady} className="text-primary ml-0.5">
              <ShieldCheck size={14} />
            </span>
          )}
        </div>
      </div>

      {/* Main Study Action Card */}
      <div className="p-5 rounded-lg bg-surface border border-border shadow-card relative overflow-hidden space-y-4">
        {/* Vocab Summary Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40 text-xs">
          <span className="font-semibold text-text-muted">Kho từ vựng có sẵn</span>
          <span className="font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-full">
            {allEntries.length} từ (28 chuyên đề)
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Tiến độ mục tiêu hôm nay
            </span>
            <div className="text-3xl font-black text-text tracking-tight flex items-baseline gap-1.5">
              <span>{stats.studiedTodayCount}</span>
              <span className="text-sm font-normal text-text-muted">/ {dailyTarget} từ</span>
            </div>
            <div className="text-xs text-text-muted pt-0.5">
              {queue.length > 0 ? (
                <span>Còn <strong className="text-text font-bold">{queue.length}</strong> từ cần học/ôn</span>
              ) : (
                <span className="text-ok font-semibold">Đã hoàn thành phiên hôm nay! 🎉</span>
              )}
            </div>
          </div>

          <ProgressRing progress={todayProgressPercent} size={68}>
            <span className="text-xs font-black text-text">{todayProgressPercent}%</span>
          </ProgressRing>
        </div>

        {/* CTA Button */}
        <div>
          {queue.length > 0 ? (
            <Button size="lg" fullWidth onClick={onStartStudy} disabled={isLoading} className="text-base font-bold shadow-md">
              <BookOpen size={18} className="mr-2" />
              {STRINGS.today.startStudy} ({queue.length} từ)
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="p-3 rounded-md bg-ok/10 border border-ok/20 flex items-center gap-2 text-ok text-xs font-semibold">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>Bạn đã hoàn thành toàn bộ mục tiêu hôm nay!</span>
              </div>
              <Button size="md" variant="outline" fullWidth onClick={handleStudyMore} className="text-xs font-bold">
                <PlusCircle size={15} className="mr-1.5" />
                Học thêm 5 từ mới
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Memory Stats Summary */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-3 rounded-md bg-surface border border-border">
          <div className="text-lg font-black text-text">{stats.totalStudied}</div>
          <div className="text-[10px] text-text-muted font-medium mt-0.5">Đã nạp</div>
        </div>
        <div className="p-3 rounded-md bg-surface border border-border">
          <div className="text-lg font-black text-pos-adj">{stats.learningCount}</div>
          <div className="text-[10px] text-text-muted font-medium mt-0.5">Đang nhớ</div>
        </div>
        <div className="p-3 rounded-md bg-surface border border-border">
          <div className="text-lg font-black text-pos-n">{stats.reviewCount}</div>
          <div className="text-[10px] text-text-muted font-medium mt-0.5">Ôn tập</div>
        </div>
        <div className="p-3 rounded-md bg-surface border border-border">
          <div className="text-lg font-black text-ok">{stats.masteredCount}</div>
          <div className="text-[10px] text-text-muted font-medium mt-0.5">Đã thuộc</div>
        </div>
      </div>

      {/* RECENT STUDY HISTORY (Visual proof that history is saved!) */}
      {stats.recentList.length > 0 && (
        <div className="p-4 rounded-lg bg-surface border border-border shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text flex items-center gap-1.5">
              <Clock size={15} className="text-primary" />
              Lịch sử các từ vừa học
            </span>
            <span className="text-text-muted text-[11px]">{stats.recentList.length} từ gần nhất</span>
          </div>

          <div className="divide-y divide-border/40">
            {stats.recentList.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text">{item.entry.headword}</span>
                    <span className="text-[10px] text-text-muted font-mono">{formatTime(item.progress.lastStudied)}</span>
                  </div>
                  <div className="text-[11px] text-text-muted truncate mt-0.5">
                    {item.entry.meaningVi}
                  </div>
                </div>

                <div>
                  {item.progress.status === 'learning' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-pos-adj-bg text-pos-adj">
                      Đang học
                    </span>
                  )}
                  {item.progress.status === 'review' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary-light text-primary">
                      Ôn tập
                    </span>
                  )}
                  {item.progress.status === 'mastered' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-ok-light text-ok">
                      Đã thuộc
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cloud & Local Storage Status */}
      <div className="p-3 rounded-md bg-surface border border-border/80 flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-2">
          {settings.githubToken ? (
            <>
              <CloudCheck size={16} className="text-ok" />
              <span className="text-text font-medium">Đã kết nối tự động lưu với GitHub</span>
            </>
          ) : (
            <>
              <HardDrive size={16} className="text-primary" />
              <span>Dữ liệu đã lưu bền vững trên máy này</span>
            </>
          )}
        </div>
        <span className="text-[11px] font-semibold text-primary cursor-pointer hover:underline">
          Kiểm tra
        </span>
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
