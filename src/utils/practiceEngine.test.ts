import { describe, it, expect } from 'vitest';
import { generateQuestion, buildPracticeSession } from './practiceEngine';
import { Entry } from '../types/vocab';

const mockEntries: Entry[] = [
  {
    id: 'w_shipment_1',
    srcNo: 1,
    sectionNo: 1,
    sectionTitle: '1. LOGISTICS',
    type: 'word',
    headword: 'shipment',
    meaningVi: 'lô hàng',
    pos: ['n'],
    examples: [{ kind: 'toeic', en: 'The shipment arrived a day late.', vi: 'Lô hàng đã đến trễ một ngày.' }],
    level: 'core',
    reviewed: true
  },
  {
    id: 'w_responsible_2',
    srcNo: 2,
    sectionNo: 23,
    sectionTitle: '23. PREPOSITIONS',
    type: 'word',
    headword: 'responsible',
    meaningVi: 'chịu trách nhiệm',
    pos: ['adj'],
    fixedPrep: ['for'],
    patterns: ['be responsible for + N/V-ing'],
    examples: [{ kind: 'toeic', en: 'She is responsible for the budget.', vi: 'Cô ấy chịu trách nhiệm về ngân sách.' }],
    level: 'core',
    reviewed: true
  },
  {
    id: 'w_approve_3',
    srcNo: 3,
    sectionNo: 3,
    sectionTitle: '3. OFFICE',
    type: 'word',
    headword: 'approve',
    meaningVi: 'phê duyệt',
    pos: ['v'],
    fixedPrep: ['none'],
    examples: [{ kind: 'toeic', en: 'The manager will approve the request.', vi: 'Người quản lý sẽ phê duyệt yêu cầu.' }],
    level: 'core',
    reviewed: true
  },
  {
    id: 'w_depend_4',
    srcNo: 4,
    sectionNo: 23,
    sectionTitle: '23. PREPOSITIONS',
    type: 'word',
    headword: 'depend',
    meaningVi: 'phụ thuộc',
    pos: ['v'],
    fixedPrep: ['on'],
    patterns: ['depend on + N'],
    examples: [{ kind: 'toeic', en: 'The price depends on the size.', vi: 'Giá cả phụ thuộc vào kích thước.' }],
    level: 'core',
    reviewed: true
  }
];

describe('practiceEngine', () => {
  it('generates a preposition question when fixedPrep exists', () => {
    const q = generateQuestion(mockEntries[1], mockEntries);
    expect(q.kind).toBe('preposition');
    expect(q.correctAnswer).toBe('for');
    expect(q.sentenceWithBlank).toContain('_____');
    expect(q.options).toContain('for');
    expect(q.options.length).toBe(4);
    expect(q.fullSentenceVi).toBe('Cô ấy chịu trách nhiệm về ngân sách.');
  });

  it('generates a no-preposition question for transitive verb traps', () => {
    const q = generateQuestion(mockEntries[2], mockEntries);
    expect(q.kind).toBe('preposition');
    expect(q.correctAnswer).toBe('[Không cần giới từ]');
    expect(q.options).toContain('[Không cần giới từ]');
    expect(q.options.length).toBe(4);
  });

  it('generates a vocabulary context question when no fixedPrep', () => {
    const q = generateQuestion(mockEntries[0], mockEntries);
    expect(q.kind).toBe('vocab');
    expect(q.correctAnswer).toBe('shipment');
    expect(q.sentenceWithBlank).toContain('__________');
    expect(q.options).toContain('shipment');
    expect(q.options.length).toBe(4);
  });

  it('builds a practice session with unique words (each word tested exactly once)', () => {
    const session = buildPracticeSession(mockEntries, mockEntries, 3);
    expect(session.length).toBe(3);
    const testedHeadwords = session.map((s) => s.headword);
    const uniqueHeadwords = new Set(testedHeadwords);
    expect(uniqueHeadwords.size).toBe(testedHeadwords.length);
  });
});
