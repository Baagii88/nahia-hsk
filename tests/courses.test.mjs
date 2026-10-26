import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {gradeQuestions,cleanCourse,assetNameSafe} from '../course-model.mjs';
const courses=JSON.parse(await readFile(new URL('../courses.json',import.meta.url),'utf8'));
test('Old/new editions remain separate and authored lessons have exercises, tests and audio',()=>{assert.equal(courses.filter(c=>c.edition==='old').length,9);assert.equal(courses.filter(c=>c.edition==='new').length,14);let count=0;for(const c of courses){cleanCourse(c);for(const u of c.edition==='nahia'?c.units:[]){count++;assert.ok(u.zh&&u.audio&&u.exercises.length&&u.test.length)}}assert.equal(count,21)});
test('Chapter grading does not accept unanswered first choices and normalizes Chinese free text',()=>{const qs=[{prompt:'x',options:['a','b','c'],correct:0},{prompt:'y',answer:'是'}];assert.equal(gradeQuestions(qs,[undefined,'']).correct,0);const r=gradeQuestions(qs,['0',' 是。 ']);assert.equal(r.percent,100);assert.equal(r.results[1].correct,true)});
test('Imported course metadata rejects invalid IDs and answer keys; safe asset names cannot escape ZIP paths',()=>{const c=structuredClone(courses.find(c=>c.edition==='nahia'));c.id='../bad';assert.throws(()=>cleanCourse(c));c.id='valid';c.units[0].test[0].correct=9;assert.throws(()=>cleanCourse(c));assert.equal(assetNameSafe('../x'),false);assert.equal(assetNameSafe('abc-123'),true)});

test('Publisher files associate with their own edition, volume, chapter and audio role',async()=>{
 const files=JSON.parse(await readFile(new URL('../course-files.json',import.meta.url),'utf8'));
 assert.equal(files.length,1236);assert.equal(new Set(files.map(a=>a.id)).size,1236);
 assert.equal(files.filter(a=>a.role==='textbook').length,12);assert.equal(files.filter(a=>a.role==='workbook').length,9);
 for(const a of files){const c=courses.find(c=>c.id===a.courseId);assert.ok(c);assert.ok(assetNameSafe(a.id));assert.ok(!a.path.includes('..'));if(a.role.endsWith('-audio')){assert.ok(c.units.some(u=>u.id===a.unitId));assert.equal(a.format,'MP3');const n=Number(a.path.match(/lesson[- ](\d+)/i)?.[1]);assert.equal(a.unitId,`lesson-${String(n).padStart(2,'0')}`)}else assert.equal(a.unitId,'');if(a.courseId.startsWith('new-'))assert.ok(a.path.startsWith('New HSK'));else assert.ok(a.path.startsWith('HSK '))}
 assert.equal(courses.filter(c=>c.edition!=='nahia').flatMap(c=>c.units).length,200);
 assert.equal(courses.find(c=>c.id==='new-1').units[0].textbookPage,16);
 assert.equal(courses.find(c=>c.id==='old-1').units[0].workbookPage,9);
});
