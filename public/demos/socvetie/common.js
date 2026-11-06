import { stemById, isGreen, wrapById, flowerCount, greenCount } from './data.js';

export const ASSETS = '/demos/socvetie/assets/';
export const rub = (n) => `${Math.round(n).toLocaleString('ru-RU')} ₽`;
export const plural = (n, one, few, many) => {
  const a = n % 100, b = n % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  return b >= 2 && b <= 4 ? few : many;
};
export const stemsText = (stems) => {
  const flowers = flowerCount(stems);
  const greens = greenCount(stems);
  const main = `${flowers} ${plural(flowers, 'цветок', 'цветка', 'цветов')}`;
  return greens ? `${main} и ${greens} ${plural(greens, 'ветка', 'ветки', 'веток')} зелени` : main;
};
export const tone = (id) => window.SOC_TONES[id];
export const toneStyle = (id) => `--tone:${tone(id)[0]};--tone-ink:${tone(id)[1]}`;
export const itemUrl = (id) => `/demos/socvetie/item.html?id=${id}`;

function seeded(seed) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const hash = (text) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Букет сверху: стебли ложатся по золотому углу, зелень и бумага лежат кольцом снизу. */
export function shuffledSeq(stems) {
  const key = Object.entries(stems).map(([id, n]) => id + n).join('');
  const rnd = seeded(hash(key) + 13);
  const flowers = [];
  const greens = [];
  Object.entries(stems).forEach(([id, n]) => {
    for (let i = 0; i < n; i += 1) (isGreen(id) ? greens : flowers).push({ id, uid: `${id}-${i}` });
  });
  // Цветы перемешаны, чтобы один сорт не собирался в кучку.
  for (let i = flowers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [flowers[i], flowers[j]] = [flowers[j], flowers[i]];
  }
  return [...flowers, ...greens];
}

export function bouquetHTML(stems, wrapId, { animate = false, seq = null } = {}) {
  const all = seq || shuffledSeq(stems);
  const flowers = all.filter((s) => !isGreen(s.id));
  const greens = all.filter((s) => isGreen(s.id));
  const count = flowers.length;
  const spread = count > 1 ? 31 + Math.min(4, count / 8) : 0;
  // Диаметр цветка взят с запасом, чтобы соседние цветки заметно перекрывались и букет был плотным.
  const base = Math.max(20, Math.min(52, 102 / Math.sqrt(Math.max(count, 1))));
  const golden = Math.PI * (3 - Math.sqrt(5));
  let order = 0;

  const greenHTML = greens.map((s, i) => {
    const rnd = seeded(hash(s.uid) + 5);
    const a = (i / Math.max(greens.length, 1)) * Math.PI * 2 + rnd() * .3;
    const r = Math.min(34, spread + 3) + rnd() * 2;
    const size = 28 + rnd() * 5;
    const x = 50 + Math.cos(a) * r, y = 50 + Math.sin(a) * r;
    return `<img class="bq-g" data-k="${s.uid}" src="${ASSETS}${s.id}-b.webp" alt="" width="360" height="360" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${size.toFixed(1)}%;--r:${Math.round(rnd() * 360)}deg;--d:${(order++) * 30}ms">`;
  }).join('');

  const flowerHTML = flowers.map((s, i) => {
    const rnd = seeded(hash(s.uid) + 9);
    const r = count > 1 ? spread * Math.sqrt((i + .4) / count) : 0;
    const a = i * golden;
    const size = base * stemById(s.id).size * (.94 + rnd() * .12);
    const x = 50 + Math.cos(a) * r, y = 50 + Math.sin(a) * r;
    const z = count - i + 2;
    return `<img class="bq-f" data-k="${s.uid}" src="${ASSETS}${s.id}-b.webp" alt="" width="360" height="360" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${size.toFixed(1)}%;z-index:${z};--r:${Math.round(rnd() * 50 - 25)}deg;--d:${(order++) * 30}ms">`;
  }).join('');

  // Бумага: фестончатый круг, один на все букеты.
  const wrap = wrapById(wrapId);
  let paper = '';
  if (wrap.id !== 'none') {
    const lobes = 16;
    const points = Array.from({ length: lobes }, (_, i) => {
      const a = (i / lobes) * Math.PI * 2;
      return [50 + Math.cos(a) * 46, 50 + Math.sin(a) * 46];
    });
    const d = points.map((p, i) => {
      const next = points[(i + 1) % lobes];
      const m = ((i + .5) / lobes) * Math.PI * 2;
      return `Q${(50 + Math.cos(m) * 52).toFixed(1)} ${(50 + Math.sin(m) * 52).toFixed(1)} ${next[0].toFixed(1)} ${next[1].toFixed(1)}`;
    }).join('');
    paper = `<svg class="bq-paper" viewBox="0 0 100 100" aria-hidden="true"><path d="M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}${d}Z" fill="${wrap.color}"/></svg>`;
  }
  return `<div class="bq ${animate ? 'bq-anim' : ''}" aria-hidden="true">${paper}${greenHTML}${flowerHTML}</div>`;
}

/* Заказ в два касания. Первое касание открывает окно, второе подтверждает. */
const DETAILS_KEY = 'socvetie-details';
const SLOTS = ['Сегодня к 18:00', 'Сегодня к 21:00', 'Завтра к 12:00', 'Завтра к 18:00'];
const DEFAULT_DETAILS = { address: 'ул. Садовая, 12, кв. 4', slot: SLOTS[0], note: '' };

function readDetails() {
  try {
    const saved = JSON.parse(localStorage.getItem(DETAILS_KEY));
    return { ...DEFAULT_DETAILS, ...(saved || {}) };
  } catch {
    return { ...DEFAULT_DETAILS };
  }
}

function saveDetails(value) {
  try { localStorage.setItem(DETAILS_KEY, JSON.stringify(value)); } catch { /* детали просто не запомнятся */ }
}

let dialog = null;

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'sheet';
  dialog.setAttribute('aria-labelledby', 'sheet-title');
  document.body.append(dialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.closest('[data-sheet-close]')) dialog.close();
  });
  return dialog;
}

const escapeText = (text) => String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function openOrder({ title, detail, price, toneId, image }) {
  const el = ensureDialog();
  let details = readDetails();
  const [bg, ink] = toneId ? tone(toneId) : ['#f2f5ef', '#26352c'];
  el.style.setProperty('--tone', bg);
  el.style.setProperty('--tone-ink', ink);

  const renderMain = () => {
    el.innerHTML = `
      <div class="sheet-in">
        <div class="sheet-head">
          ${image || ''}
          <div><h2 id="sheet-title">${escapeText(title)}</h2><p>${escapeText(detail)}</p></div>
        </div>
        <dl class="sheet-facts">
          <div><dt>Когда</dt><dd data-f="slot">${escapeText(details.slot)}</dd></div>
          <div><dt>Куда</dt><dd data-f="address">${escapeText(details.address)}</dd></div>
          <div><dt>Оплата</dt><dd>Карта, которую вы использовали в прошлый раз</dd></div>
        </dl>
        <button class="link" type="button" data-edit aria-expanded="false">Изменить детали</button>
        <form class="sheet-edit" hidden novalidate>
          <div class="field"><label for="o-address">Адрес</label><input id="o-address" name="address" autocomplete="street-address" value="${escapeText(details.address)}" aria-describedby="o-address-err"><span id="o-address-err" role="alert"></span></div>
          <fieldset class="field"><legend>Время доставки</legend><div class="chips">${SLOTS.map((s) => `<label class="chip"><input type="radio" name="slot" value="${s}" ${s === details.slot ? 'checked' : ''}><span>${s}</span></label>`).join('')}</div></fieldset>
          <div class="field"><label for="o-note">Текст открытки, по желанию</label><input id="o-note" name="note" autocomplete="off" value="${escapeText(details.note)}"></div>
        </form>
        <button class="btn sheet-go" type="button" data-confirm>Подтвердить за ${rub(price)}</button>
        <button class="link sheet-close" type="button" data-sheet-close>Не сейчас</button>
        <p class="sheet-demo">Адрес и карта подставлены для примера: это концепт-сайт.</p>
      </div>`;

    const form = el.querySelector('.sheet-edit');
    const toggle = el.querySelector('[data-edit]');
    toggle.addEventListener('click', () => {
      form.hidden = !form.hidden;
      toggle.setAttribute('aria-expanded', String(!form.hidden));
      toggle.textContent = form.hidden ? 'Изменить детали' : 'Скрыть детали';
    });
    form.addEventListener('input', () => {
      const data = new FormData(form);
      details = { address: String(data.get('address')), slot: String(data.get('slot')), note: String(data.get('note')) };
      el.querySelector('[data-f=slot]').textContent = details.slot;
      el.querySelector('[data-f=address]').textContent = details.address || 'Адрес не указан';
    });
    form.addEventListener('submit', (event) => event.preventDefault());
    el.querySelector('[data-confirm]').addEventListener('click', () => {
      if (!details.address.trim()) {
        form.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        el.querySelector('#o-address-err').textContent = 'Укажите адрес, чтобы курьер знал, куда ехать';
        el.querySelector('#o-address').setAttribute('aria-invalid', 'true');
        el.querySelector('#o-address').focus();
        return;
      }
      saveDetails(details);
      renderDone();
    });
  };

  const renderDone = () => {
    const number = String(1000 + (hash(title + Date.now()) % 9000));
    el.innerHTML = `
      <div class="sheet-in">
        <h2 id="sheet-title" tabindex="-1">Заказ ${number} принят</h2>
        <p class="sheet-done">${escapeText(title)}: ${escapeText(details.slot.toLowerCase())}, ${escapeText(details.address)}.</p>
        <p class="sheet-demo">Это концепт-сайт: заказ никуда не отправлен, оплата не проводилась.</p>
        <button class="btn sheet-go" type="button" data-sheet-close>Готово</button>
      </div>`;
    el.querySelector('#sheet-title').focus();
  };

  renderMain();
  el.showModal();
  el.querySelector('[data-confirm]').focus();
}
