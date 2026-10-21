import json,zipfile,csv,collections,hashlib,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
words=json.loads((ROOT/'words.json').read_text('utf8')); assets=zipfile.ZipFile(ROOT/'studio-assets.zip');rich=json.loads(assets.read('data/learning.json'))
chars=set(''.join(w['hanzi'] for w in words)); levels=[]
for level in ['1','2','3','4','5','6','7-9']:
 group=[w for w in words if w['level']==level];c=set(''.join(w['hanzi'] for w in group));levels.append({'level':level,'words':len(group),'characters':len(c)})
for char in chars:
 data=json.loads(assets.read(f'strokes/{ord(char):x}.json'))
 assert data['strokes'] and len(data['strokes'])==len(data['medians']),char
 for path,median in zip(data['strokes'],data['medians']):assert path.startswith('M') and len(median)>=2,char
source=ROOT.parent.parent/'Anki-xiehanzi-main/static/data/hanzi-writer-data.json'
source_match=None
if source.exists():
 original=json.loads(source.read_text('utf8'))
 for char in chars:assert json.loads(assets.read(f'strokes/{ord(char):x}.json'))==original[char],char
 source_match=len(chars)
source_words=ROOT.parent/'New HSK (2025)/Anki xiehanzi'
word_matches=0
if source_words.exists():
 for item in levels:
  with (source_words/f"HSK_Level_{item['level']}.txt").open(encoding='utf-8-sig') as f:
   original={r[0]:r for r in csv.reader(f,delimiter='\t') if len(r)>=8}
  for w in words:
   if w['level']!=item['level']:continue
   assert (w['hanzi'],w['traditional'],w['pinyin'])==tuple(original[w['hanzi']][:3]),w['id']
   word_matches+=1
clips={}
for file in sorted(ROOT.glob('audio-*.zip')):
 with zipfile.ZipFile(file) as archive:
  assert archive.testzip() is None,file
  for n in archive.namelist():
   if not n.endswith('.mp3'):continue
   data=archive.read(n);assert len(data)>128,n
   assert data[:3]==b'ID3' or (data[0]==255 and data[1]&224==224),n
   assert n not in clips,n
   clips[n]=len(data)
supplement=ROOT/'audio-audit/cmn-一下.mp3'
provenance=json.loads((ROOT/'audio-audit/google-translate-source.json').read_text('utf8'))
assert hashlib.sha256(supplement.read_bytes()).hexdigest()==provenance['sha256']
by_word=collections.defaultdict(list)
for w in words:by_word[w['hanzi']].append(w)
key=lambda s:''.join(c for c in __import__('unicodedata').normalize('NFC',s) if not c.isspace() and c not in "'’·-")
ambiguous=[{'hanzi':h,'entries':[{'level':w['level'],'pinyin':w['pinyin']} for w in rows]} for h,rows in by_word.items() if len({key(w['pinyin']) for w in rows})>1]
missing=[w['id'] for w in words if 'audio/cmn-'+w['hanzi']+'.mp3' not in clips]
report={'wordEntries':len(words),'uniqueHanzi':len(chars),'strokesCovered':len(chars),'sourceStrokeMatches':source_match,'sourceWordMatches':word_matches or None,'levels':levels,'audioFiles':len(clips),'audioEntriesCovered':len(words)-len(missing),'missingAudioEntries':missing,'differentReadingsAcrossLevels':ambiguous,'supplementedAudioEntries':['1:一下','4:一下'],'supplementFile':'audio-audit/cmn-一下.mp3','playableAudioFilesWithSupplement':len(clips)+1,'audioMeaningVerified':False,'note':'Structural checks do not certify that every recording speaks the displayed pronunciation. Shared recordings for the listed multiple readings are withheld.'}
(ROOT/'audit-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k not in ['differentReadingsAcrossLevels','levels']},ensure_ascii=True));print('Multiple-reading words:',len(ambiguous))
