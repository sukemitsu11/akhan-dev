// Демо-контакты не ведут к реальным компаниям.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  const url = new URL(link.href, location.href);
  if (url.hostname === 'example.com' || ['tel:','sms:','mailto:'].includes(url.protocol)) {
    event.preventDefault();
    let message = document.querySelector('.akhan-demo-toast');
    if (!message) {
      message = document.createElement('p');
      message.className = 'akhan-demo-toast';
      message.setAttribute('role','status');
      document.body.append(message);
    }
    message.textContent = 'Это концепт-сайт. Контакты вымышлены, сообщения не отправляются.';
    clearTimeout(window.akhanDemoToastTimer);
    window.akhanDemoToastTimer = setTimeout(() => message.remove(), 4000);
  }
});
