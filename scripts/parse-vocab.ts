import fs from 'node:fs';
import path from 'node:path';
import { Entry, EntryType, WordFamily } from '../src/types/vocab';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parseMarkdownTable(lines: string[]): Array<Record<string, string>> {
  const tableLines = lines.filter((l) => l.trim().startsWith('|'));
  if (tableLines.length < 2) return [];

  // Parse header
  const headers = tableLines[0]
    .split('|')
    .slice(1, -1)
    .map((h) => h.trim());

  // Skip separator line (tableLines[1])
  const rows: Array<Record<string, string>> = [];
  for (let i = 2; i < tableLines.length; i++) {
    const cells = tableLines[i]
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length === 0 || cells.every((c) => c === '')) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

export function parseVocabMarkdown(content: string): Entry[] {
  const lines = content.split(/\r?\n/);
  const entries: Entry[] = [];

  let currentSectionNo = 0;
  let currentSectionTitle = '';
  let currentSubsectionTitle = '';
  let inWordFamily = false;
  let wordFamilyGroup = 0;

  let currentTableLines: string[] = [];

  const flushTable = () => {
    if (currentTableLines.length === 0) return;
    const rows = parseMarkdownTable(currentTableLines);
    currentTableLines = [];

    if (inWordFamily) {
      rows.forEach((row) => {
        const srcNo = parseInt(row['STT'] || '0', 10);
        const headword = row['Từ gốc'] || '';
        if (!headword) return;

        const meaningVi = row['Nghĩa'] || '';
        const exampleEn = row['Ví dụ điền đúng dạng'] || '';

        const wf: WordFamily = {};
        if (wordFamilyGroup === 4) {
          wf.person = (row['Người làm'] || '').split(/[\/,]/).map((s) => s.trim()).filter((s) => s && s !== '—');
          const receiver = (row['Người nhận (-ee)'] || '').split(/[\/,]/).map((s) => s.trim()).filter((s) => s && s !== '—');
          if (receiver.length > 0) wf.person.push(...receiver);
          wf.action = (row['Danh từ chỉ hành động/sự việc'] || '').split(/[\/,]/).map((s) => s.trim()).filter((s) => s && s !== '—');
        } else {
          wf.n = (row['Danh từ (N)'] || '').split(/[\/,]/).map((s) => s.trim()).filter((s) => s && s !== '—');
          wf.v = (row['Động từ (V)'] || '').split(/[\/,]/).map((s) => s.trim()).filter((s) => s && s !== '—');
          wf.adj = (row['Tính từ (Adj)'] || '').split(/[\/,]/).map((s) => s.trim()).filter((s) => s && s !== '—');
          wf.adv = (row['Trạng từ (Adv)'] || '').split(/[\/,]/).map((s) => s.trim()).filter((s) => s && s !== '—');
        }

        const id = `wf_${slugify(headword)}_${srcNo}`;
        entries.push({
          id,
          srcNo,
          sectionNo: 100 + wordFamilyGroup,
          sectionTitle: currentSectionTitle,
          type: 'wordfamily',
          headword,
          meaningVi,
          wordFamily: wf,
          examples: exampleEn ? [{ kind: 'toeic', en: exampleEn }] : [],
          partFocus: ['P5'],
          level: 'core',
          reviewed: true
        });
      });
      return;
    }

    // Determine type from sectionNo and subsection
    let entryType: EntryType = 'word';
    if (currentSectionNo === 11) entryType = 'collocation';
    else if (currentSectionNo === 16 || currentSectionNo === 27) entryType = 'phrasal';
    else if (currentSectionNo === 15 || currentSectionNo === 17 || currentSectionNo === 22) entryType = 'phrase';
    else if (currentSectionNo === 19) entryType = 'confusable';
    else if (currentSectionNo === 20) entryType = 'paraphrase';
    else if (currentSectionNo === 21) entryType = 'polysemy';
    else if (currentSectionNo === 23) {
      if (currentSubsectionTitle.includes('23.1')) entryType = 'prep_contrast';
      else entryType = 'prep_pattern';
    } else if (currentSectionNo === 28) entryType = 'quantifier';

    rows.forEach((row) => {
      const srcNo = parseInt(row['STT'] || '0', 10);
      const rawWord = row['Từ'] || row['Từ gốc'] || '';
      if (!rawWord) return;

      const meaningVi = row['Nghĩa'] || row['Nghĩa trong TOEIC'] || '';
      const mnemonic = row['Mẹo nhớ'] || undefined;
      const patternsCol = row['Dùng với'] || undefined;
      const exampleEn = row['Câu ví dụ'] || '';

      const patterns: string[] = [];
      if (patternsCol) {
        patterns.push(...patternsCol.split(';').map((p) => p.trim()).filter(Boolean));
      }

      // Handle split items for confusable (e.g. "affect / effect")
      if (entryType === 'confusable' && rawWord.includes('/')) {
        const words = rawWord.split('/').map((w) => w.trim());
        words.forEach((w, idx) => {
          const others = words.filter((_, i) => i !== idx);
          const id = `conf_${slugify(w)}_${srcNo}`;
          entries.push({
            id,
            srcNo,
            sectionNo: currentSectionNo,
            sectionTitle: currentSectionTitle,
            type: 'confusable',
            headword: w,
            meaningVi: `(Cặp dễ nhầm với ${others.join(', ')}) ${meaningVi}`,
            confusableWith: others,
            mnemonic,
            patterns: patterns.length > 0 ? patterns : undefined,
            examples: exampleEn ? [{ kind: 'toeic', en: exampleEn }] : [],
            partFocus: ['P5', 'P6'],
            level: 'core',
            reviewed: true
          });
        });
        return;
      }

      // Handle split items for paraphrase (e.g. "postpone = delay = put off")
      if (entryType === 'paraphrase' && rawWord.includes('=')) {
        const words = rawWord.split('=').map((w) => w.trim());
        words.forEach((w, idx) => {
          const others = words.filter((_, i) => i !== idx);
          const id = `para_${slugify(w)}_${srcNo}`;
          entries.push({
            id,
            srcNo,
            sectionNo: currentSectionNo,
            sectionTitle: currentSectionTitle,
            type: 'paraphrase',
            headword: w,
            meaningVi: `(Đồng nghĩa với ${others.join(', ')}) ${meaningVi}`,
            synonyms: others,
            mnemonic,
            patterns: patterns.length > 0 ? patterns : undefined,
            examples: exampleEn ? [{ kind: 'toeic', en: exampleEn }] : [],
            partFocus: ['P7'],
            level: 'core',
            reviewed: true
          });
        });
        return;
      }

      const idPrefix = entryType === 'word' ? 'w' : entryType.slice(0, 4);
      const id = `${idPrefix}_${slugify(rawWord)}_${srcNo}`;

      // Extract POS hints if available in word or meaning
      const pos: string[] = [];
      if (rawWord.endsWith(' (v)') || meaningVi.includes('(v)')) pos.push('v');
      if (rawWord.endsWith(' (n)') || meaningVi.includes('(n)')) pos.push('n');
      if (rawWord.endsWith(' (adj)') || meaningVi.includes('(adj)')) pos.push('adj');
      if (rawWord.endsWith(' (adv)') || meaningVi.includes('(adv)')) pos.push('adv');

      const cleanedHeadword = rawWord.replace(/\s*\((v|n|adj|adv)\)\s*/g, '').trim();

      const examples = exampleEn ? [{ kind: 'toeic' as const, en: exampleEn }] : [];

      entries.push({
        id,
        srcNo,
        sectionNo: currentSectionNo,
        sectionTitle: currentSectionTitle,
        type: entryType,
        headword: cleanedHeadword,
        pos: pos.length > 0 ? pos : undefined,
        meaningVi,
        patterns: patterns.length > 0 ? patterns : undefined,
        mnemonic,
        examples,
        topic: currentSectionTitle.replace(/^\d+\.\s*/, '').replace(/\s*\(.*?\)/, '').trim(),
        partFocus: currentSectionNo >= 21 ? ['P5', 'P7'] : ['P5', 'P6', 'P7'],
        level: 'core',
        reviewed: true
      });
    });
  };

  for (const line of lines) {
    if (line.startsWith('## Nhóm ')) {
      flushTable();
      inWordFamily = true;
      currentSectionTitle = line.replace('##', '').trim();
      const match = line.match(/Nhóm\s+(\d+)/);
      wordFamilyGroup = match ? parseInt(match[1], 10) : 1;
      continue;
    }

    if (line.startsWith('## ') && !inWordFamily) {
      flushTable();
      const match = line.match(/##\s+(\d+)\.\s*(.*)/);
      if (match) {
        currentSectionNo = parseInt(match[1], 10);
        currentSectionTitle = line.replace('##', '').trim();
        currentSubsectionTitle = '';
      }
      continue;
    }

    if (line.startsWith('### ')) {
      flushTable();
      currentSubsectionTitle = line.replace('###', '').trim();
      continue;
    }

    if (line.trim().startsWith('|')) {
      currentTableLines.push(line);
    } else if (currentTableLines.length > 0) {
      flushTable();
    }
  }

  flushTable();
  return entries;
}

// Main execution if run directly
const contentPath = path.resolve('content/toeic_vocab.md');
if (fs.existsSync(contentPath)) {
  const content = fs.readFileSync(contentPath, 'utf-8');
  const entries = parseVocabMarkdown(content);
  const outPath = path.resolve('data/vocab.json');
  fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf-8');
  console.log(`Parsed ${entries.length} entries successfully to ${outPath}`);
}
