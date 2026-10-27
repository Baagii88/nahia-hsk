import { build } from 'esbuild';
import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('vendor',{recursive:true});
await build({entryPoints:['learning-entry.mjs'],outfile:'vendor/learning.js',bundle:true,format:'iife',charset:'utf8',platform:'browser',minify:true,legalComments:'eof',external:['fs','path','crypto'],target:['es2020']});
await copyFile('node_modules/sql.js/dist/sql-wasm.wasm','vendor/sql-wasm.wasm');

await build({entryPoints:['pdf-viewer-entry.mjs'],outfile:'vendor/pdf-viewer.mjs',bundle:true,format:'esm',charset:'utf8',platform:'browser',minify:true,legalComments:'eof',target:['es2022'],external:['node:*']});
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','vendor/pdf.worker.min.mjs');
for(const dir of ['cmaps','standard_fonts','wasm','iccs'])await cp('node_modules/pdfjs-dist/'+dir,'vendor/pdf/'+dir,{recursive:true});
await copyFile('node_modules/pdfjs-dist/LICENSE','vendor/pdf/LICENSE');
