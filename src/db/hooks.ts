import { useState, useEffect, useCallback } from 'react';
import { db, defaultSettings, UserStreak } from './index';
import { CardProgress, Entry, UserSettings } from '../types/vocab';
import { schedule, createInitialCard, Grade } from '../srs/sm2';
import { uploadToGitHubGist } from './githubSync';

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getStartOfTodayMs(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const rec = await db.settings.get('user');
      if (rec && rec.settings) {
        setSettings({ ...defaultSettings, ...rec.settings });
      } else {
        await db.settings.put({ id: 'user', settings: defaultSettings });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = async (patch: Partial<UserSettings>) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    await db.settings.put({ id: 'user', settings: updated });
  };

  return { settings, updateSettings, isLoading };
}

export function useStreak() {
  const [streak, setStreak] = useState<UserStreak>({
    id: 'current',
    count: 0,
    lastStudiedDate: '',
    freezeAvailable: true
  });

  const loadStreak = useCallback(async () => {
    const s = await db.streak.get('current');
    if (s) {
      setStreak(s);
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  const recordActivity = async () => {
    const today = getTodayDateString();
    const current = (await db.streak.get('current')) || {
      id: 'current',
      count: 0,
      lastStudiedDate: '',
      freezeAvailable: true
    };

    if (current.lastStudiedDate === today) {
      return; // Already recorded today
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    let newCount = current.count;
    if (current.lastStudiedDate === yesterdayStr) {
      newCount += 1;
    } else if (current.lastStudiedDate === '') {
      newCount = 1;
    } else {
      // Missed a day: check streak freeze
      if (current.freezeAvailable) {
        newCount += 1;
        current.freezeAvailable = false;
      } else {
        newCount = 1;
      }
    }

    const updatedStreak: UserStreak = {
      id: 'current',
      count: newCount,
      lastStudiedDate: today,
      freezeAvailable: current.freezeAvailable
    };

    await db.streak.put(updatedStreak);
    setStreak(updatedStreak);
  };

  const hasCompletedToday = streak.lastStudiedDate === getTodayDateString();

  return { streak, hasCompletedToday, recordActivity };
}

export interface RecentItem {
  entry: Entry;
  progress: CardProgress;
}

export function useStats(allEntries: Entry[]) {
  const [stats, setStats] = useState({
    totalStudied: 0,
    studiedTodayCount: 0,
    learningCount: 0,
    reviewCount: 0,
    masteredCount: 0,
    weakCount: 0,
    recentList: [] as RecentItem[]
  });

  const refreshStats = useCallback(async () => {
    const all = await db.progress.toArray();
    const startOfToday = getStartOfTodayMs();

    let learning = 0;
    let review = 0;
    let mastered = 0;
    let weak = 0;
    let studiedToday = 0;

    for (const p of all) {
      if (p.status === 'learning') learning++;
      else if (p.status === 'review') review++;
      else if (p.status === 'mastered') mastered++;
      if (p.isWeak) weak++;
      if ((p.lastStudied || 0) >= startOfToday) studiedToday++;
    }

    // Get 8 most recently studied cards
    const sorted = [...all]
      .filter((p) => p.lastStudied && p.lastStudied > 0)
      .sort((a, b) => (b.lastStudied || 0) - (a.lastStudied || 0))
      .slice(0, 8);

    const entryMap = new Map(allEntries.map((e) => [e.id, e]));
    const recentList: RecentItem[] = [];
    for (const p of sorted) {
      const entry = entryMap.get(p.entryId);
      if (entry) {
        recentList.push({ entry, progress: p });
      }
    }

    setStats({
      totalStudied: all.length,
      studiedTodayCount: studiedToday,
      learningCount: learning,
      reviewCount: review,
      masteredCount: mastered,
      weakCount: weak,
      recentList
    });
  }, [allEntries]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return { stats, refreshStats };
}

export function useStudyQueue(allEntries: Entry[]) {
  const [queue, setQueue] = useState<Entry[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, CardProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [studiedTodayCount, setStudiedTodayCount] = useState(0);
  const [extraNewCards, setExtraNewCards] = useState(0);
  const { settings, updateSettings } = useSettings();
  const { recordActivity } = useStreak();

  const loadQueue = useCallback(async () => {
    if (allEntries.length === 0) return;
    setIsLoading(true);
    try {
      const now = Date.now();
      const startOfToday = getStartOfTodayMs();
      const allProgress = await db.progress.toArray();
      const pMap = new Map<string, CardProgress>(allProgress.map((p) => [p.entryId, p]));
      setProgressMap(pMap);

      // Cards studied today
      const studiedToday = allProgress.filter((p) => (p.lastStudied || 0) >= startOfToday);
      setStudiedTodayCount(studiedToday.length);

      // 1. Cards due for review (due <= now)
      const dueCards = allProgress
        .filter((p) => p.due <= now && (p.status === 'learning' || p.status === 'review' || p.status === 'mastered'))
        .sort((a, b) => a.due - b.due)
        .slice(0, settings.maxReviewsPerDay);

      const dueEntryIds = new Set(dueCards.map((p) => p.entryId));
      const dueEntries = allEntries.filter((e) => dueEntryIds.has(e.id));

      // 2. New cards for today
      // Count new cards introduced today (reps <= 1 and lastStudied >= startOfToday)
      const newCardsIntroducedToday = studiedToday.filter((p) => p.reps <= 1).length;
      const targetNewCards = settings.newCardsPerDay + extraNewCards;
      const newQuotaRemaining = Math.max(0, targetNewCards - newCardsIntroducedToday);

      const newEntries = allEntries
        .filter((e) => !pMap.has(e.id) || pMap.get(e.id)?.status === 'new')
        .slice(0, newQuotaRemaining);

      // Interleave due cards first, then new
      const combined = [...dueEntries, ...newEntries];
      setQueue(combined);
    } finally {
      setIsLoading(false);
    }
  }, [allEntries, settings.maxReviewsPerDay, settings.newCardsPerDay, extraNewCards]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const submitGrade = async (entry: Entry, grade: Grade) => {
    const now = Date.now();
    const current = progressMap.get(entry.id) || createInitialCard(entry.id, now);
    const updated = schedule(current, grade, now);

    await db.progress.put(updated);
    setProgressMap((prev) => new Map(prev).set(entry.id, updated));
    setStudiedTodayCount((c) => c + 1);
    await recordActivity();

    // Background auto-sync to GitHub Gist if token is set
    if (settings.githubToken) {
      uploadToGitHubGist(settings.githubToken, settings.githubGistId).then((res) => {
        if (res.success && res.gistId && res.gistId !== settings.githubGistId) {
          updateSettings({ githubGistId: res.gistId });
        }
      }).catch(() => {});
    }

    return updated;
  };

  const addMoreNewCards = (count = 5) => {
    setExtraNewCards((prev) => prev + count);
  };

  return {
    queue,
    progressMap,
    isLoading,
    studiedTodayCount,
    reload: loadQueue,
    submitGrade,
    addMoreNewCards
  };
}
