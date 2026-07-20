
document.addEventListener('DOMContentLoaded', async () => {
  const search = document.getElementById('catalog-search');
  const category = document.getElementById('catalog-category');
  const group = document.getElementById('catalog-group');
  const brand = document.getElementById('catalog-brand');
  const sort = document.getElementById('catalog-sort');
  const reset = document.getElementById('catalog-reset');
  const count = document.getElementById('catalog-count');
  const productsBox = document.getElementById('catalog-products');

  let products = [];

  const fillSelect = (select, values) => {
    values.sort((a,b)=>a.localeCompare(b,'ru')).forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  };

  const draw = () => {
    const query = search.value.trim().toLowerCase();
    let filtered = products.filter(item => {
      const haystack = [item.brand,item.model,item.category,item.group,item.purpose,item.description].join(' ').toLowerCase();
      return (!query || haystack.includes(query))
        && (!category.value || item.category === category.value)
        && (!group.value || item.group === group.value)
        && (!brand.value || item.brand === brand.value);
    });

    filtered.sort((a,b)=>(a[sort.value] || '').localeCompare(b[sort.value] || '','ru'));
    count.textContent = `Найдено моделей: ${filtered.length}`;

    productsBox.innerHTML = filtered.length ? filtered.map(item => `
      <a class="product-card" href="/product/?id=${encodeURIComponent(item.id)}">
        <div class="meta">${item.brand || ''}</div>
        <h3>${item.model || ''}</h3>
        <p>${item.group || item.category || ''}</p>
        <div class="tags">
          ${item.country ? `<span class="tag">${item.country}</span>` : ''}
          ${item.purpose ? `<span class="tag">${item.purpose}</span>` : ''}
        </div>
      </a>`).join('') : '<div class="loading-card">По заданным условиям ничего не найдено.</div>';
  };

  try {
    const response = await fetch('/data/products.json', {cache:'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    products = await response.json();

    fillSelect(category, [...new Set(products.map(p=>p.category).filter(Boolean))]);
    fillSelect(group, [...new Set(products.map(p=>p.group).filter(Boolean))]);
    fillSelect(brand, [...new Set(products.map(p=>p.brand).filter(Boolean))]);

    const params = new URLSearchParams(location.search);
    category.value = params.get('category') || '';
    brand.value = params.get('brand') || '';

    [search,category,group,brand,sort].forEach(el => el.addEventListener('input', draw));
    reset.addEventListener('click', () => {
      search.value = '';
      category.value = '';
      group.value = '';
      brand.value = '';
      sort.value = 'brand';
      draw();
    });

    draw();
  } catch (error) {
    console.error('Ошибка загрузки каталога:', error);
    count.textContent = 'Ошибка загрузки каталога';
    productsBox.innerHTML = '<div class="loading-card error-card">Не удалось загрузить данные каталога.</div>';
  }
});
