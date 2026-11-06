import { FLOWERS, MONTHS, SIZES, bouquetPrice, fitParity, flowerCount, inSeasonNow, scaleStems, stemById } from './data.js';
import { ASSETS, bouquetHTML, itemUrl, openOrder, plural, rub, stemsText, tone, toneStyle } from './common.js';
import { ALL_ITEMS } from './cards.js';
import { addStems, saveBuilder } from './builder-store.js';

const main = document.getElementById('main');
const id = new URLSearchParams(location.search).get('id');
const item = ALL_ITEMS.find((x) => x.id === id);

const stemWord = (n) => plural(n, 'стебель', 'стебля', 'стеблей');
const yearHTML = (months) => `<div class="year" role="img" aria-label="Сезон: ${months.map((m) => MONTHS[m - 1]).join(', ')}">${MONTHS.map((m, i) => `<span class="${months.includes(i + 1) ? 'on' : ''}" aria-hidden="true">${m}</span>`).join('')}</div>`;

function nextHTML() {
  const index = ALL_ITEMS.indexOf(item);
  const next = ALL_ITEMS[(index + 1) % ALL_ITEMS.length];
  const pic = next.kind === 'bouquet'
    ? `<div style="width:clamp(64px,8vw,104px);flex:none">${bouquetHTML(next.stems, next.wrap)}</div>`
    : `<img src="${ASSETS}${next.id}-b.webp" width="360" height="360" alt="" loading="lazy">`;
  return `<a class="next-item toned" href="${itemUrl(next.id)}" style="${toneStyle(next.id)}">${pic}<span>Следующая страница<br><b>${next.name}</b></span></a>`;
}

function renderBouquet() {
  let size = 'm';
  let parity = 'odd';
  main.innerHTML = `
    <article class="item">
      <div class="item-pic"><div class="item-bq" id="pic" style="view-transition-name:vt-${item.id}"></div></div>
      <div class="item-info">
        <h1>${item.name}</h1>
        <p class="item-text">${item.text}</p>
        <p class="item-price"><span id="price"></span><small id="stems"></small></p>
        <fieldset class="item-ctrl"><legend>Размер</legend><div class="chips">
          ${SIZES.map((s) => `<label class="chip"><input type="radio" name="size" value="${s.id}" ${s.id === size ? 'checked' : ''}><span>${s.name}</span></label>`).join('')}
        </div></fieldset>
        <fieldset class="item-ctrl"><legend>Число цветов</legend><div class="chips">
          <label class="chip"><input type="radio" name="parity" value="odd" checked><span id="parity-odd"></span></label>
          <label class="chip"><input type="radio" name="parity" value="even"><span id="parity-even"></span></label>
        </div><p class="item-hint" id="parity-hint" role="status"></p></fieldset>
        <div class="item-acts">
          <button class="btn" type="button" id="order">Заказать</button>
          <button class="btn btn-line" type="button" id="edit">Изменить в конструкторе</button>
        </div>
        <section class="facts"><div><h2>Что внутри</h2><ul class="comp" id="comp" style="margin-top:6px"></ul></div></section>
      </div>
    </article>
    ${nextHTML()}`;

  const current = () => {
    const k = SIZES.find((s) => s.id === size).k;
    const stems = fitParity(scaleStems(item.stems, k), parity);
    return { stems, price: bouquetPrice(stems, item.wrap) };
  };
  const update = () => {
    const c = current();
    const scaled = scaleStems(item.stems, SIZES.find((s) => s.id === size).k);
    document.getElementById('parity-odd').textContent = `Нечётное: ${flowerCount(fitParity(scaled, 'odd'))}`;
    document.getElementById('parity-even').textContent = `Чётное: ${flowerCount(fitParity(scaled, 'even'))}`;
    document.getElementById('parity-hint').textContent = parity === 'even' ? 'В России чётное число цветов чаще связывают с траурными букетами. Выбор за вами.' : '';
    document.getElementById('pic').innerHTML = bouquetHTML(c.stems, item.wrap);
    document.getElementById('price').textContent = rub(c.price);
    document.getElementById('stems').textContent = `${stemsText(c.stems)}, бумага и сборка включены`;
    document.getElementById('comp').innerHTML = Object.entries(c.stems).map(([sid, n]) => `
      <li><a href="${itemUrl(sid)}"><img src="${ASSETS}${sid}-b.webp" width="360" height="360" alt="" loading="lazy"><span><b>${stemById(sid).name}</b>, ${n} ${stemWord(n)}</span></a></li>`).join('');
  };
  main.addEventListener('change', (event) => {
    if (event.target.name === 'size') {
      size = event.target.value;
      update();
    } else if (event.target.name === 'parity') {
      parity = event.target.value;
      update();
    }
  });
  document.getElementById('order').addEventListener('click', () => {
    const c = current();
    const sizeName = SIZES.find((s) => s.id === size).name;
    openOrder({
      title: `Букет «${item.name}»`,
      detail: `${sizeName}, ${stemsText(c.stems)}`,
      price: c.price,
      toneId: item.id,
      image: `<div class="sheet-bq">${bouquetHTML(c.stems, item.wrap)}</div>`,
    });
  });
  document.getElementById('edit').addEventListener('click', () => {
    saveBuilder(current().stems, item.wrap);
    location.href = '/demos/socvetie/builder.html';
  });
  update();
}

function renderStem() {
  let count = 7;
  const inAtlas = FLOWERS.some((f) => f.id === item.id);
  main.innerHTML = `
    <article class="item">
      <div class="item-pic"><img class="item-photo" src="${ASSETS}${item.id}.webp" width="900" height="1125" alt="${item.name}, крупный план" fetchpriority="high"></div>
      <div class="item-info">
        <img src="${ASSETS}${item.id}-b.webp" width="360" height="360" alt="" style="width:clamp(84px,9vw,132px);view-transition-name:vt-${item.id};margin-bottom:12px">
        <h1>${item.name}</h1>
        <p class="item-latin">${item.latin}</p>
        <p class="item-text">${item.note}</p>
        <p class="item-price"><span id="price"></span><small>${rub(item.price)} за стебель</small></p>
        <div class="item-ctrl"><p class="item-label" id="count-l">Сколько стеблей</p>
          <div class="step-n" role="group" aria-labelledby="count-l">
            <button type="button" id="minus" aria-label="Убрать стебель">−</button><b id="count" aria-live="polite"></b><button type="button" id="plus" aria-label="Добавить стебель">+</button>
          </div>
        </div>
        <div class="item-acts">
          <button class="btn" type="button" id="order">Заказать</button>
          <button class="btn btn-line" type="button" id="add">В конструктор</button>
        </div>
        <section class="facts">
          <div><h2>Когда есть в продаже</h2>${yearHTML(item.months)}${inSeasonNow(item) ? '' : '<p style="margin-top:8px">Сейчас не сезон, привезём под заказ.</p>'}</div>
          <div><h2>Сколько стоит в вазе</h2><p>${item.days} дней</p></div>
          <div><h2>Как ухаживать</h2><p>${item.care}</p></div>
          ${inAtlas ? `<a class="link" href="/demos/socvetie/atlas.html?flower=${item.id}">Открыть в атласе</a>` : ''}
        </section>
      </div>
    </article>
    ${nextHTML()}`;

  const update = () => {
    document.getElementById('count').textContent = count;
    document.getElementById('price').textContent = rub(item.price * count);
    document.getElementById('minus').disabled = count <= 1;
    document.getElementById('plus').disabled = count >= 25;
  };
  document.getElementById('minus').addEventListener('click', () => { count -= 1; update(); });
  document.getElementById('plus').addEventListener('click', () => { count += 1; update(); });
  document.getElementById('order').addEventListener('click', () => {
    openOrder({
      title: item.name,
      detail: `${count} ${stemWord(count)} без упаковки`,
      price: item.price * count,
      toneId: item.id,
      image: `<img src="${ASSETS}${item.id}-b.webp" width="360" height="360" alt="">`,
    });
  });
  document.getElementById('add').addEventListener('click', (event) => {
    addStems(item.id, count);
    event.currentTarget.textContent = 'Добавлено';
    setTimeout(() => { location.href = '/demos/socvetie/builder.html'; }, 450);
  });
  update();
}

if (!item) {
  document.title = 'Страница не найдена - Соцветие';
  main.innerHTML = `<section class="missing"><h1>Такого цветка у нас нет</h1><p>Возможно, ссылка устарела. В каталоге собрано всё, что можно заказать.</p><a class="btn" href="/demos/socvetie/catalog.html">Открыть каталог</a></section>`;
} else {
  document.title = `${item.name} - Соцветие`;
  document.querySelector('meta[name=theme-color]').content = tone(item.id)[0];
  if (item.kind === 'bouquet') renderBouquet();
  else renderStem();
}
