import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {IDBFactory} from 'fake-indexeddb';
import {createCourseStore} from '../course-store.mjs';
import {openCourseZip} from '../course-zip.mjs';
import {importCoursePack} from '../course-import.mjs';
const course={id:'sample',title:'HSK',units:[{id:'lesson-01',title:'Lesson'}]};
const asset={id:'book',courseId:course.id,unitId:'',role:'textbook',name:'book.pdf',format:'PDF'};
async function pack(compression='STORE',prefix='',assets=[asset]){const z=new JSZip();z.file(prefix+'nahia-course.json',JSON.stringify({app:'nahia-course',version:1,course,assets}));for(const a of assets)z.file(prefix+'files/'+a.id,'%PDF-1.7\nbook');return new Blob([await z.generateAsync({type:'uint8array',compression})])}
test('STORE and DEFLATE course packs import, including a wrapping folder; listing never returns Blobs',async()=>{
 for(const compression of ['STORE','DEFLATE']){const store=createCourseStore(new IDBFactory());const events=[];const result=await importCoursePack(await pack(compression,'HSK/'),{store,JSZip,onProgress:p=>events.push(p)});assert.equal(result.assets.length,1);assert.equal((await store.courses())[0].id,course.id);const metadata=await store.metadata();assert.equal(metadata[0].blob,undefined);assert.equal(await (await store.get(metadata[0].id)).blob.text(),'%PDF-1.7\nbook');assert.ok(events.some(p=>p.done===p.total&&p.total>1));await store.close()}
});
test('Cancel and staging errors retain previous course files and remove only the new staged files',async()=>{
 for(const failure of ['cancel','quota','commit']){const factory=new IDBFactory(),store=createCourseStore(factory);await store.course(course);await store.put({...asset,blob:new Blob(['original'])});const controller=new AbortController();let stages=0;const originalStage=store.stage;
  store.stage=async a=>{if(failure==='quota'&&++stages===2)throw new DOMException('full','QuotaExceededError');await originalStage(a)};
  if(failure==='commit')store.commit=async()=>{throw Error('commit failed')};
  const assets=[asset,{...asset,id:'second'}];
  await assert.rejects(importCoursePack(await pack('STORE','',assets),{store,JSZip,existing:[asset],signal:controller.signal,onProgress:p=>{if(failure==='cancel'&&p.done>0)controller.abort()}}));
  assert.equal(await (await store.get('book')).blob.text(),'original');assert.equal((await store.metadata()).length,1);
  const db=await new Promise((resolve,reject)=>{const r=factory.open('nahia-courses');r.onsuccess=()=>resolve(r.result);r.onerror=reject});const ids=await new Promise(resolve=>{const r=db.transaction('assets').objectStore('assets').getAllKeys();r.onsuccess=()=>resolve(r.result)});assert.deepEqual(ids,['book']);db.close();
  await store.close();
 }
});
test('Invalid archives, missing files and insufficient disk space fail before replacing existing content',async()=>{
 await assert.rejects(openCourseZip(new Blob(['not a zip'])),/ZIP/);
 await assert.rejects(importCoursePack({size:100,slice:()=>({arrayBuffer:async()=>{throw new DOMException('unreadable','NotReadableError')}})},{store:{}}),/OneDrive/);
 const z=new JSZip();z.file('ordinary.pdf','%PDF-');const store=createCourseStore(new IDBFactory());await assert.rejects(importCoursePack(new Blob([await z.generateAsync({type:'uint8array'})]),{store,JSZip}),/Нахиагийн/);
 const missing=new JSZip();missing.file('nahia-course.json',JSON.stringify({app:'nahia-course',version:1,course,assets:[asset]}));await assert.rejects(importCoursePack(new Blob([await missing.generateAsync({type:'uint8array'})]),{store,JSZip}),/дутуу/);
 await assert.rejects(importCoursePack(await pack(),{store,JSZip,estimate:async()=>({quota:1,usage:0})}),/зай/);
 assert.deepEqual(await store.metadata(),[]);await store.close();
});
test('Existing version-1 saved books migrate into metadata without losing their Blob',async()=>{
 const factory=new IDBFactory();await new Promise((resolve,reject)=>{const r=factory.open('legacy',1);r.onupgradeneeded=()=>{r.result.createObjectStore('courses',{keyPath:'id'});r.result.createObjectStore('assets',{keyPath:'id'}).put({...asset,blob:new Blob(['saved book'])})};r.onsuccess=()=>{r.result.close();resolve()};r.onerror=reject});
 const store=createCourseStore(factory,'legacy');assert.equal((await store.metadata())[0].blob,undefined);assert.equal(await (await store.get('book')).blob.text(),'saved book');await store.close();
});
