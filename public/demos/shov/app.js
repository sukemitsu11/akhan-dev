import { products, CATEGORIES, DELIVERY, PICKUP_POINTS, MAX_QTY } from './data.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = value => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const byId = new Map(products.map(product => [product.id, product]));
const app = $('#app');
const bag = $('#bag');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

/* Корзина. Хранятся только id, размер и количество. Цены всегда берутся из каталога. */
const CART_KEY = 'shov-cart';
const ORDER_KEY = 'shov-last-order';

function sanitizeCart(raw) {
  if (!Array.isArray(raw)) return [];
  const lines = new Map();
  for (const line of raw) {
    const product = byId.get(line?.id);
    if (!product || !product.sizes.includes(line.size) || product.soldOut.includes(line.size)) continue;
    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1) continue;
    const key = `${product.id}:${line.size}`;
    const merged = Math.min(MAX_QTY, (lines.get(key)?.qty ?? 0) + qty);
    lines.set(key, { id: product.id, size: line.size, qty: merged });
  }
  return [...lines.values()];
}

function loadCart() {
  try { return sanitizeCart(JSON.parse(localStorage.getItem(CART_KEY) || '[]')); } catch { return []; }
}

let cart = loadCart();

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* Корзина работает в пределах вкладки. */ }
  updateBagCount();
}

const cartSignature = () => JSON.stringify(cart);
const cartCount = () => cart.reduce((sum, line) => sum + line.qty, 0);
const subtotal = () => cart.reduce((sum, line) => sum + byId.get(line.id).price * line.qty, 0);

function deliveryPrice(method, sum = subtotal()) {
  const option = DELIVERY[method];
  if (!option) return 0;
  return option.freeFrom && sum >= option.freeFrom ? 0 : option.price;
}

function addToCart(id, size) {
  const line = cart.find(item => item.id === id && item.size === size);
  if (line) {
    if (line.qty >= MAX_QTY) return false;
    line.qty += 1;
  } else {
    cart.push({ id, size, qty: 1 });
  }
  saveCart();
  return true;
}

function setQty(id, size, qty) {
  const line = cart.find(item => item.id === id && item.size === size);
  if (!line) return;
  if (qty < 1) cart = cart.filter(item => item !== line);
  else line.qty = Math.min(MAX_QTY, qty);
  saveCart();
}

function updateBagCount() {
  $$('[data-bag-count]').forEach(node => { node.textContent = `(${cartCount()})`; });
}

/* Изображения. */
function picture(name, alt, sizes, eager = false) {
  return `<img src="/demos/shov/assets/${name}-small.webp" srcset="/demos/shov/assets/${name}-small.webp 600w, /demos/shov/assets/${name}.webp 1200w" sizes="${sizes}" width="1200" height="1500" alt="${escapeHtml(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function productCard(product, index, sizes) {
  const [image, alt] = product.images[0];
  return `<li class="card" style="--i:${index}">
    <a href="#/p/${product.id}">
      <span class="card-media">${picture(image, alt, sizes, index < 2)}</span>
      <span class="card-line"><span class="card-name">${product.name}</span><span class="card-price">${money(product.price)}</span></span>
      <span class="card-meta">${CATEGORIES[product.category]}</span>
    </a>
  </li>`;
}

/* Каталог. */
let sortOrder = 'default';
const SORTS = { default: 'Сначала новинки', cheap: 'Сначала дешевле', expensive: 'Сначала дороже' };

function renderCatalog(category) {
  const list = products.filter(product => !category || product.category === category);
  if (sortOrder === 'cheap') list.sort((a, b) => a.price - b.price);
  if (sortOrder === 'expensive') list.sort((a, b) => b.price - a.price);
  const filters = [['', 'Всё'], ['clothes', CATEGORIES.clothes], ['shoes', CATEGORIES.shoes]]
    .map(([key, label]) => `<a href="${key ? `#/c/${key}` : '#/'}"${(category || '') === key ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  document.title = category ? `${CATEGORIES[category]} | Шов` : 'Шов | Одежда и обувь';
  app.innerHTML = `
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-top">
        <h1 id="page-title" class="wordmark" tabindex="-1" translate="no"><span aria-hidden="true">ШОВ</span><span class="sr-only">Шов. Одежда и обувь</span></h1>
        <div class="hero-info">
          <p class="hero-lead">Одежда и обувь, у которых видно, как они сшиты. Малые партии, плотные ткани, прошитые подошвы.</p>
          <div class="hero-facts"><p>Доставка от 190 ₽, бесплатно от 15 000 ₽</p><p>Возврат 14 дней, примерка при курьере</p></div>
        </div>
      </div>
      <div class="seam" aria-hidden="true"></div>
    </section>
    <section class="catalog" aria-labelledby="catalog-title">
      <div class="catalog-bar">
        <h2 id="catalog-title" class="sr-only">Каталог</h2>
        <nav class="filters" aria-label="Разделы каталога">${filters}</nav>
        <p class="catalog-count" aria-live="polite">${list.length} ${plural(list.length, 'товар', 'товара', 'товаров')}</p>
        <label class="sort"><span class="sr-only">Сортировка</span><select data-sort>${Object.entries(SORTS).map(([key, label]) => `<option value="${key}"${key === sortOrder ? ' selected' : ''}>${label}</option>`).join('')}</select></label>
      </div>
      <ol class="grid">${list.map((product, index) => productCard(product, index, '(min-width: 1024px) 34vw, 50vw')).join('')}</ol>
    </section>`;
  $('[data-sort]', app).addEventListener('change', event => {
    sortOrder = event.target.value in SORTS ? event.target.value : 'default';
    renderCatalog(category);
    $('[data-sort]', app).focus();
  });
}

function plural(n, one, few, many) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/* Карточка товара. */
function renderProduct(product) {
  document.title = `${product.name} | Шов`;
  const related = products.filter(item => item.category === product.category && item.id !== product.id).slice(0, 3);
  app.innerHTML = `
    <article class="pdp">
      <div class="pdp-media">${product.images.map(([image, alt], index) => `<figure>${picture(image, alt, '(min-width: 1024px) 56vw, 100vw', index === 0)}</figure>`).join('')}</div>
      <div class="pdp-panel">
        <a class="text-link" href="#/${product.category === 'shoes' ? 'c/shoes' : 'c/clothes'}">Назад в раздел «${CATEGORIES[product.category]}»</a>
        <h1 id="page-title" tabindex="-1">${product.name}</h1>
        <p class="pdp-price">${money(product.price)}</p>
        <p class="pdp-description">${product.description}</p>
        <form class="pdp-form" novalidate>
          <dl class="pdp-row"><dt>Цвет</dt><dd>${product.color}</dd></dl>
          <fieldset class="sizes" aria-describedby="size-error">
            <legend>Размер${product.category === 'shoes' ? ' (RU)' : ''}</legend>
            <div class="size-grid">${product.sizes.map(size => {
              const out = product.soldOut.includes(size);
              return `<label class="size${out ? ' is-out' : ''}"><input type="radio" name="size" value="${size}"${out ? ' disabled' : ''}><span>${size}</span>${out ? '<span class="sr-only">, нет в наличии</span>' : ''}</label>`;
            }).join('')}</div>
          </fieldset>
          <p class="field-error" id="size-error" data-size-error aria-live="polite"></p>
          <button class="button" type="submit">Добавить в корзину</button>
        </form>
        <dl class="pdp-details">${product.details.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join('')}</dl>
      </div>
    </article>
    <section class="related" aria-labelledby="related-title">
      <div class="seam" aria-hidden="true"></div>
      <h2 id="related-title">Ещё в разделе «${CATEGORIES[product.category]}»</h2>
      <ol class="related-grid">${related.map((item, index) => productCard(item, index + 2, '(min-width: 1024px) 30vw, 50vw')).join('')}</ol>
    </section>`;
  const form = $('.pdp-form', app);
  form.addEventListener('change', () => { $('[data-size-error]', app).textContent = ''; $('.sizes', app).removeAttribute('aria-invalid'); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const size = new FormData(form).get('size');
    if (!size) {
      $('[data-size-error]', app).textContent = 'Выберите размер.';
      $('.sizes', app).setAttribute('aria-invalid', 'true');
      $('input[name="size"]:not(:disabled)', form)?.focus();
      return;
    }
    if (!addToCart(product.id, String(size))) {
      $('[data-size-error]', app).textContent = `В одном заказе не больше ${MAX_QTY} штук одного размера.`;
      return;
    }
    openBag(event.submitter);
  });
}

/* Корзина в боковой панели. */
let bagOpener = null;

function renderBag() {
  const body = $('[data-bag-body]');
  if (!cart.length) {
    body.innerHTML = `<div class="bag-empty"><p>В корзине пока ничего нет.</p><a class="button" href="#/" data-close-bag>Перейти в каталог</a></div>`;
    return;
  }
  const sum = subtotal();
  const left = DELIVERY.courier.freeFrom - sum;
  body.innerHTML = `
    <ul class="bag-lines">${cart.map(line => {
      const product = byId.get(line.id);
      const [image, alt] = product.images[0];
      return `<li class="bag-line">
        <a class="bag-thumb" href="#/p/${product.id}" data-close-bag tabindex="-1" aria-hidden="true">${picture(image, alt, '96px')}</a>
        <div class="bag-line-info">
          <a href="#/p/${product.id}" data-close-bag>${product.name}</a>
          <p>Размер ${line.size}</p>
          <div class="stepper" role="group" aria-label="Количество: ${product.name}, размер ${line.size}">
            <button type="button" data-qty="-1" data-id="${line.id}" data-size="${line.size}" aria-label="Уменьшить количество">−</button>
            <output aria-live="polite">${line.qty}</output>
            <button type="button" data-qty="1" data-id="${line.id}" data-size="${line.size}" aria-label="Увеличить количество"${line.qty >= MAX_QTY ? ' disabled' : ''}>+</button>
          </div>
        </div>
        <div class="bag-line-end">
          <p>${money(product.price * line.qty)}</p>
          <button class="text-button" type="button" data-remove data-id="${line.id}" data-size="${line.size}">Удалить<span class="sr-only"> ${product.name}, размер ${line.size}</span></button>
        </div>
      </li>`;
    }).join('')}</ul>
    <div class="bag-foot">
      <dl class="totals"><div><dt>Товары</dt><dd>${money(sum)}</dd></div></dl>
      <p class="bag-note">${left > 0 ? `До бесплатной доставки ${money(left)}` : 'Доставка курьером бесплатная'}</p>
      <a class="button" href="#/checkout" data-close-bag>Оформить заказ</a>
    </div>`;
}

function openBag(opener) {
  bagOpener = opener ?? document.activeElement;
  renderBag();
  if (!bag.open) bag.showModal();
  document.documentElement.classList.add('is-locked');
}

bag.addEventListener('close', () => {
  document.documentElement.classList.remove('is-locked');
  if (bagOpener?.isConnected) bagOpener.focus({ preventScroll: true });
});
bag.addEventListener('click', event => {
  if (event.target === bag) { bag.close(); return; }
  const qtyButton = event.target.closest('[data-qty]');
  if (qtyButton) {
    const { id, size } = qtyButton.dataset;
    const line = cart.find(item => item.id === id && item.size === size);
    if (!line) return;
    setQty(id, size, line.qty + Number(qtyButton.dataset.qty));
    renderBag();
    // Фокус остаётся на том же шаге, чтобы можно было нажимать подряд.
    const again = $(`[data-qty="${qtyButton.dataset.qty}"][data-id="${id}"][data-size="${size}"]`, bag);
    (again && !again.disabled ? again : $('[data-close-bag]', bag))?.focus();
    refreshCheckoutSummary();
    return;
  }
  const remove = event.target.closest('[data-remove]');
  if (remove) {
    setQty(remove.dataset.id, remove.dataset.size, 0);
    renderBag();
    $('.bag-line a, [data-close-bag]', bag)?.focus();
    refreshCheckoutSummary();
    return;
  }
  if (event.target.closest('[data-close-bag]')) bag.close();
});
document.addEventListener('click', event => {
  const opener = event.target.closest('[data-open-bag]');
  if (opener) openBag(opener);
});

/* Оформление и тестовая оплата. */
const TEST_CARD = '4242 4242 4242 4242';
const DECLINE_CARD = '4000000000000002';
// Форма, по которой идёт оплата. Флаг привязан к форме: после ухода со страницы новая форма не блокируется.
let paying = null;
const isPaying = () => Boolean(paying?.isConnected);
let deliveryMethod = 'courier';

function luhn(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
  }
  return sum % 10 === 0;
}

function formatPhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (digits && !digits.startsWith('7')) digits = `7${digits}`;
  digits = digits.slice(0, 11);
  const n = digits.slice(1);
  if (!digits) return '';
  let out = '+7';
  if (n.length) out += ` (${n.slice(0, 3)}`;
  if (n.length >= 3) out += ')';
  if (n.length > 3) out += ` ${n.slice(3, 6)}`;
  if (n.length > 6) out += `-${n.slice(6, 8)}`;
  if (n.length > 8) out += `-${n.slice(8, 10)}`;
  return out;
}

function summaryHtml() {
  const sum = subtotal();
  const shipping = deliveryPrice(deliveryMethod, sum);
  return `
    <ul class="summary-lines">${cart.map(line => {
      const product = byId.get(line.id);
      return `<li><span>${product.name}<small>Размер ${line.size}, ${line.qty} шт.</small></span><span>${money(product.price * line.qty)}</span></li>`;
    }).join('')}</ul>
    <dl class="totals">
      <div><dt>Товары</dt><dd>${money(sum)}</dd></div>
      <div><dt>Доставка</dt><dd>${shipping ? money(shipping) : 'Бесплатно'}</dd></div>
      <div class="totals-sum"><dt>Итого</dt><dd>${money(sum + shipping)}</dd></div>
    </dl>
    <button class="text-button" type="button" data-open-bag>Изменить корзину</button>`;
}

function refreshCheckoutSummary() {
  const summary = $('[data-summary]', app);
  if (!summary) return;
  if (!cart.length && !isPaying()) { route(); return; }
  summary.innerHTML = summaryHtml();
  $$('[data-delivery-price]', app).forEach(node => {
    const price = deliveryPrice(node.dataset.deliveryPrice);
    node.textContent = price ? money(price) : 'Бесплатно';
  });
  const payButton = $('[data-pay]', app);
  if (payButton && !isPaying()) payButton.textContent = `Оплатить ${money(subtotal() + deliveryPrice(deliveryMethod))}`;
}

function renderCheckout() {
  document.title = 'Оформление заказа | Шов';
  if (!cart.length) {
    app.innerHTML = `<section class="empty-page"><h1 id="page-title" tabindex="-1">Корзина пуста</h1><p>Добавьте товары из каталога, чтобы оформить заказ.</p><a class="button" href="#/">Перейти в каталог</a></section>`;
    return;
  }
  const deliveryOptions = Object.entries(DELIVERY).map(([key, option]) => `
    <label class="choice"><input type="radio" name="delivery" value="${key}"${key === deliveryMethod ? ' checked' : ''}>
      <span><strong>${option.label}</strong><small>${option.note}</small></span>
      <span class="choice-price" data-delivery-price="${key}">${deliveryPrice(key) ? money(deliveryPrice(key)) : 'Бесплатно'}</span>
    </label>`).join('');
  app.innerHTML = `
    <div class="checkout">
      <a class="text-link" href="#/">Вернуться в каталог</a>
      <h1 id="page-title" tabindex="-1">Оформление заказа</h1>
      <div class="checkout-grid">
        <form class="checkout-form" novalidate>
          <fieldset class="block">
            <legend>Получатель</legend>
            ${field('name', 'Имя и фамилия', 'text', 'autocomplete="name" maxlength="80"')}
            ${field('phone', 'Телефон', 'tel', 'autocomplete="tel" inputmode="tel" placeholder="+7 (900) 000-00-00" maxlength="18"')}
            ${field('email', 'Почта для чека <span class="optional">необязательно</span>', 'email', 'autocomplete="email" maxlength="120" spellcheck="false"')}
          </fieldset>
          <fieldset class="block">
            <legend>Доставка</legend>
            <div class="choices">${deliveryOptions}</div>
            <div data-delivery-extra></div>
          </fieldset>
          <fieldset class="block">
            <legend>Оплата картой</legend>
            <div class="demo-note">
              <p>Оплата тестовая: деньги не списываются, данные карты никуда не отправляются. Не вводите настоящую карту.</p>
              <p>Успешная оплата: ${TEST_CARD}. Отказ банка: 4000 0000 0000 0002.</p>
              <button class="text-button" type="button" data-fill-card>Подставить тестовую карту</button>
            </div>
            ${field('card', 'Номер карты', 'text', 'autocomplete="off" inputmode="numeric" placeholder="0000 0000 0000 0000" maxlength="23" spellcheck="false"')}
            <div class="field-pair">
              ${field('expiry', 'Срок действия', 'text', 'autocomplete="off" inputmode="numeric" placeholder="ММ/ГГ" maxlength="5"')}
              ${field('cvc', 'CVC', 'password', 'autocomplete="off" inputmode="numeric" placeholder="000" maxlength="3"')}
            </div>
          </fieldset>
          <p class="form-error" data-form-error role="alert" hidden></p>
          <button class="button button-wide" type="submit" data-pay>Оплатить ${money(subtotal() + deliveryPrice(deliveryMethod))}</button>
        </form>
        <aside class="summary" aria-labelledby="summary-title">
          <h2 id="summary-title">Ваш заказ</h2>
          <div data-summary>${summaryHtml()}</div>
        </aside>
      </div>
    </div>`;
  const form = $('.checkout-form', app);
  renderDeliveryExtra(form);
  form.addEventListener('input', event => {
    const input = event.target;
    if (input.name === 'phone') input.value = formatPhone(input.value);
    if (input.name === 'card') input.value = input.value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
    if (input.name === 'expiry') {
      const digits = input.value.replace(/\D/g, '').slice(0, 4);
      input.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    }
    if (input.name === 'cvc') input.value = input.value.replace(/\D/g, '').slice(0, 3);
    if (input.name) setFieldError(form, input.name, '');
  });
  form.addEventListener('change', event => {
    if (event.target.name !== 'delivery') return;
    deliveryMethod = event.target.value in DELIVERY ? event.target.value : 'courier';
    renderDeliveryExtra(form);
    refreshCheckoutSummary();
  });
  $('[data-fill-card]', form).addEventListener('click', () => {
    form.elements.card.value = TEST_CARD;
    const now = new Date();
    form.elements.expiry.value = `12/${String((now.getFullYear() + 2) % 100).padStart(2, '0')}`;
    form.elements.cvc.value = '123';
    ['card', 'expiry', 'cvc'].forEach(name => setFieldError(form, name, ''));
  });
  form.addEventListener('submit', event => { event.preventDefault(); pay(form); });
}

function field(name, label, type, attributes) {
  return `<div class="field">
    <label for="f-${name}">${label}</label>
    <input id="f-${name}" name="${name}" type="${type}" ${attributes} aria-describedby="f-${name}-error">
    <p class="field-error" id="f-${name}-error" data-error="${name}"></p>
  </div>`;
}

function renderDeliveryExtra(form) {
  const extra = $('[data-delivery-extra]', form);
  const previous = form.elements.address?.value ?? '';
  if (deliveryMethod === 'courier') extra.innerHTML = field('address', 'Адрес доставки', 'text', 'autocomplete="street-address" maxlength="200" placeholder="Город, улица, дом, квартира…"');
  else if (deliveryMethod === 'point') extra.innerHTML = `<div class="field"><label for="f-point">Пункт выдачи</label><select id="f-point" name="point">${PICKUP_POINTS.map(point => `<option>${point}</option>`).join('')}</select></div>`;
  else extra.innerHTML = `<p class="pickup-note">Шоурум: ул. Прядильная, 12. Заказ будет готов завтра после 12:00, примерка на месте.</p>`;
  if (form.elements.address) form.elements.address.value = previous;
}

function setFieldError(form, name, message) {
  const error = $(`[data-error="${name}"]`, form);
  if (error) error.textContent = message;
  const control = form.elements.namedItem(name);
  if (control instanceof HTMLElement) {
    if (message) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
  }
}

function validateCheckout(form) {
  const values = Object.fromEntries(new FormData(form));
  const errors = {};
  if (String(values.name || '').trim().length < 2) errors.name = 'Укажите имя получателя.';
  if (String(values.phone || '').replace(/\D/g, '').length !== 11) errors.phone = 'Введите номер полностью: +7 и 10 цифр.';
  const email = String(values.email || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Проверьте адрес почты, например name@mail.ru.';
  if (deliveryMethod === 'courier' && String(values.address || '').trim().length < 6) errors.address = 'Укажите город, улицу и дом.';
  const card = String(values.card || '').replace(/\D/g, '');
  if (card.length < 13 || !luhn(card)) errors.card = 'Номер карты введён с ошибкой. Для теста используйте 4242 4242 4242 4242.';
  const [month, year] = String(values.expiry || '').split('/').map(Number);
  const now = new Date();
  const expiryValid = month >= 1 && month <= 12 && Number.isInteger(year) && (2000 + year > now.getFullYear() || (2000 + year === now.getFullYear() && month >= now.getMonth() + 1));
  if (!expiryValid) errors.expiry = 'Укажите срок в формате ММ/ГГ, не раньше текущего месяца.';
  if (!/^\d{3}$/.test(String(values.cvc || ''))) errors.cvc = 'Три цифры с обратной стороны карты.';
  return { errors, values, card };
}

async function pay(form) {
  if (isPaying()) return;
  const formError = $('[data-form-error]', form);
  formError.hidden = true;
  const { errors, values, card } = validateCheckout(form);
  ['name', 'phone', 'email', 'address', 'card', 'expiry', 'cvc'].forEach(name => setFieldError(form, name, errors[name] || ''));
  const first = Object.keys(errors)[0];
  if (first) { form.elements.namedItem(first)?.focus(); return; }
  if (!cart.length) { route(); return; }

  // Состав и сумма фиксируются в момент нажатия: если корзина изменится во время оплаты, заказ не создаётся.
  const signature = cartSignature();
  const total = subtotal() + deliveryPrice(deliveryMethod);
  const button = $('[data-pay]', form);
  paying = form;
  $$('fieldset, [data-pay]', form).forEach(node => { node.disabled = true; });
  form.setAttribute('aria-busy', 'true');
  button.textContent = 'Проводим оплату…';
  await new Promise(resolve => setTimeout(resolve, reducedMotion.matches ? 600 : 1600));

  const unlock = message => {
    paying = null;
    form.removeAttribute('aria-busy');
    $$('fieldset, [data-pay]', form).forEach(node => { node.disabled = false; });
    refreshCheckoutSummary();
    formError.textContent = message;
    formError.hidden = false;
  };
  if (!form.isConnected) { if (paying === form) paying = null; refreshCheckoutSummary(); return; }
  if (cartSignature() !== signature || !cart.length) { unlock('Корзина изменилась во время оплаты. Проверьте заказ и нажмите «Оплатить» ещё раз.'); return; }
  if (card === DECLINE_CARD) { unlock('Банк отклонил оплату. Это тестовый отказ: попробуйте карту 4242 4242 4242 4242.'); setFieldError(form, 'card', 'Оплата отклонена.'); return; }

  const random = crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000;
  const order = {
    number: `Ш-${random}`,
    name: String(values.name).trim(),
    delivery: DELIVERY[deliveryMethod].label,
    lines: cart.map(line => ({ ...line })),
    total,
    last4: card.slice(-4),
  };
  try { sessionStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch { /* Экран заказа покажется и без хранилища. */ }
  lastOrder = order;
  cart = [];
  saveCart();
  paying = null;
  location.hash = '#/done';
}

let lastOrder = null;

function renderDone() {
  let order = lastOrder;
  if (!order) { try { order = JSON.parse(sessionStorage.getItem(ORDER_KEY) || 'null'); } catch { order = null; } }
  if (!order?.number || !Array.isArray(order.lines)) { location.replace('#/'); return; }
  document.title = `Заказ ${order.number} оплачен | Шов`;
  app.innerHTML = `
    <section class="done">
      <p class="done-number">${escapeHtml(order.number)}</p>
      <div class="seam" aria-hidden="true"></div>
      <h1 id="page-title" tabindex="-1">Заказ оплачен</h1>
      <p class="done-lead">${escapeHtml(order.name || 'Покупатель')}, спасибо. Тестовая оплата ${money(Number(order.total) || 0)} прошла по карте •••• ${escapeHtml(String(order.last4 || '').slice(-4))}. Настоящих списаний нет.</p>
      <ul class="summary-lines">${sanitizeCart(order.lines).map(line => {
        const product = byId.get(line.id);
        return `<li><span>${product.name}<small>Размер ${escapeHtml(line.size)}, ${Number(line.qty) || 0} шт.</small></span><span>${money(product.price * (Number(line.qty) || 0))}</span></li>`;
      }).join('')}</ul>
      <p class="done-delivery">Способ получения: ${escapeHtml(order.delivery || 'не указан')}</p>
      <a class="button" href="#/">Вернуться в каталог</a>
    </section>`;
}

/* Маршрутизация по hash: работает на статическом хостинге без настройки сервера. */
let firstRender = true;

function route() {
  const [, view = '', param = ''] = location.hash.replace(/^#/, '').split('/');
  if (bag.open) bag.close();
  if (view === 'p' && byId.has(param)) renderProduct(byId.get(param));
  else if (view === 'c' && param in CATEGORIES) renderCatalog(param);
  else if (view === 'checkout') renderCheckout();
  else if (view === 'done') renderDone();
  else renderCatalog('');
  $$('[data-nav="catalog"]').forEach(link => {
    if (view === '' || view === 'c') link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (!firstRender) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('#page-title', app)?.focus({ preventScroll: true });
  }
  firstRender = false;
}

window.addEventListener('hashchange', route);
window.addEventListener('storage', event => {
  // key === null приходит при localStorage.clear() в другой вкладке.
  if (event.key !== CART_KEY && event.key !== null) return;
  cart = loadCart();
  updateBagCount();
  if (bag.open) renderBag();
  refreshCheckoutSummary();
});

/* Тема. */
const themeButton = $('[data-theme-toggle]');
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const isDark = () => (document.documentElement.dataset.theme ?? (systemDark.matches ? 'dark' : 'light')) === 'dark';
function syncThemeButton() { themeButton.setAttribute('aria-label', isDark() ? 'Включить светлую тему' : 'Включить тёмную тему'); }
themeButton.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('shov-theme', next); } catch { /* Тема работает до перезагрузки. */ }
  syncThemeButton();
});
systemDark.addEventListener('change', syncThemeButton);

syncThemeButton();
updateBagCount();
route();
