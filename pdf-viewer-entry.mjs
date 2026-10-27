import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import {loadBlobPdf} from './pdf-core.mjs';
import {canvasSize,typedBlob} from './media.mjs';
let active=null,sequence=0;
const asset=path=>new URL('./pdf/'+path,import.meta.url).href;
async function destroy(state){if(!state||state.closed)return;state.closed=true;state.generation++;state.renderTask?.cancel();try{await state.loading?.destroy()}catch{}state.worker?.destroy();state.port?.terminate();state.canvas.width=state.canvas.height=0;state.pageProxy?.cleanup();if(state.downloadUrl)URL.revokeObjectURL(state.downloadUrl)}
export function release(owner){if(!active||active.owner!==owner)return;sequence++;const old=active;active=null;return destroy(old)}
function status(s,text){if(!s.closed)s.status.textContent=text}
function paint(s){
 if(s.closed||!s.doc)return Promise.resolve();const revision=++s.generation;s.renderTask?.cancel();
 s.chain=s.chain.catch(()=>{}).then(async()=>{
  if(s.closed||revision!==s.generation)return;
  s.page=Math.max(1,Math.min(s.doc.numPages,Math.trunc(s.page)||1));s.input.value=s.page;s.total.textContent='/ '+s.doc.numPages;s.previous.disabled=s.page===1;s.next.disabled=s.page===s.doc.numPages;
  const width=Math.min(1600,Math.max(260,s.root.clientWidth-24)*s.zoom);
  if(s.painted===s.page&&s.paintedWidth===width)return;
  status(s,s.page+' дүгээр хуудсыг зурж байна…');s.pageProxy?.cleanup();s.pageProxy=null;
  const page=await s.doc.getPage(s.page);if(s.closed||revision!==s.generation){page.cleanup();return}
  s.pageProxy=page;const base=page.getViewport({scale:1}),size=canvasSize(base.width,base.height,width,window.devicePixelRatio||1);
  s.canvas.width=size.width;s.canvas.height=size.height;s.canvas.style.width=size.cssWidth+'px';s.canvas.style.height=size.cssHeight+'px';s.canvas.setAttribute('aria-label',s.title+' · '+s.page+' дүгээр хуудас');
  s.renderTask=page.render({canvas:s.canvas,canvasContext:s.canvas.getContext('2d'),viewport:page.getViewport({scale:size.scale}),transform:size.ratio!==1?[size.ratio,0,0,size.ratio,0,0]:undefined});
  s.renderTask.onContinue=resume=>{if(s.closed||revision!==s.generation)s.renderTask.cancel();else requestAnimationFrame(resume)};
  try{await s.renderTask.promise}catch(e){if(e.name==='RenderingCancelledException')return;throw e}
  if(s.closed||revision!==s.generation)return;s.painted=s.page;s.paintedWidth=width;status(s,'Хуудас '+s.page+' / '+s.doc.numPages);try{localStorage.setItem('nahia-pdf-page:'+s.id,String(s.page))}catch{}
 }).catch(e=>{if(!s.closed)status(s,'Хуудсыг харуулж чадсангүй. Дахин оролдох эсвэл PDF татаж нээгээрэй.');console.warn('Nahia PDF page:',e)});
 return s.chain;
}
function controls(host,options){
 const root=document.createElement('section');root.className='nahia-pdf-reader';root.innerHTML='<div class="pdf-toolbar"><button type="button" data-pdf="previous" aria-label="Өмнөх хуудас">←</button><label>Хуудас <input type="number" min="1" value="1" inputmode="numeric" aria-label="PDF хуудасны дугаар"></label><span class="pdf-total"></span><button type="button" data-pdf="next" aria-label="Дараах хуудас">→</button><select aria-label="PDF томруулах"><option value="1">Тааруулах</option><option value="1.25">125%</option><option value="1.5">150%</option></select><button type="button" data-pdf="retry">↻</button><button type="button" data-pdf="download">PDF татах</button></div><p class="pdf-status" role="status">Номыг нээж байна…</p><div class="pdf-page-scroll"><canvas role="img"></canvas></div>';
 const s={...options,root,canvas:root.querySelector('canvas'),status:root.querySelector('.pdf-status'),input:root.querySelector('input'),total:root.querySelector('.pdf-total'),previous:root.querySelector('[data-pdf=previous]'),next:root.querySelector('[data-pdf=next]'),generation:0,zoom:1,page:options.page||1,chain:Promise.resolve(),closed:false};
 root.addEventListener('click',e=>{const action=e.target.closest('button')?.dataset.pdf;if(action==='previous'){s.page--;paint(s)}if(action==='next'){s.page++;paint(s)}if(action==='retry'){if(!s.doc||s.closed){const parent=s.root.parentElement;if(parent&&active===s){active=null;destroy(s).then(()=>show(parent,options))}}else{s.painted=0;paint(s)}}if(action==='download'&&s.blob){s.downloadUrl??=URL.createObjectURL(typedBlob(s.blob,'PDF'));const a=document.createElement('a');a.href=s.downloadUrl;a.download=s.title.endsWith('.pdf')?s.title:s.title+'.pdf';a.click()}});
 s.input.addEventListener('change',()=>{s.page=Number(s.input.value);paint(s)});s.input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();s.page=Number(s.input.value);paint(s)}});root.querySelector('select').addEventListener('change',e=>{s.zoom=Number(e.target.value);paint(s)});host.replaceChildren(root);return s;
}
export async function show(host,options){
 if(!host.isConnected)return;const call=++sequence;
 if(active?.id===options.id&&!active.closed){host.replaceChildren(active.root);if(options.page)active.page=options.page;if(active.doc)await paint(active);return}
 const old=active;active=null;await destroy(old);if(call!==sequence||!host.isConnected)return;
 const s=controls(host,options);active=s;
 try{
  s.blob=typedBlob(await options.getBlob(),'PDF');if(s.closed||active!==s)return;
  if(!options.page)try{s.page=Number(localStorage.getItem('nahia-pdf-page:'+s.id))||1}catch{}
  if(await s.blob.slice(0,5).text()!=='%PDF-')throw Error('Invalid PDF header');
  // An explicit Worker prevents a silent CPU-heavy fake-worker fallback.
  s.port=new Worker(new URL('./pdf.worker.min.mjs',import.meta.url),{type:'module',name:'nahia-pdf-reader'});s.port.addEventListener('error',()=>{if(!s.closed){status(s,'PDF уншигч ачаалсангүй. ↻ товчоор дахин оролдоорой.');destroy(s)}});s.worker=new pdfjs.PDFWorker({port:s.port});
  s.loading=loadBlobPdf(pdfjs,s.blob,{worker:s.worker,cMapUrl:asset('cmaps/'),standardFontDataUrl:asset('standard_fonts/'),wasmUrl:asset('wasm/'),iccUrl:asset('iccs/'),onError:()=>status(s,'Файлыг уншиж чадсангүй. Төхөөрөмжид бүрэн татагдсан эсэхийг шалгаарай.')});
  const deadline=setTimeout(()=>{if(!s.doc&&!s.closed){status(s,'Ном удаан нээгдэж байна. ↻ товчоор дахин оролдох эсвэл PDF татаж нээгээрэй.');destroy(s)}},25000);try{s.doc=await s.loading.task.promise}finally{clearTimeout(deadline)};if(s.closed||active!==s)return;s.input.max=s.doc.numPages;await paint(s);
 }catch(e){if(s.closed)return;status(s,'PDF номыг нээж чадсангүй. PDF татах товчоор эх файлаа нээж болно.');console.warn('Nahia PDF load:',e)}
}
