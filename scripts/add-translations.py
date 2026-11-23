import json
import urllib.request
import urllib.parse
import time
import os

vocab_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'vocab.json')

with open(vocab_path, 'r', encoding='utf-8') as f:
    vocab = json.load(f)

print(f"Loaded {len(vocab)} entries from vocab.json")

def translate_en_to_vi(text):
    if not text or not text.strip():
        return ""
    try:
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + urllib.parse.quote(text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            trans = ''.join([part[0] for part in data[0] if part[0]])
            return trans.strip()
    except Exception as e:
        return ""

count = 0
for i, entry in enumerate(vocab):
    if 'examples' in entry and len(entry['examples']) > 0:
        ex = entry['examples'][0]
        if not ex.get('vi'):
            en_text = ex.get('en', '')
            vi_text = translate_en_to_vi(en_text)
            if vi_text:
                ex['vi'] = vi_text
                count += 1
            else:
                # Fallback to word meaning
                ex['vi'] = f"(Nghĩa: {entry.get('meaningVi', '')})"
            if i % 50 == 0:
                print(f"Progress: {i}/{len(vocab)} entries translated...")
            time.sleep(0.04) # gentle delay

with open(vocab_path, 'w', encoding='utf-8') as f:
    json.dump(vocab, f, ensure_ascii=False, indent=2)

print(f"Translation complete! Added Vietnamese translation for {count} entries.")
