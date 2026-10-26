"""Read original books without modification; build portable local Nahia packs.
Usage: python prepare-book-packs.py SOURCE_FOLDER [OUTPUT_FOLDER]
Publisher PDFs/audio are never added to the public repository.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_STORED
import hashlib, json, re, sys

root = Path(__file__).resolve().parent
source = Path(sys.argv[1]).resolve()
output = Path(sys.argv[2]).resolve() if len(sys.argv)>2 else root.parent/'Nahia-Book-Packs'
output.mkdir(parents=True, exist_ok=True)
courses = json.loads((root/'courses.json').read_text('utf8'))
by_id = {c['id']:c for c in courses}
mapping = []
for path in sorted(source.rglob('*')):
    if not path.is_file() or path.suffix.lower() not in ('.pdf','.mp3'): continue
    relative = path.relative_to(source).as_posix()
    old = re.match(r'HSK [1-6]/HSK-([1-6][AB]?)-(Textbook|Workbook)\.pdf$',relative,re.I)
    new = re.match(r'New HSK 3\.0 Level ([123])/hsk-course-[123]\.pdf$',relative,re.I)
    audio_old = re.match(r'HSK [1-6]/hsk([1-6][AB]?)(textbook|workbook)audios/lesson[- ](\d+)/',relative,re.I)
    audio_new = re.match(r'New HSK 3\.0 Level ([123])/(?:HSK 1 Textbook|Audio)/lesson[- ](\d+)/',relative,re.I)
    chapter = None
    if old: cid='old-'+old[1].upper(); role=old[2].lower()
    elif new: cid='new-'+new[1]; role='textbook'
    elif audio_old: cid='old-'+audio_old[1].upper(); role=audio_old[2].lower()+'-audio'; chapter=int(audio_old[3])
    elif audio_new: cid='new-'+audio_new[1]; role='textbook-audio'; chapter=int(audio_new[2])
    else: continue
    mapping.append(dict(id='book-'+hashlib.sha256(relative.encode()).hexdigest()[:24],courseId=cid,unitId=f'lesson-{chapter:02}' if chapter else '',role=role,path=relative,format=path.suffix[1:].upper(),size=path.stat().st_size))

# Only verified pages are supplied. Unverified chapter pages remain explicitly unset.
new1titles=['AI小语，你好！','我叫李文','我是中国人','我有两个孩子','今天我休息','你的手机号是多少？','我晚上六点半下班','我爸爸也在医院工作','我明天上午在学校学习','这儿的苹果真甜','我读大学呢','昨天下雪了','请给我一杯茶','我看了一个电影','大兴机场见！']
new1pages=[1,5,10,18,27,35,45,54,61,70,78,86,95,103,112]
old1wb=[1,5,11,17,25,33,41,49,57,65,73,81,90,99,107,115]
for cid in sorted({m['courseId'] for m in mapping}):
    course=by_id[cid]
    files=[m for m in mapping if m['courseId']==cid]
    numbers=sorted({int(m['unitId'].split('-')[1]) for m in files if m['unitId']})
    units=[]
    for n in numbers:
        uid=f'lesson-{n:02}'
        has_tb=any(m['unitId']==uid and m['role']=='textbook-audio' for m in files)
        u=dict(id=uid,title=f'{n} дүгээр хичээл' if has_tb else 'Төгсгөлийн сорил',body='Сурах бичгээ уншаад, «Сонсох» хэсэгт энэ бүлгийн аудиотой ажиллаарай. Workbook-ийн дасгалыг дэвтэртээ хийж, хариултаа шалгасны дараа өөрийн оноо, тэмдэглэлийг хадгална. Хуудас тохируулаагүй номыг эхний хуудаснаас нээнэ; «Бүлэг тохируулах»-д PDF-ийн хуудасны дугаарыг оруулж болно.',textbookPage=1,workbookPage=1,textbookPageKnown=False,workbookPageKnown=False,exercises=[],test=[])
        if cid=='new-1' and n<=15: u.update(title=f'{n}. '+new1titles[n-1],textbookPage=new1pages[n-1]+15,textbookPageKnown=True)
        if cid=='old-1' and n<=16: u.update(workbookPage=old1wb[n-1]+8,workbookPageKnown=True)
        if cid.startswith('new-'): u['body']+=' Энэ эх хавтаст шинэ HSK-ийн Workbook PDF байхгүй; өөрийн номыг дараа нэмж холбоорой.'
        units.append(u)
    course['units']=units
    course['builtin']=True
    size=sum(f['size'] for f in files)
    if size>1000*1024*1024: raise ValueError(f'{cid}: pack too large {size}')
    dest=output/f'{cid}.nahia-course.zip'
    with ZipFile(dest,'w',compression=ZIP_STORED,allowZip64=True) as z:
        assets=[{k:v for k,v in m.items() if k not in ('path','size')}|{'name':Path(m['path']).name} for m in files]
        z.writestr('nahia-course.json',json.dumps(dict(app='nahia-course',version=1,course=course,assets=assets,progress={}),ensure_ascii=False))
        for m in files: z.write(source/Path(m['path']),'files/'+m['id'])
    print(cid,len(units),'chapters',len(files),'files',dest.stat().st_size,'bytes',flush=True)
(root/'courses.json').write_text(json.dumps(courses,ensure_ascii=False,indent=2),'utf8')
(root/'course-files.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2),'utf8')
print('Complete:',len(mapping),'mapped source files; originals unchanged.')
