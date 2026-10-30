"""Audit every shipped HSK entry and physical audio/stroke assets. No downloads.
Run: python -X utf8 audit-vocabulary.py
Optional source lists in the parent directory are compared, never changed.
"""
from pathlib import Path
import collections, csv, datetime, json, re, subprocess, zipfile

root = Path(__file__).resolve().parent
out = root / 'vocabulary-audit'
out.mkdir(exist_ok=True)
read = lambda name: json.loads((root / name).read_text('utf8'))
words, mn, overrides = read('words.json'), read('word-mn.json'), read('vocabulary-overrides.json')
definitions = read('mn-translations.json')['definitions']
# Ask the actual application resolver; duplicating its routing logic can hide bugs.
code = """import fs from 'node:fs';
import {audioFor,wordForWriting} from './pronunciation.mjs';
const w=JSON.parse(fs.readFileSync('words.json','utf8'));
console.log(JSON.stringify({words:w.map(x=>({id:x.id,...audioFor(x,w)})),
characters:[...new Set(w.flatMap(x=>[...x.hanzi]))].map(ch=>({hanzi:ch,...audioFor(wordForWriting(w,'1',ch),w)}))}));"""
routes = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code], cwd=root, encoding='utf8'))
audio = {}
for path in sorted(root.glob('audio-*.zip')):
    with zipfile.ZipFile(path) as z:
        assert z.testzip() is None, path.name
        for name in z.namelist():
            if not name.endswith('.mp3'):
                continue
            data = z.read(name)
            assert name not in audio, name
            assert len(data) > 128 and (data[:3] == b'ID3' or data[0] == 255 and data[1] & 224 == 224), name
            audio[name] = len(data)
audio['audio/cmn-一下.mp3'] = (root / 'audio-audit/cmn-一下.mp3').stat().st_size
by_id = {r['id']: r for r in routes['words']}
errors, rows = [], []
assert len({w['id'] for w in words}) == len(words), 'Duplicate word IDs'
with zipfile.ZipFile(root / 'studio-assets.zip') as z:
    strokes = set(z.namelist())
    for char in sorted(set(''.join(w['hanzi'] for w in words))):
        name = f'strokes/{ord(char):x}.json'
        if name not in strokes:
            errors.append({'hanzi': char, 'issue': 'missing-strokes'})
        else:
            s = json.loads(z.read(name))
            if not s.get('strokes') or len(s['strokes']) != len(s.get('medians', [])):
                errors.append({'hanzi': char, 'issue': 'invalid-strokes'})
for w in words:
    problems = [f'missing-{key}' for key in ['hanzi', 'traditional', 'pinyin', 'meaning'] if not w.get(key, '').strip()]
    text = overrides.get(w['id']) or mn.get(w['id'], '')
    if not re.search('[А-Яа-яӨөҮүЁё]', text):
        problems.append('missing-mongolian')
    route = by_id[w['id']]
    if route.get('file') not in audio:
        problems.append('missing-audio')
    if not definitions.get(w['meaning'], '').strip():
        problems.append('missing-dictionary-translation')
    errors.extend({'id': w['id'], 'issue': p} for p in problems)
    rows.append([w['id'], w['level'], w['hanzi'], w['pinyin'], text, w['meaning'], route.get('file', ''), route.get('text', ''), route.get('kind', ''), ';'.join(problems) or 'OK'])
for r in routes['characters']:
    if r.get('file') not in audio:
        errors.append({'hanzi': r['hanzi'], 'issue': 'missing-character-audio'})
with (out / 'all-words.csv').open('w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['ID', 'HSK', 'Ханз', 'Пиньинь', 'Монгол', 'English', 'Аудио файл', 'Аудиод хэлэх текст', 'Аудионы төрөл', 'Шалгалт'])
    writer.writerows(rows)
source_report = {}
source = root.parent / 'New HSK (2025)/hsk_all_words.json'
if source.exists():
    for key, values in json.loads(source.read_text('utf8')).items():
        actual = {w['hanzi'] for w in words if 'hsk' + w['level'] == key}
        missing = sorted(set(values) - actual)
        source_report[key] = {'sourceEntries': len(values), 'missing': missing, 'extra': sorted(actual - set(values))}
        errors.extend({'id': key + ':' + h, 'issue': 'missing-source-word'} for h in missing)
# Another edition is a separate corpus, not an incomplete translation record.
comparison = []
existing = {w['hanzi'] for w in words}
for p in sorted((root.parent / 'New HSK (2021)/HSK List').glob('*.txt')):
    for h in sorted(set(p.read_text('utf-8-sig').splitlines()) - existing):
        if h.strip():
            comparison.append([p.stem, h])
with (out / '2021-edition-differences.csv').open('w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f); writer.writerow(['2021 эхийн түвшин', '2025 санд байхгүй үг']); writer.writerows(comparison)
summary = dict(date=datetime.date.today().isoformat(), entries=len(words), levels=dict(collections.Counter(w['level'] for w in words)),
               mongolianCovered=len(rows)-sum('missing-mongolian' in r[-1] for r in rows), englishCovered=sum(bool(w.get('meaning')) for w in words),
               pinyinCovered=sum(bool(w.get('pinyin')) for w in words), audioFiles=len(audio),
               wordAudioCovered=sum(r.get('file') in audio for r in routes['words']), characterAudioCovered=sum(r.get('file') in audio for r in routes['characters']),
               contextualWordAudio=sum(r.get('kind') == 'example' for r in routes['words']), manualCorrections=len(overrides),
               source2025=source_report, alternate2021Entries=len(comparison), alternate2021UniqueWords=len({r[1] for r in comparison}),
               errors=errors, allRecordingsListeningVerified=False, allMachineTranslationsHumanReviewed=False)
(out / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2)+'\n', 'utf8')
print(json.dumps(summary, ensure_ascii=True))
raise SystemExit(bool(errors))
