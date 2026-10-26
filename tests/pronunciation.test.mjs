import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import JSZip from 'jszip';
import {wordForWriting,matchingReading,displayTones,audioIssue,pronunciationKey,traditionalFor,formLabel,audioFor,characterInfo,numberedPinyin} from '../pronunciation.mjs';
const words=JSON.parse(await readFile(new URL('../words.json',import.meta.url),'utf8'));
const assets=await JSZip.loadAsync(await readFile(new URL('../studio-assets.zip',import.meta.url)));
const rich=JSON.parse(await assets.file('data/learning.json').async('string')).words;
test('Every writing word resolves to the exact selected HSK entry, including all 43 cross-level polyphones',()=>{
 for(const w of words)assert.equal(wordForWriting(words,w.level,w.hanzi).id,w.id);
 for(const [level,pinyin,tone] of [['3','wèi',4],['4','wéi',2],['5','wéi',2]]){
  const w=wordForWriting(words,level,'为');assert.equal(w.pinyin,pinyin);assert.deepEqual(displayTones(w,rich['为']),[tone]);assert.ok(matchingReading(w,rich['为']));
 }
});
test('Unmatched dictionary readings never substitute the first entry’s Zhuyin or tone',()=>{
 assert.equal(matchingReading({pinyin:'hào'}, {y:'hǎo',z:'wrong',p:'hao3'}),null);
 assert.deepEqual(displayTones({hanzi:'好',pinyin:'hào'},{y:'hǎo',p:'hao3'}),[4]);
 assert.notEqual(pronunciationKey('lǜ'),pronunciationKey('lù'));assert.equal(pronunciationKey("nǚ'ér"),pronunciationKey('nǚ ér'));
});
test('Different level-specific pronunciations use separate contextual recordings and the supplemented audio remains available',()=>{
 const groups=new Map();for(const w of words){if(!groups.has(w.hanzi))groups.set(w.hanzi,[]);groups.get(w.hanzi).push(w)}
 let count=0;for(const list of groups.values())if(new Set(list.map(w=>pronunciationKey(w.pinyin))).size>1){count++;for(const w of list){assert.equal(audioIssue(w,words),null);assert.equal(audioFor(w,words).kind,'example')}}
 assert.equal(count,43);assert.equal(audioIssue(words.find(w=>w.hanzi==='一下'),words),null);assert.equal(audioIssue(words.find(w=>w.hanzi==='学习'),words),null);
});

test('Grammatical le has the shared form 了, never 瞭; its le context recording is available',()=>{
 const w=words.find(w=>w.id==='1:了');assert.equal(w.traditional,'瞭');assert.equal(traditionalFor(w),'了');assert.equal(formLabel(w),'Энэ үгийн хоёр бичлэг ижил');assert.equal(audioIssue(w,words),null);assert.equal(audioFor(w,words).kind,'example');
 const understand=words.find(w=>w.hanzi==='了解');assert.equal(traditionalFor(understand),'瞭解');
 assert.equal(traditionalFor({hanzi:'瞭',pinyin:'liào'}),'');assert.equal(formLabel({hanzi:'瞭',pinyin:'liào'}),'Бичлэгийн холбоос тодорхойгүй');
});

test('Every simplified HSK character has an audio route and dictionary enrichment retains ü',()=>{
 const chars=new Set(words.flatMap(w=>[...w.hanzi]));
 for(const ch of chars){const w=wordForWriting(words,'1',ch);assert.ok(audioFor(w,words),ch)}
 assert.equal(numberedPinyin('lü4'),'lǜ');assert.equal(numberedPinyin('shen2 me5'),'shén me');assert.ok(characterInfo('么'));
});
