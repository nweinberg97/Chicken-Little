// Small UI helpers and inline icons (stroke SVG, no emoji).
import { SOURCES } from './model.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const LOGO = (size = 40, extra = '') => `
<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true" ${extra}>
  <path d="M53 31 q3 -11 8 -3 q4 -9 8 1" fill="none" stroke="#2B2420" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="60" cy="63" r="33" fill="#FFC93C"/>
  <circle cx="49" cy="58" r="3.8" fill="#2B2420"/><circle cx="71" cy="58" r="3.8" fill="#2B2420"/>
  <circle cx="42" cy="68" r="5" fill="#FF8F6B" opacity="0.55"/><circle cx="78" cy="68" r="5" fill="#FF8F6B" opacity="0.55"/>
  <path d="M55 65 L65 65 L60 72 Z" fill="#FF7A59" stroke="#FF7A59" stroke-width="2" stroke-linejoin="round"/>
  <path d="M26 80 L35 72 L44 80 L53 72 L62 80 L71 72 L80 80 L89 72 L95 79 Q96 108 60 108 Q25 108 26 80 Z" fill="#FFFFFF" stroke="#2B2420" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

const s = (d, size = 22, extra = '') => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;

export const ICON = {
  home: (sz) => s('<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>', sz),
  search: (sz) => s('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>', sz),
  bowl: (sz) => s('<path d="M4 13h16a8 8 0 0 1-16 0z"/><path d="M9 9c0-2 2-2 2-4M14 9c0-2 2-2 2-4"/>', sz),
  shield: (sz) => s('<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/>', sz),
  baby: (sz) => s('<circle cx="12" cy="12" r="8"/><circle cx="9.5" cy="10.5" r="0.6" fill="currentColor"/><circle cx="14.5" cy="10.5" r="0.6" fill="currentColor"/><path d="M9.5 14.5c1.4 1.2 3.6 1.2 5 0"/>', sz),
  plus: (sz = 22) => s('<path d="M12 5v14M5 12h14"/>', sz, 'stroke-width="2.6"'),
  back: (sz = 20) => s('<path d="M15 5l-7 7 7 7"/>', sz, 'stroke-width="2.4"'),
  close: (sz = 18) => s('<path d="M6 6l12 12M18 6L6 18"/>', sz, 'stroke-width="2.4"'),
  chevron: (sz = 18) => s('<path d="M9 5l7 7-7 7"/>', sz),
  alert: (sz = 18) => s('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>', sz),
  check: (sz = 18) => s('<path d="M5 12.5l4.5 4.5L19 7"/>', sz, 'stroke-width="2.4"'),
  book: (sz = 20) => s('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>', sz),
  download: (sz = 18) => s('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', sz),
  upload: (sz = 18) => s('<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>', sz),
  trash: (sz = 18) => s('<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>', sz),
};

export const RESP_ICON = {
  loved: `<svg width="26" height="26" viewBox="0 0 24 24" fill="#F7A8BE" stroke="#8A1F45" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>`,
  liked: `<svg width="26" height="26" viewBox="0 0 24 24" fill="#FFC93C" stroke="#2B2420" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14c1.8 2 5.2 2 7 0"/><circle cx="9" cy="10" r="0.8" fill="#2B2420"/><circle cx="15" cy="10" r="0.8" fill="#2B2420"/></svg>`,
  neutral: `<svg width="26" height="26" viewBox="0 0 24 24" fill="#A8D8F0" stroke="#2B2420" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 15h6"/><circle cx="9" cy="10" r="0.8" fill="#2B2420"/><circle cx="15" cy="10" r="0.8" fill="#2B2420"/></svg>`,
  nope: `<svg width="26" height="26" viewBox="0 0 24 24" fill="#C9B6F2" stroke="#2B2420" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 16c1.8-2 5.2-2 7 0"/><circle cx="9" cy="10" r="0.8" fill="#2B2420"/><circle cx="15" cy="10" r="0.8" fill="#2B2420"/></svg>`,
  reaction: `<svg width="26" height="26" viewBox="0 0 24 24" fill="#FDE6EC" stroke="#8A1F45" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/></svg>`,
};

export function cite(ids) {
  const uniq = [...new Set(ids)].map((id) => SOURCES[id]).filter(Boolean);
  if (!uniq.length) return '';
  const agencies = [];
  for (const src of uniq) {
    const short = shortAgency(src.agency);
    if (!agencies.some((a) => a.short === short)) agencies.push({ short, src });
  }
  return `<div class="cite">Source: ${agencies
    .map(({ short, src }) => `<a href="${esc(src.url)}" target="_blank" rel="noopener" title="${esc(src.title)}">${esc(short)}</a>`)
    .join(' · ')}</div>`;
}

export function shortAgency(agency) {
  if (agency.startsWith('HealthLink BC')) return 'HealthLink BC';
  if (agency.startsWith('Health Canada')) return 'Health Canada';
  if (agency.includes('CDC')) return 'CDC';
  if (agency.includes('FDA')) return 'FDA';
  if (agency.includes('USDA')) return 'USDA';
  if (agency.includes('NIH') || agency.includes('NIAID')) return 'NIH';
  return agency;
}

export function tile(food, lg = false) {
  return `<span class="tile ${esc(food.category)}${lg ? ' lg' : ''}" aria-hidden="true">${esc(food.name.slice(0, 2))}</span>`;
}

export function toast(msg) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

export function dateLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const y = new Date(); y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function timeLabel(ts) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
