'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const photos = [...document.querySelectorAll('.work-card')];
filterButtons.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filterButtons.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('is-active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  photos.forEach(photo => { photo.hidden = category !== 'all' && photo.dataset.category !== category; });
}));

const photoDialog = document.querySelector('#photo-dialog');
const dialogImage = document.querySelector('#dialog-image');
const photoTitle = document.querySelector('#photo-title');
let savedOverflow = '';
function openPhoto(photo) {
  dialogImage.src = photo.dataset.photo;
  dialogImage.alt = photo.querySelector('img').alt;
  photoTitle.textContent = photo.dataset.title;
  savedOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  photoDialog.showModal();
}
photos.forEach(photo => photo.addEventListener('click', () => openPhoto(photo)));
document.querySelector('.dialog-close').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', event => {
  if (event.target !== photoDialog) return;
  const rect = photoDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) photoDialog.close();
});
photoDialog.addEventListener('close', () => { document.body.style.overflow = savedOverflow; });

document.querySelector('#year').textContent = new Date().getFullYear();
