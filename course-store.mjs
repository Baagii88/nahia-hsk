// Keep file metadata separate; listing courses never clones all PDF/audio Blobs.
export function createCourseStore(factory=globalThis.indexedDB,name='nahia-courses'){
 let promise;
 const meta=({blob,...a})=>a;
 const db=()=>promise??=new Promise((resolve,reject)=>{
  const r=factory.open(name,2);
  r.onupgradeneeded=()=>{
   const d=r.result;
   if(!d.objectStoreNames.contains('courses'))d.createObjectStore('courses',{keyPath:'id'});
   if(!d.objectStoreNames.contains('assets'))d.createObjectStore('assets',{keyPath:'id'});
   const m=d.createObjectStore('asset-meta',{keyPath:'id'}),cursor=r.transaction.objectStore('assets').openCursor();
   cursor.onsuccess=()=>{const c=cursor.result;if(c){m.put(meta(c.value));c.continue()}};
  };
  r.onsuccess=()=>{r.result.onversionchange=()=>r.result.close();resolve(r.result)};
  r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Нахиа нээлттэй бусад цонхыг хаагаад дахин ачаалаарай.'));
 });
 async function run(stores,mode,fn){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction(stores,mode);let request;try{request=fn(t)}catch(e){t.abort();reject(e);return}t.oncomplete=()=>resolve(request?.result);t.onerror=()=>{};t.onabort=()=>reject(t.error||Error('Файл хадгалж чадсангүй.'))})}
 return{
  courses:()=>run(['courses'],'readonly',t=>t.objectStore('courses').getAll()),
  metadata:()=>run(['asset-meta'],'readonly',t=>t.objectStore('asset-meta').getAll()),
  get:id=>run(['assets'],'readonly',t=>t.objectStore('assets').get(id)),
  course:c=>run(['courses'],'readwrite',t=>t.objectStore('courses').put(c)),
  put:a=>run(['assets','asset-meta'],'readwrite',t=>{t.objectStore('assets').put(a);t.objectStore('asset-meta').put(meta(a))}),
  stage:a=>run(['assets'],'readwrite',t=>t.objectStore('assets').put(a)),
  discard:ids=>run(['assets'],'readwrite',t=>{for(const id of ids)t.objectStore('assets').delete(id)}),
  commit:(course,files,oldIds)=>run(['courses','assets','asset-meta'],'readwrite',t=>{t.objectStore('courses').put(course);for(const id of oldIds){t.objectStore('assets').delete(id);t.objectStore('asset-meta').delete(id)}for(const f of files)t.objectStore('asset-meta').put(meta(f))}),
  close:async()=>{(await db()).close();promise=undefined}
 };
}
