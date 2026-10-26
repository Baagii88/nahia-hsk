from pathlib import Path
import json,zipfile,sqlite3
root=Path.cwd();work=root/'audio-work';jobs=json.loads((work/'jobs.json').read_text('utf8'));known={j['file'] for j in jobs};existing={Path(n).name for p in root.glob('audio-*.zip') for n in zipfile.ZipFile(p).namelist() if n.endswith('.mp3')};z=zipfile.ZipFile('studio-assets.zip');available=[chr(int(Path(n).stem,16)) for n in z.namelist() if n.startswith('strokes/') and (0x3400<=int(Path(n).stem,16)<=0x9fff or 0x20000<=int(Path(n).stem,16)<=0x323af)];dictionary=json.loads(Path('character-dictionary.json').read_text('utf8'));db=sqlite3.connect(root/'.test-build/cedict-audit.db');rich=json.loads(z.read('data/learning.json'))['words'];words=json.loads(Path('words.json').read_text('utf8'))
for ch in available:
 file='audio/cmn-'+ch+'.mp3'
 if file not in known and Path(file).name not in existing:jobs.append({'file':file,'text':ch,'kind':'character','hanzi':ch});known.add(file)
 if ch not in dictionary:
  row=db.execute('select pinyin,definitions,traditional,all_PoS from cedict where simplified=? or traditional=? limit 1',(ch,ch)).fetchone()
  if row:
   try:dictionary[ch]={'p':json.loads(row[0]),'definitions':json.loads(row[1]),'traditional':row[2],'pos':row[3]}
   except Exception:pass
for ch,info in dictionary.items():
 info['primary']=info['p'][0] if info['p'] else ''
 for w in words:
  if ch not in w['hanzi']:continue
  tokens=rich.get(w['hanzi'],{}).get('p','').split()
  if len(tokens)==len(w['hanzi']):
   candidate=tokens[w['hanzi'].index(ch)]
   if candidate in info['p']:info['primary']=candidate;break
for h,p,text in [('瞭','liào','瞭望远方。'),('瞭','liǎo','我了解了。')]:
 import hashlib
 file='audio/reading-'+hashlib.sha256((h+'|'+p).encode()).hexdigest()[:16]+'.mp3'
 if file not in known:jobs.append({'file':file,'text':text,'kind':'example','hanzi':h,'pinyin':p});known.add(file)
Path('character-dictionary.json').write_text(json.dumps(dictionary,ensure_ascii=False,separators=(',',':')),encoding='utf8');(work/'jobs.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2),encoding='utf8');print('Jobs:',len(jobs),'Character dictionary:',len(dictionary))
