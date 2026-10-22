const root = document.documentElement;
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const themeButtons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');

function updateThemeControls() {
  const dark = root.dataset['theme'] === 'dark';
  themeButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', (dark ? button.dataset['lightAria'] : button.dataset['darkAria']) ?? '');
    const label = button.querySelector('[data-theme-label]');
    if (label) label.textContent = (dark ? button.dataset['lightLabel'] : button.dataset['darkLabel']) ?? '';
  });
}

function applyTheme(theme: string) {
  root.dataset['theme'] = theme;
  updateThemeControls();
}

function toggleTheme() {
  const next = root.dataset['theme'] === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('akhan-theme', next); } catch { /* Тема работает и без хранилища. */ }
}

themeButtons.forEach(button => {
  button.hidden = false;
  button.addEventListener('click', toggleTheme);
});
updateThemeControls();
requestAnimationFrame(() => root.classList.add('theme-ready'));
systemTheme.addEventListener('change', event => {
  let stored: string | null = null;
  try { stored = localStorage.getItem('akhan-theme'); } catch { /* Системная тема остаётся доступной. */ }
  if (stored !== 'light' && stored !== 'dark') applyTheme(event.matches ? 'dark' : 'light');
});
window.addEventListener('storage', event => {
  if (event.key !== 'akhan-theme') return;
  applyTheme(event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : systemTheme.matches ? 'dark' : 'light');
});

const dialog = document.querySelector<HTMLDialogElement>('#command-palette');
const search = document.querySelector<HTMLInputElement>('#command-search');
const empty = document.querySelector<HTMLElement>('.command-empty');
const commandItems = Array.from(document.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>('[data-command-item]'));
let previousFocus: HTMLElement | null = null;

function filterCommands() {
  const query = search?.value.trim().toLocaleLowerCase('ru') ?? '';
  let count = 0;
  commandItems.forEach(item => {
    const visible = item.textContent?.toLocaleLowerCase('ru').includes(query) ?? false;
    if (item.parentElement) item.parentElement.hidden = !visible;
    if (visible) count += 1;
  });
  if (empty) empty.hidden = count > 0;
}

function openCommands() {
  if (!dialog || !search || dialog.open) return;
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  search.value = '';
  filterCommands();
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  search.focus();
}

document.querySelectorAll<HTMLButtonElement>('[data-command-open]').forEach(button => {
  if (!dialog || typeof dialog.showModal !== 'function') return;
  button.hidden = false;
  const shortcut = button.querySelector('kbd');
  if (shortcut) shortcut.textContent = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K';
  button.addEventListener('click', openCommands);
});
document.querySelector('[data-command-close]')?.addEventListener('click', () => dialog?.close());
document.querySelector('[data-command-theme]')?.addEventListener('click', toggleTheme);
search?.addEventListener('input', filterCommands);
commandItems.forEach(item => item.addEventListener('click', () => {
  dialog?.close();
  if (item instanceof HTMLAnchorElement && item.hash) {
    const target = document.getElementById(item.hash.slice(1));
    if (target) {
      target.setAttribute('tabindex', '-1');
      requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
  }
}));
dialog?.addEventListener('close', () => {
  document.body.style.overflow = '';
  previousFocus?.focus({ preventScroll: true });
});
dialog?.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
dialog?.addEventListener('keydown', event => {
  const visible = commandItems.filter(item => !item.parentElement?.hidden);
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (visible.length === 0) return;
    const index = visible.findIndex(item => item === document.activeElement);
    const next = index < 0 ? (event.key === 'ArrowDown' ? 0 : visible.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length;
    visible[next]?.focus();
  }
  if (event.key === 'Enter' && document.activeElement === search) {
    event.preventDefault();
    visible[0]?.click();
  }
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.code === 'KeyK' && !event.altKey) {
    event.preventDefault();
    if (dialog?.open) dialog.close(); else openCommands();
  }
});

if ('IntersectionObserver' in window) {
  const sections = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal-visible');
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  sections.forEach(section => {
    if (!reducedMotion.matches) {
      reveal.observe(section);
    }
  });
}

// Активен последний раздел, верхний край которого уже поднялся выше линии чтения.
const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
const navSections = navLinks.flatMap(link => {
  const section = document.getElementById(link.hash.slice(1));
  return section ? [section] : [];
});
let activeNavigationId = '';
let lockedNavigationId = '';
let unlockTimer = 0;
let navigationQueued = false;

function markNavigation(id: string) {
  if (id === activeNavigationId) return;
  activeNavigationId = id;
  navLinks.forEach(link => {
    if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function updateNavigation() {
  navigationQueued = false;
  if (lockedNavigationId || navSections.length === 0) return;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  const line = window.innerHeight * .35;
  let current = atBottom ? navSections[navSections.length - 1]!.id : '';
  if (!atBottom) navSections.forEach(section => { if (section.getBoundingClientRect().top <= line) current = section.id; });
  markNavigation(current);
}

function queueNavigation() {
  if (navigationQueued) return;
  navigationQueued = true;
  requestAnimationFrame(updateNavigation);
}

// После клика подсветка держится на выбранном пункте, пока идёт плавная прокрутка.
function releaseNavigation(delay: number) {
  window.clearTimeout(unlockTimer);
  unlockTimer = window.setTimeout(() => { lockedNavigationId = ''; updateNavigation(); }, delay);
}

navLinks.forEach(link => link.addEventListener('click', () => {
  lockedNavigationId = link.hash.slice(1);
  markNavigation(lockedNavigationId);
  releaseNavigation(700);
}));
window.addEventListener('scroll', () => {
  if (lockedNavigationId) releaseNavigation(140);
  else queueNavigation();
}, { passive: true });
window.addEventListener('resize', queueNavigation, { passive: true });
updateNavigation();

// Размеры считаются только при загрузке и изменении ширины. Прокрутка выполняется CSS-transform.
document.querySelectorAll<HTMLAnchorElement>('[data-project-preview]').forEach(preview => {
  const viewport = preview.querySelector<HTMLElement>('[data-preview-window]');
  const image = preview.querySelector<HTMLImageElement>('[data-preview-image]');
  if (!viewport || !image) return;
  const measure = () => {
    const travel = Math.max(0, image.getBoundingClientRect().height - viewport.clientHeight);
    preview.style.setProperty('--preview-travel', `${-travel}px`);
    preview.style.setProperty('--preview-duration', `${Math.min(12, Math.max(3, travel / 150))}s`);
  };
  image.addEventListener('load', measure);
  if (image.complete) measure();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(image);
  }
});
document.querySelectorAll<HTMLButtonElement>('[data-preview-toggle]').forEach(button => {
  const preview = document.getElementById(button.dataset['previewTarget'] ?? '')?.querySelector('[data-project-preview]');
  if (!preview) return;
  button.hidden = false;
  button.addEventListener('click', () => {
    const active = preview.classList.toggle('is-scrolling');
    button.setAttribute('aria-pressed', String(active));
    button.textContent = (active ? button.dataset['resetLabel'] : button.dataset['scrollLabel']) ?? '';
  });
});
