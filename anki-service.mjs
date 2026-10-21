// SPDX-License-Identifier: AGPL-3.0-or-later
// Interoperability built with genanki-js (Copyright 2021 Mani / mkanki Jeremy Apthorp).
import { Deck, Model, Package, APKG_SCHEMA } from 'genanki-js';
import JSZip from 'jszip';
export function stableGuid(id) {
  let hash=2166136261;
  for(const ch of id)hash=Math.imul(hash^ch.charCodeAt(0),16777619);
  return 'nahia'+(hash>>>0).toString(36);
}
const html = value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function exportDeck(SQL, list, name, options={}) {
  const model=new Model({id:'1988198801',name:'Nahia Chinese · 2',flds:['Hanzi','Pinyin','Meaning','Audio','Writing'].map(name=>({name})),req:[[0,'all',[0]]],
    css:'.card{font-family:Arial,sans-serif;text-align:center;background:#f6f7f2;color:#203b32;padding:24px}.hanzi{font-size:70px;color:#185c46}.pinyin{font-size:24px;color:#7d9453}.meaning{font-size:20px;line-height:1.7}button{padding:10px;background:#dce8b3;border:0;border-radius:8px}.write-grid{display:inline-block;background:linear-gradient(45deg,transparent 49.7%,#eee 50%,transparent 50.3%),linear-gradient(-45deg,transparent 49.7%,#eee 50%,transparent 50.3%);border:1px solid #ddd}',
    tmpls:[{name:'Ханз → Утга ба бичих',qfmt:'<div class="hanzi">{{Hanzi}}</div>{{Audio}}',afmt:'{{FrontSide}}<hr id="answer"><div class="pinyin">{{Pinyin}}</div><p class="meaning">{{Meaning}}</p>{{Writing}}'}]});
  const deck=new Deck(1988198802,name),pack=new Package();let audioCount=0;
  for(let i=0;i<list.length;i++){
    const w=list[i],file=`cmn-${w.hanzi}.mp3`;
    let sound='';
    if(options.audio){const data=await options.audio(w);if(data){pack.addMedia(data,file);sound=`[sound:${file}]`;audioCount++}}
    const writing=options.writing?await options.writing(w):'';
    deck.addNote(model.note([html(w.hanzi),html(w.pinyin),html(w.displayMeaning||w.meaning),sound,writing],['Nahia',`HSK_${w.level}`],stableGuid(w.id)));
    options.progress?.(i+1,list.length);
  }
  pack.addDeck(deck);
  for(const [name,data] of options.media||[])pack.addMedia(data,name);
  const db=new SQL.Database();
  try{
    db.run(APKG_SCHEMA);pack.write(db);
    const zip=new JSZip();zip.file('collection.anki2',db.export());
    const media={};pack.media.forEach((item,i)=>{zip.file(String(i),item.data);media[i]=item.name});zip.file('media',JSON.stringify(media));
    return {bytes:await zip.generateAsync({type:'uint8array',compression:'DEFLATE'}),audioCount};
  }finally{db.close()}
}
export async function readDeck(SQL, bytes, plain) {
  const zip=await JSZip.loadAsync(bytes);
  // Modern compressed collections require Anki's protobuf/zstd importer.
  if(zip.file('collection.anki21b'))throw new Error('Шинэ шахалттай APKG байна. Экспортлогч апп дээр “Support older Anki versions” сонголттой экспортлоод дахин оруулна уу.');
  const entry=zip.file('collection.anki21')||zip.file('collection.anki2');
  if(!entry)throw new Error('Багцын картын сан олдсонгүй.');
  if(entry._data?.uncompressedSize>80*1024*1024)throw new Error('Картын өгөгдөл 80 MB-аас их байна.');
  const buffer=await entry.async('uint8array');if(buffer.byteLength>80*1024*1024)throw new Error('Картын өгөгдөл хэт том байна.');
  const db=new SQL.Database(buffer);
  try{
    const models=JSON.parse(db.exec('SELECT models FROM col')[0]?.values[0][0]||'{}');
    const rows=db.exec('SELECT guid, mid, flds FROM notes LIMIT 1001')[0]?.values||[];
    if(rows.length>1000)throw new Error('Нэг удаа 1000 хүртэлх карттай багц оруулна уу.');
    return rows.map(([guid,mid,flds])=>{
      const fields=String(flds).split('\x1f'),names=(models[mid]?.flds||[]).map(f=>f.name.toLowerCase());
      const find=(patterns,fallback)=>{const i=names.findIndex(n=>patterns.some(p=>n.includes(p)));return plain(fields[i<0?fallback:i]||'')};
      const hanzi=find(['hanzi','simplified','expression','汉字','front'],0).replace(/\[sound:[^\]]*\]/g,'').trim();
      return {id:'import:'+stableGuid(String(guid)),hanzi,pinyin:find(['pinyin','拼音'],names.length>2?1:-1),meaning:find(['meaning','definition','translation','back'],names.length>2?2:1),level:'custom'};
    }).filter(w=>w.hanzi&&w.hanzi.length<100);
  }finally{db.close()}
}
