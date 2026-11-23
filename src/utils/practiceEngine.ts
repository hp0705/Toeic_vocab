import { Entry } from '../types/vocab';
import { formatPos } from './pos';

export type PracticeCategory = 'learning' | 'review' | 'mastered' | 'all';

export interface PracticeQuestion {
  id: string;
  entryId: string;
  headword: string;
  kind: 'preposition' | 'vocab';
  prompt: string;
  sentenceWithBlank: string;
  fullSentenceEn: string;
  fullSentenceVi: string;
  correctAnswer: string;
  options: string[];
  explanation: {
    headword: string;
    meaningVi: string;
    posLabel: string;
    pattern?: string;
    mnemonic?: string;
  };
}

const COMMON_PREPOSITIONS = ['for', 'to', 'with', 'on', 'in', 'of', 'from', 'about', 'into', 'at', 'by'];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a single question from an Entry
 */
export function generateQuestion(entry: Entry, allEntries: Entry[]): PracticeQuestion {
  const example = entry.examples && entry.examples.length > 0 ? entry.examples[0] : null;
  const sentenceEn = example?.en || `${entry.headword} is an important TOEIC word.`;
  const sentenceVi = example?.vi || `(Nghĩa: ${entry.meaningVi})`;

  const posInfo = entry.pos && entry.pos.length > 0 ? formatPos(entry.pos[0]) : { label: 'Từ vựng' };

  // 1. Try to generate a PREPOSITION question if entry has fixedPrep
  if (entry.fixedPrep && entry.fixedPrep.length > 0) {
    const isNoPrep = entry.fixedPrep.includes('none');
    if (isNoPrep) {
      // Transitive verb: no preposition trap
      // Try to find the headword in the sentence and insert a blank after it
      const headRegex = new RegExp(`\\b(${entry.headword}[a-z]*)\\s+`, 'i');
      if (headRegex.test(sentenceEn)) {
        const sentenceWithBlank = sentenceEn.replace(headRegex, '$1 _____ ');
        const wrongPreps = shuffleArray(['of', 'to', 'for', 'with', 'about', 'at']).slice(0, 3);
        const options = shuffleArray(['[Không cần giới từ]', ...wrongPreps]);
        return {
          id: `q_prep_${entry.id}`,
          entryId: entry.id,
          headword: entry.headword,
          kind: 'preposition',
          prompt: 'Chọn giới từ thích hợp điền vào chỗ trống (Lưu ý ngoại động từ):',
          sentenceWithBlank,
          fullSentenceEn: sentenceEn,
          fullSentenceVi: sentenceVi,
          correctAnswer: '[Không cần giới từ]',
          options,
          explanation: {
            headword: entry.headword,
            meaningVi: entry.meaningVi,
            posLabel: posInfo.label,
            pattern: 'Ngoại động từ: Đi trực tiếp với Tân ngữ, KHÔNG dùng giới từ.',
            mnemonic: entry.mnemonic
          }
        };
      }
    } else {
      // Word has real fixed preposition (e.g. for, with, to, on, in, from, of)
      const targetPrep = entry.fixedPrep[0].toLowerCase();
      // Look for the preposition in the sentence
      const prepRegex = new RegExp(`\\b${targetPrep}\\b`, 'i');
      if (prepRegex.test(sentenceEn)) {
        const sentenceWithBlank = sentenceEn.replace(prepRegex, '_____');
        const wrongPreps = shuffleArray(COMMON_PREPOSITIONS.filter((p) => p !== targetPrep)).slice(0, 3);
        const options = shuffleArray([targetPrep, ...wrongPreps]);
        return {
          id: `q_prep_${entry.id}`,
          entryId: entry.id,
          headword: entry.headword,
          kind: 'preposition',
          prompt: 'Chọn giới từ thích hợp điền vào chỗ trống:',
          sentenceWithBlank,
          fullSentenceEn: sentenceEn,
          fullSentenceVi: sentenceVi,
          correctAnswer: targetPrep,
          options,
          explanation: {
            headword: entry.headword,
            meaningVi: entry.meaningVi,
            posLabel: posInfo.label,
            pattern: entry.patterns && entry.patterns.length > 0 ? entry.patterns[0] : `Đi với giới từ: + ${targetPrep.toUpperCase()}`,
            mnemonic: entry.mnemonic
          }
        };
      }
    }
  }

  // 2. Default: VOCABULARY IN CONTEXT fill-in-the-blank question
  // Attempt to mask the word or root in the sentence
  let sentenceWithBlank = sentenceEn;
  const escapedHead = entry.headword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const headRegex = new RegExp(`\\b${escapedHead}[a-z]*\\b`, 'i');

  if (headRegex.test(sentenceEn)) {
    sentenceWithBlank = sentenceEn.replace(headRegex, '__________');
  } else {
    // If not found directly, mask first word or fall back to trailing blank
    const firstWord = entry.headword.split(' ')[0];
    const firstRegex = new RegExp(`\\b${firstWord}[a-z]*\\b`, 'i');
    if (firstRegex.test(sentenceEn)) {
      sentenceWithBlank = sentenceEn.replace(firstRegex, '__________');
    } else {
      sentenceWithBlank = `__________: "${sentenceEn}"`;
    }
  }

  // Generate 3 distractors of same POS if possible
  const samePosEntries = allEntries.filter(
    (e) => e.id !== entry.id && e.pos && entry.pos && e.pos[0] === entry.pos[0]
  );
  const pool = samePosEntries.length >= 3 ? samePosEntries : allEntries.filter((e) => e.id !== entry.id);
  const shuffledPool = shuffleArray(pool);
  const distractors = shuffledPool.slice(0, 3).map((e) => e.headword);

  const options = shuffleArray([entry.headword, ...distractors]);

  return {
    id: `q_vocab_${entry.id}`,
    entryId: entry.id,
    headword: entry.headword,
    kind: 'vocab',
    prompt: 'Chọn từ vựng thích hợp nhất để hoàn thành câu:',
    sentenceWithBlank,
    fullSentenceEn: sentenceEn,
    fullSentenceVi: sentenceVi,
    correctAnswer: entry.headword,
    options,
    explanation: {
      headword: entry.headword,
      meaningVi: entry.meaningVi,
      posLabel: posInfo.label,
      pattern: entry.patterns && entry.patterns.length > 0 ? entry.patterns[0] : undefined,
      mnemonic: entry.mnemonic
    }
  };
}

/**
 * Build a random session of distinct questions
 */
export function buildPracticeSession(
  entriesToPractice: Entry[],
  allEntries: Entry[],
  count: number
): PracticeQuestion[] {
  // Shuffle words to ensure random selection if there are more words than requested
  const shuffledWords = shuffleArray(entriesToPractice);
  const selectedWords = shuffledWords.slice(0, count);

  // Generate exactly 1 question per word (each word tested exactly once)
  return selectedWords.map((entry) => generateQuestion(entry, allEntries));
}
