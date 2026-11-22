import { z } from 'zod';
import { db, UserStreak } from './index';
import { CardProgressSchema, CardProgress, UserSettings } from '../types/vocab';

const BackupPayloadSchema = z.object({
  version: z.number(),
  timestamp: z.number(),
  progress: z.array(CardProgressSchema),
  settings: z.any().optional(),
  streak: z
    .object({
      id: z.string(),
      count: z.number(),
      lastStudiedDate: z.string(),
      freezeAvailable: z.boolean()
    })
    .optional()
});

export async function exportBackup(): Promise<string> {
  const progress = await db.progress.toArray();
  const settingsRecord = await db.settings.get('user');
  const streak = await db.streak.get('current');

  const payload = {
    version: 1,
    timestamp: Date.now(),
    progress,
    settings: settingsRecord?.settings,
    streak
  };

  return JSON.stringify(payload, null, 2);
}

export async function downloadBackupFile(): Promise<void> {
  const json = await exportBackup();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `toeic_vocab_backup_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(
  jsonString: string
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const raw = JSON.parse(jsonString);
    const parsed = BackupPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, count: 0, error: 'File sao lưu không đúng định dạng hoặc bị hỏng.' };
    }

    const { progress, settings, streak } = parsed.data;

    await db.transaction('rw', db.progress, db.settings, db.streak, async () => {
      // Smart merge progress: compare with existing
      const existing = await db.progress.toArray();
      const existingMap = new Map(existing.map((p) => [p.entryId, p]));

      const toPut: CardProgress[] = [];
      for (const item of progress) {
        const cur = existingMap.get(item.entryId);
        if (!cur) {
          toPut.push(item);
        } else {
          // If imported item was studied more or later, adopt it
          if ((item.lastStudied || 0) >= (cur.lastStudied || 0) || item.reps >= cur.reps) {
            toPut.push(item);
          }
        }
      }

      if (toPut.length > 0) {
        await db.progress.bulkPut(toPut);
      }

      if (settings) {
        await db.settings.put({ id: 'user', settings: settings as UserSettings });
      }

      if (streak) {
        const currentStreak = await db.streak.get('current');
        if (!currentStreak || streak.count >= currentStreak.count) {
          await db.streak.put(streak as UserStreak);
        }
      }
    });

    return { success: true, count: progress.length };
  } catch (err) {
    return { success: false, count: 0, error: String(err) };
  }
}
