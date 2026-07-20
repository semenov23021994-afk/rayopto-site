
document.addEventListener('DOMContentLoaded', async () => {
  const box = document.getElementById('brands-grid');
  try {
    const products = await window.loadProducts();
    const map = new Map();

    products.forEach(item => {
      if (!item.brand) return;
      if (!map.has(item.brand)) map.set(item.brand, {count:0,categories:new Set()});
      const value = map.get(item.brand);
      value.count += 1;
      if (item.category) value.categories.add(item.category);
    });

    box.innerHTML = [...map.entries()]
      .sort((a,b)=>a[0].localeCompare(b[0],'ru'))
      .map(([brand,value]) => `
        <a class="brand-card" href="/catalog/?brand=${encodeURIComponent(brand)}">
          ${brandIconHtml(brand, 'brand-icon-lg')}
          <strong>${escapeHtml(brand)}</strong>
          <span>${value.count} моделей</span>
          <span>${escapeHtml([...value.categories].sort((a,b)=>a.localeCompare(b,'ru')).join(', '))}</span>
        </a>`).join('');

    installBrandIcons(box);
  } catch (error) {
    console.error('Ошибка загрузки производителей:', error);
    box.innerHTML = '<div class="loading-card error-card">Не удалось загрузить производителей.</div>';
  }
});
