import { FLOWERS, MONTHS_GEN, scaleStems } from './data.js';
import { ASSETS, bouquetHTML, itemUrl, rub, toneStyle } from './common.js';
import { BOUQUET_ITEMS, bindOrderButtons, cardHTML } from './cards.js';

const pudra = BOUQUET_ITEMS.find((b) => b.id === 'pudra');
document.getElementById('hero-bq').innerHTML = bouquetHTML(scaleStems(pudra.stems, 1.5), pudra.wrap, { animate: true });

const month = new Date().getMonth() + 1;
const inSeason = FLOWERS.filter((f) => f.months.includes(month));
document.getElementById('season').innerHTML = inSeason.map((f) => `
  <a class="season-card" href="${itemUrl(f.id)}" style="${toneStyle(f.id)}">
    <span class="snap"><img src="${ASSETS}${f.id}-b.webp" width="360" height="360" alt="" loading="lazy" style="view-transition-name:vt-${f.id}"></span>
    <b>${f.name}</b>
    <span class="note">${rub(f.price)} за стебель, сезон до ${MONTHS_GEN[f.months[f.months.length - 1] - 1]}</span>
  </a>`).join('');

const picks = BOUQUET_ITEMS.filter((b) => b.id !== 'pudra').slice(0, 2);
document.getElementById('bouquets').innerHTML = [
  cardHTML(pudra, 0, { big: true }),
  ...picks.map((b, i) => cardHTML(b, i + 1)),
].join('');

bindOrderButtons();
