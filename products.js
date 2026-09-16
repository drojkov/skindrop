// =====================================================================
//  ДАННЫЕ МАГАЗИНА
//  1) skins  — базовые скины (пишем руками)
//  2) WEARS  — состояния износа и их влияние на цену
//  3) listings — все позиции магазина, ГЕНЕРИРУЮТСЯ из skins × WEARS
// =====================================================================

// Типы оружия — для фильтра. Ключ используется в данных, значение — подпись.
const TYPES = {
  rifle:  "Винтовки",
  sniper: "Снайперские",
  pistol: "Пистолеты",
  smg:    "ПП",
  heavy:  "Тяжёлое",
  knife:  "Ножи",
  gloves: "Перчатки",
};

// Редкости — подпись и цвет как в игре
const RARITIES = {
  consumer:   { label: "Consumer",   color: "#b0c3d9" },
  industrial: { label: "Industrial", color: "#5e98d9" },
  milspec:    { label: "Mil-Spec",   color: "#4b69ff" },
  restricted: { label: "Restricted", color: "#8847ff" },
  classified: { label: "Classified", color: "#d32ce6" },
  covert:     { label: "Covert",     color: "#eb4b4b" },
  contraband: { label: "Contraband", color: "#e4ae39" },
  gold:       { label: "★ Особое",   color: "#e4ae39" },
};

// Износ: подпись, множитель цены, диапазон float
const WEARS = {
  FN: { label: "Factory New",    short: "FN", mult: 1.00, float: [0.00, 0.07] },
  MW: { label: "Minimal Wear",   short: "MW", mult: 0.78, float: [0.07, 0.15] },
  FT: { label: "Field-Tested",   short: "FT", mult: 0.55, float: [0.15, 0.38] },
  WW: { label: "Well-Worn",      short: "WW", mult: 0.45, float: [0.38, 0.45] },
  BS: { label: "Battle-Scarred", short: "BS", mult: 0.40, float: [0.45, 1.00] },
};

// Базовые скины. basePrice — цена за Factory New без StatTrak.
// wears — в каких состояниях скин существует. image — путь к картинке в папке images/.
// Запасные данные — используются, пока нет data.js от import_skins.py
const fallbackSkins = [
  // ---- Винтовки ----
  { id: "ak-redline",        weapon: "AK-47",   name: "Redline",            type: "rifle",  rarity: "classified", basePrice: 95,   wears: ["MW","FT","WW","BS"],      stattrak: true,  image: "images/ak-redline.png" },
  { id: "ak-asiimov",        weapon: "AK-47",   name: "Asiimov",            type: "rifle",  rarity: "covert",     basePrice: 210,  wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/ak-asiimov.png" },
  { id: "ak-vulcan",         weapon: "AK-47",   name: "Vulcan",             type: "rifle",  rarity: "covert",     basePrice: 1450, wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/ak-vulcan.png" },
  { id: "ak-slate",          weapon: "AK-47",   name: "Slate",              type: "rifle",  rarity: "restricted", basePrice: 14,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/ak-slate.png" },
  { id: "ak-phantom",        weapon: "AK-47",   name: "Phantom Disruptor",  type: "rifle",  rarity: "classified", basePrice: 22,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/ak-phantom.png" },
  { id: "ak-nightwish",      weapon: "AK-47",   name: "Nightwish",          type: "rifle",  rarity: "covert",     basePrice: 120,  wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/ak-nightwish.png" },
  { id: "m4a4-neonoir",      weapon: "M4A4",    name: "Neo-Noir",           type: "rifle",  rarity: "covert",     basePrice: 110,  wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/m4a4-neonoir.png" },
  { id: "m4a4-desolate",     weapon: "M4A4",    name: "Desolate Space",     type: "rifle",  rarity: "classified", basePrice: 48,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/m4a4-desolate.png" },
  { id: "m4a4-temukau",      weapon: "M4A4",    name: "Temukau",            type: "rifle",  rarity: "covert",     basePrice: 85,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/m4a4-temukau.png" },
  { id: "m4a1s-printstream", weapon: "M4A1-S",  name: "Printstream",        type: "rifle",  rarity: "covert",     basePrice: 260,  wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/m4a1s-printstream.png" },
  { id: "m4a1s-hyperbeast",  weapon: "M4A1-S",  name: "Hyper Beast",        type: "rifle",  rarity: "covert",     basePrice: 90,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/m4a1s-hyperbeast.png" },
  { id: "m4a1s-guardian",    weapon: "M4A1-S",  name: "Guardian",           type: "rifle",  rarity: "classified", basePrice: 32,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/m4a1s-guardian.png" },
  { id: "galil-chatterbox",  weapon: "Galil AR",name: "Chatterbox",         type: "rifle",  rarity: "covert",     basePrice: 150,  wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/galil-chatterbox.png" },
  { id: "famas-mecha",       weapon: "FAMAS",   name: "Mecha Industries",   type: "rifle",  rarity: "classified", basePrice: 18,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/famas-mecha.png" },
  { id: "aug-chameleon",     weapon: "AUG",     name: "Chameleon",          type: "rifle",  rarity: "covert",     basePrice: 40,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/aug-chameleon.png" },
  { id: "sg553-integrale",   weapon: "SG 553",  name: "Integrale",          type: "rifle",  rarity: "classified", basePrice: 12,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/sg553-integrale.png" },

  // ---- Снайперские ----
  { id: "awp-asiimov",       weapon: "AWP",     name: "Asiimov",            type: "sniper", rarity: "covert",     basePrice: 330,  wears: ["FT","WW","BS"],           stattrak: true,  image: "images/awp-asiimov.png" },
  { id: "awp-dragonlore",    weapon: "AWP",     name: "Dragon Lore",        type: "sniper", rarity: "covert",     basePrice: 14500,wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/awp-dragonlore.png" },
  { id: "awp-neonoir",       weapon: "AWP",     name: "Neo-Noir",           type: "sniper", rarity: "covert",     basePrice: 95,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/awp-neonoir.png" },
  { id: "awp-wildfire",      weapon: "AWP",     name: "Wildfire",           type: "sniper", rarity: "covert",     basePrice: 140,  wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/awp-wildfire.png" },
  { id: "awp-atheris",       weapon: "AWP",     name: "Atheris",            type: "sniper", rarity: "restricted", basePrice: 16,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/awp-atheris.png" },
  { id: "awp-chromatic",     weapon: "AWP",     name: "Chromatic Aberration",type:"sniper", rarity: "covert",     basePrice: 45,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/awp-chromatic.png" },
  { id: "ssg-blood",         weapon: "SSG 08",  name: "Blood in the Water", type: "sniper", rarity: "covert",     basePrice: 180,  wears: ["FN","MW","FT"],           stattrak: true,  image: "images/ssg-blood.png" },

  // ---- Пистолеты ----
  { id: "usp-cortex",        weapon: "USP-S",   name: "Cortex",             type: "pistol", rarity: "classified", basePrice: 20,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/usp-cortex.png" },
  { id: "usp-killconfirmed", weapon: "USP-S",   name: "Kill Confirmed",     type: "pistol", rarity: "covert",     basePrice: 240,  wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/usp-killconfirmed.png" },
  { id: "usp-neonoir",       weapon: "USP-S",   name: "Neo-Noir",           type: "pistol", rarity: "covert",     basePrice: 55,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/usp-neonoir.png" },
  { id: "glock-water",       weapon: "Glock-18",name: "Water Elemental",    type: "pistol", rarity: "restricted", basePrice: 14,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/glock-water.png" },
  { id: "glock-fade",        weapon: "Glock-18",name: "Fade",               type: "pistol", rarity: "restricted", basePrice: 1400, wears: ["FN","MW"],                stattrak: false, image: "images/glock-fade.png" },
  { id: "glock-neonoir",     weapon: "Glock-18",name: "Neo-Noir",           type: "pistol", rarity: "covert",     basePrice: 40,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/glock-neonoir.png" },
  { id: "deagle-blaze",      weapon: "Desert Eagle", name: "Blaze",         type: "pistol", rarity: "restricted", basePrice: 900,  wears: ["FN","MW"],                stattrak: false, image: "images/deagle-blaze.png" },
  { id: "deagle-printstream",weapon: "Desert Eagle", name: "Printstream",   type: "pistol", rarity: "covert",     basePrice: 160,  wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/deagle-printstream.png" },
  { id: "deagle-kumicho",    weapon: "Desert Eagle", name: "Kumicho Dragon",type: "pistol", rarity: "classified", basePrice: 35,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/deagle-kumicho.png" },
  { id: "fiveseven-case",    weapon: "Five-SeveN", name: "Case Hardened",   type: "pistol", rarity: "milspec",    basePrice: 30,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/fiveseven-case.png" },
  { id: "p250-asiimov",      weapon: "P250",    name: "Asiimov",            type: "pistol", rarity: "classified", basePrice: 30,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/p250-asiimov.png" },
  { id: "cz75-victoria",     weapon: "CZ75-Auto", name: "Victoria",         type: "pistol", rarity: "covert",     basePrice: 50,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/cz75-victoria.png" },

  // ---- Пистолеты-пулемёты ----
  { id: "mp9-starlight",     weapon: "MP9",     name: "Starlight Protector",type: "smg",    rarity: "covert",     basePrice: 45,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/mp9-starlight.png" },
  { id: "mac10-neonrider",   weapon: "MAC-10",  name: "Neon Rider",         type: "smg",    rarity: "covert",     basePrice: 30,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/mac10-neonrider.png" },
  { id: "p90-asiimov",       weapon: "P90",     name: "Asiimov",            type: "smg",    rarity: "covert",     basePrice: 24,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/p90-asiimov.png" },
  { id: "ump-primal",        weapon: "UMP-45",  name: "Primal Saber",       type: "smg",    rarity: "covert",     basePrice: 22,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/ump-primal.png" },
  { id: "mp7-bloodsport",    weapon: "MP7",     name: "Bloodsport",         type: "smg",    rarity: "covert",     basePrice: 26,   wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/mp7-bloodsport.png" },
  { id: "mac10-fade",        weapon: "MAC-10",  name: "Fade",               type: "smg",    rarity: "restricted", basePrice: 18,   wears: ["FN","MW"],                stattrak: true,  image: "images/mac10-fade.png" },

  // ---- Ножи ----
  { id: "karambit-doppler",  weapon: "★ Karambit", name: "Doppler",         type: "knife",  rarity: "gold",       basePrice: 1900, wears: ["FN","MW"],                stattrak: true,  image: "images/karambit-doppler.png" },
  { id: "karambit-fade",     weapon: "★ Karambit", name: "Fade",            type: "knife",  rarity: "gold",       basePrice: 2600, wears: ["FN","MW"],                stattrak: true,  image: "images/karambit-fade.png" },
  { id: "butterfly-fade",    weapon: "★ Butterfly Knife", name: "Fade",     type: "knife",  rarity: "gold",       basePrice: 3400, wears: ["FN","MW"],                stattrak: true,  image: "images/butterfly-fade.png" },
  { id: "butterfly-doppler", weapon: "★ Butterfly Knife", name: "Doppler",  type: "knife",  rarity: "gold",       basePrice: 2400, wears: ["FN","MW"],                stattrak: true,  image: "images/butterfly-doppler.png" },
  { id: "m9-lore",           weapon: "★ M9 Bayonet", name: "Lore",          type: "knife",  rarity: "gold",       basePrice: 1600, wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/m9-lore.png" },
  { id: "bayonet-tiger",     weapon: "★ Bayonet", name: "Tiger Tooth",      type: "knife",  rarity: "gold",       basePrice: 620,  wears: ["FN","MW"],                stattrak: true,  image: "images/bayonet-tiger.png" },
  { id: "flip-marble",       weapon: "★ Flip Knife", name: "Marble Fade",   type: "knife",  rarity: "gold",       basePrice: 560,  wears: ["FN","MW"],                stattrak: true,  image: "images/flip-marble.png" },
  { id: "skeleton-crimson",  weapon: "★ Skeleton Knife", name: "Crimson Web",type:"knife",  rarity: "gold",       basePrice: 1100, wears: ["FN","MW","FT","WW","BS"], stattrak: true,  image: "images/skeleton-crimson.png" },
  { id: "gut-slaughter",     weapon: "★ Gut Knife", name: "Slaughter",      type: "knife",  rarity: "gold",       basePrice: 180,  wears: ["FN","MW","FT"],           stattrak: true,  image: "images/gut-slaughter.png" },

  // ---- Перчатки ----
  { id: "sport-vice",        weapon: "★ Sport Gloves", name: "Vice",        type: "gloves", rarity: "gold",       basePrice: 3800, wears: ["FN","MW","FT","WW","BS"], stattrak: false, image: "images/sport-vice.png" },
  { id: "sport-pandora",     weapon: "★ Sport Gloves", name: "Pandora's Box",type:"gloves", rarity: "gold",       basePrice: 3200, wears: ["FN","MW","FT","WW","BS"], stattrak: false, image: "images/sport-pandora.png" },
  { id: "specialist-kimono", weapon: "★ Specialist Gloves", name: "Crimson Kimono", type: "gloves", rarity: "gold", basePrice: 2900, wears: ["FN","MW","FT","WW","BS"], stattrak: false, image: "images/specialist-kimono.png" },
  { id: "driver-lunar",      weapon: "★ Driver Gloves", name: "Lunar Weave",type: "gloves", rarity: "gold",       basePrice: 350,  wears: ["FN","MW","FT","WW","BS"], stattrak: false, image: "images/driver-lunar.png" },
  { id: "handwraps-cobalt",  weapon: "★ Hand Wraps", name: "Cobalt Skulls", type: "gloves", rarity: "gold",       basePrice: 900,  wears: ["FN","MW","FT","WW","BS"], stattrak: false, image: "images/handwraps-cobalt.png" },
];

// ---------------------------------------------------------------------
//  ГЕНЕРАЦИЯ ПОЗИЦИЙ
// ---------------------------------------------------------------------

// Детерминированный «рандом»: одна и та же строка → всегда одно и то же число 0..1.
// Нужен, чтобы float и цена не менялись при каждой перезагрузке страницы.
function seededRandom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function buildListings() {
  const result = [];

  for (const skin of fallbackSkins) {
    for (const wearCode of skin.wears) {
      // Для каждого износа — обычная версия и, если бывает, StatTrak
      const variants = skin.stattrak ? [false, true] : [false];

      for (const stattrak of variants) {
        const id = `${skin.id}_${wearCode}${stattrak ? "_st" : ""}`;
        const wear = WEARS[wearCode];

        // float внутри диапазона износа
        const [fMin, fMax] = wear.float;
        const float = fMin + seededRandom(id + "f") * (fMax - fMin);

        // цена: база × износ × StatTrak × небольшой разброс ±10%
        let price = skin.basePrice * wear.mult;
        if (stattrak) price *= skin.type === "knife" ? 1.3 : 1.9;
        price *= 0.9 + seededRandom(id + "p") * 0.2;

        result.push({
          id,
          skinId: skin.id,
          weapon: skin.weapon,
          name: skin.name,
          fullName: `${stattrak ? "StatTrak™ " : ""}${skin.weapon} | ${skin.name}`,
          type: skin.type,
          rarity: skin.rarity,
          wear: wearCode,
          float: Number(float.toFixed(4)),
          stattrak,
          price: Number(price.toFixed(2)),
          image: skin.image,
        });
      }
    }
  }
  return result;
}

// Если подключён data.js (реальные данные из import_skins.py) — берём его,
// иначе генерируем ассортимент из fallbackSkins.
const hasData = typeof DATA !== "undefined" && Array.isArray(DATA.listings) && DATA.listings.length > 0;
if (typeof DATA !== "undefined" && !hasData) console.warn("data.js подключён, но пустой или битый — использую запасные данные");
const skins    = hasData ? DATA.skins    : fallbackSkins;
const listings = hasData ? DATA.listings : buildListings();

// ---------------------------------------------------------------------
//  ХЕЛПЕРЫ, нужные на всех страницах
// ---------------------------------------------------------------------

function formatPrice(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function findListing(id) {
  return listings.find(l => l.id === id);
}

// Цена того же предмета в Steam — на сайте лоты на 18% дешевле
const STEAM_MARKUP = 1 / 0.82;
function steamPrice(item) { return item.price * STEAM_MARKUP; }

// Шкала float с маркером: положение маркера = сам float (0…1)
function floatScaleHtml(item) {
  const pos = Math.max(0, Math.min(1, item.float)) * 100;
  const stops = Object.values(WEARS).map(w => w.float[1] * 100);
  return `
    <div class="card-scale" title="float ${item.float.toFixed(4)} · ${WEARS[item.wear].label}">
      ${stops.slice(0, -1).map(s => `<span class="card-scale-tick" style="left: ${s}%"></span>`).join("")}
      <span class="card-scale-mark" style="left: ${pos}%"></span>
    </div>`;
}

// HTML одной карточки товара — используется в каталоге и в «похожих»
function cardHtml(item) {
  const rarity = RARITIES[item.rarity];
  return `
    <article class="card" style="--rarity: ${rarity.color}" data-tilt>
      <a class="card-preview" href="product.html?skin=${item.skinId}">
        <span class="card-halo"></span>
        <img src="${item.image}" alt="" loading="lazy" onerror="this.remove()">
        <span class="card-fallback">${item.weapon}</span>
        <span class="card-rarity">${rarity.label}</span>
        <span class="card-badges">
          ${item.stattrak ? `<span class="tag tag-st">StatTrak™</span>` : ""}
          ${item.souvenir ? `<span class="tag tag-sv">Souvenir</span>` : ""}
        </span>
        <span class="card-gloss"></span>
      </a>
      <div class="card-body">
        <div class="card-weapon">${item.weapon}</div>
        <a class="card-name" href="product.html?skin=${item.skinId}">${item.name}</a>
        <div class="card-meta">
          <span class="tag" title="${WEARS[item.wear].label}">${item.wear}</span>
          <span class="card-float">float ${item.float.toFixed(4)}</span>
        </div>
        ${floatScaleHtml(item)}
        <div class="card-footer">
          <span class="card-prices">
            <span class="card-price">${formatPrice(item.price)}</span>
            <span class="card-steam">${formatPrice(steamPrice(item))}</span>
          </span>
          <span class="card-off">−18%</span>
          <button class="btn btn-primary btn-small" data-add="${item.id}"><i class="ph ph-shopping-cart-simple"></i>В корзину</button>
        </div>
      </div>
    </article>
  `;
}
