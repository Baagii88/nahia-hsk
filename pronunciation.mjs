// Pronunciation keys retain tones and ü; spacing and apostrophes are editorial.
export const pronunciationKey=value=>String(value||'').normalize('NFC').toLowerCase().replace(/[\s'’·-]/g,'');
export function wordForWriting(words,level,hanzi,entries=[]) {
  return entries.find(w=>w.hanzi===hanzi)||words.find(w=>w.hanzi===hanzi&&w.level===level)||words.find(w=>w.hanzi===hanzi)||{id:'write:'+hanzi,hanzi,level,pinyin:'',meaning:''};
}
export function matchingReading(word,info) {
  if(!info)return null;
  return [info,...(info.r||[])].find(r=>pronunciationKey(r.y)===pronunciationKey(word.pinyin))||null;
}
export function audioIssue(word,words) {
  const readings=new Set(words.filter(w=>w.hanzi===word.hanzi).map(w=>pronunciationKey(w.pinyin)));
  if(readings.size>1)return 'multiple';
  if(!words.some(w=>w.hanzi===word.hanzi&&pronunciationKey(w.pinyin)===pronunciationKey(word.pinyin)&&w.level!=='custom'))return 'unlisted';
  return null;
}
// Use the displayed reading's tones, never the dictionary's first pronunciation.
export function displayTones(word,info) {
  const reading=matchingReading(word,info);
  if(reading?.p)return reading.p.split(/\s+/).filter(Boolean).map(s=>Number(s.match(/[1-5]$/)?.[0])||5);
  const text=String(word.pinyin||'').split('/')[0].normalize('NFD');
  // Every written tone mark identifies one syllable. Neutral syllables need a
  // matching segmented reference; leave those uncoloured if segmentation is unknown.
  const marks=[...text].filter(c=>'\u0304\u0301\u030c\u0300'.includes(c));
  if(marks.length===[...word.hanzi].length)return marks.map(c=>'\u0304\u0301\u030c\u0300'.indexOf(c)+1);
  return [];
}
