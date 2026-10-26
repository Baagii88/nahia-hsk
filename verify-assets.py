"""Validate supplemental audio checksums/decoding and portable book associations."""
import concurrent.futures, hashlib, json, subprocess
from pathlib import Path
from zipfile import ZipFile
root=Path(__file__).resolve().parent
catalog=json.loads((root/'audio-catalog.json').read_text('utf8'))['assets']
audio={}
for path in sorted(root.glob('audio-google-*.zip')):
    with ZipFile(path) as z:
        assert z.testzip() is None
        for name in z.namelist():
            assert name not in audio, name
            audio[name]=z.read(name)
assert len(audio)==len(catalog)==3021
for a in catalog:
    data=audio[a['file']]
    assert len(data)==a['bytes'] and hashlib.sha256(data).hexdigest()==a['sha256'], a['file']
def decode(a):
    r=subprocess.run(['ffmpeg','-v','error','-threads','1','-i','pipe:0','-f','null','-'],input=audio[a['file']],capture_output=True)
    if r.returncode or r.stderr: raise ValueError(a['file']+': '+r.stderr.decode(errors='replace'))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    for i,_ in enumerate(pool.map(decode,catalog),1):
        if i%500==0: print('Decoded',i,flush=True)
print('All 3021 supplemental MP3s: SHA256, ZIP CRC and FFmpeg decoding passed.',flush=True)
courses={c['id']:c for c in json.loads((root/'courses.json').read_text('utf8'))}
files=json.loads((root/'course-files.json').read_text('utf8'))
assert len({a['id'] for a in files})==len(files)
for a in files:
    assert a['courseId'] in courses
    assert not a['unitId'] or any(u['id']==a['unitId'] for u in courses[a['courseId']]['units'])
    assert '..' not in Path(a['path']).parts and not Path(a['path']).is_absolute()
packs=list((root.parent/'Nahia-Book-Packs').glob('*.nahia-course.zip'))
assert len(packs)==12
for p in packs:
    with ZipFile(p) as z:
        assert z.testzip() is None,p
        m=json.loads(z.read('nahia-course.json'))
        assert len(m['assets'])==sum(a['courseId']==m['course']['id'] for a in files)
        for a in m['assets']: assert 'files/'+a['id'] in z.namelist()
print('12 portable course packs and',len(files),'book/audio links validated.')
