/* English source definitions remain visible beside Mongolian translations. */
window.Translations=(()=>{
 let definitions=null,pending=null,error='';
 function pair(source){const mn=definitions?.[source];return `${mn?`<p class="mn-definition" lang="mn">${esc(mn)}</p>`:''}<p class="en-definition" lang="en">${esc(source)}</p>`}
 function decorate(){for(const el of document.querySelectorAll('[data-meaning-source]')){const w=words.find(w=>w.id===el.dataset.meaningId)||{id:el.dataset.meaningId,meaning:el.dataset.meaningSource};el.innerHTML=meaningPair(w,false)}for(const el of document.querySelectorAll('[data-definition-en]'))el.innerHTML=pair(el.dataset.definitionEn);for(const el of document.querySelectorAll('.translation-status'))el.textContent=definitions?'Монгол · автомат орчуулга. Англи эхийг хамт харуулна.':error||'Монгол тайлбарыг ачаалж байна…';for(const el of document.querySelectorAll('[data-translation-retry]'))el.hidden=!error}
 async function ensure(){if(definitions||pending)return pending;error='';const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);pending=(async()=>{try{const r=await fetch('data/mn-translations.json',{signal:controller.signal});if(!r.ok)throw Error();const data=await r.json();definitions=Learning.setDefinitionTranslations(data.definitions)||data.definitions;decorate()}catch{error='Монгол дэлгэрэнгүй тайлбар татагдсангүй. Англи эхийг уншиж, дахин ачаалж болно.';decorate()}finally{clearTimeout(timer);pending=null}})();return pending}
 document.addEventListener('click',e=>{if(e.target.closest('[data-translation-retry]')){ensure();decorate()}});
 return{pair,ensure,decorate,status:()=>definitions?'Монгол · автомат орчуулга. Англи эхийг хамт харуулна.':error||'Монгол тайлбарыг ачаалж байна…'};
})();
