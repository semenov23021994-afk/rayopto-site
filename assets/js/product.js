
document.addEventListener('DOMContentLoaded', async () => {
  const box = document.getElementById('product-view');
  const id = new URLSearchParams(location.search).get('id');

  try {
    const response = await fetch('/data/products.json', {cache:'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();
    const item = products.find(p => String(p.id) === String(id));

    if (!item) {
      box.innerHTML = '<div class="loading-card error-card">Товар не найден.</div>';
      return;
    }

    document.title = `${item.brand} ${item.model} — RayOpto`;
    const rows = [
      ['Категория',item.category],
      ['Группа',item.group],
      ['Производитель',item.brand],
      ['Модель',item.model],
      ['Страна',item.country],
      ['Назначение',item.purpose],
      ['Совместимость',item.compatibility]
    ].filter(([,value]) => value);

    box.innerHTML = `
      <div class="product-media">${(item.brand || 'R').slice(0,1)}</div>
      <article class="product-info">
        <span class="eyebrow">${item.brand || ''}</span>
        <h1>${item.model || ''}</h1>
        <p>${item.description || 'Описание будет добавлено.'}</p>
        <table class="spec-table">
          ${rows.map(([name,value]) => `<tr><td>${name}</td><td>${value}</td></tr>`).join('')}
        </table>
        ${item.specifications ? `<h3>Технические характеристики</h3><p>${item.specifications}</p>` : ''}
        <div class="actions"><a class="button primary" href="/contacts/">Запросить КП</a></div>
      </article>`;
  } catch (error) {
    console.error('Ошибка загрузки товара:', error);
    box.innerHTML = '<div class="loading-card error-card">Не удалось загрузить карточку товара.</div>';
  }
});
