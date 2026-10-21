import { fsrs, createEmptyCard, State } from 'ts-fsrs';
const engine = fsrs({ request_retention: 0.9, enable_fuzz: false });
export function hydrateCard(value, now = new Date()) {
  const card = { ...createEmptyCard(now), ...value };
  card.due = new Date(card.due);
  if (card.last_review) card.last_review = new Date(card.last_review);
  if (!Number.isFinite(+card.due)) return createEmptyCard(now);
  return card;
}
export function migrateCard(old, now = new Date()) {
  if (!old || !Number.isFinite(old.due)) return createEmptyCard(now);
  const days = Math.max(0, Number(old.interval) || 0);
  return { ...createEmptyCard(now), due: new Date(old.due), state: days ? State.Review : State.New,
    stability: Math.max(.1, days), difficulty: 5, scheduled_days: days,
    reps: days ? 1 : 0, last_review: days ? new Date(old.due-days*86400000) : undefined };
}
export function preview(card, now = new Date()) { return engine.repeat(hydrateCard(card, now), now); }
export function rate(card, rating, now = new Date()) {
  if (![1,2,3,4].includes(Number(rating))) throw new Error('Invalid rating');
  const result = engine.next(hydrateCard(card, now), now, Number(rating));
  return { card: JSON.parse(JSON.stringify(result.card)), log: JSON.parse(JSON.stringify(result.log)) };
}
export function dueQueue(list, cards, legacy, limit, now = Date.now()) {
  const due = [], fresh = [];
  for (const word of list) {
    const card = cards[word.id];
    const when = card ? +new Date(card.due) : legacy[word.id]?.due;
    if (when === undefined) fresh.push(word);
    else if (when <= now) due.push(word);
  }
  due.sort((a,b)=>+(new Date(cards[a.id]?.due||legacy[a.id]?.due||0))-+(new Date(cards[b.id]?.due||legacy[b.id]?.due||0)));
  return [...due,...fresh].slice(0,limit);
}
export function validateCard(value) {
  if(!value || typeof value !== 'object' || !Number.isFinite(+new Date(value.due))) return false;
  if(![0,1,2,3].includes(value.state)) return false;
  return ['stability','difficulty','elapsed_days','scheduled_days','reps','lapses','learning_steps'].every(k=>Number.isFinite(value[k])&&value[k]>=0) && (!value.last_review||Number.isFinite(+new Date(value.last_review)));
}
