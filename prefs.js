// =====================================================================
//  ЯЗЫК И ВАЛЮТА. Подключается после products.js, до остальных скриптов.
//  Переводы — в DICT, курсы — в CURRENCIES.
// =====================================================================
(function () {
  const LANG_KEY = "skindrop-lang";
  const CUR_KEY  = "skindrop-currency";

  const LANGS = { ru: "Рус", en: "Eng", de: "Deu", fr: "Fra" };

  // курс: во сколько единиц валюты превращается $1
  const CURRENCIES = {
    USD: { sym: "$", rate: 1,    after: false, loc: "en-US" },
    RUB: { sym: "₽", rate: 92,   after: true,  loc: "ru-RU" },
    EUR: { sym: "€", rate: 0.92, after: true,  loc: "de-DE" },
    CNY: { sym: "¥", rate: 7.1,  after: false, loc: "en-US" },
    GBP: { sym: "£", rate: 0.79, after: false, loc: "en-GB" }
  };

  const DICT = {
    ru: {},
    en: {
      "nav.market": "Market", "nav.how": "How to buy",
      "search.ph": "Find a skin: AK-47, Asiimov, Karambit and more",
      "auth.login": "Sign in through Steam", "auth.logout": "Sign out",
      "cart.title": "Cart", "cart.btn": "Cart", "cart.clear": "Clear",
      "cart.total": "Total", "cart.save": "Cheaper than Steam by",
      "cart.checkout": "Go to payment",
      "cart.empty": "Empty for now. Pick a lot in the catalogue and it lands here.",
      "cart.toCatalog": "To the catalogue",
      "hero.title": "CS2 skins", "hero.cta": "To the catalogue", "hero.cta2": "How it works",
      "hero.p1": "cheaper than Steam", "hero.p2": "with float checked", "hero.p3": "delivered in 90 seconds",
      "hero.sub": "Top-ups with no fee, fair prices.",
      "stat.count": "listings", "stat.min": "from", "stat.steam": "cheaper than Steam",
      "game.title": "Match three", "game.hint": "three in a row or more",
      "game.score": "Score", "game.best": "Best", "game.reset": "Restart",
      "gift.goal": "1500 points a day — a random skin as a gift",
      "gift.done": "Today's gift is claimed — the next one tomorrow",
      "gift.label": "Your gift", "gift.take": "Claim",
      "sec.top5": "Top 5 lots of the day", "sec.top5sub": "the pick refreshes every 24 hours",
      "sec.all": "Full catalogue →",
      "band.fast": "Instant delivery", "band.fastSub": "",
      "band.refund": "Money back", "band.refundSub": "if the trade fails",
      "band.float": "Float verified", "band.floatSub": "every position inspected",
      "band.deals": "4 200 deals", "band.dealsSub": "over the last 30 days",
      "filters.title": "Filters", "filters.reset": "Reset",
      "filters.type": "Type", "filters.price": "Price",
      "lang.label": "Language", "cur.label": "Currency"
    },
    de: {
      "nav.market": "Markt", "nav.how": "So kaufst du",
      "search.ph": "Skin finden: AK-47, Asiimov, Karambit und mehr",
      "auth.login": "Mit Steam anmelden", "auth.logout": "Abmelden",
      "cart.title": "Warenkorb", "cart.btn": "Warenkorb", "cart.clear": "Leeren",
      "cart.total": "Summe", "cart.save": "Günstiger als Steam um",
      "cart.checkout": "Zur Zahlung",
      "cart.empty": "Noch leer. Wähle ein Angebot im Katalog, es landet hier.",
      "cart.toCatalog": "Zum Katalog",
      "hero.title": "CS2-Skins", "hero.cta": "Zum Katalog", "hero.cta2": "So funktioniert es",
      "hero.p1": "günstiger als Steam", "hero.p2": "mit geprüftem Float", "hero.p3": "in 90 Sekunden geliefert",
      "hero.sub": "Aufladen ohne Gebühr, faire Preise.",
      "stat.count": "Angebote", "stat.min": "ab", "stat.steam": "günstiger als Steam",
      "game.title": "Drei in einer Reihe", "game.hint": "drei oder mehr in einer Reihe",
      "game.score": "Punkte", "game.best": "Rekord", "game.reset": "Neu starten",
      "gift.goal": "1500 Punkte pro Tag — ein zufälliger Skin als Geschenk",
      "gift.done": "Das heutige Geschenk ist abgeholt — das nächste morgen",
      "gift.label": "Dein Geschenk", "gift.take": "Abholen",
      "sec.top5": "Top 5 Angebote des Tages", "sec.top5sub": "die Auswahl wechselt täglich",
      "sec.all": "Ganzer Katalog →",
      "band.fast": "Sofortige Ausgabe", "band.fastSub": "",
      "band.refund": "Geld zurück", "band.refundSub": "wenn der Trade scheitert",
      "band.float": "Float geprüft", "band.floatSub": "jede Position inspiziert",
      "band.deals": "4 200 Deals", "band.dealsSub": "in den letzten 30 Tagen",
      "filters.title": "Filter", "filters.reset": "Zurücksetzen",
      "filters.type": "Typ", "filters.price": "Preis",
      "lang.label": "Sprache", "cur.label": "Währung"
    },
    fr: {
      "nav.market": "Marché", "nav.how": "Comment acheter",
      "search.ph": "Trouver un skin : AK-47, Asiimov, Karambit, etc.",
      "auth.login": "Se connecter via Steam", "auth.logout": "Se déconnecter",
      "cart.title": "Panier", "cart.btn": "Panier", "cart.clear": "Vider",
      "cart.total": "Total", "cart.save": "Moins cher que Steam de",
      "cart.checkout": "Passer au paiement",
      "cart.empty": "Vide pour l'instant. Choisissez un lot dans le catalogue, il arrivera ici.",
      "cart.toCatalog": "Vers le catalogue",
      "hero.title": "Skins CS2", "hero.cta": "Vers le catalogue", "hero.cta2": "Comment ça marche",
      "hero.p1": "moins cher que Steam", "hero.p2": "avec float vérifié", "hero.p3": "livré en 90 secondes",
      "hero.sub": "Recharge sans frais, prix honnêtes.",
      "stat.count": "offres", "stat.min": "à partir de", "stat.steam": "moins cher que Steam",
      "game.title": "Trois en ligne", "game.hint": "trois d'affilée ou plus",
      "game.score": "Points", "game.best": "Record", "game.reset": "Recommencer",
      "gift.goal": "1500 points par jour — un skin aléatoire en cadeau",
      "gift.done": "Le cadeau du jour est récupéré — le prochain demain",
      "gift.label": "Votre cadeau", "gift.take": "Récupérer",
      "sec.top5": "Top 5 des lots du jour", "sec.top5sub": "la sélection change chaque jour",
      "sec.all": "Tout le catalogue →",
      "band.fast": "Remise instantanée", "band.fastSub": "",
      "band.refund": "Remboursement", "band.refundSub": "si l'échange échoue",
      "band.float": "Float vérifié", "band.floatSub": "chaque pièce inspectée",
      "band.deals": "4 200 transactions", "band.dealsSub": "sur les 30 derniers jours",
      "filters.title": "Filtres", "filters.reset": "Réinitialiser",
      "filters.type": "Type", "filters.price": "Prix",
      "lang.label": "Langue", "cur.label": "Devise"
    }
  };

  const lang = localStorage.getItem(LANG_KEY) || "ru";
  const cur  = CURRENCIES[localStorage.getItem(CUR_KEY)] ? localStorage.getItem(CUR_KEY) : "USD";

  window.SITE_LANG = lang;
  window.SITE_CUR  = cur;
  window.t = (key, fallback) => (DICT[lang] && DICT[lang][key]) || fallback || key;

  // ---------- Валюта: единая точка форматирования цен ----------
  window.formatPrice = function (n) {
    const c = CURRENCIES[cur];
    const v = n * c.rate;
    const digits = c.rate >= 50 ? 0 : 2;                     // рубли — без копеек
    const num = v.toLocaleString(c.loc, {
      minimumFractionDigits: digits, maximumFractionDigits: digits
    });
    return c.after ? num + " " + c.sym : c.sym + num;
  };

  // ---------- Переводы статической разметки ----------
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const v = DICT[lang] && DICT[lang][el.dataset.i18n];
      if (v) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => {
      const v = DICT[lang] && DICT[lang][el.dataset.i18nPh];
      if (v) el.placeholder = v;
    });
  }

  // ---------- Переключатели в шапке: свои выпадающие списки ----------
  function picker(id, sym, items, current, onPick) {
    const el = document.createElement("div");
    el.className = "pref";
    el.innerHTML = `
      <button type="button" class="pref-btn" id="${id}" aria-haspopup="listbox" aria-expanded="false">
        <span class="pref-sym">${sym}</span>
        <span class="pref-val">${items[current]}</span>
        <i class="ph ph-caret-down"></i>
      </button>
      <div class="pref-menu" role="listbox">
        ${Object.entries(items).map(([k, v]) => `
          <button type="button" class="pref-opt${k === current ? " is-on" : ""}" role="option" data-v="${k}">
            <span>${v}</span>${k === current ? '<i class="ph ph-check"></i>' : ""}
          </button>`).join("")}
      </div>`;

    const btn = el.querySelector(".pref-btn");
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const open = el.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      document.querySelectorAll(".pref.is-open").forEach(o => {
        if (o !== el) { o.classList.remove("is-open"); o.querySelector(".pref-btn").setAttribute("aria-expanded", "false"); }
      });
    });
    el.querySelectorAll(".pref-opt").forEach(o => {
      o.addEventListener("click", () => onPick(o.dataset.v));
    });
    return el;
  }

  function buildPickers() {
    const actions = document.querySelector(".header-actions");
    if (!actions) return;

    const wrap = document.createElement("div");
    wrap.className = "prefs";
    wrap.appendChild(picker("pref-lang", '<i class="ph ph-globe"></i>', LANGS, lang, v => {
      localStorage.setItem(LANG_KEY, v);
      location.reload();
    }));
    const curItems = {};
    Object.keys(CURRENCIES).forEach(k => (curItems[k] = CURRENCIES[k].sym + " " + k));
    wrap.appendChild(picker("pref-cur", CURRENCIES[cur].sym, curItems, cur, v => {
      localStorage.setItem(CUR_KEY, v);
      location.reload();
    }));
    actions.prepend(wrap);

    document.addEventListener("click", () => {
      document.querySelectorAll(".pref.is-open").forEach(o => {
        o.classList.remove("is-open");
        o.querySelector(".pref-btn").setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") document.querySelectorAll(".pref.is-open").forEach(o => o.classList.remove("is-open"));
    });
  }

  applyLang();
  buildPickers();
})();
