// =====================================================================
//  HERO. Все тексты — здесь, в COPY. Правьте только этот блок.
// =====================================================================
const T = (k, f) => (typeof t === "function" ? t(k, f) : f);

const COPY = {
  titleStatic: T("hero.title", "Скины CS2"),
  titlePhrases: [
    T("hero.p1", "дешевле Steam"),
    T("hero.p2", "с проверкой float"),
    T("hero.p3", "с выдачей за 90 секунд")
  ],
  sub: T("hero.sub", "Пополнение без комисии, честные цены."),
  cta: T("hero.cta", "В каталог"),
  ctaSecondary: { text: T("hero.cta2", "Как это работает"), href: "how-to.html" },
  stats: [
    { id: "stat-count", value: "0", label: T("stat.count", "предложений") },
    { id: "stat-min",   value: "—", label: T("stat.min", "цена от") },
    { id: null,         value: "−18%", label: T("stat.steam", "дешевле Steam") }
  ]
};

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hero = document.getElementById("nhero");

// ---------- Текст ----------
document.getElementById("hero-title-static").textContent = COPY.titleStatic;
document.getElementById("hero-sub").textContent = COPY.sub;
document.getElementById("hero-cta").textContent = COPY.cta;
const ctaAlt = document.getElementById("hero-cta-alt");
ctaAlt.textContent = COPY.ctaSecondary.text;
ctaAlt.href = COPY.ctaSecondary.href;

document.getElementById("hero-stats").innerHTML = COPY.stats.map(s => `
  <div class="stat"><strong${s.id ? ` id="${s.id}"` : ""}>${s.value}</strong><span>${s.label}</span></div>
`).join("");

// ---------- Печатающаяся строка ----------
const typeEl = document.getElementById("hero-type");
if (reduce) {
  typeEl.textContent = COPY.titlePhrases[0];
} else {
  let pi = 0, ci = 0, del = false;
  (function tick() {
    const phrase = COPY.titlePhrases[pi];
    ci += del ? -1 : 1;
    typeEl.textContent = phrase.slice(0, ci);
    let wait = del ? 28 : 62;
    if (!del && ci === phrase.length) { del = true; wait = 2200; }
    else if (del && ci === 0) { del = false; pi = (pi + 1) % COPY.titlePhrases.length; wait = 340; }
    setTimeout(tick, wait);
  })();
}

// ---------- Мини-игра «три в ряд» в правом окне ----------
const stage = document.getElementById("hero-stage");
if (typeof initMatch3 === "function") initMatch3(stage);

// ---------- Вход ----------
requestAnimationFrame(() => hero.classList.add(reduce ? "is-static" : "is-in"));
