import './motion.js';
import { DIETS, PLANS, TERMS } from './data.js';
import { delivery, getCity, getOrder, plural, rub, saveCity, saveOrder, shipping } from './common.js';
import { fillCities } from './city-check.js';

const stage = document.getElementById('stage');
const order = getOrder();
const plan = order && PLANS.find((p) => p.kcal === order.kcal);
const term = order && TERMS.find((t) => t.days === order.days);
const diet = order && DIETS[order.diet];

const esc = (text) => String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dayWord = (n) => plural(n, 'день', 'дня', 'дней');

function emptyState() {
  stage.innerHTML = `<div class="wrap done"><h2>Рацион ещё не выбран</h2><p>Сначала рассчитайте норму калорий и выберите срок: цена и доставка подставятся сюда сами.</p><a class="btn" href="/demos/poltarelki/plan.html">Рассчитать рацион</a></div>`;
}

function dates(minDays) {
  const fmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + minDays + i);
    return fmt.format(d);
  });
}

function render() {
  const cityName = getCity() || 'Москва';
  const perDay = plan.perDay + diet.add;
  const food = Math.round(perDay * term.days * (1 - term.off / 100));

  stage.innerHTML = `
    <div class="wrap order">
      <form class="order-form" id="form" novalidate>
        <div class="two">
          <div class="field"><label for="o-name">Имя</label><input id="o-name" name="name" autocomplete="name" aria-describedby="o-name-e"><span id="o-name-e" role="alert"></span></div>
          <div class="field"><label for="o-phone">Телефон</label><input id="o-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" aria-describedby="o-phone-e"><span id="o-phone-e" role="alert"></span></div>
        </div>
        <div class="two">
          <div class="field"><label for="o-city">Город</label><input id="o-city" name="city" list="cities" autocomplete="address-level2" value="${esc(cityName)}" aria-describedby="o-city-e"><datalist id="cities"></datalist><span id="o-city-e" role="alert"></span></div>
          <div class="field"><label for="o-address">Адрес</label><input id="o-address" name="address" autocomplete="street-address" aria-describedby="o-address-e"><span id="o-address-e" role="alert"></span></div>
        </div>
        <fieldset class="ctrl"><legend>День первой доставки</legend><div class="opts date-opts" id="o-date"></div></fieldset>
        <fieldset class="ctrl"><legend>Оплата</legend><div class="opts wrap2">
          <label class="opt"><input type="radio" name="pay" value="Картой при получении" checked><span>Картой при получении</span></label>
          <label class="opt"><input type="radio" name="pay" value="Наличными при получении"><span>Наличными при получении</span></label>
        </div></fieldset>
        <button class="btn" type="submit" id="send"></button>
      </form>
      <aside class="result" aria-label="Ваш заказ">
        <p class="result-kcal">${plan.kcal.toLocaleString('ru-RU')} <small>ккал в день</small></p>
        <p class="result-note">${diet.name}. <a href="/demos/poltarelki/plan.html">Изменить рацион</a></p>
        <dl class="bill">
          <div><dt>${term.days} ${dayWord(term.days)} по ${rub(perDay)}${term.off ? `, скидка ${term.off}%` : ''}</dt><dd>${rub(food)}</dd></div>
          <div><dt id="s-ship-l"></dt><dd id="s-ship"></dd></div>
          <div><dt>Срок</dt><dd id="s-days"></dd></div>
          <div class="sum"><dt>Итого</dt><dd id="s-total"></dd></div>
        </dl>
      </aside>
    </div>`;

  const cityInput = document.getElementById('o-city');
  fillCities(document.getElementById('cities'));

  const sync = () => {
    const d = delivery(cityInput.value.trim() || cityName);
    const ship = shipping(d.cost, term.days, food);
    const total = food + ship.total;
    document.getElementById('s-ship-l').textContent = `Доставка, ${ship.boxes} ${plural(ship.boxes, 'бокс', 'бокса', 'боксов')}`;
    document.getElementById('s-ship').textContent = ship.total ? rub(ship.total) : 'бесплатно';
    document.getElementById('s-days').textContent = d.days;
    document.getElementById('s-total').textContent = rub(total);
    document.getElementById('send').textContent = `Заказать за ${rub(total)}`;
    const picked = document.querySelector('input[name=date]:checked')?.value;
    const list = dates(d.minDays);
    document.getElementById('o-date').innerHTML = list.map((label, i) => `<label class="opt"><input type="radio" name="date" value="${label}" ${(picked === label || (!picked && i === 0) || (picked && !list.includes(picked) && i === 0)) ? 'checked' : ''}><span>${label}</span></label>`).join('');
    return { d, total };
  };

  sync();
  cityInput.addEventListener('change', sync);

  document.getElementById('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const rules = [
      ['o-name', String(data.get('name')).trim().length > 0, 'Напишите, как к вам обращаться'],
      ['o-phone', String(data.get('phone')).replace(/\D/g, '').length >= 10, 'Укажите телефон, в нём минимум 10 цифр'],
      ['o-city', String(data.get('city')).trim().length > 0, 'Укажите город доставки'],
      ['o-address', String(data.get('address')).trim().length > 0, 'Укажите улицу и дом'],
    ];
    let first = null;
    rules.forEach(([id, ok, text]) => {
      const input = document.getElementById(id);
      if (ok) input.removeAttribute('aria-invalid');
      else input.setAttribute('aria-invalid', 'true');
      document.getElementById(`${id}-e`).textContent = ok ? '' : text;
      if (!ok && !first) first = input;
    });
    if (first) {
      first.focus();
      return;
    }
    const { d, total } = sync();
    saveCity(d.name);
    saveOrder(null);
    const number = String(10000 + (Date.now() % 90000));
    stage.innerHTML = `<div class="wrap done"><h2 tabindex="-1" id="done-h">Заказ ${number} принят</h2>
      <p>${plan.kcal} ккал в день на ${term.days} ${dayWord(term.days)}, ${rub(total)}. Первый бокс приедет: ${esc(data.get('date'))}, ${esc(d.name)}, ${esc(data.get('address'))}.</p>
      <p>Это концепт-сайт: заказ никуда не отправлен, данные не сохранены.</p>
      <a class="btn" href="/demos/poltarelki/menu.html">Посмотреть меню</a></div>`;
    window.scrollTo(0, 0);
    document.getElementById('done-h').focus({ preventScroll: true });
  });
}

if (plan && term && diet) render();
else emptyState();
