import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import JSZip from 'jszip';
import { hydrateCard, migrateCard, rate, preview, dueQueue, validateCard } from '../review-engine.mjs';
import anki from '../.test-build/anki-service.cjs';
const {exportDeck,readDeck,stableGuid}=anki;
const now=new Date('2026-10-21T06:00:00Z');
test('FSRS provides distinct honest outcomes and persists dates through JSON',()=>{
  const card=hydrateCard(undefined,now),options=preview(card,now);
  assert.ok(+options[1].card.due<+options[4].card.due);
  const next=rate(card,3,now);assert.ok(validateCard(next.card));
  const restored=hydrateCard(JSON.parse(JSON.stringify(next.card)),now);
  assert.ok(restored.due instanceof Date);assert.equal(restored.reps,1);
  const again=rate(restored,1,new Date(restored.due));assert.equal(again.card.reps,2);
  assert.throws(()=>rate(card,5,now));
});
test('Legacy progress preserves due times and due cards precede unseen cards',()=>{
  const old={interval:4,due:+now-1000},migrated=migrateCard(old,now);assert.equal(+migrated.due,old.due);
  const list=[{id:'new'},{id:'future'},{id:'due'}];
  assert.deepEqual(dueQueue(list,{}, {future:{due:+now+10000},due:old},10,+now).map(w=>w.id),['due','new']);
  assert.equal(validateCard({...migrated,difficulty:-1}),false);
});
test('Anki export produces real SQLite notes, stable GUIDs, audio and writing media; reimports text',async()=>{
  const SQL=await initSqlJs();const list=[{id:'1:你好',hanzi:'你好',pinyin:'nǐ hǎo',meaning:'сайн байна уу',level:'1'},{id:'1:学习',hanzi:'学习',pinyin:'xuéxí',meaning:'сурах',level:'1'}];
  const result=await exportDeck(SQL,list,'Nahia::Test',{audio:async()=>new Uint8Array([1,2,3]),writing:()=>'<div>Writing practice</div>',media:[['_writer.js','/* test */']]});
  const zip=await JSZip.loadAsync(result.bytes);assert.equal(result.audioCount,2);assert.ok(zip.file('collection.anki2'));
  const db=new SQL.Database(await zip.file('collection.anki2').async('uint8array'));
  assert.equal(db.exec('SELECT count(*) FROM notes')[0].values[0][0],2);assert.equal(db.exec('SELECT count(*) FROM cards')[0].values[0][0],2);
  const guids=db.exec('SELECT guid FROM notes')[0].values.flat();assert.ok(guids.includes(stableGuid(list[0].id)));db.close();
  const imported=await readDeck(SQL,result.bytes,s=>s.replace(/<[^>]*>/g,''));assert.equal(imported.length,2);assert.equal(imported[0].hanzi,'你好');assert.equal(imported[0].pinyin,'nǐ hǎo');assert.equal(imported[0].meaning,'сайн байна уу');
  const media=JSON.parse(await zip.file('media').async('string'));assert.equal(Object.keys(media).length,3);
});
test('Modern compressed Anki files are rejected with an actionable message',async()=>{
  const SQL=await initSqlJs(),zip=new JSZip();zip.file('collection.anki21b','unsupported');
  await assert.rejects(readDeck(SQL,await zip.generateAsync({type:'uint8array'}),s=>s),/Support older Anki versions/);
});
