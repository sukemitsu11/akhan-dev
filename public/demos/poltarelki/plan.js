import { ACTIVITY, DIETS, GOALS, PLANS, TERMS } from './data.js';
import { delivery, getCity, plural, rub, saveCity, saveOrder, shipping } from './common.js';
import { fillCities } from './city-check.js';
import { countTo } from './motion.js';

const $ = (id) => document.getElementById(id);
const dayWord = (n) => plural(n, 'день', 'дня', 'дней');
const state = { goal: 'lose', sex: 'f', act: 'mid', diet: 'all', term: 14 };
const LIMITS = {
  age: { min: 16, max: 90, text: 'Возраст от 16 до 90 лет' },
  height: { min: 130, max: 220, text: 'Рост от 130 до 220 см' },
  weight: { min: 40, max: 200, text: 'Вес от 40 до 200 кг' },
};

const radio = (name, value, inner) => `<label class="opt"><input type="radio" name="${name}" value="${value}"><span>${inner}</span></label>`;
$('o-goal').innerHTML = Object.entries(GOALS).map(([k, g]) => radio('goal', k, g.name)).join('');
$('o-sex').innerHTML = radio('sex', 'f', 'Женский') + radio('sex', 'm', 'Мужской');
$('o-act').innerHTML = Object.entries(ACTIVITY).map(([k, a]) => radio('act', k, a.name)).join('');
$('o-diet').innerHTML = Object.entries(DIETS).map(([k, d]) => radio('diet', k, d.add ? `${d.name}<small>+${d.add} ₽ в день</small>` : d.name)).join('');
$('o-term').innerHTML = TERMS.map((t) => radio('term', t.days, t.off ? `${t.days} ${dayWord(t.days)}<small>скидка ${t.off}%</small>` : `${t.days} ${dayWord(t.days)}`)).join('');
['goal', 'sex', 'act', 'diet', 'term'].forEach((name) => {
  document.querySelector(`input[name=${name}][value="${state[name]}"]`).checked = true;
});
fillCities($('cities'));
$('plan-city').value = getCity() || 'Москва';

let last = null;

function readNumbers() {
  let ok = true;
  const values = {};
  Object.entries(LIMITS).forEach(([id, rule]) => {
    const input = $(id);
    const n = Number(input.value.replace(',', '.'));
    const good = input.value.trim() !== '' && Number.isFinite(n) && n >= rule.min && n <= rule.max;
    input.toggleAttribute('aria-invalid', !good);
    if (!good) input.setAttribute('aria-invalid', 'true');
    $(`${id}-e`).textContent = good ? '' : rule.text;
    if (!good) ok = false;
    values[id] = n;
  });
  return ok ? values : null;
}

function calc(numbers) {
  const base = 10 * numbers.weight + 6.25 * numbers.height - 5 * numbers.age + (state.sex === 'm' ? 5 : -161);
  const goal = GOALS[state.goal];
  const need = Math.round(base * ACTIVITY[state.act].k * goal.k);
  const plan = PLANS.reduce((best, p) => (Math.abs(p.kcal - need) < Math.abs(best.kcal - need) ? p : best));
  const term = TERMS.find((t) => t.days === state.term);
  const perDay = plan.perDay + DIETS[state.diet].add;
  const full = perDay * term.days;
  const food = Math.round(full * (1 - term.off / 100));
  const cityText = $('plan-city').value.trim() || 'Москва';
  const d = delivery(cityText);
  const ship = shipping(d.cost, term.days, food);
  return { need, plan, term, perDay, full, food, d, ship, total: food + ship.total, goal };
}

function render() {
  const numbers = readNumbers();
  $('go').disabled = !numbers;
  $('go').style.opacity = numbers ? '' : '.5';
  if (!numbers) {
    $('r-note').textContent = 'Проверьте значения в форме, чтобы пересчитать рацион.';
    return;
  }
  const r = calc(numbers);
  last = r;
  countTo($('r-kcal'), r.plan.kcal, (n) => Math.round(n).toLocaleString('ru-RU'));
  $('r-note').textContent = `Ваша норма для цели «${r.goal.name.toLowerCase()}»: около ${r.need} ккал. Ближайший рацион: ${r.plan.kcal}.`;
  const grams = [['Белки', r.goal.p, 4], ['Жиры', r.goal.f, 9], ['Углеводы', r.goal.c, 4]];
  $('r-macros').innerHTML = grams.map(([name, share, per]) => `<div><span style="text-align:left">${name}</span><i style="transform:scaleX(${(share * 2).toFixed(2)})"></i><span>${Math.round((r.plan.kcal * share) / per)} г</span></div>`).join('');
  $('r-days-l').textContent = `${r.term.days} ${dayWord(r.term.days)} по ${rub(r.perDay)}`;
  $('r-food').textContent = rub(r.full);
  $('r-off').textContent = r.term.off ? `−${rub(r.full - r.food)}` : 'нет';
  $('r-ship-l').textContent = `Доставка: ${r.d.name}, ${r.ship.boxes} ${plural(r.ship.boxes, 'бокс', 'бокса', 'боксов')}`;
  $('r-ship').textContent = r.ship.total ? rub(r.ship.total) : 'бесплатно';
  countTo($('r-total'), r.total, (n) => rub(Math.round(n)));
  $('r-live').textContent = `${r.plan.kcal} ккал в день, итого ${rub(r.total)}`;
}

$('form').addEventListener('submit', (event) => event.preventDefault());
$('form').addEventListener('change', (event) => {
  const { name, value, id } = event.target;
  if (name in state) state[name] = name === 'term' ? Number(value) : value;
  if (id === 'plan-city' && value.trim()) saveCity(delivery(value).name);
  render();
});
$('form').addEventListener('input', (event) => {
  if (event.target.id in LIMITS) render();
});
$('go').addEventListener('click', () => {
  if (!last || !readNumbers()) return;
  saveCity(last.d.name);
  saveOrder({ kcal: last.plan.kcal, days: last.term.days, diet: state.diet, goal: state.goal });
  location.href = '/demos/poltarelki/order.html';
});

render();
