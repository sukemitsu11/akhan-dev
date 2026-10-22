const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const form = $('#request-form');
const menuButton = $('.menu-toggle');
const menu = $('#mobile-nav');
let lastDialogTrigger;
let selectedProject = 'kitchen';

const categories = {
  kitchen: { image: 'kitchen-concept.webp', caption: 'Кухня с характером', alt: 'Концепция кухни с ореховыми фасадами и каменным островом' },
  closet: { image: 'wardrobe-concept.webp', caption: 'Хранение по вашим размерам', alt: 'Концепция шкафа: ореховые двери и продуманное наполнение' },
  wardrobe: { image: 'wardrobe-concept.webp', caption: 'Каждая деталь на своём месте', alt: 'Концепция гардеробной с открытыми секциями и скамьёй' },
  hallway: { image: 'hallway-concept.webp', caption: 'Дом начинается с прихожей', alt: 'Концепция прихожей: ореховый шкаф, открытая ниша, зеркало и мягкая скамья' },
};
const projects = {
  kitchen: { title: 'Орех и камень', image: 'kitchen-concept.webp', type: 'Кухня', description: 'Тёплая фактура дерева, спокойные плоскости и остров, вокруг которого собирается вся семья. Пример сочетания материалов для вашего проекта.' },
  wardrobe: { title: 'Порядок в деталях', image: 'wardrobe-concept.webp', type: 'Гардеробная', description: 'Закрытые фасады и открытые секции в одной системе. Пример, который поможет обсудить наполнение и организацию хранения.' },
  materials: { title: 'Фактуры, которые хочется трогать', image: 'materials-concept.webp', type: null, description: 'Дерево, матовые поверхности и камень. Визуальная палитра для обсуждения, не каталог доступных материалов.' },
};

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menu.hidden = true;
}
menuButton.addEventListener('click', () => {
  const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isExpanded));
  menu.hidden = isExpanded;
});
menu.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); }
});
document.addEventListener('click', (event) => {
  if (!menu.hidden && !event.target.closest('.header')) closeMenu();
});
const desktopBreakpoint = matchMedia('(min-width: 768px)');
desktopBreakpoint.addEventListener('change', (event) => { if (event.matches) closeMenu(); });

function selectFurniture(type, wantsMeasurement = false) {
  if (type) {
    const radio = $$('input[name="furniture"]').find((input) => input.value === type);
    if (radio) radio.checked = true;
  }
  if (wantsMeasurement) form.elements.measurement.checked = true;
  location.hash = 'calculate';
  $('#calculate').scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth' });
  const firstRadio = form.querySelector('input[name="furniture"]:checked');
  firstRadio.focus({ preventScroll: true });
}

$$('[data-select]').forEach((button) => button.addEventListener('click', () => selectFurniture(button.dataset.select)));
$$('[data-purpose]').forEach((link) => link.addEventListener('click', () => { form.elements.measurement.checked = true; }));

$$('[data-category]').forEach((button) => button.addEventListener('click', () => {
  const category = categories[button.dataset.category];
  $$('[data-category]').forEach((other) => {
    const isActive = other === button;
    other.setAttribute('aria-expanded', String(isActive));
    other.closest('.furniture-item').classList.toggle('is-active', isActive);
    document.getElementById(other.getAttribute('aria-controls')).hidden = !isActive;
    other.querySelector('span').textContent = isActive ? '−' : '+';
  });
  $('#category-image').src = `assets/${category.image}`;
  $('#category-image').alt = category.alt;
  $('#category-caption').textContent = category.caption;
}));

$$('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  $$('[data-filter]').forEach((other) => {
    other.classList.toggle('is-active', other === button);
    other.setAttribute('aria-pressed', String(other === button));
  });
  let count = 0;
  $$('.project').forEach((project) => {
    project.hidden = filter !== 'all' && project.dataset.group !== filter;
    if (!project.hidden) { count++; project.classList.add('is-visible'); }
  });
  $('#project-grid').classList.toggle('is-filtered', filter !== 'all');
  $('#filter-status').textContent = `Показано примеров: ${count}.`;
}));

function openDialog(dialog, trigger) {
  lastDialogTrigger = trigger;
  dialog.showModal();
  dialog.scrollTop = 0;
}
$$('dialog').forEach((dialog) => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (dialog.dataset.restoreFocus !== 'false') lastDialogTrigger?.focus({ preventScroll: true });
    delete dialog.dataset.restoreFocus;
  });
});
$$('[data-project]').forEach((button) => button.addEventListener('click', () => {
  selectedProject = button.dataset.project;
  const project = projects[selectedProject];
  $('#project-dialog-title').textContent = project.title;
  $('#project-dialog-description').textContent = project.description;
  $('#dialog-image').src = `assets/${project.image}`;
  $('#dialog-image').alt = `Интерьерная концепция: ${project.title}`;
  openDialog($('#project-dialog'), button);
}));
$('#similar-project').addEventListener('click', () => {
  const project = projects[selectedProject];
  $('#project-dialog').dataset.restoreFocus = 'false';
  $('#project-dialog').close();
  form.elements.wishes.value = `Мне понравилась концепция «${project.title}». Хочу обсудить похожее решение.`;
  selectFurniture(project.type);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const lines = [
    'Здравствуйте, Грань!',
    `Хочу обсудить мебель на заказ: ${data.get('furniture')}.`,
  ];
  if (data.get('width')) lines.push(`Примерная ширина: ${data.get('width')} см.`);
  lines.push(`Фасады: ${data.get('material')}.`);
  if (data.get('measurement')) lines.push('Хочу записаться на бесплатный замер.');
  const wishes = String(data.get('wishes') || '').trim();
  if (wishes) lines.push(`Пожелания: ${wishes}`);
  lines.push('Подскажите, пожалуйста, дальнейшие шаги и ориентировочную стоимость.');
  const message = lines.join('\n');
  $('#request-text').value = message;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  $('#sms-request').href = `sms:+7 (000) 000-00-00${isIOS ? '&' : '?'}body=${encodeURIComponent(message)}`;
  $('#copy-status').textContent = '';
  $('#copy-request').firstChild.textContent = 'Скопировать запрос ';
  openDialog($('#request-dialog'), event.submitter);
});

$('#copy-request').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('#request-text').value);
    $('#copy-status').textContent = 'Текст скопирован. Теперь его можно отправить удобным способом.';
    $('#copy-request').firstChild.textContent = 'Скопировано ';
  } catch {
    $('#request-text').focus();
    $('#request-text').select();
    $('#copy-status').textContent = 'Выделили текст. Скопируйте его вручную через меню устройства или Ctrl+C.';
  }
});

$('#year').textContent = String(new Date().getFullYear());

if ('IntersectionObserver' in window && !motionPreference.matches) {
  const reveals = $$('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: .07 });
  reveals.forEach((element) => { element.classList.add('will-reveal'); observer.observe(element); });
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) { observer.disconnect(); reveals.forEach((element) => element.classList.add('is-visible')); }
  });
}
