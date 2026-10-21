"""Build Nahia as a self-contained static site. Python 3.11+, no dependencies."""
from pathlib import Path
from zipfile import ZipFile
import shutil
import json
root = Path(__file__).resolve().parent
out = root / 'dist'
(out / 'data').mkdir(parents=True, exist_ok=True)
for name in ['index.html','app.js','styles.css','sw.js','manifest.webmanifest','icon.svg','DATA-LICENSE.md']:
    shutil.copy2(root / name, out / name)
for name in ['words.json','grammar.json']:
    shutil.copy2(root / name, out / 'data' / name)
for path in sorted(root.glob('audio-*.zip')):
    with ZipFile(path) as archive:
        archive.extractall(out)
words = json.loads((out / 'data/words.json').read_text(encoding='utf-8'))
grammar = json.loads((out / 'data/grammar.json').read_text(encoding='utf-8'))
assert len(words) == len({word['id'] for word in words}) == 11073
assert sum(map(len, grammar.values())) == 593
assert len(list((out / 'audio').glob('*.mp3'))) == 10900
(out / '.nojekyll').touch()
print('Nahia is ready in dist/')