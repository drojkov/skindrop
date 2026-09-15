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

// ---------- Поиск: понимает кириллицу и транслит ----------

// Русские названия, которые пишут чаще всего → как они называются в игре
const ALIASES = {
  "ак": "ak-47", "акм": "ak-47", "калаш": "ak-47",
  "авп": "awp", "авипи": "awp",
  "м4": "m4a", "эмка": "m4a",
  "юсп": "usp-s", "глок": "glock-18", "дигл": "desert eagle", "деагл": "desert eagle",
  "керамбит": "karambit", "бабочка": "butterfly", "штык": "bayonet", "м9": "m9 bayonet",
  "перчатки": "gloves", "нож": "★",
  "асиимов": "asiimov", "азимов": "asiimov", "редлайн": "redline", "вулкан": "vulcan",
  "драгон": "dragon lore", "лор": "lore", "фейд": "fade",
  "допплер": "doppler", "доплер": "doppler", "принтстрим": "printstream",
  "неонуар": "neo-noir", "хайпербист": "hyper beast", "хайпер": "hyper beast",
  "статтрек": "stattrak", "стат": "stattrak",
};

// Побуквенная транслитерация — на случай, если слова нет в ALIASES
const TRANSLIT = {
  а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",
  о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",
  э:"e",ю:"yu",я:"ya",
};

// «AK-47» и «ак 47» должны совпадать: убираем всё, кроме букв и цифр
const squash = str => str.toLowerCase().replace(/[^a-z0-9а-яё★]/g, "");

// Из запроса делаем несколько вариантов написания; совпал любой — товар подходит
function queryVariants(q) {
  const raw = q.trim().toLowerCase();
  if (!raw) return [];
  const words = raw.split(/\s+/);
  const aliased  = words.map(w => ALIASES[w] || w).join(" ");
  const translit = raw.replace(/[а-яё]/g, ch => TRANSLIT[ch] ?? ch);
  return [...new Set([raw, aliased, translit])].map(squash).filter(Boolean);
}

// ---------- Применяем фильтры ----------
function getFiltered() {
  const qs = queryVariants(state.q);
  let items = listings.filter(p =>
    (qs.length === 0 || qs.some(q => squash(p.fullName).includes(q))) &&
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
document.getElementById("stat-count").textContent = listings.length.toLocaleString("ru-RU");
document.getElementById("stat-min").textContent = formatPrice(Math.min(...listings.map(p => p.price)));

renderCatalog();