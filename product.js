// =====================================================================
//  СТРАНИЦА ТОВАРА: product.html?skin=ak-redline
// =====================================================================

const skinId = new URLSearchParams(window.location.search).get("skin");
const skin = skins.find(s => s.id === skinId);

if (!skin) {
  window.location.href = "index.html";
}

const variants = listings.filter(l => l.skinId === skinId);
const rarity = RARITIES[skin.rarity];
const minPrice = Math.min(...variants.map(v => v.price));

document.title = `${skin.weapon} | ${skin.name} — SkinDrop`;
document.getElementById("product").style.setProperty("--rarity", rarity.color);

document.getElementById("crumb-type").textContent = TYPES[skin.type];
document.getElementById("crumb-name").textContent = `${skin.weapon} | ${skin.name}`;
document.getElementById("p-weapon").textContent = skin.weapon;
document.getElementById("p-name").textContent = skin.name;
document.getElementById("p-rarity").textContent = rarity.label;
document.getElementById("p-from").textContent = `${variants.length} лотов в наличии`;

const img = document.getElementById("p-image");
img.src = skin.image;
img.onerror = () => img.remove();
document.getElementById("p-fallback").textContent = skin.weapon;

// Таблица всех вариантов: износ × StatTrak
document.getElementById("variants").innerHTML = variants.map(v => `
  <div class="variant">
    <div class="variant-wear">
      <span class="tag">${v.wear}</span>
      <span>${WEARS[v.wear].label}</span>
      ${v.stattrak ? `<span class="tag tag-st">StatTrak™</span>` : ""}
    </div>
    <div class="variant-float">float ${v.float.toFixed(4)}</div>
    <div class="variant-price">${formatPrice(v.price)}</div>
    <button class="btn btn-primary btn-small" data-add="${v.id}"><i class="ph ph-shopping-cart-simple"></i>В корзину</button>
  </div>
`).join("");

// Похожие: другие скины того же типа, по одной позиции на скин
const similar = skins
  .filter(s => s.type === skin.type && s.id !== skin.id)
  .slice(0, 4)
  .map(s => listings.find(l => l.skinId === s.id && !l.stattrak));
document.getElementById("similar").innerHTML = similar.map(cardHtml).join("");


// ---------------------------------------------------------------------
//  Показатели лота и история цены (детерминированно из данных)
// ---------------------------------------------------------------------
function rnd(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 15; h = Math.imul(h, 2246822507);
  h ^= h >>> 13; h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const weekDelta = rnd(skin.id + "w") * 8 - 2.6;

document.getElementById("p-extras").innerHTML = `
  <div class="p-stat">
    <div class="p-stat-label">от</div>
    <div class="p-stat-value">${formatPrice(minPrice)}</div>
  </div>
  <div class="p-stat">
    <div class="p-stat-label">в наличии</div>
    <div class="p-stat-value">${variants.length} <span style="font-size:14px; color:var(--muted)">лотов</span></div>
  </div>
  <div class="p-stat">
    <div class="p-stat-label">за 7 дней</div>
    <div class="p-stat-value ${weekDelta >= 0 ? "up" : ""}">${weekDelta >= 0 ? "+" : "−"}${Math.abs(weekDelta).toFixed(1)}%</div>
  </div>
`;

// Простой график: 30 точек случайного, но стабильного блуждания вокруг средней цены
(function priceHistory() {
  const base = minPrice;
  const pts = [];
  let v = base * (1 - weekDelta / 100);
  for (let i = 0; i < 30; i++) {
    v *= 1 + (rnd(skin.id + "h" + i) - 0.5) * 0.06;
    pts.push(v);
  }
  // приводим последнюю точку к текущей цене, масштабируя весь ряд
  const k = base / pts[pts.length - 1];
  for (let i = 0; i < pts.length; i++) pts[i] *= k;

  const min = Math.min(...pts), max = Math.max(...pts);
  const W = 100, H = 30;
  const xy = pts.map((p, i) => [
    (i / (pts.length - 1)) * W,
    H - ((p - min) / (max - min || 1)) * (H - 3) - 1.5,
  ]);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");

  document.getElementById("p-spark").innerHTML = `
    <div class="p-spark-head">
      <span>Цена за 30 дней</span>
      <span>${formatPrice(min)} — ${formatPrice(max)}</span>
    </div>
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <path class="area" d="${line} L100 30 L0 30 Z"></path>
      <path class="line" d="${line}"></path>
    </svg>
  `;
})();
