import { LANGS, TEACHERS } from './data.js';
import { setLang, getLang, plural } from './common.js';

const filters = document.getElementById('filters');
const grid = document.getElementById('grid');
const ghost = document.getElementById('ghost');
const param = new URLSearchParams(location.search).get('lang');
let current = LANGS[param] ? param : 'all';

filters.innerHTML = [['all', 'Все'], ...Object.entries(LANGS).map(([code, l]) => [code, l.name])]
  .map(([code, label]) => `<button type="button" data-f="${code}" aria-pressed="false">${label}</button>`).join('');

function card(t, i) {
  const l = LANGS[t.lang];
  return `
    <article class="t-card l-${t.lang}" style="animation-delay:${Math.min(i, 5) * 50}ms">
      <div class="t-photo"><img src="/demos/umlaut/assets/${t.id}.webp" width="640" height="800" alt="Портрет: ${t.name}" loading="${i < 2 ? 'eager' : 'lazy'}"></div>
      <div class="t-body">
        <h2 class="t-name">${t.name}</h2>
        <p class="t-meta">${t.from}. ${t.cert}.</p>
        <p class="t-facts">${l.name}, ${t.levels}. Преподаёт ${t.years} ${plural(t.years, 'год', 'года', 'лет')}.</p>
        <div class="fix">
          <span>Чаще всего исправляю</span>
          <s lang="${t.lang}">${t.wrong}</s>
          <b lang="${t.lang}">${t.right}</b>
        </div>
        <div class="t-foot">
          <span>Ближайшее окно: ${t.slot}</span>
          <a class="link-btn" href="/demos/umlaut/courses.html?lang=${t.lang}">Рассчитать курс</a>
        </div>
      </div>
    </article>`;
}

function render() {
  const list = TEACHERS.filter((t) => current === 'all' || t.lang === current);
  grid.classList.toggle('few', current !== 'all');
  grid.innerHTML = list.map(card).join('');
  filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === current)));
  ghost.textContent = LANGS[current === 'all' ? getLang() : current].glyph;
}

filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-f]');
  if (!button) return;
  current = button.dataset.f;
  if (current !== 'all') setLang(current);
  render();
});

render();
