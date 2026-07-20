
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.menu-button');
  const menu = document.querySelector('.main-menu');
  if (!button || !menu) return;
  button.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
});
