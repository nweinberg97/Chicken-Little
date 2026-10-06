import { store } from './store.js';
import { FOOD, ALLERGEN } from './model.js';
import { getNutrients } from './nutrition.js';
import { ICON, toast, esc } from './ui.js';
import * as V from './views.js';

const app = document.getElementById('app');
const nav = document.getElementById('nav');
const fab = document.getElementById('fab');

// Per-session UI state (search text, filters, current response choice).
const ui = { q: '', cat: 'all', logQ: '', resp: '', note: '', ideaFilter: 'all', historyDays: 7 };

const ROUTES = [
  [/^\/?$/, V.home, 'home'],
  [/^\/welcome$/, V.welcome, null],
  [/^\/explore$/, V.explore, 'explore'],
  [/^\/food\/([\w-]+)$/, V.food, 'explore'],
  [/^\/log$/, V.logPicker, null],
  [/^\/log\/([\w-]+)$/, V.logForm, null],
  [/^\/log-idea\/([\w-]+)$/, V.logIdea, null],
  [/^\/allergens$/, V.allergens, 'allergens'],
  [/^\/allergen\/([\w-]+)$/, V.allergen, 'allergens'],
  [/^\/ideas$/, V.ideas, 'ideas'],
  [/^\/idea\/([\w-]+)$/, V.idea, 'ideas'],
  [/^\/baby$/, V.babyPage, 'baby'],
  [/^\/guide$/, V.guide, 'home'],
  [/^\/sources$/, V.sources, 'baby'],
];

const TABS = [
  ['home', '#/', 'Home', ICON.home],
  ['explore', '#/explore', 'Explore', ICON.search],
  ['ideas', '#/ideas', 'Ideas', ICON.bowl],
  ['allergens', '#/allergens', 'Allergens', ICON.shield],
  ['baby', '#/baby', 'Baby', ICON.baby],
];

function parse() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  return { path, query: new URLSearchParams(qs || '') };
}

let lastPath = null;
function render() {
  const { path, query } = parse();
  if (!store.get().baby && path !== '/welcome') { location.replace('#/welcome'); return; }

  if (path !== lastPath) {
    // reset per-screen state when navigating
    if (!path.startsWith('/log')) { ui.resp = ''; ui.note = ''; }
    if (path === '/log') ui.logQ = '';
    if (path.startsWith('/log/') || path.startsWith('/log-idea/')) { ui.resp = ''; ui.note = ''; }
  }

  let view = V.notFound, tab = null, params = [];
  for (const [re, fn, t] of ROUTES) {
    const m = path.match(re);
    if (m) { view = fn; tab = t; params = m.slice(1); break; }
  }
  app.innerHTML = view(params, ui, query);

  const hideChrome = path === '/welcome' || path.startsWith('/log');
  nav.hidden = hideChrome;
  fab.hidden = hideChrome;
  nav.innerHTML = TABS.map(([id, href, label, icon]) =>
    `<a href="${href}" ${tab === id ? 'aria-current="page"' : ''}>${icon(22)}<span>${label}</span></a>`).join('');

  const title = { home: 'Home', explore: 'Explore', ideas: 'Ideas', allergens: 'Allergens', baby: 'Baby' }[tab];
  document.title = title ? `${title} · Chicken Little` : 'Chicken Little';

  if (path !== lastPath) {
    window.scrollTo(0, 0);
    const t = query.get('t');
    if (t) document.getElementById('t-' + t)?.scrollIntoView();
    const h = app.querySelector('h1');
    if (h && lastPath !== null) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  lastPath = path;
  loadNutrients();
}

async function loadNutrients() {
  const box = document.getElementById('nutrients');
  if (!box) return;
  const f = FOOD[box.dataset.slug];
  try {
    const r = await getNutrients(f);
    if (document.getElementById('nutrients') === box) box.innerHTML = r.nutrients.length ? V.nutrientsHtml(r) : '<div class="small muted">USDA has no nutrient values for this entry.</div>';
  } catch (e) {
    if (document.getElementById('nutrients') === box) {
      box.innerHTML = `<div class="small muted">${esc(!navigator.onLine ? 'Nutrition loads from USDA when you\'re online.' : e instanceof TypeError ? 'Couldn\'t reach USDA FoodData Central right now.' : e.message)}</div>
        <button class="link-btn" data-act="retry-nutrients">Try again</button>`;
    }
  }
}

// ---------- events ----------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  if (act === 'explore-cat') { ui.cat = el.dataset.cat; render(); }
  if (act === 'idea-filter') { ui.ideaFilter = el.dataset.f; render(); }
  if (act === 'jump') document.getElementById('t-' + el.dataset.t)?.scrollIntoView({ behavior: 'smooth' });
  if (act === 'more-history') { ui.historyDays += 7; render(); }
  if (act === 'retry-nutrients') loadNutrients();
  if (act === 'pick-resp') {
    ui.resp = ui.resp === el.dataset.r ? '' : el.dataset.r;
    const note = document.getElementById('note');
    if (note) ui.note = note.value;
    document.querySelectorAll('.resp').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.r === ui.resp)));
    document.getElementById('reaction-slot').innerHTML = ui.resp === 'reaction' ? V.reactionNote() : '';
    const btn = document.querySelector('form[data-form="log"] button[type="submit"]');
    if (btn) btn.textContent = ui.resp === 'reaction' ? 'Save and note reaction' : btn.dataset.label;
  }
  if (act === 'establish') { store.markEstablished(el.dataset.id, true); toast(`${ALLERGEN[el.dataset.id].name} marked as introduced`); render(); }
  if (act === 'unestablish') { store.markEstablished(el.dataset.id, false); render(); }
  if (act === 'delete-log') {
    if (confirm('Delete this entry?')) { store.deleteLog(el.dataset.id); toast('Entry deleted'); render(); }
  }
  if (act === 'export') {
    const blob = new Blob([store.exportBackup()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chicken-little-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Backup downloaded');
  }
  if (act === 'reset') {
    if (confirm('Erase all of this baby\'s data from this device? Download a backup first if you want to keep it.')) {
      store.reset(); location.hash = '#/welcome';
    }
  }
});

document.addEventListener('input', (e) => {
  const k = e.target.dataset.input;
  if (k === 'explore-q') {
    ui.q = e.target.value;
    document.getElementById('explore-results').innerHTML = V.exploreResults(V.exploreFilter(ui));
  }
  if (k === 'log-q') {
    ui.logQ = e.target.value;
    const pos = e.target.selectionStart;
    render();
    const inp = document.getElementById('lq'); inp.focus(); inp.setSelectionRange(pos, pos);
  }
  if (k === 'usda-key') store.setSetting('usdaKey', e.target.value.trim());
});

document.addEventListener('change', async (e) => {
  if (e.target.dataset.input === 'import') {
    const file = e.target.files[0];
    if (!file) return;
    try {
      store.importBackup(await file.text());
      toast('Backup restored');
      render();
    } catch (err) {
      alert(err.message || 'That file could not be read.');
    }
  }
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-form]');
  if (!form) return;
  e.preventDefault();
  const data = new FormData(form);
  if (form.dataset.form === 'baby') {
    const first = !store.get().baby;
    store.setBaby({ name: data.get('name').trim(), birthdate: data.get('birthdate') });
    location.hash = first ? '#/' : '#/baby';
  }
  if (form.dataset.form === 'log') {
    const when = data.get('when');
    let ts = Date.now();
    if (when === 'morning') { const d = new Date(); d.setHours(9, 0, 0, 0); ts = Math.min(ts, d.getTime()); }
    if (when === 'yesterday') ts -= 86400000;
    const slugs = form.dataset.foods.split(',');
    slugs.forEach((food) => store.addLog({ food, response: ui.resp || null, note: data.get('note').trim(), ts }));
    const name = slugs.length === 1 ? FOOD[slugs[0]].name : 'Meal';
    toast(ui.resp === 'reaction' ? `${name} saved with a reaction note` : `${name} saved`);
    ui.resp = ''; ui.note = '';
    location.hash = slugs.length === 1 ? `#/food/${slugs[0]}` : '#/';
  }
});

window.addEventListener('hashchange', render);
render();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
