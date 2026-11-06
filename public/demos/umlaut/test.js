import { LANGS, LEVELS, QUESTIONS, levelByScore } from './data.js';
import { setLang, readStore, writeStore, plural } from './common.js';

const KEY = 'umlaut-test';
const picker = document.getElementById('picker');
const stage = document.getElementById('stage');
const ICON_OK = '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>';
const ICON_BAD = '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>';

let state = null;

document.getElementById('stairs').innerHTML = Object.entries(LEVELS).map(([code, level]) => `
  <li class="step"><b>${code}</b><span>Верно: ${level.from}</span><p>${level.text}</p></li>`).join('');

function shuffle(count) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function start(lang) {
  setLang(lang);
  state = {
    lang,
    index: 0,
    done: false,
    answers: Array(QUESTIONS[lang].length).fill(null),
    orders: QUESTIONS[lang].map((q) => shuffle(q.options.length)),
  };
  save();
  render();
}

function save() { writeStore(KEY, state); }

function reset() {
  state = null;
  writeStore(KEY, null);
  stage.hidden = true;
  stage.innerHTML = '';
  picker.hidden = false;
  window.scrollTo(0, 0);
  picker.querySelector(`[data-pick]`).focus({ preventScroll: true });
}

function score() {
  return state.answers.filter((a) => a === 0).length;
}

function render() {
  picker.hidden = true;
  stage.hidden = false;
  if (state.done) renderResult();
  else renderQuestion();
  window.scrollTo(0, 0);
  stage.querySelector('[data-focus]')?.focus({ preventScroll: true });
}

function renderQuestion() {
  const questions = QUESTIONS[state.lang];
  const q = questions[state.index];
  const info = LANGS[state.lang];
  const chosen = state.answers[state.index];
  const isLast = state.index === questions.length - 1;
  stage.innerHTML = `
    <section class="quiz on-field">
      <span class="ghost" aria-hidden="true" lang="${state.lang}">${info.glyph}</span>
      <div class="quiz-top">
        <strong>${info.name}: вопрос ${state.index + 1} из ${questions.length}</strong>
        <button class="link-btn" type="button" data-other>Другой язык</button>
      </div>
      <div class="pips" aria-hidden="true">${questions.map((_, i) => `<i class="${i <= state.index ? 'on' : ''}"></i>`).join('')}</div>
      <form novalidate>
        <h1 class="stem" lang="${state.lang}" tabindex="-1" data-focus>${q.stem.replace('___', '<span class="blank" aria-label="пропуск"></span>')}</h1>
        <fieldset class="answers">
          <legend>Выберите вариант</legend>
          ${state.orders[state.index].map((opt) => `
            <label class="answer" lang="${state.lang}">
              <input type="radio" name="a" value="${opt}" ${chosen === opt ? 'checked' : ''}>
              <span>${q.options[opt]}</span>
            </label>`).join('')}
        </fieldset>
        <div class="quiz-nav">
          <button class="btn btn-main" type="submit">${isLast ? 'Показать результат' : 'Дальше'}</button>
          ${state.index > 0 ? '<button class="link-btn" type="button" data-back>Назад</button>' : ''}
          <span class="quiz-error" role="alert"></span>
        </div>
      </form>
    </section>`;
  stage.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const picked = new FormData(event.target).get('a');
    if (picked === null) {
      stage.querySelector('.quiz-error').textContent = 'Выберите один вариант';
      return;
    }
    state.answers[state.index] = Number(picked);
    if (isLast) state.done = true;
    else state.index += 1;
    save();
    render();
  });
  stage.querySelector('form').addEventListener('change', () => {
    stage.querySelector('.quiz-error').textContent = '';
  });
  stage.querySelector('[data-back]')?.addEventListener('click', () => {
    state.index -= 1;
    save();
    render();
  });
  stage.querySelector('[data-other]').addEventListener('click', reset);
}

function reviewItem(q, answer, number) {
  const ok = answer === 0;
  const filled = q.stem.replace('___', `<mark>${q.options[0]}</mark>`);
  return `
    <li class="item ${ok ? 'ok' : 'bad'}">
      <div class="item-top">
        <span>Вопрос ${number}, уровень ${q.level}</span>
        <span class="item-status">${ok ? ICON_OK : ICON_BAD}${ok ? 'Верно' : 'Ошибка'}</span>
      </div>
      <p class="item-q" lang="${state.lang}">${filled}</p>
      ${ok ? '' : `<p class="item-yours">Ваш ответ: <s lang="${state.lang}">${q.options[answer]}</s></p>`}
      <p class="item-why">${q.why}</p>
    </li>`;
}

function renderList(filter) {
  const questions = QUESTIONS[state.lang];
  const items = questions
    .map((q, i) => ({ q, a: state.answers[i], n: i + 1 }))
    .filter((x) => filter === 'all' || x.a !== 0);
  const list = stage.querySelector('.review-list');
  list.innerHTML = items.length
    ? items.map((x) => reviewItem(x.q, x.a, x.n)).join('')
    : `<li class="empty">Ошибок нет. Попробуйте курс на уровень выше: он будет в самый раз.</li>`;
}

function renderResult() {
  const lang = state.lang;
  const info = LANGS[lang];
  const total = QUESTIONS[lang].length;
  const right = score();
  const code = levelByScore(right);
  const wrong = total - right;
  stage.innerHTML = `
    <section class="result on-field">
      <p class="result-eyebrow">Ваш уровень ${info.gen}</p>
      <h1 class="result-level" tabindex="-1" data-focus>${code}</h1>
      <div class="result-side">
        <p class="score">${right} из ${total} верно</p>
        <p>${LEVELS[code].text}</p>
        <small>Это предварительная оценка по грамматике. Говорение и понимание на слух проверим на пробном занятии.</small>
        <div class="result-actions">
          <a class="btn btn-main" href="/demos/umlaut/courses.html?lang=${lang}&level=${code}">Рассчитать курс</a>
          <button class="btn btn-quiet" type="button" data-again>Пройти заново</button>
        </div>
      </div>
    </section>
    <section class="review" aria-labelledby="review-h">
      <div class="review-head">
        <h2 id="review-h">Разбор ответов</h2>
        <div class="seg" role="group" aria-label="Какие ответы показать">
          <button type="button" data-filter="all" aria-pressed="true">Все: ${total}</button>
          <button type="button" data-filter="bad" aria-pressed="false">${wrong} ${plural(wrong, 'ошибка', 'ошибки', 'ошибок')}</button>
        </div>
      </div>
      <ul class="review-list"></ul>
    </section>`;
  renderList('all');
  stage.querySelector('[data-again]').addEventListener('click', reset);
  stage.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      stage.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      renderList(button.dataset.filter);
    });
  });
}

picker.addEventListener('click', (event) => {
  const tile = event.target.closest('[data-pick]');
  if (tile) start(tile.dataset.pick);
});

const saved = readStore(KEY);
if (saved && QUESTIONS[saved.lang] && Array.isArray(saved.answers)) {
  state = saved;
  setLang(state.lang);
  render();
}
