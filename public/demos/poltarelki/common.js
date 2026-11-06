import { AIR_ONLY, CITIES, FREE_FROM, KITCHENS, OTHER_CITY, TIERS } from './data.js';

export const ASSETS = '/demos/poltarelki/assets/';
export const rub = (n) => `${Math.round(n).toLocaleString('ru-RU')} ₽`;
export const plural = (n, one, few, many) => {
  const a = n % 100, b = n % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  return b >= 2 && b <= 4 ? few : many;
};

const CITY_KEY = 'poltarelki-city';
const ORDER_KEY = 'poltarelki-order';

const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};
const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch { /* без хранилища выбор просто не запомнится */ }
};
export const getCity = () => read(CITY_KEY);
export const saveCity = (name) => write(CITY_KEY, name);
export const getOrder = () => read(ORDER_KEY);
export const saveOrder = (value) => write(ORDER_KEY, value);

const norm = (s) => s.trim().toLowerCase().replaceAll('ё', 'е').replace(/^(г\.|город)\s*/, '');
export const findCity = (text) => CITIES.find((c) => norm(c.name) === norm(text)) || null;

function km(a, b) {
  const rad = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Срок и цена считаются от ближайшей кухни. Город не из списка получает общие условия. */
export function delivery(text) {
  const city = findCity(text);
  if (!city) return { city: null, name: text.trim(), ...OTHER_CITY };
  const kitchens = CITIES.filter((c) => KITCHENS.includes(c.name));
  const nearest = kitchens.reduce((best, k) => (km(city, k) < km(city, best) ? k : best));
  const distance = km(city, nearest);
  const tier = AIR_ONLY.includes(city.name) ? TIERS[TIERS.length - 1] : TIERS.find((t) => distance <= t.max);
  // Калининград близко по расстоянию, но отделён границей, поэтому туда еда летит.
  const way = city.name === 'Калининград' ? 'Заморозка в термобоксе, самолётом' : tier.way;
  return { city, name: city.name, kitchen: nearest.name, distance: Math.round(distance), ...tier, way };
}

export const tzText = (tz) => (tz === 0 ? 'по московскому времени' : `МСК${tz > 0 ? '+' : ''}${tz}`.replace('-', '−'));

/** Поставка раз в неделю: длинный рацион приезжает несколькими боксами. */
export function shipping(cost, days, subtotal) {
  const boxes = Math.ceil(days / 7);
  const free = subtotal >= FREE_FROM;
  return { boxes, total: free ? 0 : cost * boxes, free };
}

const LON_MIN = 20, LON_MAX = 178;
const lonX = (lon) => ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;

export const kitchenX = (name) => lonX(findCity(name).lon);
export const cityX = (name) => lonX(findCity(name).lon);

/** Вся Россия одной линией: города стоят по настоящей долготе, с запада на восток. */
export function lineHTML(selected, kitchen) {
  const ticks = CITIES.map((c) => `<i class="tick ${KITCHENS.includes(c.name) ? 'kitchen' : ''}" style="left:${lonX(c.lon).toFixed(2)}%" title="${c.name}"></i>`).join('');
  const city = selected ? findCity(selected) : null;
  const x = city ? lonX(city.lon) : 0;
  const side = x > 72 ? 'end' : x < 28 ? 'start' : 'mid';
  const from = kitchen ? kitchenX(kitchen) : x;
  const left = Math.min(from, x);
  const route = city ? `<i class="route" style="left:${left.toFixed(2)}%;width:${Math.abs(x - from).toFixed(2)}%;transform-origin:${from <= x ? 'left' : 'right'}"></i>` : '';
  const mark = city ? `${route}<b class="pin" style="left:${x.toFixed(2)}%"><img src="${ASSETS}veg-tomato.webp" width="340" height="340" alt=""></b><span class="pin-label ${side}" style="left:${x.toFixed(2)}%">${city.name}</span>` : '';
  const label = city ? `Линия России с запада на восток, отмечен город ${city.name}` : 'Линия России с запада на восток, от Калининграда до Анадыря';
  return `<div class="line" role="img" aria-label="${label}"><div class="line-track">${ticks}${mark}</div><div class="line-ends"><span>Калининград</span><span>Анадырь</span></div></div>`;
}

export const dishCard = (d) => `
  <article class="dish">
    <button class="dish-open" type="button" data-dish="${d.id}" aria-haspopup="dialog">
      <span class="dish-pic"><img src="${ASSETS}${d.id}.webp" width="720" height="720" alt="" loading="lazy"></span>
      <span class="dish-meal">${d.meal}</span>
      <span class="dish-name">${d.name}</span>
      <span class="dish-kcal">${d.kcal} ккал</span>
    </button>
  </article>`;
