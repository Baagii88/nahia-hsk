window.PDFBooks=(()=>{
 let module;
 function load(){return module??=import('./vendor/pdf-viewer.mjs').catch(e=>{module=null;throw e})}
 async function show(host,options){host.textContent='PDF уншигчийг ачаалж байна…';try{const reader=await load();if(host.isConnected)await reader.show(host,options)}catch{if(host.isConnected){host.textContent='PDF уншигч татагдсангүй. ';const b=document.createElement('button');b.className='secondary';b.textContent='Дахин ачаалах';b.onclick=()=>show(host,options);host.append(b)}}}
 function release(owner){module?.then(m=>m.release(owner)).catch(()=>{})}
 return{show,release};
})();
