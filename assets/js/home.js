
document.addEventListener('DOMContentLoaded', async () => {
  const categoryBox = document.getElementById('home-categories');
  const brandBox = document.getElementById('home-brands');
  try {
    const response = await fetch('/data/products.json', {cache: 'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru'));
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru'));

    document.getElementById('home-product-count').textContent = products.length;
    document.getElementById('home-brand-count').textContent = brands.length;
    document.getElementById('home-category-count').textContent = categories.length;

    const categoryCounts = {};
    products.forEach(p => { if (p.category) categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1; });

    categoryBox.innerHTML = categories.map(category => `
      <a class="category-card" href="/catalog/?category=${encodeURIComponent(category)}">
        <strong>${category}</strong>
        <span>${categoryCounts[category] || 0} моделей</span>
      </a>`).join('');

    brandBox.innerHTML = brands.slice(0, 24).map(brand =>
      `<a class="brand-pill" href="/catalog/?brand=${encodeURIComponent(brand)}">${brand}</a>`
    ).join('');
  } catch (error) {
    console.error('Ошибка загрузки главной страницы:', error);
    categoryBox.innerHTML = '<div class="loading-card error-card">Не удалось загрузить разделы каталога.</div>';
    brandBox.innerHTML = '<span class="loading-card error-card">Не удалось загрузить производителей.</span>';
  }
});
