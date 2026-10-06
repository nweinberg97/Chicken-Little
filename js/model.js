import { DATA } from './data.js';
import { store } from './store.js';

export const SOURCES = Object.fromEntries(DATA.sources.map((s) => [s.id, s]));
export const FOODS = DATA.foods;
export const FOOD = Object.fromEntries(DATA.foods.map((f) => [f.slug, f]));
export const GENERAL = DATA.general;

const SYM = {
  peanut: 'Pn', egg: 'Eg', milk: 'Mk', wheat: 'Wh', soy: 'So', fish: 'Fi',
  'crustaceans-molluscs': 'Cm', 'tree-nuts': 'Tn', sesame: 'Se', mustard: 'Mu',
};
export const ALLERGENS = DATA.allergens.map((a) => ({ ...a, sym: SYM[a.id] || a.name.slice(0, 2) }));
export const ALLERGEN = Object.fromEntries(ALLERGENS.map((a) => [a.id, a]));

// Foods that are "avoid" examples, not foods to log.
export const AVOID = new Set(['popcorn', 'whole-nuts', 'honey', 'hot-dogs']);

export const RESPONSES = [
  { id: 'loved', label: 'Loved' },
  { id: 'liked', label: 'Liked' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'nope', label: 'Not today' },
  { id: 'reaction', label: 'Reaction' },
];
export const RESPONSE = Object.fromEntries(RESPONSES.map((r) => [r.id, r]));

const DAY = 86400000;

export function ageMonths(birthdate, now = new Date()) {
  if (!birthdate) return null;
  const b = new Date(birthdate + 'T00:00:00');
  let m = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) m -= 1;
  return Math.max(0, m);
}

export function stageFor(months) {
  if (months == null) return '6-8 months';
  if (months < 9) return '6-8 months';
  if (months < 12) return '9-12 months';
  return '12+ months';
}

export function ageLabel(months) {
  if (months == null) return '';
  if (months < 24) return `${months} month${months === 1 ? '' : 's'}`;
  const y = Math.floor(months / 12);
  return `${y} year${y === 1 ? '' : 's'}`;
}

export function stageName(months) {
  if (months == null) return '';
  if (months < 6) return 'Getting ready for solids';
  if (months < 9) return 'First tastes';
  if (months < 12) return 'Exploring textures';
  return 'Family foods';
}

export function logsFor(slug) {
  return store.get().logs.filter((l) => l.food === slug).sort((a, b) => b.ts - a.ts);
}

export function foodStatus(slug) {
  const logs = logsFor(slug);
  return {
    count: logs.length,
    last: logs[0] || null,
    latestResponse: logs.find((l) => l.response)?.response || null,
    reaction: logs.some((l) => l.response === 'reaction'),
  };
}

export function triedSlugs() {
  return new Set(store.get().logs.map((l) => l.food));
}

export function daysAgo(ts) {
  if (!ts) return null;
  const start = (d) => new Date(d).setHours(0, 0, 0, 0);
  return Math.round((start(Date.now()) - start(ts)) / DAY);
}

export function whenLabel(ts) {
  const d = daysAgo(ts);
  if (d == null) return 'never';
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  return `${d} days ago`;
}

export function allergenStatus(id) {
  const s = store.get();
  const logs = s.logs
    .filter((l) => FOOD[l.food]?.allergens.includes(id))
    .sort((a, b) => b.ts - a.ts);
  const reaction = logs.some((l) => l.response === 'reaction');
  const week = logs.filter((l) => Date.now() - l.ts < 7 * DAY).length;
  let state = 'not';
  if (s.established[id]) state = 'established';
  else if (logs.length) state = 'introducing';
  const last = logs[0]?.ts || null;
  return {
    id, state, reaction, count: logs.length, week, last,
    stale: state === 'established' && last && daysAgo(last) >= 7,
  };
}

export function allergenSummary() {
  const all = ALLERGENS.map((a) => allergenStatus(a.id));
  return {
    all,
    established: all.filter((a) => a.state === 'established').length,
    introducing: all.filter((a) => a.state === 'introducing').length,
    not: all.filter((a) => a.state === 'not').length,
  };
}

export const STATE_LABEL = { established: 'Established', introducing: 'Introducing', not: 'Not yet' };

// ---------- Ideas ----------
// Combinations of foods only. Every step shown to parents is the food's own
// government-sourced preparation text for the baby's stage — nothing is invented here.
export const IDEAS = [
  { id: 'peanut-cereal-bowl', title: 'Peanut cereal bowl', foods: ['infant-cereal', 'peanut-butter', 'banana'], meals: ['breakfast'] },
  { id: 'egg-avocado', title: 'Egg & avocado mash', foods: ['egg', 'avocado'], meals: ['breakfast', 'lunch'] },
  { id: 'salmon-sweet-potato', title: 'Salmon & sweet potato', foods: ['salmon', 'sweet-potato'], meals: ['lunch', 'dinner'] },
  { id: 'lentil-squash', title: 'Lentil & squash mash', foods: ['lentils-beans', 'squash'], meals: ['lunch', 'dinner'] },
  { id: 'tofu-peas', title: 'Tofu & peas', foods: ['tofu', 'peas'], meals: ['lunch', 'dinner'] },
  { id: 'yogurt-berries', title: 'Yogurt & berries', foods: ['yogurt', 'blueberries'], meals: ['breakfast', 'snack'] },
  { id: 'chicken-broccoli-rice', title: 'Chicken, broccoli & rice', foods: ['chicken', 'broccoli', 'rice'], meals: ['dinner'] },
  { id: 'tahini-toast-pear', title: 'Tahini toast & pear', foods: ['toast', 'sesame-butter', 'pear'], meals: ['breakfast', 'snack'] },
  { id: 'beef-carrot', title: 'Beef & carrot', foods: ['beef', 'carrot'], meals: ['dinner'] },
  { id: 'cheesy-pasta-spinach', title: 'Cheesy pasta & spinach', foods: ['pasta', 'cheese', 'spinach'], meals: ['lunch', 'dinner'] },
  { id: 'oats-apple', title: 'Oats & apple', foods: ['oats', 'apple'], meals: ['breakfast'] },
  { id: 'shrimp-rice-peas', title: 'Shrimp, rice & peas', foods: ['shrimp', 'rice', 'peas'], meals: ['dinner'] },
  { id: 'almond-toast-strawberry', title: 'Almond butter toast & strawberries', foods: ['toast', 'tree-nut-butter', 'strawberries'], meals: ['breakfast', 'snack'] },
];

export function ideaInfo(idea) {
  const tried = triedSlugs();
  const allergens = [...new Set(idea.foods.flatMap((f) => FOOD[f]?.allergens || []))];
  const newFoods = idea.foods.filter((f) => !tried.has(f));
  const newAllergens = allergens.filter((a) => allergenStatus(a).state === 'not');
  const iron = idea.foods.some((f) => FOOD[f]?.ironRich);
  return { allergens, newFoods, newAllergens, allTried: newFoods.length === 0, iron };
}

export function prepFor(slug, stage) {
  const f = FOOD[slug];
  if (!f) return null;
  const exact = f.prep.find((p) => p.stage === stage)
    || (stage === '12+ months' && f.prep.find((p) => p.stage === '9-12 months'));
  if (exact) return { ...exact, exact: true };
  const any = f.prep.find((p) => p.stage !== 'all ages') || f.prep[0];
  return any ? { ...any, exact: false } : null;
}

// Earliest stage at which every food in an idea has stage-specific guidance.
export function ideaFitsStage(idea, stage) {
  return idea.foods.every((slug) => prepFor(slug, stage)?.exact);
}

// One calm suggestion: favour ideas made of tried foods that keep an established
// allergen in the diet, rotating day by day.
export function todaysIdea(stage) {
  const scored = IDEAS.map((idea) => {
    const info = ideaInfo(idea);
    let score = info.allTried ? 10 : 0;
    if (ideaFitsStage(idea, stage)) score += 20;
    for (const a of info.allergens) {
      const st = allergenStatus(a);
      if (st.state === 'established' && (st.stale || !st.last)) score += 5;
      if (st.reaction) score -= 100;
    }
    if (info.iron) score += 2;
    return { idea, info, score };
  }).sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score === scored[0].score);
  const dayIndex = Math.floor(Date.now() / DAY);
  return top[dayIndex % top.length];
}
