import { CardProgress } from '../types/vocab';

export type Grade = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;
const ONE_MINUTE_MS = 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function createInitialCard(entryId: string, now = Date.now()): CardProgress {
  return {
    entryId,
    due: now,
    interval: 0,
    ease: DEFAULT_EASE,
    lapses: 0,
    reps: 0,
    status: 'new'
  };
}

export function schedule(card: CardProgress, grade: Grade, now = Date.now()): CardProgress {
  const updated: CardProgress = { ...card, lastStudied: now };

  if (grade === 1) {
    // Again: reset interval, increase lapses
    updated.lapses += 1;
    updated.reps = 0;
    updated.interval = 0; // learning step
    // 10 minutes
    updated.due = now + 10 * ONE_MINUTE_MS;
    updated.ease = Math.max(MIN_EASE, updated.ease - 0.2);
    updated.status = 'learning';
    if (updated.lapses >= 4) {
      updated.isWeak = true;
    }
    return updated;
  }

  // Grade 2 (Hard), 3 (Good), 4 (Easy)
  if (grade === 2) {
    updated.ease = Math.max(MIN_EASE, updated.ease - 0.15);
  } else if (grade === 4) {
    updated.ease += 0.15;
  }

  if (card.status === 'new' || card.status === 'learning') {
    if (grade === 2) {
      // Hard: stay in learning (e.g. 12 hours)
      updated.interval = 0.5;
      updated.due = now + 12 * 60 * ONE_MINUTE_MS;
      updated.status = 'learning';
    } else if (grade === 3) {
      // Good: 1 day
      updated.interval = 1;
      updated.due = now + ONE_DAY_MS;
      updated.reps = 1;
      updated.status = 'review';
    } else {
      // Easy: 3 days
      updated.interval = 3;
      updated.due = now + 3 * ONE_DAY_MS;
      updated.reps = 1;
      updated.status = 'review';
    }
  } else {
    // In review or mastered
    updated.reps += 1;
    let nextInterval = 1;

    if (card.interval <= 1) {
      nextInterval = grade === 2 ? 1.5 : grade === 3 ? 3 : 5;
    } else {
      const factor = grade === 2 ? 1.2 : grade === 3 ? updated.ease : updated.ease * 1.3;
      nextInterval = Math.max(card.interval + 1, Math.round(card.interval * factor));
    }

    updated.interval = nextInterval;
    updated.due = now + Math.round(nextInterval * ONE_DAY_MS);
    updated.status = nextInterval >= 21 && updated.reps >= 4 ? 'mastered' : 'review';
  }

  return updated;
}

export function getNextIntervalEstimate(card: CardProgress, grade: Grade, now = Date.now()): string {
  const nextCard = schedule(card, grade, now);
  const diffMs = nextCard.due - now;

  if (diffMs <= 15 * ONE_MINUTE_MS) return '10 phút';
  if (diffMs <= 14 * 60 * ONE_MINUTE_MS) return '12 giờ';
  const days = Math.round(diffMs / ONE_DAY_MS);
  if (days <= 1) return '1 ngày';
  if (days < 30) return `${days} ngày`;
  const months = Math.round(days / 30);
  return `${months} tháng`;
}
