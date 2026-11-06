import { ASSETS } from './common.js';

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Овощи на фоне. x, y, size в процентах от блока, size ограничен сверху размером экрана.
   d: на сколько пикселей овощ смещается при прокрутке, чем больше, тем ближе он кажется.
   spin: поворот при прокрутке. wide: только на широком экране. */
const SCENES = {
  hero: [
    { v: 'tomato', x: 49, y: 9, size: 11, d: 70, spin: 70, fx: -34, fy: -40 },
    { v: 'broccoli', x: 50, y: 66, size: 15, d: 150, spin: -30, fx: -40, fy: 50 },
    { v: 'cucumber', x: 88, y: 3, size: 11, d: 120, spin: 90, fx: 30, fy: -50 },
    { v: 'radish', x: 90, y: 80, size: 12, d: 70, spin: -60, fx: 30, fy: 40 },
    { v: 'carrot', x: 40, y: 88, size: 7, d: 60, spin: 120, fx: -10, fy: 60, wide: true },
    { v: 'onion', x: 3, y: 90, size: 8, d: 100, spin: -90, fx: -30, fy: 50, wide: true },
  ],
  rule: [
    { v: 'beet', x: 90, y: 8, size: 11, d: 110, spin: 24 },
    { v: 'lemon', x: -3, y: 78, size: 11, d: 70, spin: 80, wide: true },
  ],
  line: [
    { v: 'cucumber', x: 84, y: 5, size: 13, d: 90, spin: 100 },
    { v: 'carrot', x: 75, y: 8, size: 6, d: 50, spin: -80, wide: true },
    { v: 'radish', x: 87, y: 90, size: 12, d: 24, spin: -70, wide: true },
    { v: 'tomato', x: 58, y: 92, size: 8, d: 18, spin: 60, wide: true },
  ],
  menu: [
    { v: 'broccoli', x: 84, y: -2, size: 13, d: 90, spin: 16 },
    { v: 'onion', x: 72, y: 5, size: 6, d: 40, spin: -90, wide: true },
  ],
  quotes: [
    { v: 'lemon', x: 86, y: 5, size: 13, d: 100, spin: 90 },
    { v: 'beet', x: 70, y: 2, size: 7, d: 50, spin: -18, wide: true },
  ],
  title: [
    { v: 'tomato', x: 84, y: 16, size: 13, d: 60, spin: 80 },
    { v: 'broccoli', x: 72, y: 46, size: 12, d: 90, spin: -24, wide: true },
    { v: 'cucumber', x: 92, y: 66, size: 9, d: 50, spin: 110, wide: true },
  ],
};

function plantVeg() {
  document.querySelectorAll('[data-veg]').forEach((host) => {
    const scene = SCENES[host.dataset.veg] || [];
    host.classList.add('has-veg');
    const layer = document.createElement('div');
    layer.className = 'veg-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = scene.map((item, i) => `
      <span class="veg ${item.wide ? 'veg-wide' : ''}" data-depth="${item.d}" style="left:${item.x}%;top:${item.y}%;--size:${item.size};--d:${item.d};--spin:${item.spin}deg;--fx:${item.fx || 0}vmin;--fy:${item.fy || 0}vmin;--i:${i}">
        <span class="veg-m"><img src="${ASSETS}veg-${item.v}.webp" width="340" height="340" alt="" decoding="async"></span>
      </span>`).join('');
    host.prepend(layer);
  });
}

/* Появление блоков при прокрутке: один раз, без повторов. */
function revealOnScroll() {
  const targets = document.querySelectorAll('.band h2, .lead, .rule-list li, .half, .dish, .quotes li, .tiers li, .steps li, .split-title, .ctrl, .nums');
  if (still || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  targets.forEach((el) => {
    const siblings = el.parentElement ? [...el.parentElement.children] : [];
    el.style.setProperty('--n', String(Math.min(siblings.indexOf(el), 5)));
    el.classList.add('reveal');
    io.observe(el);
  });
}

/* На первом экране овощи чуть следуют за курсором: только мышь, не палец. */
function pointerParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || still || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const items = [...hero.querySelectorAll('.veg')].map((el) => ({ el: el.querySelector('.veg-m'), depth: Number(el.dataset.depth) / 150 }));
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const step = () => {
    x += (tx - x) * .08;
    y += (ty - y) * .08;
    items.forEach(({ el, depth }) => { el.style.transform = `translate(${(x * depth).toFixed(1)}px,${(y * depth).toFixed(1)}px)`; });
    raf = Math.abs(tx - x) + Math.abs(ty - y) > .1 ? requestAnimationFrame(step) : 0;
  };
  hero.addEventListener('pointermove', (event) => {
    const r = hero.getBoundingClientRect();
    tx = ((event.clientX - r.left) / r.width - .5) * -36;
    ty = ((event.clientY - r.top) / r.height - .5) * -28;
    if (!raf) raf = requestAnimationFrame(step);
  });
  hero.addEventListener('pointerleave', () => {
    tx = 0;
    ty = 0;
    if (!raf) raf = requestAnimationFrame(step);
  });
}

/* Кружок томата катится по линии России от кухни до города. */
export function rollRoute(host, fromPercent, toPercent) {
  const pin = host.querySelector('.pin');
  const route = host.querySelector('.route');
  const label = host.querySelector('.pin-label');
  if (still || !pin || !route || !pin.animate) return;
  const width = host.querySelector('.line-track').getBoundingClientRect().width;
  const distance = ((fromPercent - toPercent) / 100) * width;
  const turns = (Math.abs(distance) / (Math.PI * pin.offsetWidth)) * 360 * (distance < 0 ? 1 : -1);
  const duration = Math.min(1500, 500 + Math.abs(distance) * 1.8);
  const easing = 'cubic-bezier(.22,.9,.3,1)';
  pin.animate([{ transform: `translateX(${distance}px)` }, { transform: 'translateX(0)' }], { duration, easing });
  pin.querySelector('img').animate([{ transform: `rotate(${-turns}deg)` }, { transform: 'rotate(0deg)' }], { duration, easing });
  route.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration, easing });
  if (label) label.animate([{ opacity: 0 }, { opacity: 0, offset: .55 }, { opacity: 1 }], { duration: duration + 120, easing: 'linear' });
}

/* Плавный пересчёт числа. Короткий: это отклик на действие, а не шоу. */
export function countTo(el, to, format) {
  if (still) {
    el.textContent = format(to);
    el.dataset.value = String(to);
    return;
  }
  const from = Number(el.dataset.value);
  el.dataset.value = String(to);
  if (!Number.isFinite(from) || from === to) {
    el.textContent = format(to);
    return;
  }
  cancelAnimationFrame(Number(el.dataset.raf));
  const started = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - started) / 320);
    el.textContent = format(from + (to - from) * (1 - (1 - t) ** 3));
    if (t < 1) el.dataset.raf = String(requestAnimationFrame(tick));
  };
  el.dataset.raf = String(requestAnimationFrame(tick));
}

plantVeg();
document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
  pointerParallax();
});
