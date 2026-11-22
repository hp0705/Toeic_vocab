import fs from 'node:fs';
import path from 'node:path';
import { EntrySchema } from '../src/types/vocab';

const dataPath = path.resolve('data/vocab.json');
if (!fs.existsSync(dataPath)) {
  console.error('File data/vocab.json does not exist. Run parse-vocab first.');
  process.exit(1);
}

const raw = fs.readFileSync(dataPath, 'utf-8');
const entries = JSON.parse(raw);

if (!Array.isArray(entries) || entries.length === 0) {
  console.error('Error: entries is empty or not an array.');
  process.exit(1);
}

const seenIds = new Set<string>();
let errors = 0;

entries.forEach((entry, idx) => {
  const result = EntrySchema.safeParse(entry);
  if (!result.success) {
    console.error(`Validation failed at index ${idx} (id: ${entry.id}):`, result.error.format());
    errors++;
  }

  if (seenIds.has(entry.id)) {
    console.error(`Duplicate ID found: ${entry.id} at index ${idx}`);
    errors++;
  }
  seenIds.add(entry.id);
});

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log(`Validation passed! 100% of ${entries.length} entries are valid and IDs are unique.`);
