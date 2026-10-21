"""Extract the supplied Anki-xiehanzi assets; never changes the source project."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parent
source = root.parent.parent / 'Anki-xiehanzi-main'
data = source / 'static/data'
words = json.loads((root / 'words.json').read_text(encoding='utf-8'))
rich = {}
for level in ['1','2','3','4','5','6','7-9']:
    for row in json.loads((data / f'hsk/new-{level}.json').read_text(encoding='utf-8')):
        rich.setdefault(row['s'], {k: row[k] for k in ['s','t','p','y','z','m','o','c','f','r'] if k in row})
etymology = json.loads((data / 'dict/etymology.json').read_text(encoding='utf-8'))
radicals = json.loads((data / 'radicals/index.json').read_text(encoding='utf-8'))
strokes = json.loads((data / 'hanzi-writer-data.json').read_text(encoding='utf-8'))
chars = set(''.join(w['hanzi'] + w.get('traditional','') for w in words))
chars.update(''.join(r['char'] + ''.join(r.get('variants',[])) for r in radicals['radicals']))
available = sorted(chars.intersection(strokes))
with ZipFile(root / 'studio-assets.zip','w',ZIP_DEFLATED) as archive:
    for char in available:
        archive.writestr(f'strokes/{ord(char):x}.json', json.dumps(strokes[char],ensure_ascii=False,separators=(',',':')))
    archive.writestr('data/learning.json',json.dumps({'words':rich,'etymology':etymology,'radicals':radicals['radicals'],'available':available},ensure_ascii=False,separators=(',',':')))
    archive.write(data / '_hanzi-writer.min.js','vendor/hanzi-writer.js')
    archive.write(source / 'ARPHICPL.TXT','licenses/ARPHICPL.TXT')
    archive.write(source / 'License.md','licenses/Anki-xiehanzi.md')
    archive.write(source.parent / 'Anki-Android-main/COPYING','licenses/AnkiDroid-GPL-3.0.txt')
print(f'Prepared {len(available)} characters, {len(rich)} dictionary words, {len(radicals["radicals"])} radicals; archive {round((root/"studio-assets.zip").stat().st_size/1024/1024,1)} MB')
