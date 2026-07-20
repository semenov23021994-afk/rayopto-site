
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
  const placeholders = new Map([category, group, brand].map(el => [el, el.options[0].textContent]));

  const uniqueSorted = (list, key) =>
    [...new Set(list.map(item => item[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru'));

  const setOptions = (select, values) => {
    const previous = select.value;
    select.innerHTML = '';
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = placeholders.get(select);
    select.appendChild(empty);
    values.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    select.value = values.includes(previous) ? previous : '';
  };

  // Списки групп и производителей сужаются по уже выбранной категории,
  // чтобы нельзя было собрать заведомо пустую комбинацию фильтров.
  const refreshDependentFilters = () => {
    const byCategory = category.value ? products.filter(item => item.category === category.value) : products;
    setOptions(group, uniqueSorted(byCategory, 'group'));
    const byGroup = group.value ? byCategory.filter(item => item.group === group.value) : byCategory;
    setOptions(brand, uniqueSorted(byGroup, 'brand'));
  };

  const draw = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = products.filter(item => {
      const haystack = [item.brand,item.model,item.category,item.group,item.purpose,item.description]
        .filter(Boolean).join(' ').toLowerCase();
      return (!query || haystack.includes(query))
        && (!category.value || item.category === category.value)
        && (!group.value || item.group === group.value)
        && (!brand.value || item.brand === brand.value);
    });

    const key = sort.value;
    filtered.sort((a,b) =>
      (a[key] || '').localeCompare(b[key] || '','ru')
      || (a.brand || '').localeCompare(b.brand || '','ru')
      || (a.model || '').localeCompare(b.model || '','ru'));

    count.textContent = `Найдено моделей: ${filtered.length}`;

    productsBox.innerHTML = filtered.length ? filtered.map(item => `
      <a class="product-card" href="/product/?id=${encodeURIComponent(item.id)}">
        <div class="meta">${brandIconHtml(item.brand, 'brand-icon-sm')}<span>${escapeHtml(item.brand)}</span></div>
        <h3>${escapeHtml(item.model)}</h3>
        <p>${escapeHtml(item.group || item.category)}</p>
        <div class="tags">
          ${item.country ? `<span class="tag">${escapeHtml(item.country)}</span>` : ''}
          ${item.purpose ? `<span class="tag">${escapeHtml(item.purpose)}</span>` : ''}
        </div>
      </a>`).join('') : '<div class="loading-card">По заданным условиям ничего не найдено.</div>';

    installBrandIcons(productsBox);
  };

  try {
    products = await window.loadProducts();

    setOptions(category, uniqueSorted(products, 'category'));

    const params = new URLSearchParams(location.search);
    category.value = params.get('category') || '';
    refreshDependentFilters();
    group.value = params.get('group') || '';
    refreshDependentFilters();
    brand.value = params.get('brand') || '';

    category.addEventListener('change', () => { refreshDependentFilters(); draw(); });
    group.addEventListener('change', () => { refreshDependentFilters(); draw(); });
    brand.addEventListener('change', draw);
    sort.addEventListener('change', draw);
    search.addEventListener('input', draw);

    reset.addEventListener('click', () => {
      search.value = '';
      category.value = '';
      group.value = '';
      refreshDependentFilters();
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
