const fs = require('fs');
const path = require('path');

const root = process.argv[2];
const brands = require(path.join(root, 'data/brands.json'));
const outDir = path.join(root, 'assets/brands');
fs.mkdirSync(outDir, {recursive: true});

const slugify = brand => brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const initials = brand => {
  const words = brand.trim().split(/\s+/);
  if (words.length > 1) return words.slice(0, 2).map(w => w[0]).join('');
  return brand.slice(0, 2);
};

// Оттенок выводится из имени бренда, поэтому он стабилен между пересборками.
// Диапазон ограничен холодной частью спектра (бирюза → индиго), чтобы плитки
// не спорили с фирменными navy/cyan и читались как один набор.
const HUE_MIN = 168;
const HUE_SPAN = 96;
const hash = brand => {
  let h = 0;
  for (const ch of brand) h = (h * 31 + ch.codePointAt(0)) % 100000;
  return h;
};
const hue = brand => HUE_MIN + (hash(brand) % HUE_SPAN);

const escapeXml = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

const files = brands.map(brand => {
  const slug = slugify(brand);
  const text = initials(brand);
  const h = hue(brand);
  // Второй стоп смещён к фирменному голубому, чтобы плитки читались как один набор.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${escapeXml(brand)}">
  <title>${escapeXml(brand)}</title>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h}, 44%, 29%)"/>
      <stop offset="1" stop-color="hsl(${h + 18}, 58%, 45%)"/>
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="22" fill="url(#g)"/>
  <text x="48" y="62" text-anchor="middle" fill="#ffffff"
        font-family="Arial, Helvetica, sans-serif" font-size="${text.length > 1 ? 36 : 46}" font-weight="bold"
        letter-spacing="0.5">${escapeXml(text)}</text>
</svg>
`;
  fs.writeFileSync(path.join(outDir, slug + '.svg'), svg, 'utf8');
  return {brand, slug, text};
});

console.log(files.map(f => `${f.slug}.svg  ${f.text.padEnd(3)} ${f.brand}`).join('\n'));
console.log('\nвсего файлов:', files.length);
