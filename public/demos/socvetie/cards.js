import { BOUQUETS, STEMS, bouquetPrice, isGreen } from './data.js';
import { ASSETS, bouquetHTML, itemUrl, openOrder, rub, stemsText, toneStyle } from './common.js';

export const BOUQUET_ITEMS = BOUQUETS.map((b) => ({ ...b, kind: 'bouquet', price: bouquetPrice(b.stems, b.wrap) }));
export const STEM_ITEMS = STEMS.map((s) => ({ ...s, kind: isGreen(s.id) ? 'green' : 'flower' }));
export const ALL_ITEMS = [...BOUQUET_ITEMS, ...STEM_ITEMS];

export function picture(item) {
  if (item.kind === 'bouquet') return bouquetHTML(item.stems, item.wrap);
  return `<img src="${ASSETS}${item.id}-b.webp" width="360" height="360" alt="" loading="lazy">`;
}

export function cardHTML(item, i = 0, { big = false } = {}) {
  const isBouquet = item.kind === 'bouquet';
  const kind = isBouquet ? stemsText(item.stems) : `<i>${item.latin}</i>`;
  return `
    <article class="card ${big ? 'big' : ''}" style="${toneStyle(item.id)};animation-delay:${Math.min(i, 8) * 40}ms">
      <span class="card-pic" style="view-transition-name:vt-${item.id}">${picture(item)}</span>
      <h3><a href="${itemUrl(item.id)}">${item.name}</a></h3>
      <p class="card-kind">${kind}</p>
      <div class="card-foot">
        <span>${rub(item.price)}${isBouquet ? '' : ' за стебель'}</span>
        ${isBouquet ? `<button class="card-order" type="button" data-order="${item.id}">Заказать</button>` : ''}
      </div>
    </article>`;
}

export function orderBouquet(id) {
  const item = BOUQUET_ITEMS.find((b) => b.id === id);
  openOrder({
    title: `Букет «${item.name}»`,
    detail: `Средний, ${stemsText(item.stems)}`,
    price: item.price,
    toneId: item.id,
    image: `<div class="sheet-bq">${bouquetHTML(item.stems, item.wrap)}</div>`,
  });
}

/** Первое касание: кнопка «Заказать» на любой карточке букета. */
export function bindOrderButtons(root = document) {
  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-order]');
    if (button) orderBouquet(button.dataset.order);
  });
}
