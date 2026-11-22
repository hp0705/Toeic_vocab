import { z } from 'zod';

export const EntryTypeSchema = z.enum([
  'word',
  'collocation',
  'phrasal',
  'phrase',
  'prep_pattern',
  'prep_contrast',
  'confusable',
  'paraphrase',
  'polysemy',
  'quantifier',
  'wordfamily'
]);

export type EntryType = z.infer<typeof EntryTypeSchema>;

export const SpecialSenseSchema = z.object({
  pos: z.string().optional(),
  meaningVi: z.string(),
  note: z.string().optional()
});
export type SpecialSense = z.infer<typeof SpecialSenseSchema>;

export const ExampleSchema = z.object({
  kind: z.enum(['toeic', 'daily']),
  en: z.string(),
  vi: z.string().optional()
});
export type Example = z.infer<typeof ExampleSchema>;

export const WordFamilySchema = z.object({
  n: z.array(z.string()).optional(),
  v: z.array(z.string()).optional(),
  adj: z.array(z.string()).optional(),
  adv: z.array(z.string()).optional(),
  person: z.array(z.string()).optional(),
  action: z.array(z.string()).optional()
});
export type WordFamily = z.infer<typeof WordFamilySchema>;

export const EntrySchema = z.object({
  id: z.string(),
  srcNo: z.number(),
  sectionNo: z.number(),
  sectionTitle: z.string(),
  type: EntryTypeSchema,
  headword: z.string(),
  pos: z.array(z.string()).optional(),
  ipa: z.object({
    us: z.string().optional(),
    uk: z.string().optional()
  }).optional(),
  meaningVi: z.string(),
  meaningEn: z.string().optional(),
  specialSenses: z.array(SpecialSenseSchema).optional(),
  patterns: z.array(z.string()).optional(),
  collocations: z.array(z.string()).optional(),
  examples: z.array(ExampleSchema),
  mnemonic: z.string().optional(),
  wordFamily: WordFamilySchema.optional(),
  confusableWith: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  topic: z.string().optional(),
  partFocus: z.array(z.string()).optional(),
  level: z.enum(['core', 'extra']).default('core'),
  reviewed: z.boolean().default(true)
});

export type Entry = z.infer<typeof EntrySchema>;

export const CardProgressSchema = z.object({
  entryId: z.string(),
  due: z.number(), // timestamp ms
  interval: z.number(), // days
  ease: z.number(), // factor e.g. 2.5
  lapses: z.number(),
  reps: z.number(),
  status: z.enum(['new', 'learning', 'review', 'mastered']),
  lastStudied: z.number().optional(),
  isWeak: z.boolean().optional(),
  notes: z.string().optional()
});

export type CardProgress = z.infer<typeof CardProgressSchema>;

export interface UserSettings {
  accent: 'us' | 'uk';
  speechRate: 0.6 | 0.8 | 1.0;
  autoPlayAudio: boolean;
  showMeaningVi: boolean;
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  theme: 'light' | 'dark' | 'system';
  lastBackupPrompt?: number;
}
