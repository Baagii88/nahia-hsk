import wordMn from './word-mn.json' with {type:'json'};
import overrides from './vocabulary-overrides.json' with {type:'json'};
import definitionOverrides from './definition-overrides.json' with {type:'json'};
let definitions={};
export const setDefinitionTranslations=value=>definitions={...value,...definitionOverrides};
export const wordMeaning=word=>word?.mn||overrides[word?.id]||wordMn[word?.id]||definitions[word?.meaning]||'';
