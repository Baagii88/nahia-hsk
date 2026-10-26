import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('vendor',{recursive:true});
await build({entryPoints:['learning-entry.mjs'],outfile:'vendor/learning.js',bundle:true,format:'iife',charset:'utf8',platform:'browser',minify:true,legalComments:'eof',external:['fs','path','crypto'],target:['es2020']});
await copyFile('node_modules/sql.js/dist/sql-wasm.wasm','vendor/sql-wasm.wasm');
