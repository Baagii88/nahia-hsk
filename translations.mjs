import wordMn from './word-mn.json' with {type:'json'};
let definitions={};
export const setDefinitionTranslations=value=>definitions=value;
export const wordMeaning=word=>word?.mn||wordMn[word?.id]||definitions[word?.meaning]||'';
