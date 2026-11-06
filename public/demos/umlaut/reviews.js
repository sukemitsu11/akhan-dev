import { LANGS, GOALS, REVIEWS } from './data.js';
import { setLang, plural } from './common.js';

const fLang = document.getElementById('f-lang');
const fGoal = document.getElementById('f-goal');
const list = document.getElementById('list');
const count = document.getElementById('count');
const param = new URLSearchParams(location.search).get('lang');
const state = { lang: LANGS[param] ? param : 'all', goal: 'all' };

const buttons = (entries, attr) => entries.map(([code, label]) => `<button type="button" ${attr}="${code}" aria-pressed="false">${label}</button>`).join('');
fLang.innerHTML = buttons([['all', 'Все языки'], ...Object.entries(LANGS).map(([c, l]) => [c, l.name])], 'data-l');
fGoal.innerHTML = buttons([['all', 'Любая цель'], ...Object.entries(GOALS)], 'data-g');

function card(r, i) {
  const months = `${r.months} ${plural(r.months, 'месяц', 'месяца', 'месяцев')}`;
  return `
    <article class="r-card l-${r.lang} ${r.big ? 'big' : ''}" style="animation-delay:${Math.min(i, 6) * 40}ms">
      <p class="r-jump"><span>с ${r.from} до ${r.to}</span></p>
      <blockquote>${r.text}</blockquote>
      <p class="r-who">${r.name}<small>${r.role}. ${LANGS[r.lang].name}, ${months}. Цель: ${GOALS[r.goal].toLowerCase()}.</small></p>
    </article>`;
}

function render() {
  const items = REVIEWS.filter((r) => (state.lang === 'all' || r.lang === state.lang) && (state.goal === 'all' || r.goal === state.goal));
  fLang.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.l === state.lang)));
  fGoal.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.g === state.goal)));
  count.textContent = `${items.length} ${plural(items.length, 'отзыв', 'отзыва', 'отзывов')}`;
  list.innerHTML = items.length
    ? items.map(card).join('')
    : '<div class="empty">С такой целью отзывов по этому языку пока нет. <br><button class="link-btn" type="button" data-reset>Показать все цели</button></div>';
}

fLang.addEventListener('click', (event) => {
  const b = event.target.closest('[data-l]');
  if (!b) return;
  state.lang = b.dataset.l;
  if (state.lang !== 'all') setLang(state.lang);
  render();
});
fGoal.addEventListener('click', (event) => {
  const b = event.target.closest('[data-g]');
  if (!b) return;
  state.goal = b.dataset.g;
  render();
});
list.addEventListener('click', (event) => {
  if (event.target.closest('[data-reset]')) {
    state.goal = 'all';
    render();
  }
});

render();
