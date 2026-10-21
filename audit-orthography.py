"""Audit supplied script pairs and audio file links; does not certify spoken audio."""
from pathlib import Path
from zipfile import ZipFile
import argparse,csv,json,unicodedata,collections
parser=argparse.ArgumentParser();parser.add_argument('--output',default='.test-build/orthography-audit');args=parser.parse_args()
root=Path(__file__).resolve().parent;out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
words=json.loads((root/'words.json').read_text('utf8'));rich=json.loads(ZipFile(root/'studio-assets.zip').read('data/learning.json'))['words']
names={Path(n).name for p in root.glob('audio-*.zip') for n in ZipFile(p).namelist() if n.endswith('.mp3')};names.add('cmn-一下.mp3')
key=lambda s:''.join(c for c in unicodedata.normalize('NFC',s) if not c.isspace() and c not in "'’·-")
counts=collections.Counter();rows=[]
for w in words:
 original=w.get('traditional',w['hanzi']);traditional='了' if w['hanzi']=='了' and key(w['pinyin'])=='le' else original
 same=w['hanzi']==traditional;filename='cmn-'+w['hanzi']+'.mp3';exists=filename in names
 readings=list(dict.fromkeys(key(r['y']) for r in rich.get(w['hanzi'],{}).get('r',[]) if r.get('y')))
 counts['sameDisplayForm' if same else 'differentSourceForms']+=1;counts['audioFilePresent' if exists else 'audioFileMissing']+=1
 rows.append([w['id'],w['level'],w['hanzi'],original,traditional,w['pinyin'],'Хоёр бичлэг ижил' if same else 'Эх толь дахь бичлэг ялгаатай',filename,'Байгаа' if exists else 'Байхгүй',' / '.join(readings),'Бичлэгийн бодит уншлагыг сонсож баталгаажуулаагүй','了 le: албан ёсны толиор зассан' if traditional!=original else 'Эх өгөгдлийн холбоос; утга тус бүрийн хөрвүүлэлтийг бие даан баталгаажуулаагүй'])
with (out/'all-script-audio-audit.csv').open('w',encoding='utf-8-sig',newline='') as f:
 writer=csv.writer(f);writer.writerow(['ID','HSK','HSK үндсэн бичлэг','Эхийн уламжлалт талбар','Харуулах уламжлалт бичлэг','Сонгосон пиньинь','Хэлбэрийн харьцуулалт','Аудио файлын нэр','Файл байгаа эсэх','Эх толь дахь дуудлагууд','Сонсголын хяналт','Хөрвүүлэлтийн баталгаа']);writer.writerows(rows)
summary={'entries':len(words),**counts,'traditionalOnlyAudioLinks':sum(w['hanzi']!=w['traditional'] and 'cmn-'+w['hanzi']+'.mp3' not in names and 'cmn-'+w['traditional']+'.mp3' in names for w in words),'correctedEntry':{'id':'1:了','pinyin':'le','originalTraditional':'瞭','displayTraditional':'了','source':'https://stroke-order.learningweb.moe.edu.tw/dictMean.jsp?ID=20102&la=0'},'dictionaryWordsWithMultipleReadings':sum(len({key(r['y']) for r in v.get('r',[]) if r.get('y')})>1 for v in rich.values()),'audioMeaningVerified':False,'note':'File existence and identical script strings do not certify every context-sensitive script conversion or every spoken reading.'}
(out/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(summary,ensure_ascii=True))
