import React, { useState, useEffect, useCallback } from 'react';
import { Entry } from '../types/vocab';
import { useStudyQueue, useSettings } from '../db/hooks';
import { getNextIntervalEstimate, createInitialCard, Grade } from '../srs/sm2';
import { WordCard } from '../components/card/WordCard';
import { Button } from '../components/ui/Button';
import { STRINGS } from '../constants/strings';
import { speak } from '../audio/speak';
import { uploadToGitHubGist } from '../db/githubSync';
import { X, CheckCircle2, RotateCcw, CloudCheck } from 'lucide-react';

export interface StudySessionProps {
  allEntries: Entry[];
  onFinish: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({ allEntries, onFinish }) => {
  const { queue, progressMap, submitGrade, isLoading } = useStudyQueue(allEntries);
  const { settings, updateSettings } = useSettings();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState<Entry[]>([]);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [cloudSynced, setCloudSynced] = useState<boolean | null>(null);

  // Initialize session cards once queue loads
  useEffect(() => {
    if (queue.length > 0 && sessionCards.length === 0) {
      setSessionCards([...queue]);
    }
  }, [queue, sessionCards.length]);

  // Sync to GitHub on session finish if token is available
  useEffect(() => {
    if (sessionCards.length > 0 && currentIndex >= sessionCards.length && reviewedCount > 0 && settings.githubToken) {
      uploadToGitHubGist(settings.githubToken, settings.githubGistId).then((res) => {
        if (res.success && res.gistId) {
          setCloudSynced(true);
          if (res.gistId !== settings.githubGistId) {
            updateSettings({ githubGistId: res.gistId });
          }
        } else {
          setCloudSynced(false);
        }
      });
    }
  }, [currentIndex, sessionCards.length, reviewedCount, settings.githubToken, settings.githubGistId, updateSettings]);

  const currentEntry = sessionCards[currentIndex];

  // Auto-play audio when new card appears if enabled
  useEffect(() => {
    if (currentEntry && !isFlipped && settings.autoPlayAudio) {
      speak(currentEntry.headword, {
        accent: settings.accent,
        rate: settings.speechRate
      });
    }
  }, [currentIndex, currentEntry, isFlipped, settings.accent, settings.autoPlayAudio, settings.speechRate]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleGrade = useCallback(
    async (grade: Grade) => {
      if (!currentEntry) return;

      await submitGrade(currentEntry, grade);
      setReviewedCount((c) => c + 1);

      // If Again (Grade 1), re-append to the end of this session queue
      if (grade === 1) {
        setSessionCards((prev) => [...prev, currentEntry]);
      }

      setIsFlipped(false);
      setCurrentIndex((i) => i + 1);
    },
    [currentEntry, submitGrade]
  );

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleGrade(1);
        else if (e.key === '2') handleGrade(2);
        else if (e.key === '3') handleGrade(3);
        else if (e.key === '4') handleGrade(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleGrade, isFlipped]);

  if (isLoading || (sessionCards.length === 0 && !currentEntry)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <p className="text-sm text-text-muted">Đang tải thẻ học...</p>
      </div>
    );
  }

  // Session Completed Screen
  if (currentIndex >= sessionCards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 space-y-6 max-w-sm mx-auto">
        <div className="p-4 rounded-full bg-ok/10 text-ok">
          <CheckCircle2 size={54} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text mb-1">{STRINGS.study.sessionFinished}</h2>
          <p className="text-sm text-text-muted">{STRINGS.study.cardsReviewed(reviewedCount)}</p>
        </div>

        {cloudSynced === true && (
          <div className="p-2.5 rounded-md bg-ok-light border border-ok/30 text-ok text-xs font-semibold flex items-center justify-center gap-1.5 animate-in fade-in">
            <CloudCheck size={16} />
            <span>Đã tự động lưu lên GitHub của bạn!</span>
          </div>
        )}

        {cloudSynced === false && (
          <div className="p-2.5 rounded-md bg-bad-light border border-bad/30 text-bad text-xs font-semibold flex items-center justify-center gap-1.5">
            <span>Tiến độ đã lưu trên máy, nhưng chưa đồng bộ GitHub. Hãy kiểm tra lại Token ở Cài đặt.</span>
          </div>
        )}
        <div className="w-full space-y-3">
          <Button fullWidth size="lg" onClick={onFinish}>
            {STRINGS.study.backToHome}
          </Button>
        </div>
      </div>
    );
  }

  const currentCardProgress =
    progressMap.get(currentEntry.id) || createInitialCard(currentEntry.id);

  const progressPercent = Math.round((currentIndex / sessionCards.length) * 100);

  return (
    <div className="flex flex-col justify-between min-h-[85vh] max-w-lg mx-auto px-4 pb-24 pt-2">
      {/* Top Session Progress Bar & Controls */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <button
            onClick={onFinish}
            className="p-1 rounded-md hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Thoát phiên học"
          >
            <X size={20} />
          </button>
          <span className="font-semibold text-text">
            {currentIndex + 1} / {sessionCards.length}
          </span>
          <span className="text-text-muted">{progressPercent}%</span>
        </div>
        <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="flex-1 flex items-center justify-center my-auto">
        <WordCard entry={currentEntry} isFlipped={isFlipped} onFlip={handleFlip} />
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="mt-4 pt-3 border-t border-border/50">
        {!isFlipped ? (
          <Button
            size="lg"
            fullWidth
            onClick={handleFlip}
            className="text-base font-bold shadow-md h-12"
          >
            <RotateCcw size={18} className="mr-2" />
            {STRINGS.study.flipCard} (Space)
          </Button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleGrade(1)}
              className="flex flex-col items-center justify-center p-2 rounded-md bg-bad/10 text-bad hover:bg-bad/20 active:scale-95 transition-all cursor-pointer min-h-[54px]"
            >
              <span className="text-xs font-bold">{STRINGS.study.again}</span>
              <span className="text-[10px] text-text-muted font-medium mt-0.5">
                {getNextIntervalEstimate(currentCardProgress, 1)}
              </span>
            </button>

            <button
              onClick={() => handleGrade(2)}
              className="flex flex-col items-center justify-center p-2 rounded-md bg-surface-2 text-text hover:bg-border active:scale-95 transition-all cursor-pointer min-h-[54px]"
            >
              <span className="text-xs font-bold">{STRINGS.study.hard}</span>
              <span className="text-[10px] text-text-muted font-medium mt-0.5">
                {getNextIntervalEstimate(currentCardProgress, 2)}
              </span>
            </button>

            <button
              onClick={() => handleGrade(3)}
              className="flex flex-col items-center justify-center p-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all cursor-pointer min-h-[54px]"
            >
              <span className="text-xs font-bold">{STRINGS.study.good}</span>
              <span className="text-[10px] text-text-muted font-medium mt-0.5">
                {getNextIntervalEstimate(currentCardProgress, 3)}
              </span>
            </button>

            <button
              onClick={() => handleGrade(4)}
              className="flex flex-col items-center justify-center p-2 rounded-md bg-ok/10 text-ok hover:bg-ok/20 active:scale-95 transition-all cursor-pointer min-h-[54px]"
            >
              <span className="text-xs font-bold">{STRINGS.study.easy}</span>
              <span className="text-[10px] text-text-muted font-medium mt-0.5">
                {getNextIntervalEstimate(currentCardProgress, 4)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
