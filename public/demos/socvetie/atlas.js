import { BOUQUETS, FLOWERS, MONTHS, MONTHS_IN, SEASONS } from './data.js';
import { ASSETS, bouquetHTML, itemUrl, rub, tone } from './common.js';

const book = document.getElementById('book');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const pos = document.getElementById('pos');
const chapters = document.getElementById('chapters');
const root = document.documentElement.style;
const narrow = matchMedia('(max-width: 760px)');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const FLIP_MS = 900;
const month = new Date().getMonth() + 1;

let leaves = [];
let idx = 0;
let single = false;

const yearHTML = (f) => `<div class="year" role="img" aria-label="Сезон: ${f.months.map((m) => MONTHS[m - 1]).join(', ')}">${MONTHS.map((m, i) => `<span class="${f.months.includes(i + 1) ? 'on' : ''}" aria-hidden="true">${m}</span>`).join('')}</div>`;
const pageVars = (f) => `--page-tone:${tone(f.id)[1]};--page-ink:${tone(f.id)[0]}`;

const pudra = BOUQUETS[0];
const coverFront = () => `<div class="face front cover">
    <p class="cover-title">Атлас цветов сезона</p>
    <div class="cover-bq">${bouquetHTML(pudra.stems, pudra.wrap)}</div>
    <p class="cover-foot"><span>Соцветие</span><span>${FLOWERS.length} цветов</span></p>
  </div>`;

function tocHTML() {
  return `<p class="toc-title">Оглавление</p>
    <div class="toc">${SEASONS.map((season) => `<div><h3>${season}</h3>${FLOWERS.map((f, i) => (f.season === season ? `<button type="button" data-goto="${i}">${f.name}, табл. ${i + 1}</button>` : '')).join('')}</div>`).join('')}</div>
    <p class="toc-now">Сейчас, в ${MONTHS_IN[month - 1]}, в сезоне:${FLOWERS.filter((f) => f.months.includes(month)).map((f) => f.name.toLowerCase()).join(', ')}.</p>`;
}

const plateFace = (f, i) => `<div class="face back plate"><figure><img src="${ASSETS}${f.id}.webp" width="900" height="1125" alt="${f.name}, крупный план" draggable="false"><figcaption><span>Табл. ${i + 1}</span><i>${f.latin}</i></figcaption></figure></div>`;

const textBody = (f) => `<div>
    <h2>${f.name}</h2>
    <p class="page-latin">${f.latin}</p>
    <p class="page-note">${f.note}</p>
  </div>`;

const textFoot = (f) => `<div class="page-foot"><span>${rub(f.price)} за стебель, ${f.days} дней в вазе</span><a class="link" href="${itemUrl(f.id)}">Страница цветка</a></div>`;

const textFace = (f) => `<div class="face front page-text" style="${pageVars(f)}">
    ${textBody(f)}
    <img class="page-bloom" src="${ASSETS}${f.id}-b.webp" width="360" height="360" alt="" draggable="false">
    <div>${yearHTML(f)}</div>
    ${textFoot(f)}
  </div>`;

const mergedFace = (f, i) => `<div class="face front merged" style="${pageVars(f)}">
    <img class="merged-photo" src="${ASSETS}${f.id}.webp" width="900" height="1125" alt="${f.name}, крупный план" draggable="false">
    <div class="merged-body">
      <p>Табл. ${i + 1}, ${f.season.toLowerCase()}</p>
      ${textBody(f)}
      ${yearHTML(f)}
      ${textFoot(f)}
    </div>
  </div>`;

const colophonInner = `<p class="toc-title">Понравился цветок?</p>
  <p class="page-note">Соберите из него свой букет в конструкторе или выберите готовый в каталоге.</p>
  <div style="margin-top:auto;display:flex;flex-wrap:wrap;gap:10px;align-items:center"><a class="btn" href="/demos/socvetie/builder.html">Собрать букет</a><a class="link" href="/demos/socvetie/catalog.html">Смотреть каталог</a></div>`;

function buildLeaves() {
  const html = [];
  if (single) {
    html.push({ front: coverFront(), back: '' });
    html.push({ front: `<div class="face front">${tocHTML()}</div>`, back: '' });
    FLOWERS.forEach((f, i) => html.push({ front: mergedFace(f, i), back: '' }));
    html.push({ front: `<div class="face front">${colophonInner}</div>`, back: '' });
  } else {
    html.push({ front: coverFront(), back: `<div class="face back"><p class="toc-title">Как читать</p><p class="page-note">Каждому цветку отведён разворот. Слева таблица с фотографией, справа заметка флориста и календарь: тёмные месяцы показывают, когда цветок есть в продаже.</p><p class="page-note">Листайте кнопками внизу, стрелками на клавиатуре или тяните страницу за край.</p></div>` });
    FLOWERS.forEach((f, i) => {
      const front = i === 0 ? `<div class="face front">${tocHTML()}</div>` : textFace(FLOWERS[i - 1]);
      html.push({ front, back: plateFace(f, i) });
    });
    html.push({ front: textFace(FLOWERS[FLOWERS.length - 1]), back: `<div class="face back"><p class="toc-title">Конец атласа</p><p class="page-note">В следующем сезоне здесь появятся новые таблицы.</p></div>` });
    html.push({ front: `<div class="face front">${colophonInner}</div>`, back: `<div class="face back cover"><span></span><p class="cover-foot"><span>Соцветие</span></p></div>` });
  }
  book.innerHTML = html.map((l) => `<div class="leaf">${l.front}${l.back}</div>`).join('');
  leaves = [...book.querySelectorAll('.leaf')];
}

/* Последний разрешённый индекс: на узком экране нельзя пролистать последнюю страницу. */
const maxIdx = () => (single ? leaves.length - 1 : leaves.length);
/* Первые два перелистывания открывают обложку и оглавление, затем идут цветы. */
const flowerIndex = () => {
  const k = idx - 2;
  return k >= 0 && k < FLOWERS.length ? k : -1;
};

function applyZ(active = -1) {
  leaves.forEach((leaf, i) => {
    const flipped = i < idx;
    leaf.style.zIndex = i === active ? leaves.length + 5 : String(flipped ? i + 1 : leaves.length - i);
  });
}

function syncChrome() {
  book.classList.toggle('closed-front', !single && idx === 0);
  book.classList.toggle('closed-back', !single && idx === leaves.length);
  prevBtn.disabled = idx === 0;
  nextBtn.disabled = idx >= maxIdx();
  const k = flowerIndex();
  const f = k >= 0 ? FLOWERS[k] : null;
  // На обложке и оглавлении лежит оранжевая бумага, у каждого цветка своя.
  document.body.classList.toggle('paper-tone', Boolean(f));
  if (f) {
    root.setProperty('--tone', tone(f.id)[0]);
    root.setProperty('--tone-ink', tone(f.id)[1]);
  } else {
    root.removeProperty('--tone');
    root.removeProperty('--tone-ink');
  }
  if (f) pos.textContent = `${f.season}: ${f.name.toLowerCase()}`;
  else pos.textContent = idx === 0 ? 'Обложка' : idx === 1 ? 'Оглавление' : 'Конец атласа';
  chapters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', String(Boolean(f) && b.dataset.season === f.season)));
  // Скрытые страницы недоступны с клавиатуры.
  leaves.forEach((leaf, i) => {
    const visible = single ? i === idx : i === idx || i === idx - 1;
    leaf.inert = !visible;
  });
  if (!single) {
    leaves.forEach((leaf, i) => {
      leaf.querySelector('.face.front').inert = i < idx;
      const back = leaf.querySelector('.face.back');
      if (back) back.inert = i >= idx;
    });
  }
}

function setFlipped(leaf, value) {
  leaf.style.transform = '';
  leaf.classList.toggle('flipped', value);
}

function goTo(target, { instant = false } = {}) {
  const next = Math.max(0, Math.min(maxIdx(), target));
  if (next === idx) return;
  const forward = next > idx;
  const from = idx;
  idx = next;
  const steps = forward ? Array.from({ length: next - from }, (_, i) => from + i) : Array.from({ length: from - next }, (_, i) => from - 1 - i);
  const quick = instant || still.matches;
  steps.forEach((leafIndex, order) => {
    const leaf = leaves[leafIndex];
    const run = () => {
      applyZ(leafIndex);
      setFlipped(leaf, forward);
      setTimeout(() => applyZ(), quick ? 0 : FLIP_MS);
    };
    if (quick) {
      setFlipped(leaf, forward);
    } else {
      setTimeout(run, order * 70);
    }
  });
  if (quick) applyZ();
  syncChrome();
}

/* Страницу можно тянуть за край: угол следует за пальцем или мышью. */
let drag = null;
let suppressClick = false;

book.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || event.target.closest('a,button')) return;
  const rect = book.getBoundingClientRect();
  const forward = event.clientX >= rect.left + rect.width / 2;
  const leaf = forward ? leaves[idx] : leaves[idx - 1];
  if (!leaf || (forward && idx >= maxIdx())) return;
  drag = { forward, leaf, x: event.clientX, width: rect.width / (single ? 1 : 2), started: false, angle: forward ? 0 : -180, id: event.pointerId };
});

window.addEventListener('pointermove', (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x;
  if (!drag.started) {
    if (Math.abs(dx) < 8) return;
    drag.started = true;
    book.setPointerCapture?.(drag.id);
    book.classList.add('dragging');
    drag.leaf.classList.add('active');
    applyZ(leaves.indexOf(drag.leaf));
  }
  const limit = single ? 110 : 180;
  const progress = Math.max(0, Math.min(1, (drag.forward ? -dx : dx) / (drag.width * 1.2)));
  drag.progress = progress;
  drag.angle = drag.forward ? -limit * progress : -limit + limit * progress;
  drag.leaf.style.transform = `rotateY(${drag.angle}deg)`;
});

function endDrag(event) {
  if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.id)) return;
  const { started, forward, leaf, progress = 0 } = drag;
  drag = null;
  if (!started) return;
  suppressClick = true;
  setTimeout(() => { suppressClick = false; }, 60);
  book.classList.remove('dragging');
  leaf.classList.remove('active');
  leaf.style.transform = '';
  if (progress > .3) {
    idx += forward ? 1 : -1;
    leaf.classList.toggle('flipped', forward);
    syncChrome();
  }
  setTimeout(() => applyZ(), still.matches ? 0 : FLIP_MS);
}
window.addEventListener('pointerup', endDrag);
window.addEventListener('pointercancel', endDrag);

book.addEventListener('click', (event) => {
  if (suppressClick) return;
  const jump = event.target.closest('[data-goto]');
  if (jump) {
    goTo(Number(jump.dataset.goto) + 2);
    return;
  }
  if (event.target.closest('a,button')) return;
  const rect = book.getBoundingClientRect();
  goTo(idx + (event.clientX >= rect.left + rect.width / 2 ? 1 : -1));
});

prevBtn.addEventListener('click', () => goTo(idx - 1));
nextBtn.addEventListener('click', () => goTo(idx + 1));
window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') goTo(idx + 1);
  if (event.key === 'ArrowLeft') goTo(idx - 1);
});

chapters.innerHTML = SEASONS.map((s) => `<button type="button" data-season="${s}">${s}</button>`).join('');
chapters.addEventListener('click', (event) => {
  const b = event.target.closest('[data-season]');
  if (!b) return;
  goTo(FLOWERS.findIndex((f) => f.season === b.dataset.season) + 2);
});

function setup(keepFlower) {
  single = narrow.matches;
  book.classList.toggle('single', single);
  buildLeaves();
  idx = 0;
  leaves.forEach((leaf) => leaf.classList.remove('flipped'));
  applyZ();
  syncChrome();
  if (keepFlower >= 0) goTo(keepFlower + 2, { instant: true });
}

narrow.addEventListener('change', () => setup(flowerIndex()));

const wanted = new URLSearchParams(location.search).get('flower');
setup(FLOWERS.findIndex((f) => f.id === wanted));
