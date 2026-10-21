export const hanCharacters = text => [...text].filter(c=>/\p{Script=Han}/u.test(c));
export function writingEntries(words, level, mode='words') {
  const list=words.filter(w=>w.level===level&&hanCharacters(w.hanzi).length);
  if(mode==='words')return list;
  const seen=new Set(),entries=[];
  for(const word of list)for(const char of hanCharacters(word.hanzi)){
    if(seen.has(char))continue;seen.add(char);
    const exact=list.find(w=>w.hanzi===char)||words.find(w=>w.hanzi===char);
    entries.push({id:`hanzi:${level}:${char}`,hanzi:char,level,pinyin:exact?.pinyin||'',meaning:exact?.meaning||'',sample:word.hanzi});
  }
  return entries;
}
export function selectionForLevel(words,level,mode,current,reset=false) {
  const entries=writingEntries(words,level,mode);
  return (!reset&&entries.find(w=>w.hanzi===current)||entries[0])?.hanzi||'';
}
export function searchWriting(entries,query) {
  const normalize=value=>String(value).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
  const q=normalize(query.trim());
  return entries.filter(w=>normalize(`${w.hanzi} ${w.pinyin} ${w.meaning}`).includes(q));
}
