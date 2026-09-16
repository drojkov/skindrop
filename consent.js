// =====================================================================
//  СОГЛАСИЕ НА COOKIE. Плашка снизу при первом входе.
//  Решение хранится в localStorage: skindrop-consent.
//  window.cookieConsent() — текущее состояние, window.openCookieSettings() — открыть настройки.
// =====================================================================
(function () {
  const KEY = "skindrop-consent";
  const VERSION = 1;

  const T = (k, f) => (typeof t === "function" ? t(k, f) : f);

  function read() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      return v && v.version === VERSION ? v : null;
    } catch (e) { return null; }
  }

  function write(analytics, marketing) {
    const v = {
      version: VERSION,
      essential: true,
      analytics: !!analytics,
      marketing: !!marketing,
      date: new Date().toISOString()
    };
    localStorage.setItem(KEY, JSON.stringify(v));
    window.COOKIE_CONSENT = v;
    document.dispatchEvent(new CustomEvent("cookieconsent", { detail: v }));
    return v;
  }

  window.cookieConsent = read;
  window.COOKIE_CONSENT = read();

  function render() {
    const cur = read() || { analytics: false, marketing: false };
    const el = document.createElement("section");
    el.className = "cc";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", T("cc.title", "Файлы cookie"));
    el.innerHTML = `
      <div class="cc-inner">
        <div class="cc-main">
          <h2 class="cc-title">${T("cc.title", "Файлы cookie")}</h2>
          <p class="cc-text">
            ${T("cc.text", "Необходимые cookie нужны для входа через Steam, корзины и защиты от мошенничества — без них сайт не работает. Аналитику и маркетинг включаем только с вашего согласия. Подробности — в")}
            <a href="cookies.html">${T("cc.link", "политике cookie")}</a>.
          </p>
          <div class="cc-groups" id="cc-groups" hidden>
            <label class="cc-group">
              <input type="checkbox" checked disabled>
              <span><b>${T("cc.ess", "Необходимые")}</b>${T("cc.essSub", "Сессия, вход, корзина, антифрод. Отключить нельзя.")}</span>
            </label>
            <label class="cc-group">
              <input type="checkbox" id="cc-analytics"${cur.analytics ? " checked" : ""}>
              <span><b>${T("cc.ana", "Аналитика")}</b>${T("cc.anaSub", "Обезличенная статистика посещений и ошибок.")}</span>
            </label>
            <label class="cc-group">
              <input type="checkbox" id="cc-marketing"${cur.marketing ? " checked" : ""}>
              <span><b>${T("cc.mkt", "Маркетинг")}</b>${T("cc.mktSub", "Оценка эффективности рекламы и персональные предложения.")}</span>
            </label>
          </div>
        </div>
        <div class="cc-actions">
          <button type="button" class="btn btn-primary" id="cc-all">${T("cc.all", "Принять все")}</button>
          <button type="button" class="btn btn-ghost" id="cc-ess">${T("cc.only", "Только необходимые")}</button>
          <button type="button" class="link-btn" id="cc-cfg">${T("cc.cfg", "Настроить")}</button>
          <button type="button" class="btn btn-primary" id="cc-save" hidden>${T("cc.save", "Сохранить выбор")}</button>
        </div>
      </div>`;
    document.body.appendChild(el);

    const groups = el.querySelector("#cc-groups");
    const close = () => { el.classList.remove("is-in"); setTimeout(() => el.remove(), 320); };

    el.querySelector("#cc-all").addEventListener("click", () => { write(true, true); close(); });
    el.querySelector("#cc-ess").addEventListener("click", () => { write(false, false); close(); });
    el.querySelector("#cc-cfg").addEventListener("click", e => {
      groups.hidden = false;
      e.target.hidden = true;
      el.querySelector("#cc-save").hidden = false;
      el.querySelector("#cc-all").textContent = T("cc.all", "Принять все");
    });
    el.querySelector("#cc-save").addEventListener("click", () => {
      write(el.querySelector("#cc-analytics").checked, el.querySelector("#cc-marketing").checked);
      close();
    });

    requestAnimationFrame(() => el.classList.add("is-in"));
    return el;
  }

  window.openCookieSettings = function () {
    document.querySelector(".cc")?.remove();
    const el = render();
    el.querySelector("#cc-cfg").click();
  };

  if (!read()) render();
})();
