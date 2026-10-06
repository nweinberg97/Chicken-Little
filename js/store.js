// Device-only storage. Everything lives in this browser's localStorage.
const KEY = 'chicken-little:v1';

const empty = () => ({
  version: 1,
  baby: null,               // { name, birthdate: 'YYYY-MM-DD' }
  logs: [],                 // { id, food, ts, response, note }
  established: {},          // allergenId -> timestamp the parent marked it introduced
  settings: { usdaKey: '' },
  nutrientCache: {},        // food slug -> USDA FoodData Central result
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save', e);
  }
  listeners.forEach((fn) => fn(state));
}

export const store = {
  get: () => state,
  subscribe: (fn) => listeners.add(fn),

  setBaby(baby) { state.baby = baby; save(); },

  addLog({ food, response, note, ts }) {
    const log = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), food, response, note: note || '', ts: ts || Date.now() };
    state.logs.push(log);
    save();
    return log;
  },
  deleteLog(id) { state.logs = state.logs.filter((l) => l.id !== id); save(); },

  markEstablished(id, on = true) {
    if (on) state.established[id] = Date.now(); else delete state.established[id];
    save();
  },

  setSetting(k, v) { state.settings[k] = v; save(); },
  cacheNutrients(slug, data) { state.nutrientCache[slug] = data; save(); },

  exportBackup() {
    const { nutrientCache, ...rest } = state;
    return JSON.stringify({ app: 'chicken-little', exportedAt: new Date().toISOString(), ...rest }, null, 2);
  },
  importBackup(text) {
    const data = JSON.parse(text);
    if (data.app !== 'chicken-little' || !Array.isArray(data.logs)) throw new Error('This file is not a Chicken Little backup.');
    const { app, exportedAt, ...rest } = data;
    state = { ...empty(), ...rest };
    save();
  },
  reset() { state = empty(); save(); },
};
