import { ASSEMBLY, BOUQUETS, FLOWERS, GREENS, MAX_STEMS, WRAPS, bouquetPrice, inSeasonNow, isGreen, stemById, wrapById } from './data.js';
import { ASSETS, bouquetHTML, openOrder, plural, rub, tone } from './common.js';
import { loadBuilder, makeSeq, persist } from './builder-store.js';

const $ = (id) => document.getElementById(id);
const state = loadBuilder();
let uidCounter = 0;

const stemTile = (s) => `
  <div class="stem">
    <img src="${ASSETS}${s.id}-b.webp" width="360" height="360" alt="" loading="lazy">
    <b>${s.name}</b>
    <small>${rub(s.price)}${inSeasonNow(s) ? '' : ', под заказ'}</small>
    <div class="step-n" role="group" aria-label="${s.name}">
      <button type="button" data-minus="${s.id}" aria-label="Убрать: ${s.name}">−</button>
      <b data-n="${s.id}">0</b>
      <button type="button" data-plus="${s.id}" aria-label="Добавить: ${s.name}">+</button>
    </div>
  </div>`;

$('flowers').innerHTML = FLOWERS.map(stemTile).join('');
$('greens').innerHTML = GREENS.map(stemTile).join('');
$('presets').innerHTML = BOUQUETS.slice(0, 3).map((b) => `<button class="link" type="button" data-preset="${b.id}">${b.name}</button>`).join('');
$('wraps').innerHTML = WRAPS.map((w) => `
  <label class="chip"><input type="radio" name="wrap" value="${w.id}"><span>${w.id === 'none' ? '' : `<i class="swatch" style="background:${w.color}" aria-hidden="true"></i>`}${w.name}${w.price ? `, ${rub(w.price)}` : ''}</span></label>`).join('');

const countMap = () => state.seq.reduce((map, s) => { map[s.id] = (map[s.id] || 0) + 1; return map; }, {});

/** Обновляет букет на месте: старые цветки плавно сдвигаются, новый распускается с краю. */
function drawDome() {
  const dome = $('dome');
  const host = document.createElement('div');
  host.innerHTML = bouquetHTML(countMap(), state.wrap, { seq: state.seq });
  const next = host.firstElementChild;
  const current = dome.firstElementChild;
  if (!current) {
    dome.append(next);
    return;
  }
  const paper = next.querySelector('.bq-paper');
  current.querySelector('.bq-paper')?.remove();
  if (paper) current.prepend(paper);
  const existing = new Map([...current.querySelectorAll('img')].map((img) => [img.dataset.k, img]));
  next.querySelectorAll('img').forEach((img) => {
    const old = existing.get(img.dataset.k);
    if (old) {
      old.style.cssText = img.style.cssText;
      existing.delete(img.dataset.k);
    } else {
      img.style.setProperty('--d', '0ms');
      img.style.animation = 'bloom .55s var(--ease) both';
      current.append(img);
    }
  });
  existing.forEach((img) => img.remove());
}

function dominantTone(counts) {
  const entries = Object.entries(counts);
  const flowers = entries.filter(([id]) => !isGreen(id));
  const pool = flowers.length ? flowers : entries;
  if (!pool.length) return null;
  return pool.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
}

function render() {
  const counts = countMap();
  const total = state.seq.length;
  const flowers = state.seq.filter((s) => !isGreen(s.id)).length;
  drawDome();
  $('empty').hidden = total > 0;

  // Фон страницы подстраивается под главный цветок букета.
  const lead = dominantTone(counts);
  const root = document.documentElement.style;
  document.body.classList.toggle('paper-tone', Boolean(lead));
  if (lead) {
    root.setProperty('--tone', tone(lead)[0]);
    root.setProperty('--tone-ink', tone(lead)[1]);
  } else {
    root.removeProperty('--tone');
    root.removeProperty('--tone-ink');
  }

  const price = total ? bouquetPrice(counts, state.wrap) : 0;
  $('price').textContent = rub(price);
  $('meta').textContent = total
    ? `${total} ${plural(total, 'стебель', 'стебля', 'стеблей')}, сборка ${rub(ASSEMBLY)} включена`
    : 'Букет пока пуст';
  $('order').disabled = !total;
  $('order').style.opacity = total ? '' : '.45';

  let tip = '';
  if (total >= MAX_STEMS) tip = `В один букет помещается ${MAX_STEMS} стебель.`;
  else if (flowers > 0 && flowers < 15 && flowers % 2 === 0) tip = `В России принято дарить нечётное число цветов. Сейчас их ${flowers}, добавьте ещё один.`;
  else if (flowers > 0 && !state.seq.some((s) => isGreen(s.id))) tip = 'Немного зелени соберёт букет в одну форму.';
  $('tip').textContent = tip;

  document.querySelectorAll('[data-n]').forEach((el) => { el.textContent = counts[el.dataset.n] || 0; });
  document.querySelectorAll('[data-minus]').forEach((b) => { b.disabled = !counts[b.dataset.minus]; });
  document.querySelectorAll('[data-plus]').forEach((b) => { b.disabled = total >= MAX_STEMS; });
  const wrapInput = document.querySelector(`input[name=wrap][value="${state.wrap}"]`);
  if (wrapInput) wrapInput.checked = true;
  persist(state);
}

document.querySelector('.b-side').addEventListener('click', (event) => {
  const plus = event.target.closest('[data-plus]');
  const minus = event.target.closest('[data-minus]');
  const preset = event.target.closest('[data-preset]');
  if (plus && state.seq.length < MAX_STEMS) {
    uidCounter += 1;
    state.seq.push({ id: plus.dataset.plus, uid: `${plus.dataset.plus}-${Date.now().toString(36)}-${uidCounter}` });
    render();
  } else if (minus) {
    const at = state.seq.map((s) => s.id).lastIndexOf(minus.dataset.minus);
    if (at >= 0) state.seq.splice(at, 1);
    render();
  } else if (preset) {
    const b = BOUQUETS.find((x) => x.id === preset.dataset.preset);
    state.seq = makeSeq(b.stems);
    state.wrap = b.wrap;
    render();
  } else if (event.target.closest('#clear')) {
    state.seq = [];
    render();
  }
});

$('wraps').addEventListener('change', (event) => {
  state.wrap = event.target.value;
  render();
});

$('order').addEventListener('click', () => {
  const counts = countMap();
  const total = state.seq.length;
  if (!total) return;
  const names = Object.keys(counts).slice(0, 3).map((id) => stemById(id).name.toLowerCase()).join(', ');
  openOrder({
    title: 'Ваш букет',
    detail: `${total} ${plural(total, 'стебель', 'стебля', 'стеблей')}: ${names}. ${wrapById(state.wrap).name}`,
    price: bouquetPrice(counts, state.wrap),
    toneId: dominantTone(counts),
    image: `<div class="sheet-bq">${bouquetHTML(counts, state.wrap, { seq: state.seq })}</div>`,
  });
});

render();
