/* Nahia-authored Mongolian grammar lessons. */
window.School=(()=>{
 let lessons=null,loading=false,reference=false;
 Studio.views.grammar=()=>{
  const tabs=`<div class="mode-tabs"><button data-school-tab="mn" class="${!reference?'active':''}">Монгол тайлбартай</button><button data-school-tab="reference" class="${reference?'active':''}">Хөтөлбөрийн эх жагсаалт</button></div>`;
  if(reference)return tabs+grammarView();
  const list=(lessons||[]).filter(l=>l.level===state.level&&`${l.title} ${l.pattern} ${l.explanation}`.toLowerCase().includes(filter.toLowerCase()));
  return `${title('ОЙЛГООД ХЭРЭГЛЭЕ','Монгол тайлбартай дүрэм','Бүтэц, тайлбар, орчуулгатай жишээ, жижиг дасгал.')}${tabs}<div class="toolbar"><input id="search" type="search" value="${esc(filter)}" placeholder="Дүрэм хайх…" aria-label="Дүрэм хайх">${levelSelect()}</div><p class="notice">Нахиагийн ${lessons?.length||21} тайлбарт хичээл. Түвшнүүд нь суралцах дарааллын санал; 593 эх дүрмийн бүрэн орчуулга биш.</p>${!lessons?'<p>Хичээл ачаалж байна…</p>':list.map(l=>`<details class="panel lesson"><summary><span class="badge">HSK ${esc(l.level)}</span> ${esc(l.title)}</summary><div class="lesson-body"><p class="grammar-pattern">${esc(l.pattern)}</p><p>${esc(l.explanation)}</p><div class="hint"><strong class="hanzi">${esc(l.zh)}</strong><p class="pinyin">${esc(l.pinyin)}</p><p>${esc(l.mn)}</p></div><h4>Өөрийгөө шалгах</h4><p class="hanzi">${esc(l.question)}</p><details><summary>Хариугаа харах</summary><p class="hanzi">${esc(l.answer)}</p><p>Дээрх бүтцийн хоосон зайд ${esc(l.answer)} орно.</p></details></div></details>`).join('')||'<p>Хайлтад тохирох хичээл олдсонгүй.</p>'}`;
 };
 function afterRender(){if(page==='grammar'&&!lessons&&!loading){loading=true;fetch('data/grammar-mn.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{lessons=d;if(page==='grammar')render()}).catch(()=>{toast('Монгол хичээл ачаалахад алдаа гарлаа.')}).finally(()=>loading=false)}}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-school-tab]');if(b){reference=b.dataset.schoolTab==='reference';filter='';render()}});
 return{afterRender};
})();
