import { CITIES } from './data.js';
import { cityX, delivery, getCity, kitchenX, lineHTML, rub, saveCity, tzText } from './common.js';
import { rollRoute } from './motion.js';

export const fillCities = (list) => {
  list.innerHTML = CITIES.map((c) => `<option value="${c.name}"></option>`).join('');
};

/** Форма города: рисует линию и ответ со сроком, ценой и способом. */
export function bindCityCheck() {
  const form = document.getElementById('check');
  const input = document.getElementById('city');
  const error = document.getElementById('city-err');
  const line = document.getElementById('line');
  const answer = document.getElementById('answer');
  fillCities(document.getElementById('cities'));

  const show = (name, roll = false) => {
    const d = delivery(name);
    line.innerHTML = lineHTML(d.city ? d.city.name : null, d.kitchen);
    if (roll && d.city) rollRoute(line, kitchenX(d.kitchen), cityX(d.city.name));
    const safe = document.createElement('span');
    safe.textContent = d.name;
    const where = d.city
      ? `Ближайшая кухня: ${d.kitchen}. Привозим в удобное время, ${tzText(d.city.tz)}.`
      : `Города ${safe.innerHTML} нет в нашем списке, поэтому доставим до ближайшего пункта выдачи.`;
    answer.innerHTML = `
      <dl class="answer">
        <div><dt>Срок</dt><dd>${d.days}</dd></div>
        <div><dt>За бокс</dt><dd>${d.cost ? rub(d.cost) : 'Бесплатно'}</dd></div>
        <div><dt>Город</dt><dd>${safe.innerHTML}</dd></div>
      </dl>
      <p class="answer-way">${d.way}. ${where}</p>`;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
      error.hidden = false;
      error.textContent = 'Напишите город, чтобы узнать срок и цену';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    error.hidden = true;
    input.removeAttribute('aria-invalid');
    const d = delivery(value);
    saveCity(d.name);
    input.value = d.name;
    show(d.name, true);
  });

  const saved = getCity();
  if (saved) {
    input.value = saved;
    show(saved);
  } else {
    line.innerHTML = lineHTML(null);
  }
}
