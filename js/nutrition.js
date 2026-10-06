// Nutrient data pulled live from USDA FoodData Central (a US government database).
// Values are per 100 g as published by USDA; nothing is calculated or estimated here.
import { store } from './store.js';

const API = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const WANT = [
  { ids: [1008, 2048, 2047], label: 'Energy' },
  { ids: [1003], label: 'Protein' },
  { ids: [1089], label: 'Iron' },
  { ids: [1087], label: 'Calcium' },
  { ids: [1004], label: 'Fat' },
  { ids: [1079], label: 'Fibre' },
  { ids: [1162], label: 'Vitamin C' },
  { ids: [1095], label: 'Zinc' },
];
const CACHE_DAYS = 30;

export function usdaKey() {
  return store.get().settings.usdaKey?.trim() || window.CL_CONFIG?.usdaKey || 'DEMO_KEY';
}

export async function getNutrients(food) {
  const cached = store.get().nutrientCache[food.slug];
  if (cached && Date.now() - cached.fetchedAt < CACHE_DAYS * 86400000) return cached;

  const params = new URLSearchParams({
    api_key: usdaKey(),
    query: food.usdaQuery,
    dataType: 'Foundation,SR Legacy',
    pageSize: '8',
  });
  const res = await fetch(`${API}?${params}`);
  if (res.status === 429) throw new Error('USDA is limiting requests right now. Try again in a little while.');
  if (!res.ok) throw new Error(`USDA FoodData Central returned ${res.status}.`);
  const json = await res.json();
  const foods = json.foods || [];
  if (!foods.length) throw new Error('USDA has no matching entry for this food.');
  const wanted = food.usdaQuery.toLowerCase();
  const match = foods.find((f) => f.description?.toLowerCase() === wanted) || foods[0];

  const byId = new Map((match.foodNutrients || []).map((n) => [n.nutrientId, n]));
  const nutrients = WANT.map((w) => {
    const n = w.ids.map((id) => byId.get(id)).find(Boolean);
    return n && n.value != null ? { label: w.label, value: n.value, unit: (n.unitName || '').toLowerCase() } : null;
  }).filter(Boolean);

  const result = {
    fdcId: match.fdcId,
    description: match.description,
    dataType: match.dataType,
    url: `https://fdc.nal.usda.gov/food-details/${match.fdcId}/nutrients`,
    nutrients,
    fetchedAt: Date.now(),
  };
  store.cacheNutrients(food.slug, result);
  return result;
}

export function formatValue(n) {
  const v = n.value;
  const digits = v >= 10 ? 0 : v >= 1 ? 1 : 2;
  return `${v.toFixed(digits)} ${n.unit === 'kcal' ? 'kcal' : n.unit}`;
}
