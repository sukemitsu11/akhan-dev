import { TONES } from './data.js';
import { plural } from './common.js';
import { ALL_ITEMS, bindOrderButtons, cardHTML } from './cards.js';

const TYPES = { all: 'Всё', bouquet: 'Букеты', flower: 'Цветы', green: 'Зелень' };
const SWATCH = { pink: '#f7d9e0', peach: '#fdd9c8', yellow: '#fbe9a9', lilac: '#e3d9f9', blue: '#cfe3f5', white: '#f3eee3', green: '#d8ebc9' };
const params = new URLSearchParams(location.search);
const state = {
  type: TYPES[params.get('type')] ? params.get('type') : 'all',
  tone: TONES[params.get('tone')] ? params.get('tone') : 'all',
};

const fType = document.getElementById('f-type');
const fTone = document.getElementById('f-tone');
const list = document.getElementById('list');
const count = document.getElementById('count');

fType.innerHTML = Object.entries(TYPES).map(([k, v]) => `<button type="button" data-type="${k}">${v}</button>`).join('');
fTone.innerHTML = `<button type="button" data-tone="all">Все цвета</button>` + Object.entries(TONES)
  .filter(([k]) => k !== 'green')
  .map(([k, v]) => `<button type="button" data-tone="${k}"><span class="swatch" style="background:${SWATCH[k]}" aria-hidden="true"></span>${v}</button>`).join('');

function syncUrl() {
  const next = new URLSearchParams();
  if (state.type !== 'all') next.set('type', state.type);
  if (state.tone !== 'all') next.set('tone', state.tone);
  const query = next.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

function render() {
  const items = ALL_ITEMS.filter((item) => (state.type === 'all' || item.kind === state.type)
    && (state.tone === 'all' || item.tone === state.tone));
  fType.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === state.type)));
  fTone.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tone === state.tone)));
  count.textContent = `${items.length} ${plural(items.length, 'позиция', 'позиции', 'позиций')}`;
  const isBig = (item, i) => item.kind === 'bouquet' && i % 7 === 0;
  // Если в последнем ряду остаётся одна пустая ячейка, последняя карточка занимает и её.
  const cells = items.reduce((sum, item, i) => sum + (isBig(item, i) ? 2 : 1), 0);
  const stretchLast = cells % 4 === 3;
  list.innerHTML = items.length
    ? items.map((item, i) => cardHTML(item, i, { big: isBig(item, i) || (stretchLast && i === items.length - 1) })).join('')
    : '<div class="empty">В этом цвете такого сейчас нет. <button class="link" type="button" data-reset>Показать все цвета</button></div>';
}

fType.addEventListener('click', (event) => {
  const b = event.target.closest('[data-type]');
  if (!b) return;
  state.type = b.dataset.type;
  syncUrl();
  render();
});
fTone.addEventListener('click', (event) => {
  const b = event.target.closest('[data-tone]');
  if (!b) return;
  state.tone = b.dataset.tone;
  syncUrl();
  render();
});
list.addEventListener('click', (event) => {
  if (event.target.closest('[data-reset]')) {
    state.tone = 'all';
    syncUrl();
    render();
  }
});

bindOrderButtons();
render();
