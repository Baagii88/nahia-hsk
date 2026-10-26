import json,hashlib
from pathlib import Path
lessons=json.loads(Path('grammar-mn.json').read_text('utf8'));courses=[]
for edition,base,url in [('old','HSK Standard Course','https://www.hskstandardcourse.com/'),('new','New HSK Course','https://www.fltrp.com/en/hsk/')]:
 for level in ['1','2','3','4','5','6']:
  for part in ([''] if int(level)<4 else ['A','B']):courses.append({'id':f'{edition}-{level}{part}','edition':edition,'level':level,'title':f'{base} {level}{part}','source':url,'units':[],'builtin':True})
for part,label in [('listening-A','Listening & Speaking A'),('listening-B','Listening & Speaking B'),('reading-A','Reading A'),('reading-B','Reading B'),('writing','Writing')]:courses.append({'id':'new-79-'+part,'edition':'new','level':'7-9','title':'New HSK Course 7–9 '+label,'source':'https://www.fltrp.com/en/hsk/','units':[],'builtin':True})
work=Path('audio-work');jobs=json.loads((work/'jobs.json').read_text('utf8'))
for level in ['1','2','3','4','5','6','7-9']:
 group=[l for l in lessons if l['level']==level];units=[]
 for i,l in enumerate(group):
  other=[x for x in group if x['id']!=l['id']];answers=list(dict.fromkeys([l['answer']]+[x['answer'] for x in other]+['是','在','的','吗']))[:3]
  name='audio/lesson-'+l['id']+'.mp3';jobs.append({'file':name,'text':l['zh'],'kind':'lesson','lesson':l['id']})
  units.append({'id':l['id'],'title':l['title'],'body':l['pattern']+'\n\n'+l['explanation'],'zh':l['zh'],'pinyin':l['pinyin'],'mn':l['mn'],'textbookPage':1,'workbookPage':1,'audio':name,'exercises':[{'prompt':l['question'],'answer':l['answer'],'explanation':l['explanation']}],'test':[{'prompt':l['question'],'options':answers,'correct':0,'explanation':l['explanation']},{'prompt':'Жишээ өгүүлбэрийн утгыг сонгоорой: '+l['zh'],'options':[l['mn']]+[x['mn'] for x in other],'correct':0,'explanation':l['pinyin']},{'prompt':l['pattern']+' бүтцийн тайлбарыг сонгоорой.','options':[l['explanation']]+[x['explanation'] for x in other],'correct':0,'explanation':l['explanation']}]})
 courses.append({'id':'nahia-'+level.replace('-',''),'edition':'nahia','level':level,'title':'Нахиа · HSK '+level+' · Дүрэм ба хэрэглээ','source':'','units':units,'builtin':True})
Path('courses.json').write_text(json.dumps(courses,ensure_ascii=False,indent=2),encoding='utf8')
(work/'jobs.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2),encoding='utf8')
print('Course catalogs:',len(courses),'Authored lessons:',sum(len(c['units']) for c in courses),'Audio jobs:',len(jobs))
