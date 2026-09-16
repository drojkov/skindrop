// =====================================================================
//  КАТАЛОГ: фильтры, сортировка, поиск, «показать ещё»
// =====================================================================

const PAGE_SIZE = 24;

// Состояние фильтров. Всё, что выбрал пользователь, — здесь.
const state = {
  q: "",
  types: new Set(),
  rarities: new Set(),
  wears: new Set(),
  stattrak: "any",      // any | yes | no
  minPrice: "",
  maxPrice: "",
  sort: "popular",
  shown: PAGE_SIZE,     // сколько карточек показано сейчас
};

const catalogEl  = document.getElementById("catalog");
const countEl    = document.getElementById("result-count");
const moreBtn    = document.getElementById("show-more");
const sortSelect = document.getElementById("sort");

// ---------- Строим чекбоксы фильтров из данных ----------
function checkboxList(containerId, dict, group) {
  document.getElementById(containerId).innerHTML = Object.entries(dict).map(([key, val]) => `
    <label class="check">
      <input type="checkbox" data-group="${group}" value="${key}">
      <span>${typeof val === "string" ? val : val.label}</span>
    </label>
  `).join("");
}
checkboxList("filter-type",   TYPES,    "types");
checkboxList("filter-rarity", RARITIES, "rarities");
checkboxList("filter-wear",   WEARS,    "wears");

// ---------- Применяем фильтры ----------
function getFiltered() {
  const q = state.q.toLowerCase();
  let items = listings.filter(p =>
    (!q || p.fullName.toLowerCase().includes(q)) &&
    (state.types.size === 0    || state.types.has(p.type)) &&
    (state.rarities.size === 0 || state.rarities.has(p.rarity)) &&
    (state.wears.size === 0    || state.wears.has(p.wear)) &&
    (state.stattrak === "any"  || (state.stattrak === "yes") === p.stattrak) &&
    (state.minPrice === ""     || p.price >= Number(state.minPrice)) &&
    (state.maxPrice === ""     || p.price <= Number(state.maxPrice))
  );

  // sort меняет массив на месте, поэтому копия [...items] сверху уже сделана filter'ом
  switch (state.sort) {
    case "price-asc":  items.sort((a, b) => a.price - b.price); break;
    case "price-desc": items.sort((a, b) => b.price - a.price); break;
    case "float-asc":  items.sort((a, b) => a.float - b.float); break;
    case "name":       items.sort((a, b) => a.fullName.localeCompare(b.fullName)); break;
    // "popular" — оставляем порядок из данных
  }
  return items;
}

function renderCatalog() {
  const items = getFiltered();
  const visible = items.slice(0, state.shown);

  countEl.textContent = `${items.length} предложений`;
  moreBtn.hidden = state.shown >= items.length;

  catalogEl.innerHTML = visible.length
    ? visible.map(cardHtml).join("")
    : `<p class="empty">Ничего не найдено. Попробуй убрать часть фильтров.</p>`;
}

// При любом изменении фильтра — сброс пагинации и перерисовка
function update() {
  state.shown = PAGE_SIZE;
  renderCatalog();
}

// ---------- Обработчики ----------
document.getElementById("filters").addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.group) {                     // чекбоксы type/rarity/wear
    const set = state[el.dataset.group];
    el.checked ? set.add(el.value) : set.delete(el.value);
  } else if (el.name === "stattrak") {
    state.stattrak = el.value;
  }
  update();
});

// Цена — по вводу, с задержкой, чтобы не перерисовывать на каждую букву
let priceTimer;
["min-price", "max-price"].forEach(id => {
  document.getElementById(id).addEventListener("input", e => {
    clearTimeout(priceTimer);
    priceTimer = setTimeout(() => {
      state[id === "min-price" ? "minPrice" : "maxPrice"] = e.target.value;
      update();
    }, 300);
  });
});

document.getElementById("search").addEventListener("input", e => {
  state.q = e.target.value;
  update();
});

sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; update(); });

moreBtn.addEventListener("click", () => { state.shown += PAGE_SIZE; renderCatalog(); });

document.getElementById("filters-reset").addEventListener("click", () => {
  document.getElementById("filters").reset();
  state.types.clear(); state.rarities.clear(); state.wears.clear();
  state.stattrak = "any"; state.minPrice = ""; state.maxPrice = "";
  update();
});

// Мобильная кнопка «Фильтры»
document.getElementById("filters-toggle").addEventListener("click", () => {
  document.getElementById("filters").classList.toggle("open");
});

// Быстрые ссылки по типу в hero
document.querySelectorAll("[data-type-link]").forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    const box = document.querySelector(`#filter-type input[value="${a.dataset.typeLink}"]`);
    box.checked = true;
    box.dispatchEvent(new Event("change", { bubbles: true }));
    document.getElementById("catalog-top").scrollIntoView({ behavior: "smooth" });
  });
});

// Если пришли с product.html?q=... — подставляем поиск
const urlQ = new URLSearchParams(window.location.search).get("q");
if (urlQ) {
  document.getElementById("search").value = urlQ;
  state.q = urlQ;
}

// Статистика в hero
const statCount = document.getElementById("stat-count");
const statMin   = document.getElementById("stat-min");
if (statCount) statCount.textContent = listings.length.toLocaleString("ru-RU");
if (statMin)   statMin.textContent = formatPrice(Math.min(...listings.map(p => p.price)));

renderCatalog();
