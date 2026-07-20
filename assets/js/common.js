
const ESCAPE_MAP = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
window.escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ESCAPE_MAP[ch]);

window.brandSlug = brand =>
  String(brand || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

window.brandInitials = brand => {
  const words = String(brand || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  return words.length > 1 ? words.slice(0, 2).map(w => w[0]).join('') : words[0].slice(0, 2);
};

// Иконка бренда: /assets/brands/<slug>.svg. Чтобы поставить официальный логотип,
// достаточно заменить файл с тем же именем — код менять не нужно.
window.brandIconHtml = (brand, modifier = '') => {
  const slug = window.brandSlug(brand);
  const classes = `brand-icon${modifier ? ' ' + modifier : ''}`;
  return `<img class="${classes}" src="/assets/brands/${slug}.svg" alt="" loading="lazy"
    data-initials="${escapeHtml(window.brandInitials(brand))}">`;
};

// Если файла нет, подменяем картинку монограммой. Обработчик вешаем скриптом,
// а не инлайновым onerror — инлайн заблокировал бы CSP.
window.installBrandIcons = container => {
  container.querySelectorAll('img.brand-icon').forEach(img => {
    img.addEventListener('error', () => {
      const fallback = document.createElement('span');
      fallback.className = img.className + ' brand-icon-fallback';
      fallback.textContent = img.dataset.initials || '?';
      fallback.setAttribute('aria-hidden', 'true');
      img.replaceWith(fallback);
    }, {once: true});
  });
};

window.PRODUCT_STATUS_PUBLISHED = 'Опубликован';
window.isPublished = item => Boolean(item) && item.status === window.PRODUCT_STATUS_PUBLISHED;

window.loadProducts = async () => {
  const response = await fetch('/data/products.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const products = await response.json();
  if (!Array.isArray(products)) throw new Error('Некорректный формат products.json');
  return products.filter(window.isPublished);
};

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.menu-button');
  const menu = document.querySelector('.main-menu');
  if (!button || !menu) return;

  const setOpen = open => {
    menu.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
  };

  button.addEventListener('click', event => {
    event.stopPropagation();
    setOpen(!menu.classList.contains('open'));
  });

  document.addEventListener('click', event => {
    if (menu.classList.contains('open') && !menu.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      setOpen(false);
      button.focus();
    }
  });
});
