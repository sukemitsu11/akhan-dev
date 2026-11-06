import { LANGS, LEVELS, COURSES, FORMATS, LEVEL_ADD, TERM_DISCOUNT, INTENSIVE_DISCOUNT } from './data.js';
import { setLang, getLang, plural, rub } from './common.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const levelCodes = Object.keys(LEVELS);
const round10 = (n) => Math.round(n / 10) * 10;

const state = {
  lang: getLang(),
  level: levelCodes.includes(params.get('level')) ? params.get('level') : 'A2',
  course: 'talk',
  format: 'group',
  week: 2,
  term: 3,
};

if (params.get('level') && levelCodes.includes(params.get('level'))) {
  $('from-test').textContent = `Уровень ${state.level} подставлен из теста. Цена занятия зависит от формата, цели и уровня, занятие идёт 60 минут.`;
}

const radio = (name, value, inner, cls = '') => `
  <label class="opt ${cls}">
    <input type="radio" name="${name}" value="${value}">
    <span>${inner}</span>
  </label>`;

$('o-lang').innerHTML = Object.entries(LANGS).map(([code, l]) => radio('lang', code, `<i aria-hidden="true" lang="${code}">${l.glyph}</i>${l.name}`, `opt-lang l-${code}`)).join('');
$('o-level').innerHTML = levelCodes.map((code) => radio('level', code, code, 'opt-center')).join('');
$('o-format').innerHTML = FORMATS.map((f) => radio('format', f.id, `<b>${f.name}</b><small>${f.note}</small>`)).join('');
$('o-week').innerHTML = [1, 2, 3].map((n) => radio('week', n, n === 3 ? `<b>3</b><small>скидка ${INTENSIVE_DISCOUNT}%</small>` : `<b>${n}</b>`, 'opt-center')).join('');
$('o-term').innerHTML = Object.entries(TERM_DISCOUNT).map(([months, d]) => {
  const label = `${months} ${plural(Number(months), 'месяц', 'месяца', 'месяцев')}`;
  return radio('term', months, d ? `<b>${label}</b><small>скидка ${d}%</small>` : `<b>${label}</b>`, 'opt-center');
}).join('');

function renderCourses() {
  const exam = LANGS[state.lang].exam;
  $('o-course').innerHTML = COURSES.map((c) => radio('course', c.id, `<b>${c.name(exam)}</b><small>${c.text}</small>`)).join('');
}

const form = $('ctrls');

function courseAllowed(course) {
  return !course.minLevel || levelCodes.indexOf(state.level) >= levelCodes.indexOf(course.minLevel);
}

function syncForm() {
  // Экзаменационный курс открыт только с нужного уровня.
  const exam = COURSES.find((c) => c.minLevel);
  const allowed = courseAllowed(exam);
  const note = $('course-note');
  if (!allowed && state.course === exam.id) state.course = 'talk';
  form.querySelector(`input[name=course][value=${exam.id}]`).disabled = !allowed;
  note.hidden = allowed;
  note.textContent = allowed ? '' : `Подготовка к ${LANGS[state.lang].exam} открывается с уровня ${exam.minLevel}.`;
  ['lang', 'level', 'course', 'format', 'week', 'term'].forEach((name) => {
    const input = form.querySelector(`input[name=${name}][value="${state[name]}"]`);
    if (input) input.checked = true;
  });
}

function calc() {
  const format = FORMATS.find((f) => f.id === state.format);
  const course = COURSES.find((c) => c.id === state.course);
  const lesson = round10((format.price + LEVEL_ADD[state.level]) * course.k);
  const perMonth = state.week * 4;
  const full = lesson * perMonth * state.term;
  const discount = TERM_DISCOUNT[state.term] + (state.week === 3 ? INTENSIVE_DISCOUNT : 0);
  const total = round10(full * (1 - discount / 100));
  return { lesson, perMonth, discount, total, monthly: round10(total / state.term), saved: full - total, course, format };
}

function summary(r) {
  const week = `${state.week} ${plural(state.week, 'занятие', 'занятия', 'занятия')} в неделю`;
  return `${LANGS[state.lang].name}, ${state.level}. ${r.course.name(LANGS[state.lang].exam)}, ${r.format.name.toLowerCase()}, ${week}`;
}

let shown = null;
let frame = 0;

function showPrice(target) {
  const el = $('p-big');
  cancelAnimationFrame(frame);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (shown === null || still) {
    el.textContent = rub(target);
    shown = target;
    return;
  }
  const from = shown;
  const started = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - started) / 380);
    const eased = 1 - (1 - t) ** 3;
    shown = from + (target - from) * eased;
    el.textContent = rub(round10(shown));
    if (t < 1) frame = requestAnimationFrame(tick);
    else shown = target;
  };
  frame = requestAnimationFrame(tick);
}

function render() {
  const r = calc();
  $('p-ghost').textContent = LANGS[state.lang].glyph;
  $('p-name').textContent = summary(r);
  showPrice(r.monthly);
  $('p-lesson').textContent = rub(r.lesson);
  $('p-count').textContent = r.perMonth;
  $('p-discount').textContent = r.discount ? `${r.discount}%` : 'нет';
  $('p-total-label').textContent = `Всего за ${state.term} ${plural(state.term, 'месяц', 'месяца', 'месяцев')}`;
  $('p-total').textContent = rub(r.total);
  $('p-save').textContent = r.saved ? rub(r.saved) : '0 ₽';
  $('p-live').textContent = `${rub(r.monthly)} в месяц, всего ${rub(r.total)}`;
  $('bar-price').textContent = rub(r.monthly);
  $('dlg-sum').textContent = `${summary(r)}. ${rub(r.monthly)} в месяц. Первое занятие бесплатно.`;
}

form.addEventListener('change', (event) => {
  const { name, value } = event.target;
  if (name === 'lang') {
    state.lang = value;
    setLang(value);
    renderCourses();
  } else if (name === 'week' || name === 'term') {
    state[name] = Number(value);
  } else {
    state[name] = value;
  }
  syncForm();
  render();
});
form.addEventListener('submit', (event) => event.preventDefault());

renderCourses();
syncForm();
render();

// Заявка на пробное
const dlg = $('dlg');
const dlgForm = $('dlg-form');
const done = $('dlg-done');
const fields = [
  { input: $('f-name'), error: $('e-name'), text: 'Напишите, как к вам обращаться' },
  { input: $('f-contact'), error: $('e-contact'), text: 'Укажите телефон или Telegram, чтобы мы могли ответить' },
];

function clearErrors() {
  fields.forEach(({ input, error }) => {
    input.removeAttribute('aria-invalid');
    error.textContent = '';
  });
}

document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => {
  dlgForm.hidden = false;
  done.hidden = true;
  dlgForm.reset();
  clearErrors();
  dlg.showModal();
}));
dlg.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => dlg.close()));
dlg.addEventListener('click', (event) => { if (event.target === dlg) dlg.close(); });

dlgForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();
  const invalid = fields.filter(({ input }) => !input.value.trim());
  invalid.forEach(({ input, error, text }) => {
    input.setAttribute('aria-invalid', 'true');
    error.textContent = text;
  });
  if (invalid.length) {
    invalid[0].input.focus();
    return;
  }
  dlgForm.hidden = true;
  done.hidden = false;
  $('done-h').focus();
});
