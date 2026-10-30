import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import JSZip from 'jszip';
import {audioFor,wordForWriting} from '../pronunciation.mjs';
import {wordMeaning,setDefinitionTranslations} from '../translations.mjs';
const root=new URL('../',import.meta.url);
const words=JSON.parse(await readFile(new URL('words.json',root),'utf8'));

test('Every vocabulary and standalone-character audio route points to a physical packaged MP3',async()=>{
 const files=new Set(['audio/cmn-一下.mp3']);
 for(const name of await readdir(root))if(/^audio-.*\.zip$/.test(name)){
  const zip=await JSZip.loadAsync(await readFile(new URL(name,root)));
  for(const path of Object.keys(zip.files))if(path.endsWith('.mp3'))files.add(path);
 }
 for(const w of words){assert.ok(w.hanzi&&w.pinyin&&w.meaning,w.id);assert.ok(files.has(audioFor(w,words)?.file),w.id)}
 for(const ch of new Set(words.flatMap(w=>[...w.hanzi])))assert.ok(files.has(audioFor(wordForWriting(words,'1',ch),words)?.file),ch);
});

test('Reviewed grammar meanings survive machine-definition loading and preserve distinct readings',()=>{
 const definitions=setDefinitionTranslations({});
 const de=words.find(w=>w.id==='2:地'),di=words.find(w=>w.id==='3:地');
 assert.match(wordMeaning(de),/туслах үг/);
 assert.notEqual(wordMeaning(de),wordMeaning(di));
 assert.match(definitions[de.meaning],/慢慢地走/);
 assert.match(wordMeaning(words.find(w=>w.id==='1:吗')),/Тийм\/үгүй/);
});
