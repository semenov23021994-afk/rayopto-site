
document.addEventListener('DOMContentLoaded', async () => {
  const box = document.getElementById('brands-grid');
  try {
    const response = await fetch('/data/products.json', {cache:'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();
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
          <strong>${brand}</strong>
          <span>${value.count} моделей</span>
          <span>${[...value.categories].join(', ')}</span>
        </a>`).join('');
  } catch (error) {
    console.error('Ошибка загрузки производителей:', error);
    box.innerHTML = '<div class="loading-card error-card">Не удалось загрузить производителей.</div>';
  }
});
