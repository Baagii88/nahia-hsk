import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
import * as learn from '../learn-model.mjs';import * as pronunciation from '../pronunciation.mjs';
const words=JSON.parse(await readFile(new URL('../words.json',import.meta.url),'utf8'));
test('Every themed item uses a real vocabulary record, pronunciation, traditional form and unique ID',()=>{
 for(const t of learn.TOPICS){const list=learn.topicWords(t,words);assert.equal(list.length,t.items.length,t.id);assert.equal(new Set(list.map(w=>w.id)).size,list.length);for(const w of list){assert.ok(w.pinyin);assert.ok(w.art&&w.mn);assert.equal(learn.shownForm(w,false,pronunciation),w.hanzi);assert.equal(learn.shownForm(w,true,pronunciation),pronunciation.traditionalFor(w)||w.hanzi)}}
 for(const level of ['1','2','3','4','5','6','7-9']){const list=words.filter(w=>w.level===level),groups=learn.batches(list);assert.deepEqual(groups.flat().map(w=>w.id),list.map(w=>w.id));assert.ok(groups.every(g=>g.length>0&&g.length<=10))}
});
test('Text lessons prefer the longest dictionary word and deduplicate; choices never repeat a meaning',()=>{
 const list=learn.wordsFromText('我喜欢学习汉语，学习汉语。',words);assert.ok(list.some(w=>w.hanzi==='学习'));assert.ok(list.some(w=>w.hanzi==='汉语'));assert.equal(new Set(list.map(w=>w.hanzi)).size,list.length);
 const target={id:'a',mn:'one'},choices=learn.uniqueChoices([target,{id:'b',mn:'one'},{id:'c',mn:'two'},{id:'d',mn:'three'},{id:'e',mn:'four'}],target,'mn',()=>.4);assert.equal(choices.length,4);assert.equal(new Set(choices.map(w=>w.mn)).size,4);assert.ok(choices.some(w=>w.id==='a'));
});
test('Learning UI renders all activities, switches script, and never credits skipped cards',async()=>{
 const handlers={},memory=new Map();let html='';const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const context={Learning:{learn,pronunciation},Studio:{views:{}},words,LEVELS:['1','2','3','4','5','6','7-9'],page:'learn',localStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)},document:{addEventListener:(n,fn)=>handlers[n]=fn,querySelector:()=>null},esc,meaning:w=>w.meaning,title:(a,b,c)=>`<h1>${b}</h1><p>${c}</p>`,playButton:w=>`<button data-play="${w.id}">♪</button>`,shuffle:a=>[...a],toast:()=>{},crypto,console};context.window=context;context.$=s=>context.document.querySelector(s);context.render=()=>html=context.Studio.views.learn?.()||'';context.go=p=>{context.page=p;context.render()};
 vm.runInNewContext(await readFile(new URL('../learn.js',import.meta.url),'utf8'),context);
 const click=dataset=>handlers.click({target:{closest:()=>({dataset,hasAttribute:k=>Object.hasOwn(dataset,k.replace('data-','').replace(/-([a-z])/g,(_,c)=>c.toUpperCase()))})}});
 assert.match(html,/Сэдвээр сурах/);click({learnUnit:'animals'});assert.equal((html.match(/data-learn-mode=/g)||[]).length,6);
 click({learnMode:'cards'});for(let i=0;i<10;i++)click({learnAction:'next'});assert.match(html,/0 \/ 10 үгийг давтлаа/);assert.equal(memory.size,0);
 click({learnAction:'again'});click({learnAction:'reveal'});click({learnAction:'remember'});assert.match(html,/猫/);click({learnScript:'traditional'});assert.match(html,/貓/);const p=JSON.parse(memory.get('nahia-learn-progress'));assert.equal(Object.values(p)[0].length,1);
 click({learnAction:'back'});click({learnMode:'match'});const correct=words.find(w=>w.hanzi==='狗');click({learnAnswer:correct.id});assert.match(html,/✓ Зөв!/);
 // Completing only the last character of 兔子 must not complete the whole word.
 click({learnAction:'back'});click({learnMode:'write'});click({learnAction:'next'});click({learnAction:'next'});
 const status={textContent:''},board={clientWidth:400};let quizOptions;
 context.document.querySelector=s=>s==='[data-page="learn"]'?{}:s==='#learn-write-board'?board:s==='#learn-write-status'?status:null;
 context.fetch=async()=>({ok:true,json:async()=>({strokes:['M0 0'],medians:[[[0,0],[1,1]]]})});
 context.HanziWriter={create:()=>({quiz:o=>quizOptions=o,cancelQuiz:()=>{}})};
 click({learnCharacter:'1'});context.LearnHub.afterRender();await new Promise(r=>setImmediate(r));quizOptions.onComplete();
 assert.equal(JSON.parse(memory.get('nahia-learn-progress'))['animals:0:write'],undefined);
 context.LearnHub.afterRender();await new Promise(r=>setImmediate(r));quizOptions.onComplete();
 assert.ok(JSON.parse(memory.get('nahia-learn-progress'))['animals:0:write'].includes(words.find(w=>w.hanzi==='兔子').id));
});
