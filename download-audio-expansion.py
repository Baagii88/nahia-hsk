from pathlib import Path
from urllib.request import urlopen,Request
from urllib.parse import urlencode
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,time,hashlib
root=Path(__file__).resolve().parent;work=root/'audio-work';jobs=json.loads((work/'jobs.json').read_text('utf8'));failures=[];success=[]
def download(job):
 file=work/job['file'];file.parent.mkdir(exist_ok=True,parents=True)
 url='https://translate.google.com/translate_tts?'+urlencode({'ie':'UTF-8','client':'tw-ob','tl':'zh-CN','q':job['text']})
 if not file.exists():
  for attempt in range(4):
   try:
    with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':'https://translate.google.com/'}),timeout=25) as r:
     data=r.read()
     if 'audio' not in r.headers.get('Content-Type','') or len(data)<300:raise ValueError('Invalid audio response')
    file.write_bytes(data);break
   except Exception:
    if attempt==3:raise
    time.sleep(2*(attempt+1))
  time.sleep(.18)
 data=file.read_bytes();return {**job,'provider':'Google Translate','language':'zh-CN','source':url,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'synthesized':True,'downloadedAt':'2026-10-23'}
with ThreadPoolExecutor(max_workers=6) as pool:
 futures={pool.submit(download,j):j for j in jobs}
 for i,f in enumerate(as_completed(futures),1):
  try:success.append(f.result())
  except Exception as e:failures.append({**futures[f],'error':str(e)})
  if i%25==0 or i==len(jobs):
   (work/'manifest.json').write_text(json.dumps({'assets':success,'failures':failures},ensure_ascii=False,indent=2),encoding='utf8');print(f'Audio {i}/{len(jobs)}; downloaded {len(success)}; failures {len(failures)}',flush=True)
print('Finished',flush=True)

