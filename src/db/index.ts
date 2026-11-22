import Dexie, { type EntityTable } from 'dexie';
import { CardProgress, UserSettings } from '../types/vocab';

export interface UserStreak {
  id: string; // 'current'
  count: number;
  lastStudiedDate: string; // YYYY-MM-DD
  freezeAvailable: boolean;
}

export interface SettingsRecord {
  id: string; // 'user'
  settings: UserSettings;
}

export const defaultSettings: UserSettings = {
  accent: 'us',
  speechRate: 1.0,
  autoPlayAudio: true,
  showMeaningVi: true,
  newCardsPerDay: 15,
  maxReviewsPerDay: 100,
  theme: 'system'
};

class ToeicVocabDatabase extends Dexie {
  progress!: EntityTable<CardProgress, 'entryId'>;
  settings!: EntityTable<SettingsRecord, 'id'>;
  streak!: EntityTable<UserStreak, 'id'>;

  constructor() {
    super('ToeicVocabDB');
    this.version(1).stores({
      progress: 'entryId, due, status, isWeak, lastStudied',
      settings: 'id',
      streak: 'id'
    });
  }
}

export const db = new ToeicVocabDatabase();

// Request persistent storage on modern browsers
if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}
