"""Build Nahia as a self-contained static site. Python 3.11+, no dependencies."""
from pathlib import Path
from zipfile import ZipFile
import shutil
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
(out / '.nojekyll').touch()
print('Nahia is ready in dist/')
