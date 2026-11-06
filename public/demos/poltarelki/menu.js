import './motion.js';
import { DISHES } from './data.js';
import { dishCard, plural } from './common.js';
import { bindDishDialog } from './dish-dialog.js';

const MEALS = ['Всё', 'Завтрак', 'Обед', 'Ужин'];
const DIETS = { noMeat: 'Без мяса', noGluten: 'Без глютена', noLactose: 'Без лактозы' };
const state = { meal: 'Всё', diets: new Set() };

const fMeal = document.getElementById('f-meal');
const fDiet = document.getElementById('f-diet');
const list = document.getElementById('dishes');
const count = document.getElementById('count');

fMeal.innerHTML = MEALS.map((m) => `<button type="button" data-m="${m}">${m}</button>`).join('');
fDiet.innerHTML = Object.entries(DIETS).map(([k, v]) => `<button type="button" data-d="${k}">${v}</button>`).join('');

function render() {
  const items = DISHES.filter((d) => (state.meal === 'Всё' || d.meal === state.meal) && [...state.diets].every((k) => d[k]));
  fMeal.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === state.meal)));
  fDiet.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(state.diets.has(b.dataset.d))));
  count.textContent = `${items.length} ${plural(items.length, 'блюдо', 'блюда', 'блюд')}`;
  list.innerHTML = items.length
    ? items.map(dishCard).join('')
    : '<div class="empty">С такими ограничениями блюд нет. <button class="link" type="button" data-reset>Сбросить фильтры</button></div>';
}

fMeal.addEventListener('click', (event) => {
  const b = event.target.closest('[data-m]');
  if (!b) return;
  state.meal = b.dataset.m;
  render();
});
fDiet.addEventListener('click', (event) => {
  const b = event.target.closest('[data-d]');
  if (!b) return;
  if (state.diets.has(b.dataset.d)) state.diets.delete(b.dataset.d);
  else state.diets.add(b.dataset.d);
  render();
});
list.addEventListener('click', (event) => {
  if (event.target.closest('[data-reset]')) {
    state.meal = 'Всё';
    state.diets.clear();
    render();
  }
});

bindDishDialog(list);
render();
