from pathlib import Path
import json,zipfile,sqlite3,re,hashlib
root=Path.cwd();work=root/'audio-work';work.mkdir(exist_ok=True)
w=json.loads((root/'words.json').read_text('utf8'));rich=json.loads(zipfile.ZipFile('studio-assets.zip').read('data/learning.json'))['words']; chars=sorted(set(''.join(x['hanzi'] for x in w)))
existing={Path(n).name for p in root.glob('audio-*.zip') for n in zipfile.ZipFile(p).namelist() if n.endswith('.mp3')}; db=sqlite3.connect(root/'.test-build/cedict-audit.db'); dictionary={}
for ch in chars:
 row=db.execute('select pinyin,definitions,traditional,all_PoS from cedict where simplified=?',(ch,)).fetchone()
 if row:
  try: readings=json.loads(row[0]);definitions=json.loads(row[1])
  except Exception: readings=[];definitions={}
  dictionary[ch]={'p':readings,'definitions':definitions,'traditional':'了' if ch=='了' else row[2],'pos':row[3]}
jobs=[]
for ch in chars:
 if 'cmn-'+ch+'.mp3' not in existing:jobs.append({'file':'audio/cmn-'+ch+'.mp3','text':ch,'kind':'character','hanzi':ch})
contexts={
'好':{'hǎo':'今天很好。','hào':'他好读书。'},'还':{'hái':'他还在学习。','huán':'请还书。'},'看':{'kàn':'我看书。','kān':'看守大门。'},'只':{'zhī':'一只猫。','zhǐ':'我只有一本书。'},'着':{'zhe':'门开着。','zháo':'我睡着了。'},'地':{'de':'慢慢地走。','dì':'这块土地。'},'啊':{'a':'是啊。','ā':'啊，原来如此！'},'得':{'de':'他跑得很快。','děi':'我得走了。'},'长':{'cháng':'这条路很长。','zhǎng':'孩子长大了。'},'头':{'tóu':'我的头很疼。','tou':'石头很大。'},'中':{'zhōng':'中国。','zhòng':'他中了奖。'},'为':{'wèi':'为人民服务。','wéi':'他的行为很好。'},'种':{'zhǒng':'这种书很好。','zhòng':'我们种树。'},'地方':{'dìfang':'这个地方很好。','dìfāng':'地方政府。'},'行':{'xíng':'这样做也行。','háng':'银行在这里。'},'卡':{'kǎ':'一张卡片。','qiǎ':'关卡很多。'},'干':{'gàn':'我们干活。','gān':'干净的衣服。'},'当':{'dāng':'他当老师。','dàng':'我上当了。'},'结果':{'jiéguǒ':'结果很好。','jiēguǒ':'这棵树结果了。'},'转':{'zhuǎn':'向左转。','zhuàn':'轮子转得很快。'},'重':{'zhòng':'这块石头很重。','chóng':'请重复一遍。'},'数':{'shù':'数学很有趣。','shǔ':'请数一数。'},'倒':{'dào':'请倒水。','dǎo':'树倒了。'},'量':{'liáng':'请量一下身高。','liàng':'数量很多。'},'落':{'luò':'树叶落下来了。','là':'我把书落在家里了。'},'背':{'bēi':'他背着书包。','bèi':'请背课文。'},'待':{'dāi':'我待在家里。','dài':'我们等待你。'},'精神':{'jīngshen':'今天他看起来很精神。','jīngshén':'我们学习这种精神。'},'传':{'chuán':'请传给我。','zhuàn':'这是一部人物传记。'},'调':{'tiáo':'请调节温度。','diào':'调查已经结束。'},'涨':{'zhǎng':'水位上涨了。','zhàng':'豆子泡涨了。'},'冲':{'chōng':'他冲了出去。','chòng':'他冲着我笑。'},'结':{'jié':'结果很好。','jiē':'结实的桌子。'},'挑':{'tiāo':'请挑选一本书。','tiǎo':'请不要挑衅。'},'划':{'huá':'我们去划船。','huà':'这个计划很好。'},'炸':{'zhá':'我喜欢吃炸鸡。','zhà':'炸弹爆炸了。'},'扇':{'shān':'他扇着扇子。','shàn':'一把扇子。'},'尽':{'jìn':'请尽力。','jǐn':'请尽早来。'},'圈':{'quān':'画一个圆圈。','juān':'把鸡圈在笼子里。'},'折':{'zhé':'请把纸折起来。','shé':'树枝折了。'},'率':{'lǜ':'效率很高。','shuài':'他率领团队。'},'撒':{'sǎ':'请撒点盐。','sā':'孩子在撒娇。'},'地道':{'dìdao':'他说的汉语很地道。','dìdào':'这是一条地道。'},'了':{'le':'我吃饭了。','liǎo':'这件事还没有了结。'}}
for h,readings in contexts.items():
 for p,text in readings.items():jobs.append({'file':'audio/reading-'+hashlib.sha256((h+'|'+p).encode()).hexdigest()[:16]+'.mp3','text':text,'kind':'example','hanzi':h,'pinyin':p})
(root/'character-dictionary.json').write_text(json.dumps(dictionary,ensure_ascii=False,separators=(',',':')),encoding='utf8')
(work/'jobs.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2),encoding='utf8');print('Character jobs:',sum(j['kind']=='character' for j in jobs),'Example jobs:',sum(j['kind']=='example' for j in jobs))
