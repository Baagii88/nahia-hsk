import {build} from 'esbuild';
await build({entryPoints:['anki-service.mjs'],outfile:'.test-build/anki-service.cjs',bundle:true,platform:'node',format:'cjs'});
