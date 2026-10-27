"""Build Nahia as a self-contained static site. Python 3.11+, no dependencies."""
from pathlib import Path
from zipfile import ZipFile
import shutil
import json
root = Path(__file__).resolve().parent
out = root / 'dist'
(out / 'data').mkdir(parents=True, exist_ok=True)
for name in ['index.html','app.js','studio.js','courses.js','courses.css','learn.js','learn.css','translations.js','pdf-books.js','pdf-books.css','dictionary.js','school.js','library.js','school-library.css','styles.css','studio.css','sw.js','manifest.webmanifest','icon.svg','DATA-LICENSE.md','THIRD-PARTY.md','COPYING']:
    shutil.copy2(root / name, out / name)
for name in ['words.json','grammar.json','grammar-mn.json','courses.json','course-files.json','character-dictionary.json','mn-translations.json']:
    shutil.copy2(root / name, out / 'data' / name)
for path in sorted(root.glob('audio-*.zip')):
    with ZipFile(path) as archive:
        archive.extractall(out)
shutil.copy2(root / 'audio-audit/cmn-一下.mp3', out / 'audio/cmn-一下.mp3')
with ZipFile(root / 'studio-assets.zip') as archive:
    archive.extractall(out)
shutil.copytree(root / 'vendor', out / 'vendor', dirs_exist_ok=True)
words = json.loads((out / 'data/words.json').read_text(encoding='utf-8'))
grammar = json.loads((out / 'data/grammar.json').read_text(encoding='utf-8'))
assert len(words) == len({word['id'] for word in words}) == 11073
assert sum(map(len, grammar.values())) == 593
assert len(list((out / 'audio').glob('*.mp3'))) == 10901 + len(json.loads((root / 'audio-catalog.json').read_text(encoding='utf-8'))['assets'])
assert len(list((out / 'strokes').glob('*.json'))) >= 4400
(out / '.nojekyll').touch()
print('Nahia is ready in dist/')
