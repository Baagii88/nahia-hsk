import test from 'node:test';import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';import {createCanvas} from '@napi-rs/canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import {typedBlob,canvasSize} from '../media.mjs';import {createCourseStore} from '../course-store.mjs';import {loadBlobPdf} from '../pdf-core.mjs';
test('Legacy ZIP-imported PDFs get application/pdf on read without rewriting or decoding the whole file',async()=>{
 const store=createCourseStore(new IDBFactory()),source=new Blob(['%PDF-1.5\nunchanged']);await store.stage({id:'legacy',format:'PDF',blob:source});
 const file=await store.get('legacy');assert.equal(file.blob.type,'application/pdf');assert.equal(await file.blob.text(),await source.text());
 assert.equal(typedBlob(new Blob(['audio']),'MP3').type,'audio/mpeg');assert.equal(typedBlob(file.blob,'PDF'),file.blob);await store.close();
});
test('Page backing buffers remain capped even on a large high-DPI screen at high zoom',()=>{
 for(const width of [300,700,1600,2400])for(const ratio of [1,2,4]){const s=canvasSize(595,842,width,ratio);assert.ok(s.width*s.height<=2400000);assert.equal(Math.round(s.cssWidth),width);assert.ok(s.width>0&&s.height>0)}
});
// A tiny synthetic two-page in-memory PDF, not a publisher book or output artifact.
function samplePdf(){let text='%PDF-1.4\n';const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Count 2 /Kids [3 0 R 5 0 R] >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Resources << >> /Contents 4 0 R >>',null,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Resources << >> /Contents 6 0 R >>',null],green='0 1 0 rg 10 10 80 80 re f\n',blue='0 0 1 rg 10 10 80 80 re f\n';objects[3]=`<< /Length ${green.length} >>\nstream\n${green}endstream`;objects[5]=`<< /Length ${blue.length} >>\nstream\n${blue}endstream`;const offsets=[0];for(const [i,s] of objects.entries()){offsets.push(text.length);text+=`${i+1} 0 obj\n${s}\nendobj\n`}const xref=text.length;text+='xref\n0 7\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;return new Blob([text])}
test('The actual PDF.js engine renders real page pixels from range slices and changes pages',async()=>{
 const blob=samplePdf();Object.defineProperty(blob,'arrayBuffer',{value:()=>{throw Error('Full-document read forbidden')}});
 const loading=loadBlobPdf(pdfjs,blob);const doc=await loading.task.promise;assert.equal(doc.numPages,2);
 for(const [number,channel] of [[1,1],[2,2]]){const page=await doc.getPage(number),canvas=createCanvas(100,100),context=canvas.getContext('2d');await page.render({canvas,canvasContext:context,viewport:page.getViewport({scale:1})}).promise;const pixel=context.getImageData(50,50,1,1).data;assert.equal(pixel[channel],255);assert.equal(pixel[0],0);page.cleanup()}
 assert.ok(loading.stats.requests>0);assert.ok(loading.stats.bytes<=blob.size);await loading.destroy();
});
