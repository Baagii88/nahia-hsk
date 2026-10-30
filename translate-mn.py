"""Translate public dictionary definitions; keep originals and a resumable local cache.
No personal files/text are sent. Run explicitly, not during the site build.
"""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlencode
import concurrent.futures,hashlib,json,re,time,zipfile,unicodedata,ast
root=Path(__file__).resolve().parent
work=root/'audio-work'/'translations';work.mkdir(parents=True,exist_ok=True)
words=json.loads((root/'words.json').read_text('utf8'))
chars=json.loads((root/'character-dictionary.json').read_text('utf8'))
rich=json.loads(zipfile.ZipFile(root/'studio-assets.zip').read('data/learning.json'))['words']
texts=set(w['meaning'] for w in words if w.get('meaning'))
texts.update(t for c in chars.values() for t in c['definitions'].values() if t)
texts.update(r.get('d') or r.get('m') or '' for c in rich.values() for r in c.get('r',[]));texts.discard('')
ordered=sorted(texts);lookup={100000+i:t for i,t in enumerate(ordered)}
def query(rows):return '\n'.join(str(n)+') '+t.replace('\n',' ') for n,t in rows)
batches=[];batch=[]
for n,t in lookup.items():
 candidate=batch+[(n,t)]
 if batch and (len(candidate)>30 or len(urlencode({'q':query(candidate)}))>6200):batches.append(batch);batch=[]
 batch.append((n,t))
if batch:batches.append(batch)
def request(rows):
 url='https://translate.googleapis.com/translate_a/single?'+urlencode(dict(client='gtx',sl='en',tl='mn',dt='t',q=rows[0][1] if len(rows)==1 else query(rows)))
 data=json.load(urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=45))
 text=''.join(a[0] or '' for a in data[0]);text=unicodedata.normalize('NFKC',text)
 if len(rows)==1 and text.strip():return {rows[0][1]:text.strip()}
 marks=list(re.finditer(r'(?<!\d)(1\d{2}[, \u00a0]?\d{3})(?!\d)[ \t]*[/).:：\]-]?[ \t]*',text));result={}
 for i,m in enumerate(marks):result[int(re.sub(r'[^0-9]','',m[1]))]=text[m.end():marks[i+1].start() if i+1<len(marks) else len(text)].strip()
 if set(result)!={n for n,_ in rows} or not all(result.values()):raise ValueError('Translation numbering mismatch')
 return {lookup[n]:v for n,v in result.items()}
def translate(rows):
 key=hashlib.sha256(query(rows).encode()).hexdigest();cache=work/(key+'.json')
 if cache.exists():
  try:return json.loads(cache.read_text('utf8'))
  except json.JSONDecodeError:pass
 for attempt in range(5):
  try:
   result=request(rows)
   cache.write_text(json.dumps(result,ensure_ascii=False),'utf8',newline='\n');time.sleep(.15);return result
  except Exception:
   if attempt==4:break
   time.sleep(min(15,2**attempt))
 # A batch that lost a number is split, rather than attaching a wrong definition.
 if len(rows)>1:
  mid=len(rows)//2;return translate(rows[:mid])|translate(rows[mid:])
 raise RuntimeError('Translation unavailable: '+str(rows[0][0]))
result={}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 futures={pool.submit(translate,b):b for b in batches};failures=[]
 for i,f in enumerate(concurrent.futures.as_completed(futures),1):
  try:result.update(f.result())
  except Exception as e:failures.append(futures[f]);print('Retry batch:',len(futures[f]),str(e),flush=True)
  if i%20==0:print(i,'/',len(batches),'batches;',len(result),'definitions',flush=True)
for batch in failures:
 try:result.update(translate(batch))
 except Exception:pass
missing=sorted(texts-set(result));(work/'missing.json').write_text(json.dumps(missing,ensure_ascii=False),'utf8')
assert not missing,str(len(missing))+' definitions still need translation'
for original,translated in list(result.items()):
 if 'classifier' in original:translated=translated.replace('ангилагч','тоолох үг')
 if re.search(r'(?:modal|final|sentence|possessive|interrogative|structural|aspect).*particle',original):translated=translated.replace('модаль бөөмс','баймж туслах үг').replace('бөөмс','туслах үг').replace('бөөм','туслах үг')
 result[original]=translated
manual_definitions={'Lenovo':'Леново (компани, брэндийн нэр)','to be carsick':'унаанд явахад дотор муухайрах','please (do sth) (deferential form)':'…на уу; …хийгээрэй (хүндэтгэлийн хэллэг)','to dote on sb':'хэт өхөөрдөн эрхлүүлэх','to frame sb (by planting sth on them)':'хуурамч нотлох баримт тавьж бусдад хилс хэрэг тохох','to let sth cool down':'хөргөх; хөртөл нь байлгах','(coll.) this':'(ярианы хэл) энэ'}
result.update(manual_definitions)
out=dict(provider='Google Translate',language='mn',sourceLanguage='en',machineTranslated=True,manualCorrections=list(manual_definitions),definitions=result)
(root/'mn-translations.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),'utf8',newline='\n')
manual=ast.literal_eval(re.search(r'const MN=(\{.*?\});',(root/'app.js').read_text('utf8'),re.S)[1]);first={}
for w in words:first.setdefault(w['hanzi'],w['id'])
word_map={w['id']:manual[w['hanzi']] if w['hanzi'] in manual and first[w['hanzi']]==w['id'] else result[w['meaning']] for w in words if w.get('meaning')}
word_map.update(json.loads((root/'vocabulary-overrides.json').read_text('utf8')))
(root/'word-mn.json').write_text(json.dumps(word_map,ensure_ascii=False,separators=(',',':')),'utf8',newline='\n')
print('Completed:',len(result),'definitions;',len(words),'word records; English originals preserved.',flush=True)
