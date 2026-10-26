import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import JSZip from 'jszip';import vm from 'node:vm';
import {wordMeaning,setDefinitionTranslations} from '../translations.mjs';
const words=JSON.parse(await readFile(new URL('../words.json',import.meta.url),'utf8'));
const data=JSON.parse(await readFile(new URL('../mn-translations.json',import.meta.url),'utf8'));
test('All 11073 vocabulary records have Mongolian meanings, with different readings kept by ID',()=>{
 assert.equal(words.length,11073);for(const w of words){assert.ok(wordMeaning(w),w.id);assert.match(wordMeaning(w),/[А-Яа-яӨөҮүЁё]/u,w.id)}
 assert.match(wordMeaning(words.find(w=>w.id==='1:了')),/үйл дууссан/);
 const different=words.filter(w=>w.hanzi==='地');assert.ok(new Set(different.map(wordMeaning)).size>1);
});
test('Every original character/word reading definition has a corresponding Mongolian translation',async()=>{
 const chars=JSON.parse(await readFile(new URL('../character-dictionary.json',import.meta.url),'utf8')),zip=await JSZip.loadAsync(await readFile(new URL('../studio-assets.zip',import.meta.url))),rich=JSON.parse(await zip.file('data/learning.json').async('string')).words;
 const originals=new Set(words.map(w=>w.meaning));for(const c of Object.values(chars))for(const s of Object.values(c.definitions))if(s)originals.add(s);for(const c of Object.values(rich))for(const r of c.r||[])if(r.d||r.m)originals.add(r.d||r.m);
 assert.equal(originals.size,18000);for(const original of originals)assert.ok(data.definitions[original]?.trim(),original);
 setDefinitionTranslations(data.definitions);assert.ok(wordMeaning({id:'hanzi:standalone',meaning:'to be carsick'}).includes('дотор муухайрах'));
});
test('Dictionary renders Mongolian plus safely escaped English without re-mounting the writing board',async()=>{
 const context={document:{addEventListener:()=>{},querySelectorAll:()=>[]},Learning:{setDefinitionTranslations:()=>{}},esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),setTimeout,clearTimeout,AbortController,fetch:async()=>({ok:true,json:async()=>({definitions:{'<script>':'Монгол утга'}})})};context.window=context;
 vm.runInNewContext(await readFile(new URL('../translations.js',import.meta.url),'utf8'),context);await context.Translations.ensure();const html=context.Translations.pair('<script>');assert.match(html,/Монгол утга/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.match(html,/lang="en"/);assert.match(html,/lang="mn"/);
});
