import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
import {readSavedCourses,withTimeout} from '../course-loader.mjs';import {cleanCourse} from '../course-model.mjs';import {createCourseStore} from '../course-store.mjs';
const catalog=JSON.parse(await readFile(new URL('../courses.json',import.meta.url),'utf8'));
test('Unresponsive saved-book storage cannot keep built-in lessons on a loading screen',async()=>{
 const never=new Promise(()=>{}),store={courses:()=>never,metadata:()=>never};let html='';
 const context={Learning:{courseCatalog:catalog,course:{cleanCourse},createCourseStore:()=>store,readSavedCourses:s=>readSavedCourses(s,15)},Studio:{views:{}},page:'courses',words:[],LEVELS:['1','2','3','4','5','6','7-9'],esc:String,title:(a,b,c)=>`<h1>${b}</h1><p>${c}</p>`,localStorage:{getItem:()=>null},document:{addEventListener:()=>{},querySelector:s=>s==='[data-page="courses"]'?{}:null},URL:{revokeObjectURL:()=>{}},toast:()=>{},setTimeout,clearTimeout};context.window=context;context.$=s=>context.document.querySelector(s);context.render=()=>html=context.Studio.views.courses();
 vm.runInNewContext(await readFile(new URL('../courses.js',import.meta.url),'utf8'),context);context.render();
 assert.match(html,/HSK Standard Course 1/);assert.match(html,/PDF \/ аудио тусад нь оруулах/);assert.doesNotMatch(html,/Хөтөлбөрүүдийг бэлдэж/);
 context.Courses.afterRender();await new Promise(r=>setTimeout(r,35));assert.match(html,/Дахин холбох/);assert.match(html,/HSK Standard Course 1/);assert.match(html,/Нахиагийн 21 эх хичээл/);
});
test('Saved-book reads and never-returning database opens time out with a recovery action',async()=>{
 await assert.rejects(withTimeout(new Promise(()=>{}),10,'retry'),/retry/);
 const store=createCourseStore({open:()=>({})},'blocked',{openTimeout:10});await assert.rejects(store.courses(),/дахин оролдоорой/);
});
