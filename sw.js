const CACHE='nahia-v2.1.0';
const SHELL=['./','./index.html','./styles.css','./studio.css','./app.js','./studio.js','./school.js','./library.js','./school-library.css','./data/grammar-mn.json','./icon.svg','./manifest.webmanifest','./data/words.json','./data/grammar.json','./data/learning.json','./vendor/learning.js','./vendor/hanzi-writer.js','./vendor/sql-wasm.wasm'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nahia-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{if(r.status===200&&!e.request.headers.has('Range')){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)))}return r}).catch(()=>caches.match(e.request).then(r=>r||Response.error())));
});
