import { store } from './store.js';
import {
  FOODS, FOOD, ALLERGENS, ALLERGEN, GENERAL, SOURCES, AVOID, RESPONSES, RESPONSE, IDEAS, STATE_LABEL,
  ageMonths, ageLabel, stageFor, stageName, foodStatus, logsFor, allergenStatus, allergenSummary,
  whenLabel, ideaInfo, prepFor, ideaFitsStage, todaysIdea,
} from './model.js';
import { esc, LOGO, ICON, RESP_ICON, cite, tile, dateLabel, timeLabel, shortAgency } from './ui.js';

const DAY = 86400000;

// ---------- shared bits ----------
function baby() {
  const b = store.get().baby;
  const months = ageMonths(b?.birthdate);
  return { ...b, months, stage: stageFor(months) };
}

function topbar(title, back = '#/') {
  return `<div class="topbar">
    <a class="icon-btn" href="${back}" aria-label="Back">${ICON.back()}</a>
    ${title ? `<h1>${esc(title)}</h1>` : ''}
  </div>`;
}

function g(topic, includes) {
  return GENERAL.filter((x) => x.topic === topic && (!includes || x.text.includes(includes)));
}

function gBlock(items, cls = '') {
  return items.map((x) => `<div class="stack-sm ${cls}"><div>${esc(x.text)}</div>${cite(x.sourceIds)}</div>`).join('');
}

function statusPill(st) {
  if (st.reaction) return `<span class="pill reaction">Reaction noted</span>`;
  return `<span class="pill ${st.state}">${STATE_LABEL[st.state]}</span>`;
}

function allergenBar(sum) {
  return `<div class="bar" role="img" aria-label="${sum.established} established, ${sum.introducing} introducing, ${sum.not} not yet">
    ${sum.established ? `<span style="flex:${sum.established};background:var(--pea)"></span>` : ''}
    ${sum.introducing ? `<span style="flex:${sum.introducing};background:var(--yolk)"></span>` : ''}
    ${sum.not ? `<span style="flex:${sum.not};background:var(--oat-deep)"></span>` : ''}
  </div>
  <div class="row between small muted">
    <span><b style="color:var(--pea-deep)">${sum.established}</b> established</span>
    <span><b style="color:var(--yolk-deep)">${sum.introducing}</b> introducing</span>
    <span><b style="color:var(--cocoa)">${sum.not}</b> not yet</span>
  </div>`;
}

function foodSubtitle(f) {
  const st = foodStatus(f.slug);
  const parts = [];
  if (AVOID.has(f.slug)) parts.push('Safety info');
  else parts.push(st.count ? `Served ${st.count}×, last ${whenLabel(st.last.ts)}` : 'Not tried yet');
  if (f.allergens.length) parts.push(f.allergens.map((a) => ALLERGEN[a]?.name).join(', '));
  return parts.join(' · ');
}

function foodRow(f, href) {
  const st = foodStatus(f.slug);
  const resp = st.latestResponse ? RESP_ICON[st.latestResponse].replace('width="26" height="26"', 'width="22" height="22"') : '';
  return `<a class="list-item" href="${href || `#/food/${f.slug}`}">
    ${tile(f)}
    <span class="grow stack-sm" style="gap:2px"><b>${esc(f.name)}</b><span class="small muted">${esc(foodSubtitle(f))}</span></span>
    ${resp ? `<span title="${esc(RESPONSE[st.latestResponse].label)}">${resp}</span>` : ''}
    ${AVOID.has(f.slug) ? '<span class="pill reaction">Avoid</span>' : ''}
  </a>`;
}

// ---------- welcome ----------
export function welcome() {
  const b = store.get().baby || {};
  return `<div class="page welcome">
    ${LOGO(96)}
    <h1 class="wordmark">Chicken<br><span>Little</span></h1>
    <p class="muted" style="margin:0;font-size:18px">Know what to serve. Know what's been tried. Feel good about what's next.</p>
    <form class="card" data-form="baby">
      <div class="field"><label for="bname">Baby's name</label>
        <input class="input" id="bname" name="name" required autocomplete="off" value="${esc(b.name || '')}" placeholder="e.g. Emma"></div>
      <div class="field"><label for="bdate">Birthday</label>
        <input class="input" id="bdate" name="birthdate" type="date" required value="${esc(b.birthdate || '')}" max="${new Date().toISOString().slice(0, 10)}"></div>
      <button class="btn dark block" type="submit">Let's go</button>
      <div class="tiny muted">Your baby's info and logs stay on this device.</div>
    </form>
  </div>`;
}

// ---------- home ----------
export function home() {
  const b = baby();
  const s = store.get();
  const sum = allergenSummary();
  const stale = sum.all.filter((a) => a.stale && !a.reaction).sort((x, y) => x.last - y.last);
  const intro = sum.all.filter((a) => a.state === 'introducing' && !a.reaction).sort((x, y) => y.last - x.last);
  const reactions = sum.all.filter((a) => a.reaction);

  let nudge = '';
  if (stale[0]) {
    const a = ALLERGEN[stale[0].id];
    nudge = `<div class="note yolk row"><span class="grow">${esc(a.name)} hasn't been served in ${Math.round((Date.now() - stale[0].last) / DAY)} days.</span>
      <a class="btn dark small" href="#/log?allergen=${a.id}">Log ${esc(a.name.toLowerCase())}</a></div>`;
  } else if (intro[0]) {
    const a = ALLERGEN[intro[0].id];
    nudge = `<div class="note yolk row"><span class="grow">You've started ${esc(a.name.toLowerCase())}. Ready to keep going?</span>
      <a class="btn dark small" href="#/allergen/${a.id}">Continue</a></div>`;
  } else if (sum.established === 0) {
    nudge = `<div class="note yolk row"><span class="grow">Common allergens can be introduced from about 6 months.</span>
      <a class="btn dark small" href="#/allergens">See how</a></div>`;
  }

  const firstSeen = new Map();
  [...s.logs].sort((x, y) => x.ts - y.ts).forEach((l) => { if (!firstSeen.has(l.food)) firstSeen.set(l.food, l.ts); });
  const tried = firstSeen.size;
  const newWeek = [...firstSeen.values()].filter((ts) => Date.now() - ts < 7 * DAY).length;
  const loved = FOODS.filter((f) => foodStatus(f.slug).latestResponse === 'loved').length;

  const t = todaysIdea(b.stage);
  const recent = [...s.logs].sort((x, y) => y.ts - x.ts).slice(0, 4);

  return `<div class="page">
    <div class="row">
      <span class="tile lg" style="background:var(--yolk);color:var(--cocoa);border-radius:28px" aria-hidden="true">${esc((b.name || '?').slice(0, 1).toUpperCase())}</span>
      <div class="grow stack-sm" style="gap:0">
        <h1 class="h-xl">Hi, ${esc(b.name)}'s crew</h1>
        <span class="small muted">${esc(ageLabel(b.months))}${b.months != null ? ' · ' + esc(stageName(b.months)) : ''}</span>
      </div>
      ${LOGO(40)}
    </div>

    ${b.months != null && b.months < 6 ? `<div class="note sky">${gBlock(g('when-to-start').slice(0, 1))}</div>` : ''}

    ${reactions.map((r) => `<div class="note berry"><b>You noted a possible reaction to ${esc(ALLERGEN[r.id].name.toLowerCase())}.</b>
      Talk with your baby's health care provider before serving it again.<div style="margin-top:6px"><a href="#/allergen/${r.id}" style="color:inherit;font-weight:700">View details</a></div></div>`).join('')}

    <section class="card" aria-labelledby="h-all">
      <div class="row between"><h2 class="h2" id="h-all">Allergens</h2><a class="link-btn" href="#/allergens">See all</a></div>
      ${allergenBar(sum)}
      ${nudge}
    </section>

    <div class="stats">
      <a class="stat sky" href="#/baby"><span class="num">${tried}</span><span class="lbl">foods tried</span></a>
      <a class="stat berry" href="#/baby"><span class="num">${loved}</span><span class="lbl">loved</span></a>
      <a class="stat plum" href="#/baby"><span class="num">${newWeek}</span><span class="lbl">new this week</span></a>
    </div>

    ${t ? `<a class="hero yolk" href="#/idea/${t.idea.id}" style="text-decoration:none">
      <span class="eyebrow">Today's idea</span>
      <span class="h-xl">${esc(t.idea.title)}</span>
      <span class="small" style="color:#3D2E00">${esc(t.idea.foods.map((f) => FOOD[f].name).join(' · '))}</span>
      <span class="row wrap" style="gap:8px">
        ${t.info.allergens.map((a) => `<span class="pill white">Contains ${esc(ALLERGEN[a].name.toLowerCase())}</span>`).join('')}
        ${t.info.allTried ? `<span class="pill white" style="color:var(--pea-deep)">All foods tried</span>` : `<span class="pill white">New: ${esc(t.info.newFoods.map((f) => FOOD[f].name).join(', '))}</span>`}
      </span>
    </a>` : ''}

    <section class="stack" aria-labelledby="h-recent">
      <div class="row between"><h2 class="h2" id="h-recent">Recently</h2>${recent.length ? '<a class="link-btn" href="#/baby">History</a>' : ''}</div>
      ${recent.length ? `<div class="list">${recent.map((l) => logRow(l)).join('')}</div>`
        : `<div class="card empty">Nothing logged yet. Tap <b>+</b> to log your first food.</div>`}
    </section>

    <a class="card row" href="#/guide" style="text-decoration:none;color:inherit">
      <span class="tile" style="background:var(--sky-tint);color:var(--sky-deep)">${ICON.book()}</span>
      <span class="grow stack-sm" style="gap:2px"><b>Feeding basics</b><span class="small muted">Starting solids, choking, allergens, milk and more, from Health Canada, HealthLink BC, CDC and USDA</span></span>
      ${ICON.chevron()}
    </a>
  </div>`;
}

function logRow(l, withDelete = false, showDate = !withDelete) {
  const f = FOOD[l.food];
  if (!f) return '';
  const r = RESPONSE[l.response];
  return `<div class="list-item">
    <a href="#/food/${f.slug}" class="row grow" style="text-decoration:none;color:inherit">
      ${tile(f)}
      <span class="grow stack-sm" style="gap:2px"><b>${esc(f.name)}</b>
        <span class="small muted">${showDate ? esc(dateLabel(l.ts)) + ' · ' : ''}${esc(timeLabel(l.ts))}${l.note ? ' · ' + esc(l.note) : ''}</span></span>
      ${r ? `<span class="row small" style="gap:6px">${RESP_ICON[r.id].replace('width="26" height="26"', 'width="20" height="20"')}<span class="muted">${esc(r.label)}</span></span>` : ''}
    </a>
    ${withDelete ? `<button class="icon-btn" style="background:none" data-act="delete-log" data-id="${l.id}" aria-label="Delete ${esc(f.name)} entry">${ICON.trash()}</button>` : ''}
  </div>`;
}

// ---------- explore ----------
const CATS = [
  ['all', 'All'], ['fruit', 'Fruit'], ['vegetable', 'Veggies'], ['grain', 'Grains'], ['protein', 'Protein'], ['dairy', 'Dairy'], ['allergen', 'Allergens'], ['avoid', 'Avoid'],
];
export function explore(params, ui) {
  const cat = ui.cat || 'all';
  const list = exploreFilter(ui);
  return `<div class="page">
    <div class="topbar"><h1>Explore</h1><a class="icon-btn" href="#/guide" aria-label="Feeding basics">${ICON.book()}</a></div>
    <div class="search">${ICON.search(20)}<label class="sr-only" for="q">Search foods</label>
      <input class="input" id="q" type="search" placeholder="Search foods" value="${esc(ui.q || '')}" data-input="explore-q" autocomplete="off"></div>
    <div class="chips" role="group" aria-label="Filter">${CATS.map(([id, label]) =>
      `<button class="chip" data-act="explore-cat" data-cat="${id}" aria-pressed="${cat === id}">${label}</button>`).join('')}</div>
    <div id="explore-results">${exploreResults(list)}</div>
  </div>`;
}
export function exploreResults(list) {
  return list.length ? `<div class="list">${list.map((f) => foodRow(f)).join('')}</div>` : `<div class="card empty">No foods match that search.</div>`;
}
export function exploreFilter(ui) {
  const q = (ui.q || '').trim().toLowerCase();
  const cat = ui.cat || 'all';
  return FOODS.filter((f) => {
    if (q && !f.name.toLowerCase().includes(q)) return false;
    if (cat === 'all') return true;
    if (cat === 'allergen') return f.allergens.length && !AVOID.has(f.slug);
    if (cat === 'avoid') return AVOID.has(f.slug);
    return f.category === cat && !AVOID.has(f.slug);
  });
}

// ---------- food ----------
const STAGES = ['6-8 months', '9-12 months', '12+ months', 'all ages'];
export function food([slug]) {
  const f = FOOD[slug];
  if (!f) return notFound();
  const b = baby();
  const st = foodStatus(slug);
  const avoid = AVOID.has(slug);
  const prep = [...f.prep].sort((x, y) => STAGES.indexOf(x.stage) - STAGES.indexOf(y.stage));
  const hist = logsFor(slug).slice(0, 6);

  return `<div class="page">
    ${topbar('', '#/explore')}
    <div class="row">${tile(f, true)}
      <div class="grow stack-sm" style="gap:4px">
        <h1 class="h-xl">${esc(f.name)}</h1>
        <span class="small muted">${avoid ? 'Safety information' : st.count ? `Served ${st.count}× · last ${whenLabel(st.last.ts)}` : 'Not tried yet'}</span>
      </div>
    </div>
    <div class="row wrap" style="gap:8px">
      ${avoid ? '<span class="pill reaction">Not for babies as is</span>' : ''}
      ${f.ironRich ? '<span class="pill established">Iron-rich</span>' : ''}
      ${f.allergens.map((a) => `<a class="pill introducing" href="#/allergen/${a}" style="text-decoration:none">Allergen: ${esc(ALLERGEN[a].name)}</a>`).join('')}
      ${st.latestResponse ? `<span class="pill white">${esc(RESPONSE[st.latestResponse].label)}</span>` : ''}
    </div>
    ${avoid ? '' : `<a class="btn dark block" href="#/log/${slug}">${ICON.plus(18)} Log ${esc(f.name.toLowerCase())}</a>`}

    ${prep.length ? `<section class="card"><h2 class="h2">How to serve</h2>
      ${prep.map((p) => `<div class="stage${p.stage === b.stage ? ' current' : ''}">
        <span class="st">${esc(p.stage === 'all ages' ? 'Good to know' : p.stage)}${p.stage === b.stage ? ` · ${esc(b.name || 'Baby')} now` : ''}</span>
        <span>${esc(p.text)}</span>${cite(p.sourceIds)}</div>`).join('')}
    </section>` : ''}

    ${f.safety.length ? `<section class="card"><h2 class="h2">Safety</h2>
      ${f.safety.map((x) => `<div class="safety"><span style="color:var(--berry-deep)">${ICON.alert()}</span><div class="stack-sm grow" style="gap:4px"><span>${esc(x.text)}</span>${cite(x.sourceIds)}</div></div>`).join('')}
    </section>` : ''}

    ${avoid ? '' : `<section class="card" aria-labelledby="h-n"><div class="row between"><h2 class="h2" id="h-n">Nutrition</h2><span class="tiny muted">per 100 g</span></div>
      <div id="nutrients" data-slug="${slug}"><div class="small muted">Loading from USDA FoodData Central…</div></div>
    </section>`}

    ${hist.length ? `<section class="stack"><h2 class="h2">${esc(b.name || 'Baby')}'s history</h2>
      <div class="list">${hist.map((l) => `<div class="list-item">
        <span class="grow stack-sm" style="gap:2px"><b>${esc(dateLabel(l.ts))}</b><span class="small muted">${esc(timeLabel(l.ts))}${l.note ? ' · ' + esc(l.note) : ''}</span></span>
        ${l.response ? `<span class="row small" style="gap:6px">${RESP_ICON[l.response].replace('width="26" height="26"', 'width="20" height="20"')}${esc(RESPONSE[l.response].label)}</span>` : ''}
      </div>`).join('')}</div></section>` : ''}
  </div>`;
}

export function nutrientsHtml(r) {
  return `<div class="nutri">${r.nutrients.map((n) => `<div><b>${esc(fmt(n))}</b><span class="small muted">${esc(n.label)}</span></div>`).join('')}</div>
    <div class="cite">USDA FoodData Central: <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.description)}</a> (${esc(r.dataType)}). Nutrition facts only, not serving advice.</div>`;
}
function fmt(n) {
  const v = n.value;
  const d = v >= 10 ? 0 : v >= 1 ? 1 : 2;
  return `${v.toFixed(d)} ${n.unit}`;
}

// ---------- log ----------
export function logPicker(params, ui, query) {
  const allergen = query.get('allergen');
  const q = (ui.logQ || '').trim().toLowerCase();
  const recentSlugs = [...new Set([...store.get().logs].sort((a, b) => b.ts - a.ts).map((l) => l.food))];
  let foods = FOODS.filter((f) => !AVOID.has(f.slug));
  if (allergen) foods = foods.filter((f) => f.allergens.includes(allergen));
  if (q) foods = foods.filter((f) => f.name.toLowerCase().includes(q));
  foods.sort((a, b) => {
    const ra = recentSlugs.indexOf(a.slug), rb = recentSlugs.indexOf(b.slug);
    return (ra < 0 ? 999 : ra) - (rb < 0 ? 999 : rb) || a.name.localeCompare(b.name);
  });
  return `<div class="page">
    ${topbar(allergen ? `Log ${ALLERGEN[allergen]?.name.toLowerCase() || ''}` : 'What did they eat?', allergen ? `#/allergen/${allergen}` : '#/')}
    <div class="search">${ICON.search(20)}<label class="sr-only" for="lq">Search foods</label>
      <input class="input" id="lq" type="search" placeholder="Search foods" value="${esc(ui.logQ || '')}" data-input="log-q" autocomplete="off"></div>
    <div id="log-results">${foods.length ? `<div class="list">${foods.map((f) => foodRow(f, `#/log/${f.slug}`)).join('')}</div>` : `<div class="card empty">No foods match.</div>`}</div>
  </div>`;
}

function reactionNote() {
  const severe = g('reaction-signs', 'Severe');
  const er = g('emergency', 'severe allergic');
  return `<div class="note berry stack-sm" id="reaction-note">
    <b>We'll keep this on ${esc(baby().name || 'baby')}'s record so you can share it with your health care provider.</b>
    ${gBlock(severe)}${gBlock(er)}
  </div>`;
}

export function logForm([slug], ui) {
  const f = FOOD[slug];
  if (!f || AVOID.has(slug)) return notFound();
  return logFormFor([f], `#/log/${slug}`, `Save ${f.name.toLowerCase()}`, ui);
}

export function logIdea([id], ui) {
  const idea = IDEAS.find((i) => i.id === id);
  if (!idea) return notFound();
  return logFormFor(idea.foods.map((s) => FOOD[s]), `#/idea/${id}`, 'Save meal', ui, idea);
}

function logFormFor(foods, back, saveLabel, ui, idea) {
  const r = ui.resp || '';
  const single = foods.length === 1 ? foods[0] : null;
  return `<div class="page">
    <div class="row">
      ${single ? tile(single, true) : `<span class="tile lg grain" aria-hidden="true">${ICON.bowl(26)}</span>`}
      <div class="grow stack-sm" style="gap:2px">
        <h1 class="h-xl">${esc(single ? single.name : idea.title)}</h1>
        <span class="small muted">${esc(single ? foodSubtitle(single) : foods.map((f) => f.name).join(' · '))}</span>
      </div>
      <a class="icon-btn" href="${back}" aria-label="Close">${ICON.close()}</a>
    </div>
    <form class="stack" data-form="log" data-foods="${foods.map((f) => f.slug).join(',')}">
      <fieldset style="border:0;padding:0;margin:0" class="stack">
        <legend class="h2" style="margin-bottom:10px">How did ${esc(baby().name || 'baby')} respond?</legend>
        <div class="responses">${RESPONSES.map((x) => `<button type="button" class="resp" data-act="pick-resp" data-r="${x.id}" aria-pressed="${r === x.id}">${RESP_ICON[x.id]}${esc(x.label)}</button>`).join('')}</div>
      </fieldset>
      <div id="reaction-slot">${r === 'reaction' ? reactionNote() : ''}</div>
      <div class="field"><label for="when">When</label>
        <select class="input" id="when" name="when">
          <option value="now">Just now</option><option value="morning">This morning</option><option value="yesterday">Yesterday</option>
        </select></div>
      <div class="field"><label for="note">Note <span class="muted" style="font-weight:400">(optional)</span></label>
        <textarea class="input" id="note" name="note" placeholder="Mashed, ate a few spoonfuls…">${esc(ui.note || '')}</textarea></div>
      <button class="btn dark block" type="submit" data-label="${esc(saveLabel)}" style="min-height:56px;font-size:17px">${esc(r === 'reaction' ? 'Save and note reaction' : saveLabel)}</button>
    </form>
  </div>`;
}
export { reactionNote };

// ---------- allergens ----------
export function allergens() {
  const sum = allergenSummary();
  return `<div class="page">
    <div class="topbar"><h1>Allergens</h1><span class="pill white">Health Canada list</span></div>
    <div class="card tight">${allergenBar(sum)}</div>
    <div class="agrid">${ALLERGENS.map((a) => {
      const st = allergenStatus(a.id);
      const meta = st.state === 'not' ? 'Tap to see how to start'
        : `${st.last ? 'Last ' + whenLabel(st.last) : ''}${st.state === 'established' ? ` · ${st.week} this week` : ` · ${st.count} serving${st.count === 1 ? '' : 's'}`}`;
      const tint = st.reaction ? 'reaction' : st.state;
      return `<a class="acard" href="#/allergen/${a.id}">
        <span class="row" style="gap:8px"><span class="pill ${tint}" style="width:36px;height:36px;justify-content:center;border-radius:11px;padding:0;font:800 14px var(--display)">${esc(a.sym)}</span>
        <b class="grow" style="font-size:14px;line-height:1.15">${esc(a.name)}</b></span>
        ${statusPill(st)}
        <span class="meta">${esc(meta)}</span>
      </a>`;
    }).join('')}</div>
    <div class="tiny muted stack-sm" style="padding:0 4px">
      <span>Tracking an introduction isn't a medical guarantee against allergy. For a possible reaction, or if your baby is at higher risk, talk to your health care provider.</span>
      <span>List: Health Canada priority food allergens. Sulphites are on that list too but are a food additive, so they aren't tracked here.</span>
      ${cite(['hc-allergens'])}
    </div>
  </div>`;
}

export function allergen([id]) {
  const a = ALLERGEN[id];
  if (!a) return notFound();
  const st = allergenStatus(id);
  const foods = FOODS.filter((f) => f.allergens.includes(id) && !AVOID.has(f.slug));
  const logs = store.get().logs.filter((l) => FOOD[l.food]?.allergens.includes(id)).sort((x, y) => y.ts - x.ts);
  const keep = g('allergen-introduction', 'keep offering');
  const risk = g('allergen-introduction', 'higher risk');
  return `<div class="page">
    ${topbar(a.name, '#/allergens')}
    <div class="card">
      <div class="row between">${statusPill(st)}<span class="small muted">${st.count} serving${st.count === 1 ? '' : 's'} logged</span></div>
      <div class="row between small"><span class="muted">Last served</span><b>${st.last ? esc(whenLabel(st.last)) : '—'}</b></div>
      <div class="row between small"><span class="muted">This week</span><b>${st.week}</b></div>
      <div class="row wrap">
        <a class="btn dark small grow" href="#/log?allergen=${id}">${ICON.plus(18)} Log ${esc(a.name.toLowerCase())}</a>
        ${st.reaction ? '' : st.state === 'established'
          ? `<button class="btn ghost small" data-act="unestablish" data-id="${id}">Undo introduced</button>`
          : st.count ? `<button class="btn yolk small" data-act="establish" data-id="${id}">${ICON.check()} Mark as introduced</button>` : ''}
      </div>
      ${st.state !== 'not' && !st.reaction ? `<div class="tiny muted">"Introduced" records your own process. It isn't a medical guarantee that ${esc(baby().name || 'your baby')} won't react.</div>` : ''}
    </div>
    ${st.reaction ? `<div class="note berry"><b>A possible reaction is noted.</b> Talk with your baby's health care provider before serving ${esc(a.name.toLowerCase())} again.</div>` : ''}

    <section class="card"><h2 class="h2">How to introduce</h2>${gBlock(a.guidance)}</section>
    ${st.state === 'established' ? `<div class="note pea">${gBlock(keep)}</div>` : ''}
    <section class="card"><h2 class="h2">Higher-risk babies</h2>${gBlock(risk)}</section>

    ${foods.length ? `<section class="stack"><h2 class="h2">Foods with ${esc(a.name.toLowerCase())}</h2><div class="list">${foods.map((f) => foodRow(f)).join('')}</div></section>` : ''}
    ${logs.length ? `<section class="stack"><h2 class="h2">History</h2><div class="list">${logs.slice(0, 10).map((l) => logRow(l)).join('')}</div></section>` : ''}
  </div>`;
}

// ---------- ideas ----------
const IDEA_FILTERS = [['all', 'All'], ['tried', 'Foods tried'], ['iron', 'Iron-rich'], ['allergen', 'New allergen'], ['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snack', 'Snack']];
export function ideas(params, ui) {
  const b = baby();
  const fl = ui.ideaFilter || 'all';
  const list = IDEAS.map((idea) => ({ idea, info: ideaInfo(idea), fits: ideaFitsStage(idea, b.stage) })).filter(({ idea, info }) => {
    if (fl === 'tried') return info.allTried;
    if (fl === 'iron') return info.iron;
    if (fl === 'allergen') return info.newAllergens.length > 0;
    if (['breakfast', 'lunch', 'dinner', 'snack'].includes(fl)) return idea.meals.includes(fl);
    return true;
  }).sort((x, y) => (y.fits - x.fits) || (y.info.allTried - x.info.allTried));
  return `<div class="page">
    <div class="topbar"><h1>Ideas</h1></div>
    <p class="small muted" style="margin:-6px 0 0">Simple combinations of foods. Each step uses the government guidance for ${esc(b.name || 'your baby')}'s age.</p>
    <div class="chips" role="group" aria-label="Filter ideas">${IDEA_FILTERS.map(([id, l]) => `<button class="chip" data-act="idea-filter" data-f="${id}" aria-pressed="${fl === id}">${l}</button>`).join('')}</div>
    ${list.length ? list.map(({ idea, info, fits }) => `<a class="card" href="#/idea/${idea.id}" style="text-decoration:none;color:inherit">
      <div class="row">${idea.foods.map((s) => tile(FOOD[s])).join('')}</div>
      <b style="font:700 19px var(--display)">${esc(idea.title)}</b>
      <span class="row wrap" style="gap:6px">
        ${info.allTried ? '<span class="pill established">All foods tried</span>' : `<span class="pill not">New: ${esc(info.newFoods.map((f) => FOOD[f].name).join(', '))}</span>`}
        ${info.iron ? '<span class="pill white" style="border:1.5px solid var(--oat-deep)">Iron-rich</span>' : ''}
        ${info.allergens.map((a) => `<span class="pill introducing">${esc(ALLERGEN[a].name)}</span>`).join('')}
        ${fits ? '' : '<span class="pill not">Best from 9 months</span>'}
      </span>
    </a>`).join('') : `<div class="card empty">No ideas match this filter yet.</div>`}
  </div>`;
}

export function idea([id]) {
  const idea = IDEAS.find((i) => i.id === id);
  if (!idea) return notFound();
  const b = baby();
  const info = ideaInfo(idea);
  return `<div class="page">
    ${topbar(idea.title, '#/ideas')}
    <div class="row wrap" style="gap:6px">
      ${info.allTried ? '<span class="pill established">All foods tried</span>' : `<span class="pill not">New: ${esc(info.newFoods.map((f) => FOOD[f].name).join(', '))}</span>`}
      ${info.allergens.map((a) => `<span class="pill introducing">Contains ${esc(ALLERGEN[a].name.toLowerCase())}</span>`).join('')}
    </div>
    ${info.newAllergens.length ? `<div class="note yolk">This includes ${esc(info.newAllergens.map((a) => ALLERGEN[a].name.toLowerCase()).join(' and '))}, which ${esc(b.name || 'your baby')} hasn't had yet. ${gBlock(g('allergen-introduction', 'one at a time'))}</div>` : ''}
    <section class="card"><h2 class="h2">For ${esc(b.stage)}</h2>
      ${idea.foods.map((s) => {
        const f = FOOD[s];
        const p = prepFor(s, b.stage);
        return `<div class="row" style="align-items:flex-start">${tile(f)}<div class="grow stack-sm" style="gap:4px">
          <a href="#/food/${s}" style="color:inherit"><b>${esc(f.name)}</b></a>
          ${p ? `${p.exact ? '' : `<span class="tiny muted">Guidance for ${esc(p.stage)}</span>`}<span>${esc(p.text)}</span>${cite(p.sourceIds)}` : '<span class="muted small">No preparation guidance found in government sources.</span>'}
          ${f.safety.slice(0, 1).map((x) => `<span class="small" style="color:var(--berry-deep)">${esc(x.text)}</span>`).join('')}
        </div></div>`;
      }).join('')}
      <div class="small muted">Serve together or side by side.</div>
    </section>
    <a class="btn dark block" href="#/log-idea/${idea.id}">${ICON.plus(18)} Log this meal</a>
  </div>`;
}

// ---------- baby ----------
export function babyPage(params, ui) {
  const b = baby();
  const s = store.get();
  const groups = RESPONSES.map((r) => ({ r, foods: FOODS.filter((f) => foodStatus(f.slug).latestResponse === r.id) })).filter((x) => x.foods.length);
  const byDay = new Map();
  [...s.logs].sort((x, y) => y.ts - x.ts).forEach((l) => {
    const k = new Date(l.ts).toDateString();
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(l);
  });
  const days = [...byDay.values()].slice(0, ui.historyDays || 7);
  return `<div class="page">
    <div class="row">
      <span class="tile lg" style="background:var(--yolk);color:var(--cocoa);border-radius:28px" aria-hidden="true">${esc((b.name || '?').slice(0, 1).toUpperCase())}</span>
      <div class="grow stack-sm" style="gap:0"><h1 class="h-xl">${esc(b.name)}</h1>
        <span class="small muted">${esc(ageLabel(b.months))} · born ${esc(new Date(b.birthdate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }))}</span></div>
      <a class="btn ghost small" href="#/welcome">Edit</a>
    </div>

    <section class="stack"><h2 class="h2">Preferences</h2>
      ${groups.length ? `<div class="card">${groups.map(({ r, foods }) => `<div class="stack-sm">
        <span class="row small" style="gap:6px">${RESP_ICON[r.id].replace('width="26" height="26"', 'width="20" height="20"')}<b>${esc(r.label)}</b></span>
        <div class="row wrap" style="gap:6px">${foods.map((f) => `<a class="chip" href="#/food/${f.slug}" style="text-decoration:none">${esc(f.name)}</a>`).join('')}</div>
      </div>`).join('')}</div>` : `<div class="card empty">Preferences appear here as you log foods.</div>`}
    </section>

    <section class="stack"><h2 class="h2">History</h2>
      ${days.length ? days.map((logs) => `<div class="day"><h3>${esc(dateLabel(logs[0].ts))}</h3><div class="list">${logs.map((l) => logRow(l, true)).join('')}</div></div>`).join('')
        : `<div class="card empty">No foods logged yet.</div>`}
      ${byDay.size > days.length ? `<button class="btn ghost" data-act="more-history">Show more</button>` : ''}
    </section>

    <section class="card"><h2 class="h2">Backup</h2>
      <p class="small muted" style="margin:0">Logs are saved only in this browser. Download a backup now and then, or to move to another device.</p>
      <div class="row wrap">
        <button class="btn dark small" data-act="export">${ICON.download()} Download backup</button>
        <label class="btn ghost small" for="import-file">${ICON.upload()} Restore</label>
        <input id="import-file" type="file" accept="application/json,.json" class="sr-only" data-input="import">
      </div>
    </section>

    <section class="card"><h2 class="h2">Settings</h2>
      <div class="field"><label for="usda">USDA FoodData Central API key <span class="muted" style="font-weight:400">(optional)</span></label>
        <input class="input" id="usda" value="${esc(s.settings.usdaKey || '')}" placeholder="Uses the shared demo key" data-input="usda-key" autocomplete="off">
        <span class="tiny muted">Free from <a href="https://fdc.nal.usda.gov/api-key-signup" target="_blank" rel="noopener">api.data.gov</a>. Only needed if nutrition often says it's busy.</span></div>
      <a class="list-item" href="#/guide" style="padding-left:0">${ICON.book()}<span class="grow">Feeding basics</span>${ICON.chevron()}</a>
      <a class="list-item" href="#/sources" style="padding-left:0">${ICON.shield()}<span class="grow">Sources</span>${ICON.chevron()}</a>
      <button class="btn ghost small" data-act="reset" style="color:var(--berry-deep)">Erase all data on this device</button>
    </section>
  </div>`;
}

// ---------- guide + sources ----------
const TOPICS = [
  ['when-to-start', 'When to start'], ['textures', 'Textures'], ['iron', 'Iron'], ['allergen-introduction', 'Introducing allergens'],
  ['reaction-signs', 'Signs of a reaction'], ['emergency', 'In an emergency'], ['choking', 'Choking'], ['honey', 'Honey'],
  ['cow-milk', "Cow's milk"], ['plant-beverages', 'Plant-based drinks'], ['drinks', 'Water and other drinks'], ['fish-mercury', 'Fish and mercury'],
  ['food-safety', 'Food safety'], ['salt-sugar', 'Salt and sugar'], ['grains-arsenic', 'Grains and arsenic'], ['vitamin-d', 'Vitamin D'],
  ['responsive-feeding', 'Following your baby\'s cues'],
];
export function guide() {
  return `<div class="page">
    ${topbar('Feeding basics')}
    <p class="small muted" style="margin:-6px 0 0">From Health Canada, HealthLink BC, CDC, USDA, FDA and NIH. Where Canadian and US advice differ, both are shown.</p>
    <div class="chips">${TOPICS.filter(([t]) => g(t).length).map(([t, l]) => `<button class="chip" data-act="jump" data-t="${t}">${esc(l)}</button>`).join('')}</div>
    ${TOPICS.map(([t, l]) => {
      const items = g(t);
      if (!items.length) return '';
      const tone = t === 'emergency' || t === 'reaction-signs' ? ' style="border:2px solid var(--berry)"' : '';
      return `<section class="card" id="t-${t}"${tone}><h2 class="h2">${esc(l)}</h2>${items.map((x) => `<div class="stack-sm">${x.text.startsWith('CONFLICT') || x.text.startsWith('Conflict') ? `<span class="pill introducing" style="align-self:flex-start">Canada and US differ</span>` : ''}<div>${esc(x.text.replace(/^CONFLICT with US guidance: |^Conflict on waiting time between new allergens: /, ''))}</div>${cite(x.sourceIds)}</div>`).join('<hr style="border:0;border-top:1px solid var(--stone);margin:2px 0">')}</section>`;
    }).join('')}
  </div>`;
}

export function sources() {
  const by = new Map();
  Object.values(SOURCES).forEach((s) => {
    const k = shortAgency(s.agency);
    if (!by.has(k)) by.set(k, { agency: s.agency, items: [] });
    by.get(k).items.push(s);
  });
  return `<div class="page">
    ${topbar('Sources', '#/baby')}
    <div class="note sky">Every piece of feeding, allergen and safety guidance in Chicken Little comes from a government source, and each one is linked where it appears. Nutrition numbers come live from USDA FoodData Central.</div>
    ${[...by.entries()].map(([k, v]) => `<section class="card"><h2 class="h2">${esc(k)}</h2><div class="tiny muted">${esc(v.agency)}</div>
      ${v.items.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" class="small" style="font-weight:500">${esc(s.title)}</a>`).join('')}</section>`).join('')}
    <section class="card"><h2 class="h2">USDA FoodData Central</h2><a class="small" href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener">fdc.nal.usda.gov</a></section>
  </div>`;
}

export function notFound() {
  return `<div class="page">${topbar('Not found')}<div class="card empty">That page doesn't exist. <a href="#/">Go home</a></div></div>`;
}
