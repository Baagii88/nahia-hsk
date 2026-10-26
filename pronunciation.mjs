import audioMap from './audio-map.json' with {type:'json'};
import characters from './character-dictionary.json' with {type:'json'};
// Pronunciation keys retain tones and ü; spacing and apostrophes are editorial.
export const pronunciationKey=value=>String(value||'').normalize('NFC').toLowerCase().replace(/[\s'’·-]/g,'');
export function numberedPinyin(value){return String(value||'').split(/\s+/).map(s=>{s=s.replace(/u:/g,'ü').replace(/v/g,'ü');const tone=Number(s.match(/[1-5]$/)?.[0])||5;let base=s.replace(/[1-5]$/,'');if(tone===5)return base;let at=base.indexOf('a');if(at<0)at=base.indexOf('e');if(at<0&&base.includes('ou'))at=base.indexOf('o');if(at<0)for(let i=base.length-1;i>=0;i--)if('iouü'.includes(base[i])){at=i;break}if(at<0)return base;const table={a:'āáǎà',e:'ēéěè',i:'īíǐì',o:'ōóǒò',u:'ūúǔù','ü':'ǖǘǚǜ'};return base.slice(0,at)+(table[base[at]]?.[tone-1]||base[at])+base.slice(at+1)}).join(' ')}
export function characterInfo(hanzi){return characters[hanzi]||null}
export function wordForWriting(words,level,hanzi,entries=[]) {
 const found=entries.find(w=>w.hanzi===hanzi)||words.find(w=>w.hanzi===hanzi&&w.level===level)||words.find(w=>w.hanzi===hanzi),info=characterInfo(hanzi);
 const w=found||{id:'write:'+hanzi,hanzi,level,pinyin:'',meaning:''};
 if(info&&!w.pinyin)return {...w,pinyin:numberedPinyin(info.primary||info.p[0]),meaning:info.definitions[info.primary||info.p[0]]||'',traditional:hanzi==='了'?'了':info.traditional};
 return w;
}
export function audioFor(word,words=[]) {
 const example=audioMap.examples[word.hanzi+'|'+pronunciationKey(word.pinyin)];if(example)return{...example,kind:'example'};
 if(audioMap.characters.includes(word.hanzi)||words.some(w=>w.hanzi===word.hanzi&&pronunciationKey(w.pinyin)===pronunciationKey(word.pinyin)&&w.level!=='custom'))return{file:'audio/cmn-'+word.hanzi+'.mp3',kind:'word',text:word.hanzi};
 return null;
}
export function exampleFor(hanzi,pinyin){return audioMap.examples[hanzi+'|'+pronunciationKey(pinyin)]||null}
export function matchingReading(word,info) {
  if(!info)return null;
  return [info,...(info.r||[])].find(r=>pronunciationKey(r.y)===pronunciationKey(word.pinyin))||null;
}
export function audioIssue(word,words) {return audioFor(word,words)?null:'unlisted'}
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
// Traditional form is contextual: grammatical le stays 了 in both scripts.
export function traditionalFor(word) {
  if(word.hanzi==='了'&&pronunciationKey(word.pinyin)==='le')return '了';
  return word.traditional||'';
}
export function formLabel(word) {
  if(!traditionalFor(word))return 'Бичлэгийн холбоос тодорхойгүй';
  return traditionalFor(word)===word.hanzi?'Энэ үгийн хоёр бичлэг ижил':'Эх тольд хоёр бичлэг ялгаатай';
}
