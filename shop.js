// =====================================================================
//  ОБЩАЯ ЧАСТЬ: шапка (пользователь), корзина, окно входа.
//  Подключается на index.html и product.html после products.js.
//  HTML корзины и окна входа вставляет сам — чтобы не копировать в каждую страницу.
// =====================================================================

const STEAM_MARK = `<svg class="steam-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.98 2C6.5 2 2.02 6.16 1.54 11.47l5.4 2.23a3.06 3.06 0 0 1 1.74-.54h.15l2.4-3.48v-.05a4.08 4.08 0 1 1 4.08 4.1h-.1l-3.42 2.44v.13a3.07 3.07 0 0 1-6.07.6L1.9 15.1A10.46 10.46 0 0 0 11.98 22.5C17.78 22.5 22.5 17.8 22.5 12S17.78 2 11.98 2Zm-4.4 15.53.6.25a2.31 2.31 0 1 0 1.27-3.02l.72.3a1.7 1.7 0 1 1-1.3 3.13l-1.29-.66Zm10.5-9.85a2.73 2.73 0 1 0-2.73 2.74 2.73 2.73 0 0 0 2.73-2.74Zm-4.77 0a2.05 2.05 0 1 1 2.05 2.06 2.05 2.05 0 0 1-2.05-2.06Z"/></svg>`;

// ---------- Вставляем общую разметку в конец body ----------
document.body.insertAdjacentHTML("beforeend", `
  <div class="overlay" id="overlay"></div>

  <aside class="cart-drawer" id="cart-drawer">
    <div class="drawer-header">
      <h2>${typeof t === "function" ? t("cart.title", "Корзина") : "Корзина"}</h2>
      <button class="icon-btn" id="cart-close" aria-label="Закрыть"><i class="ph ph-x"></i></button>
    </div>
    <div class="cart-items" id="cart-items"></div>
    <div class="cart-summary">
      <div class="cart-save" id="cart-save" hidden><span>${typeof t === "function" ? t("cart.save", "Дешевле Steam на") : "Дешевле Steam на"}</span><b id="cart-save-value">$0.00</b></div>
      <button class="link-btn" id="cart-clear">${typeof t === "function" ? t("cart.clear", "Очистить") : "Очистить"}</button>
      <div class="cart-summary-total">
        <span>${typeof t === "function" ? t("cart.total", "Итого") : "Итого"}</span>
        <span class="cart-total" id="cart-total">$0.00</span>
      </div>
    </div>
    <a href="checkout.html" class="btn btn-primary btn-block" id="checkout-btn"><i class="ph ph-arrow-right"></i>${typeof t === "function" ? t("cart.checkout", "Перейти к оплате") : "Перейти к оплате"}</a>
  </aside>

  <dialog class="auth-modal" id="auth-modal">
    <form class="auth-form" id="auth-form">
      <div class="drawer-header">
        <h2 id="auth-title">Вход через Steam</h2>
        <button type="button" class="icon-btn" id="auth-close" aria-label="Закрыть"><i class="ph ph-x"></i></button>
      </div>
      <div class="steam-auth">
        <svg class="steam-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.98 2C6.5 2 2.02 6.16 1.54 11.47l5.4 2.23a3.06 3.06 0 0 1 1.74-.54h.15l2.4-3.48v-.05a4.08 4.08 0 1 1 4.08 4.1h-.1l-3.42 2.44v.13a3.07 3.07 0 0 1-6.07.6L1.9 15.1A10.46 10.46 0 0 0 11.98 22.5C17.78 22.5 22.5 17.8 22.5 12S17.78 2 11.98 2Zm-4.4 15.53.6.25a2.31 2.31 0 1 0 1.27-3.02l.72.3a1.7 1.7 0 1 1-1.3 3.13l-1.29-.66Zm10.5-9.85a2.73 2.73 0 1 0-2.73 2.74 2.73 2.73 0 0 0 2.73-2.74Zm-4.77 0a2.05 2.05 0 1 1 2.05 2.06 2.05 2.05 0 0 1-2.05-2.06Z"/></svg>
        <p>Вы авторизуетесь на стороне Steam. Мы не видим ваш пароль — только ник, аватар и Steam ID.</p>
      </div>
      <label>Ваш ник в Steam
        <input type="text" name="nickname" required minlength="3" placeholder="s1mple" autocomplete="off">
      </label>
      <p class="form-error" id="auth-error" hidden></p>
      <button type="submit" class="btn btn-steam btn-block" id="auth-submit"><svg class="steam-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.98 2C6.5 2 2.02 6.16 1.54 11.47l5.4 2.23a3.06 3.06 0 0 1 1.74-.54h.15l2.4-3.48v-.05a4.08 4.08 0 1 1 4.08 4.1h-.1l-3.42 2.44v.13a3.07 3.07 0 0 1-6.07.6L1.9 15.1A10.46 10.46 0 0 0 11.98 22.5C17.78 22.5 22.5 17.8 22.5 12S17.78 2 11.98 2Zm-4.4 15.53.6.25a2.31 2.31 0 1 0 1.27-3.02l.72.3a1.7 1.7 0 1 1-1.3 3.13l-1.29-.66Zm10.5-9.85a2.73 2.73 0 1 0-2.73 2.74 2.73 2.73 0 0 0 2.73-2.74Zm-4.77 0a2.05 2.05 0 1 1 2.05 2.06 2.05 2.05 0 0 1-2.05-2.06Z"/></svg>Продолжить в Steam</button>
      <p class="form-note">Демо: перехода на steamcommunity.com здесь нет.</p>
    </form>
  </dialog>
`);

// =====================================================================
//  КОРЗИНА
// =====================================================================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const drawerEl    = document.getElementById("cart-drawer");
const overlayEl   = document.getElementById("overlay");
const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id) {
  if (cart.includes(id)) { openCart(); return; }
  cart.push(id);
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(x => x !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const items = cart.map(findListing).filter(Boolean);   // filter(Boolean) выкидывает несуществующие id
  const total = items.reduce((s, p) => s + p.price, 0);

  cartCountEl.textContent = items.length;
  cartCountEl.hidden = items.length === 0;
  cartTotalEl.textContent = formatPrice(total);
  checkoutBtn.classList.toggle("disabled", items.length === 0);

  if (items.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <i class="ph ph-shopping-cart-simple"></i>
        <span>${typeof t === "function" ? t("cart.empty", "Пока пусто. Выберите лот в каталоге — добавится сюда.") : ""}</span>
        <a href="index.html" class="btn btn-ghost btn-small">${typeof t === "function" ? t("cart.toCatalog", "В каталог") : "В каталог"}</a>
      </div>`;
    document.getElementById("cart-save").hidden = true;
    return;
  }

  // экономия против цены Steam (у нас цены на 18% ниже)
  const saveEl = document.getElementById("cart-save");
  saveEl.hidden = false;
  document.getElementById("cart-save-value").textContent = "−" + formatPrice(total / 0.82 - total);

  cartItemsEl.innerHTML = items.map(p => `
    <div class="cart-item" style="--rarity: ${RARITIES[p.rarity].color}">
      <div class="cart-item-info">
        <div class="cart-item-name">${p.fullName}</div>
        <div class="cart-item-wear">${WEARS[p.wear].label} · float ${p.float.toFixed(4)}</div>
        ${typeof floatScaleHtml === "function" ? floatScaleHtml(p) : ""}
      </div>
      <span class="cart-item-prices">
        <span class="cart-item-price">${formatPrice(p.price)}</span>
        <span class="cart-item-steam">${formatPrice(p.price / 0.82)}</span>
      </span>
      <button class="icon-btn" data-remove="${p.id}" aria-label="Убрать"><i class="ph ph-trash"></i></button>
    </div>
  `).join("");
}

function openCart()  { drawerEl.classList.add("open");    overlayEl.classList.add("open"); }
function closeCart() { drawerEl.classList.remove("open"); overlayEl.classList.remove("open"); }

// Клик по любой кнопке data-add на странице → в корзину
document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);

  const rm = e.target.closest("[data-remove]");
  if (rm) removeFromCart(rm.dataset.remove);
});

document.getElementById("cart-btn").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
document.getElementById("cart-clear").addEventListener("click", () => { cart = []; saveCart(); renderCart(); });
overlayEl.addEventListener("click", closeCart);

// =====================================================================
//  ВХОД ЧЕРЕЗ STEAM (имитация, всё в localStorage)
// =====================================================================
let user  = JSON.parse(localStorage.getItem("user"))  || null;

const authModal  = document.getElementById("auth-modal");
const authForm   = document.getElementById("auth-form");
const authError  = document.getElementById("auth-error");
const loginBtn   = document.getElementById("login-btn");
const logoutBtn  = document.getElementById("logout-btn");
const userNameEl = document.getElementById("user-name");

function renderUser() {
  const on = user !== null;
  loginBtn.hidden = on;
  logoutBtn.hidden = !on;
  userNameEl.hidden = !on;
  if (on) userNameEl.textContent = user.nickname;
}

function openAuth() {
  authError.hidden = true;
  authModal.showModal();
}

authForm.addEventListener("submit", e => {
  e.preventDefault();
  const nickname = new FormData(authForm).get("nickname").trim();
  if (nickname.length < 3) { showError("Ник в Steam — минимум 3 символа."); return; }

  const submit = document.getElementById("auth-submit");
  submit.disabled = true;
  submit.innerHTML = '<i class="ph ph-circle-notch spin"></i>Ждём подтверждение в Steam…';

  setTimeout(() => {
    user = { nickname };
    localStorage.setItem("user", JSON.stringify(user));
    renderUser();
    authForm.reset();
    authModal.close();
    submit.disabled = false;
    submit.innerHTML = STEAM_MARK + "Продолжить в Steam";
  }, 900);
});

function showError(text) { authError.textContent = text; authError.hidden = false; }

document.getElementById("auth-close").addEventListener("click", () => authModal.close());
loginBtn.addEventListener("click", () => openAuth());
logoutBtn.addEventListener("click", () => { user = null; localStorage.removeItem("user"); renderUser(); });
authModal.addEventListener("click", e => { if (e.target === authModal) authModal.close(); });

// Чекаут без входа → окно входа
checkoutBtn.addEventListener("click", e => {
  if (user === null) { e.preventDefault(); closeCart(); openAuth(); }
});

// =====================================================================
//  ПОИСК В ШАПКЕ: на главной фильтрует каталог, на других страницах ведёт на главную
// =====================================================================
const searchInput = document.getElementById("search");
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !document.getElementById("catalog")) {
    window.location.href = "index.html?q=" + encodeURIComponent(searchInput.value);
  }
});

renderCart();
renderUser();
