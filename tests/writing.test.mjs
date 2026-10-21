import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import JSZip from 'jszip';
import {writingEntries,selectionForLevel,searchWriting,hanCharacters} from '../writing-model.mjs';
const words=JSON.parse(await readFile(new URL('../words.json',import.meta.url),'utf8'));
const levels=['1','2','3','4','5','6','7-9'];
test('Every HSK change replaces the previous writing selection with that level’s first word',()=>{
  let selected='学习';
  for(const level of levels){selected=selectionForLevel(words,level,'words',selected,true);assert.equal(selected,words.find(w=>w.level===level).hanzi)}
  assert.notEqual(selectionForLevel(words,'1','words','学习',true),selectionForLevel(words,'2','words','学习',true));
});
test('Every level can browse all words and each unique character, including the last entry',()=>{
  for(const level of levels){const list=words.filter(w=>w.level===level),entries=writingEntries(words,level,'words'),chars=writingEntries(words,level,'characters');
    assert.equal(entries.length,list.length);assert.equal(entries.at(-1).id,list.at(-1).id);
    assert.equal(chars.length,new Set(list.flatMap(w=>hanCharacters(w.hanzi))).size);
    assert.equal(new Set(chars.map(w=>w.hanzi)).size,chars.length);
  }
  assert.ok(searchWriting(writingEntries(words,'1'),'xue').some(w=>w.hanzi==='学习'));
});
test('All 3,088 simplified HSK characters have real local stroke paths and medians',async()=>{
  const zip=await JSZip.loadAsync(await readFile(new URL('../studio-assets.zip',import.meta.url)));
  const characters=new Set(words.flatMap(w=>hanCharacters(w.hanzi)));assert.equal(characters.size,3088);
  for(const char of characters){const entry=zip.file(`strokes/${char.codePointAt(0).toString(16)}.json`);assert.ok(entry,`Missing ${char}`);const data=JSON.parse(await entry.async('string'));assert.ok(data.strokes.length>0,`Empty ${char}`);assert.equal(data.strokes.length,data.medians.length,`Invalid ${char}`)}
});
