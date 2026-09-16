// =====================================================================
//  МИНИ-ИГРА «ТРИ В РЯД» на скинах. Подключается до hero.js.
//  window.initMatch3(container) — рисует игру внутрь контейнера.
// =====================================================================
(function () {
  // Разные типы предметов: перчатки, пистолет, винтовка, снайперка, дробовик, ПП.
  // tint — цвет рамки и подсветки плитки, чтобы виды не путались.
  const KINDS = [
    { img: "images/driver-gloves-snow-leopard.png", tint: "#cfd3dc" },
    { img: "images/desert-eagle-heat-treated.png",  tint: "#e08a4f" },
    { img: "images/ak-47-neon-rider.png",           tint: "#d86fb2" },
    { img: "images/awp-atheris.png",                tint: "#6ec48a" },
    { img: "images/xm1014-irezumi.png",             tint: "#e0c060" },
    { img: "images/mp9-starlight-protector.png",    tint: "#7ea8e6" }
  ];
  const COLS = 8, ROWS = 6;
  const BEST_KEY = "skindrop-match3-best";
  const GIFT_KEY = "skindrop-match3-gift";   // { date: "2026-09-16", name, price }
  const GOAL = 1500;                          // очков для подарка
  const MAX_GIFT_PRICE = 2;                   // потолок цены выпадающего скина, $
  const GIFT_FALLBACK = [
    { name: "P250 | Cassette",  price: "$0.42" },
    { name: "MP9 | Bee-Tron",   price: "$0.96" },
    { name: "Nova | Dark Sigil", price: "$1.34" },
    { name: "Tec-9 | Slag",     price: "$0.61" }
  ];

  const today = () => new Date().toISOString().slice(0, 10);
  const giftState = () => { try { return JSON.parse(localStorage.getItem(GIFT_KEY)) || null; } catch (e) { return null; } };

  // Пул подарков: скины каталога дешевле MAX_GIFT_PRICE
  function giftPool() {
    if (typeof listings !== "undefined" && Array.isArray(listings)) {
      const cheap = listings.filter(p => p.price <= MAX_GIFT_PRICE);
      if (cheap.length) return cheap.map(p => ({
        name:  p.fullName || (p.weapon + " | " + p.name),
        price: (typeof formatPrice === "function" ? formatPrice(p.price) : "$" + p.price),
        img:   p.image,
        href:  "product.html?id=" + encodeURIComponent(p.id)
      }));
    }
    return GIFT_FALLBACK;
  }

  const T = (k, f) => (typeof t === "function" ? t(k, f) : f);

  window.initMatch3 = function (root) {
    root.innerHTML = `
      <div class="m3">
        <div class="m3-head">
          <span class="m3-title">${T("game.title", "Три в ряд")}</span>
          <span class="m3-hint" id="m3-hint">${T("game.hint", "три в ряд и больше")}</span>
          <div class="m3-meta">
            <span class="m3-score">${T("game.score", "Очки")} <b id="m3-score">0</b></span>
            <span class="m3-best">${T("game.best", "Рекорд")} <b id="m3-best">0</b></span>
            <button type="button" class="m3-reset" id="m3-reset">${T("game.reset", "Заново")}</button>
          </div>
        </div>
        <div class="m3-board" id="m3-board"></div>
        <div class="m3-gift" id="m3-gift">
          <div class="m3-gift-bar"><span id="m3-gift-fill"></span></div>
          <div class="m3-gift-row">
            <span class="m3-gift-text" id="m3-gift-text"></span>
            <span class="m3-gift-count" id="m3-gift-count"></span>
          </div>
          <div class="m3-gift-prize" id="m3-gift-prize" hidden>
            <img id="m3-gift-img" alt="">
            <div>
              <span class="m3-gift-label">${T("gift.label", "Ваш подарок")}</span>
              <span class="m3-gift-name" id="m3-gift-name"></span>
            </div>
            <a class="btn btn-primary btn-small" id="m3-gift-link" href="index.html">${T("gift.take", "Забрать")}</a>
          </div>
        </div>
      </div>`;

    const boardEl = root.querySelector("#m3-board");
    const scoreEl = root.querySelector("#m3-score");
    const bestEl  = root.querySelector("#m3-best");
    const hintEl  = root.querySelector("#m3-hint");   // строка событий в шапке

    const giftEl    = root.querySelector("#m3-gift");
    const fillEl    = root.querySelector("#m3-gift-fill");
    const gTextEl   = root.querySelector("#m3-gift-text");
    const gCountEl  = root.querySelector("#m3-gift-count");
    const prizeEl   = root.querySelector("#m3-gift-prize");
    const gImgEl    = root.querySelector("#m3-gift-img");
    const gNameEl   = root.querySelector("#m3-gift-name");
    const gLinkEl   = root.querySelector("#m3-gift-link");

    let grid = [], score = 0, busy = false, sel = null;
    let best = Number(localStorage.getItem(BEST_KEY) || 0);
    bestEl.textContent = best;

    const idx = (r, c) => r * COLS + c;
    const rnd = () => Math.floor(Math.random() * KINDS.length);

    function build() {
      boardEl.innerHTML = "";
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = document.createElement("button");
          cell.type = "button";
          cell.className = "m3-tile";
          cell.dataset.r = r;
          cell.dataset.c = c;
          cell.innerHTML = '<img alt="">';
          boardEl.appendChild(cell);
        }
      }
    }

    function fill() {
      grid = Array.from({ length: ROWS * COLS }, () => rnd());
      // стартовое поле без готовых линий
      let guard = 0;
      while (findMatches().length && guard++ < 200) {
        findMatches().forEach(i => (grid[i] = rnd()));
      }
    }

    function paint(changed) {
      const tiles = boardEl.children;
      for (let i = 0; i < tiles.length; i++) {
        const k = KINDS[grid[i]];
        const img = tiles[i].firstElementChild;
        if (img.getAttribute("src") !== k.img) img.src = k.img;
        tiles[i].style.setProperty("--tint", k.tint);
        tiles[i].classList.toggle("is-sel", sel === i);
        if (changed && changed.has(i)) {
          tiles[i].classList.remove("drop");
          void tiles[i].offsetWidth;
          tiles[i].classList.add("drop");
        }
      }
    }

    function findMatches() {
      const hit = new Set();
      for (let r = 0; r < ROWS; r++) {
        let run = 1;
        for (let c = 1; c <= COLS; c++) {
          const same = c < COLS && grid[idx(r, c)] === grid[idx(r, c - 1)];
          if (same) run++;
          else {
            if (run >= 3) for (let k = 1; k <= run; k++) hit.add(idx(r, c - k));
            run = 1;
          }
        }
      }
      for (let c = 0; c < COLS; c++) {
        let run = 1;
        for (let r = 1; r <= ROWS; r++) {
          const same = r < ROWS && grid[idx(r, c)] === grid[idx(r - 1, c)];
          if (same) run++;
          else {
            if (run >= 3) for (let k = 1; k <= run; k++) hit.add(idx(r - k, c));
            run = 1;
          }
        }
      }
      return [...hit];
    }

    function tap(i) {
      if (busy) return;
      if (sel === null) { sel = i; paint(); return; }
      if (sel === i) { sel = null; paint(); return; }

      const sr = Math.floor(sel / COLS), sc = sel % COLS;
      const r = Math.floor(i / COLS), c = i % COLS;
      if (Math.abs(sr - r) + Math.abs(sc - c) !== 1) { sel = i; paint(); return; }

      const a = sel;
      sel = null;
      tryMove(a, i);
    }

    // Обмен двух соседних клеток: линия — считаем, иначе откат с тряской
    function tryMove(a, b) {
      if (busy) return;
      swap(a, b);
      if (!findMatches().length) {
        swap(a, b);
        sel = null;
        paint();
        shake(a); shake(b);
        return;
      }
      sel = null;
      paint(new Set([a, b]));
      resolve(1);
    }

    // ---- Управление: тап по двум клеткам, свайп и перетаскивание ----
    const DRAG_MIN = 14;                  // px, после этого жест считается свайпом
    let drag = null;

    function cellFrom(e) {
      const el = e.target.closest(".m3-tile");
      return el ? [...boardEl.children].indexOf(el) : -1;
    }

    boardEl.addEventListener("pointerdown", e => {
      if (busy) return;
      const i = cellFrom(e);
      if (i < 0) return;
      drag = { i, x: e.clientX, y: e.clientY, moved: false };
      boardEl.children[i].classList.add("is-drag");
      boardEl.setPointerCapture(e.pointerId);
    });

    boardEl.addEventListener("pointermove", e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      const dist = Math.hypot(dx, dy);
      const tile = boardEl.children[drag.i];

      if (dist < DRAG_MIN) {
        const k = 0.5;
        tile.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
        return;
      }

      // направление свайпа → соседняя клетка
      const r = Math.floor(drag.i / COLS), c = drag.i % COLS;
      let nr = r, nc = c;
      if (Math.abs(dx) > Math.abs(dy)) nc += dx > 0 ? 1 : -1;
      else nr += dy > 0 ? 1 : -1;

      drag.moved = true;
      tile.style.transform = "";
      tile.classList.remove("is-drag");
      const from = drag.i;
      drag = null;

      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) { shake(from); return; }
      tryMove(from, idx(nr, nc));
    });

    function endDrag(e) {
      if (!drag) return;
      const tile = boardEl.children[drag.i];
      tile.style.transform = "";
      tile.classList.remove("is-drag");
      const { i, moved } = drag;
      drag = null;
      if (!moved) tap(i);            // короткое нажатие — обычный тап
    }
    boardEl.addEventListener("pointerup", endDrag);
    boardEl.addEventListener("pointercancel", endDrag);
    boardEl.addEventListener("dragstart", e => e.preventDefault());

    function swap(a, b) { const t = grid[a]; grid[a] = grid[b]; grid[b] = t; }

    function shake(i) {
      const el = boardEl.children[i];
      el.classList.remove("bad");
      void el.offsetWidth;
      el.classList.add("bad");
    }

    function resolve(chain) {
      const hits = findMatches();
      if (!hits.length) { busy = false; return; }
      busy = true;

      hits.forEach(i => boardEl.children[i].classList.add("pop"));
      const gain = hits.length * 10 * chain;
      addScore(gain);
      hintEl.textContent = chain > 1
        ? `Каскад ×${chain} · +${gain}`
        : `Собрано ${hits.length} · +${gain}`;

      setTimeout(() => {
        hits.forEach(i => boardEl.children[i].classList.remove("pop"));
        const changed = new Set();
        // гравитация по столбцам
        for (let c = 0; c < COLS; c++) {
          const col = [];
          for (let r = ROWS - 1; r >= 0; r--) {
            if (!hits.includes(idx(r, c))) col.push(grid[idx(r, c)]);
          }
          while (col.length < ROWS) col.push(rnd());
          for (let r = ROWS - 1, k = 0; r >= 0; r--, k++) {
            if (grid[idx(r, c)] !== col[k]) changed.add(idx(r, c));
            grid[idx(r, c)] = col[k];
          }
        }
        paint(changed);
        setTimeout(() => resolve(chain + 1), 240);
      }, 220);
    }

    function renderGift() {
      const st = giftState();
      const claimed = st && st.date === today();
      const pct = Math.min(100, Math.round((score / GOAL) * 100));
      fillEl.style.width = pct + "%";
      giftEl.classList.toggle("is-done", claimed);

      if (claimed) {
        gTextEl.textContent = T("gift.done", "Подарок за сегодня получен — следующий завтра");
        gCountEl.textContent = "+1 скин";
        prizeEl.hidden = false;
        if (st.img) gImgEl.src = st.img;
        gImgEl.hidden = !st.img;
        gNameEl.textContent = st.name + (st.price ? " · " + st.price : "");
        gLinkEl.href = st.href || "index.html";
        return;
      }
      prizeEl.hidden = true;
      gTextEl.textContent = T("gift.goal", GOAL + " очков за сутки — случайный скин в подарок");
      gCountEl.textContent = Math.min(score, GOAL) + " / " + GOAL;
    }

    function tryGift() {
      const st = giftState();
      if (score < GOAL || (st && st.date === today())) return;
      const pool = giftPool();
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const rec = { date: today(), name: pick.name, price: pick.price, img: pick.img, href: pick.href };
      localStorage.setItem(GIFT_KEY, JSON.stringify(rec));
      renderGift();
      giftEl.classList.remove("win");
      void giftEl.offsetWidth;
      giftEl.classList.add("win");
      hintEl.textContent = "подарок ваш!";
    }

    function addScore(n) {
      score += n;
      scoreEl.textContent = score;
      scoreEl.classList.remove("bump");
      void scoreEl.offsetWidth;
      scoreEl.classList.add("bump");
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem(BEST_KEY, String(best));
      }
      renderGift();
      tryGift();
    }

    function reset() {
      score = 0; sel = null; busy = false;
      scoreEl.textContent = "0";
      hintEl.textContent = T("game.hint", "три в ряд и больше");
      fill();
      paint(new Set(grid.map((_, i) => i)));
      renderGift();
    }

    root.querySelector("#m3-reset").addEventListener("click", reset);
    build();
    fill();
    paint();
    renderGift();
  };
})();
