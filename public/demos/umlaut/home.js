import { LANGS, HELLO, STEPS, FORMATS, TEACHERS, REVIEWS, GOALS } from './data.js';
import { setLang, getLang, plural, rub } from './common.js';

const $ = (id) => document.getElementById(id);
const FACES = ['daniel', 'lucia', 'camille', 'jonas'];

$('tabs').innerHTML = Object.entries(LANGS).map(([code, l]) => `
  <button class="hero-tab l-${code}" type="button" data-lang-tab="${code}" aria-pressed="false">
    <i aria-hidden="true" lang="${code}">${l.glyph}</i><span>${l.name}</span>
  </button>`).join('');

$('steps').innerHTML = STEPS.map((s) => `<li><h3>${s.title}</h3><p>${s.text}</p></li>`).join('');

$('fees').innerHTML = FORMATS.map((f) => `
  <li class="fee"><strong>${f.name}</strong><span>${f.note}</span><b>от ${rub(f.price)}</b></li>`).join('');

$('people').innerHTML = FACES.map((id) => {
  const t = TEACHERS.find((x) => x.id === id);
  return `
    <li class="person l-${t.lang}">
      <div class="person-photo"><img src="/demos/umlaut/assets/${t.id}.webp" width="640" height="800" alt="Портрет: ${t.name}" loading="lazy"></div>
      <h3>${t.name}</h3>
      <p>${LANGS[t.lang].name}, ${t.levels}</p>
    </li>`;
}).join('');

function renderVoice(lang) {
  const list = REVIEWS.filter((r) => r.lang === lang);
  const r = list.find((x) => x.big) || list[0];
  const months = `${r.months} ${plural(r.months, 'месяц', 'месяца', 'месяцев')}`;
  $('voice').innerHTML = `
    <p class="voice-jump">с ${r.from}<br>до ${r.to}</p>
    <div class="voice-body">
      <blockquote>${r.text}</blockquote>
      <div class="voice-foot">
        <p class="r-who">${r.name}<small>${r.role}. ${LANGS[r.lang].name}, ${months}. Цель: ${GOALS[r.goal].toLowerCase()}.</small></p>
        <a class="link-btn" href="/demos/umlaut/reviews.html?lang=${r.lang}">Все отзывы</a>
      </div>
    </div>`;
}

function render(lang) {
  const hello = $('hello');
  hello.textContent = HELLO[lang].word;
  hello.lang = lang;
  hello.style.setProperty('--size', HELLO[lang].size);
  // Перезапуск анимации показывает смену языка.
  hello.style.animation = 'none';
  void hello.offsetWidth;
  hello.style.animation = '';
  $('closing-ghost').textContent = LANGS[lang].glyph;
  document.querySelectorAll('[data-lang-tab]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.langTab === lang)));
  renderVoice(lang);
}

$('tabs').addEventListener('click', (event) => {
  const tab = event.target.closest('[data-lang-tab]');
  if (!tab) return;
  setLang(tab.dataset.langTab);
  render(tab.dataset.langTab);
});

render(getLang());
