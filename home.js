// =====================================================================
//  ГЛАВНАЯ: тикер цен, топ-5 лотов дня, лента покупок, появление секций
//  Подключается последним — после products.js / shop.js / catalog.js
// =====================================================================

// Детерминированный «рандом» из строки: одинаковые данные → одинаковые числа
function hashRand(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  // финальное перемешивание: без него старшие биты зависят от последнего символа
  h ^= h >>> 15; h = Math.imul(h, 2246822507);
  h ^= h >>> 13; h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const withImage = listings.filter(l => l.image);
const pick = (arr, n, salt) =>
  [...arr].sort((a, b) => hashRand(a.id + salt) - hashRand(b.id + salt)).slice(0, n);

// ---------------------------------------------------------------------
//  Тикер: движение цен за сутки
// ---------------------------------------------------------------------
(function ticker() {
  const track = document.getElementById("ticker-track");
  if (!track) return;

  const items = pick(withImage, 16, "t").map(p => {
    const delta = (hashRand(p.id + "d") * 9.4 - 3.4);
    return { name: `${p.weapon} | ${p.name}`, delta };
  });

  const html = items.map(i => `
    <span class="ticker-item">
      <b>${i.name}</b>
      <span class="${i.delta >= 0 ? "ticker-up" : "ticker-down"}">
        ${i.delta >= 0 ? "+" : "−"}${Math.abs(i.delta).toFixed(1)}%
      </span>
    </span>
  `).join("");

  track.innerHTML = html + html;   // две копии — для бесшовной прокрутки

  const now = new Date();
  document.getElementById("ticker-time").textContent =
    `обновлено ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
})();

// ---------------------------------------------------------------------
//  Топ-5 лотов дня
// ---------------------------------------------------------------------
(function top5() {
  const heroEl = document.getElementById("top5-hero");
  const listEl = document.getElementById("top5-list");
  if (!heroEl || !listEl) return;

  const day = new Date().toISOString().slice(0, 10);
  const items = pick(withImage.filter(p => p.price > 20), 5, day);
  const [hero, ...rest] = items;
  const steam = p => formatPrice(p.price / 0.82);

  heroEl.style.setProperty("--rarity", RARITIES[hero.rarity].color);
  heroEl.innerHTML = `
    <img src="${hero.image}" alt="" loading="lazy">
    <div class="top5-hero-body">
      <div class="top5-kicker">
        <span class="rarity-ink">${RARITIES[hero.rarity].label}</span>
        <span>${WEARS[hero.wear].label} · float ${hero.float.toFixed(4)}</span>
      </div>
      <div class="top5-weapon">${hero.weapon}</div>
      <h3>${hero.name}</h3>
      <div class="top5-row">
        <span class="top5-price">${formatPrice(hero.price)}</span>
        <span class="top5-steam">${steam(hero)}</span>
        <button class="btn btn-primary" data-add="${hero.id}">
          <i class="ph ph-shopping-cart-simple"></i>В корзину
        </button>
      </div>
    </div>
  `;

  listEl.innerHTML = rest.map((p, i) => `
    <a class="top5-item" href="product.html?skin=${p.skinId}" style="--rarity: ${RARITIES[p.rarity].color}">
      <span class="top5-num">${i + 2}</span>
      <span class="top5-thumb"><img src="${p.image}" alt="" loading="lazy"></span>
      <span>
        <span class="top5-name">${p.weapon} | ${p.name}</span>
        <span class="top5-sub">${WEARS[p.wear].label} · float ${p.float.toFixed(4)}</span>
      </span>
      <span class="top5-item-price">${formatPrice(p.price)}</span>
    </a>
  `).join("");
})();

// ---------------------------------------------------------------------
//  Лента «только что купили»
// ---------------------------------------------------------------------
(function feed() {
  const feedEl = document.getElementById("feed");
  if (!feedEl) return;

  const NICKS = ["s1mple_fan", "molotoff", "kotbaton", "dry_shot", "niko_2k", "awpshka",
                 "tapok", "flashbang", "smoke_mid", "peek_a_boo", "eco_round", "clutchboy"];
  const pool = pick(withImage, 40, "f");
  let cursor = 0;

  function itemHtml(p, ago) {
    const nick = NICKS[Math.floor(hashRand(p.id + "n") * NICKS.length)];
    return `
      <div class="feed-item" style="--rarity: ${RARITIES[p.rarity].color}">
        <span class="feed-thumb"><img src="${p.image}" alt="" loading="lazy"></span>
        <span>
          <span class="feed-name">${p.weapon} | ${p.name}</span>
          <span class="feed-meta">${nick} · ${ago}</span>
        </span>
        <span class="feed-price">${formatPrice(p.price)}</span>
      </div>
    `;
  }

  const AGO = ["только что", "1 мин назад", "2 мин назад", "4 мин назад",
               "6 мин назад", "9 мин назад", "12 мин назад", "15 мин назад"];
  feedEl.innerHTML = AGO.map((ago, i) => itemHtml(pool[i], ago)).join("");
  cursor = AGO.length;

  // каждые 7 секунд сверху появляется новая покупка
  setInterval(() => {
    if (document.hidden) return;
    const p = pool[cursor++ % pool.length];
    feedEl.insertAdjacentHTML("afterbegin", itemHtml(p, "только что"));
    if (feedEl.children.length > 8) feedEl.lastElementChild.remove();
  }, 7000);
})();

// ---------------------------------------------------------------------
//  Появление секций при скролле + счётчики в hero
// ---------------------------------------------------------------------
(function motion() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "-40px 0px -10% 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // счётчик предложений: 0 → итоговое значение
  const el = document.getElementById("stat-count");
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = Number(el.textContent.replace(/\D/g, ""));
  if (!target) return;
  const start = performance.now();
  (function step(now) {
    const t = Math.min((now - start) / 900, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))).toLocaleString("ru-RU");
    if (t < 1) requestAnimationFrame(step);
  })(start);
})();
