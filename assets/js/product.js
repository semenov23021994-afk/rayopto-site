
document.addEventListener('DOMContentLoaded', async () => {
  const box = document.getElementById('product-view');
  const id = new URLSearchParams(location.search).get('id');

  const setMeta = (selector, attribute, value) => {
    const node = document.head.querySelector(selector);
    if (node) node.setAttribute(attribute, value);
  };

  try {
    const products = await window.loadProducts();
    const item = products.find(p => String(p.id) === String(id));

    if (!item) {
      box.innerHTML = '<div class="loading-card error-card">Товар не найден.</div>';
      document.title = 'Товар не найден — RayOpto';
      setMeta('meta[name="robots"]', 'content', 'noindex, follow');
      return;
    }

    const title = `${item.brand} ${item.model}`;
    const summary = item.description
      || `${title} — ${item.group || item.category}. Поставка и консультация RayOpto.`;

    document.title = `${title} — RayOpto`;
    setMeta('meta[name="description"]', 'content', summary);
    setMeta('link[rel="canonical"]', 'href', `https://rayopto.ru/product/?id=${encodeURIComponent(item.id)}`);
    setMeta('meta[property="og:title"]', 'content', `${title} — RayOpto`);
    setMeta('meta[property="og:description"]', 'content', summary);

    const rows = [
      ['Категория',item.category],
      ['Группа',item.group],
      ['Производитель',item.brand],
      ['Модель',item.model],
      ['Страна',item.country],
      ['Назначение',item.purpose],
      ['Совместимость',item.compatibility]
    ].filter(([,value]) => value);

    const media = item.image
      ? `<img class="product-media" src="${escapeHtml(item.image)}" alt="${escapeHtml(title)}" loading="lazy">`
      : `<div class="product-media">${escapeHtml((item.brand || 'R').slice(0,1))}</div>`;

    box.innerHTML = `
      ${media}
      <article class="product-info">
        <span class="eyebrow brand-line">${brandIconHtml(item.brand, 'brand-icon-sm')}<span>${escapeHtml(item.brand)}</span></span>
        <h1>${escapeHtml(item.model)}</h1>
        <p>${escapeHtml(item.description || 'Описание будет добавлено.')}</p>
        <table class="spec-table">
          ${rows.map(([name,value]) => `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(value)}</td></tr>`).join('')}
        </table>
        ${item.specifications ? `<h2>Технические характеристики</h2><p>${escapeHtml(item.specifications)}</p>` : ''}
        <div class="actions">
          <a class="button primary" href="/contacts/?product=${encodeURIComponent(item.id)}">Запросить КП</a>
          ${item.pdf ? `<a class="button secondary" href="${escapeHtml(item.pdf)}" target="_blank" rel="noopener">Скачать PDF</a>` : ''}
        </div>
      </article>`;

    installBrandIcons(box);

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      model: item.model,
      category: item.category,
      description: summary,
      brand: {'@type': 'Brand', name: item.brand},
      sku: item.id
    });
    document.head.appendChild(schema);
  } catch (error) {
    console.error('Ошибка загрузки товара:', error);
    box.innerHTML = '<div class="loading-card error-card">Не удалось загрузить карточку товара.</div>';
  }
});
