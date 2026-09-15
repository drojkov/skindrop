// =====================================================================
//  ОБЩАЯ ЧАСТЬ: шапка (пользователь), корзина, окно входа.
//  Подключается на index.html и product.html после products.js.
//  HTML корзины и окна входа вставляет сам — чтобы не копировать в каждую страницу.
// =====================================================================

// ---------- Вставляем общую разметку в конец body ----------
document.body.insertAdjacentHTML("beforeend", `
  <div class="overlay" id="overlay"></div>

  <aside class="cart-drawer" id="cart-drawer">
    <div class="drawer-header">
      <h2>Корзина</h2>
      <button class="icon-btn" id="cart-close" aria-label="Закрыть"><i class="ph ph-x"></i></button>
    </div>
    <div class="cart-items" id="cart-items"></div>
    <div class="cart-summary">
      <div class="cart-save" id="cart-save" hidden><span>Дешевле Steam на</span><b id="cart-save-value">$0.00</b></div>
      <button class="link-btn" id="cart-clear">Очистить</button>
      <div class="cart-summary-total">
        <span>Итого</span>
        <span class="cart-total" id="cart-total">$0.00</span>
      </div>
    </div>
    <a href="checkout.html" class="btn btn-primary btn-block" id="checkout-btn"><i class="ph ph-arrow-right"></i>Перейти к оплате</a>
  </aside>

  <dialog class="auth-modal" id="auth-modal">
    <form class="auth-form" id="auth-form">
      <div class="drawer-header">
        <h2 id="auth-title">Вход</h2>
        <button type="button" class="icon-btn" id="auth-close" aria-label="Закрыть"><i class="ph ph-x"></i></button>
      </div>
      <label>Никнейм
        <input type="text" name="nickname" required minlength="3" placeholder="s1mple">
      </label>
      <label id="email-label" hidden>Email
        <input type="email" name="email" placeholder="you@example.com">
      </label>
      <label>Пароль
        <input type="password" name="password" required minlength="4">
      </label>
      <p class="form-error" id="auth-error" hidden></p>
      <button type="submit" class="btn btn-primary btn-block" id="auth-submit">Войти</button>
      <p class="auth-switch">
        <span id="auth-switch-text">Нет аккаунта?</span>
        <button type="button" class="link-btn" id="auth-switch">Зарегистрироваться</button>
      </p>
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
        <span>Пока пусто. Выберите лот в каталоге — добавится сюда.</span>
        <a href="index.html" class="btn btn-ghost btn-small">В каталог</a>
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
      </div>
      <span class="cart-item-price">${formatPrice(p.price)}</span>
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
//  ВХОД / РЕГИСТРАЦИЯ (фиктивные, всё в localStorage)
// =====================================================================
let user  = JSON.parse(localStorage.getItem("user"))  || null;
let users = JSON.parse(localStorage.getItem("users")) || {};
let authMode = "login";

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

function setAuthMode(mode) {
  authMode = mode;
  const isLogin = mode === "login";
  document.getElementById("auth-title").textContent       = isLogin ? "Вход" : "Регистрация";
  document.getElementById("auth-submit").textContent      = isLogin ? "Войти" : "Создать аккаунт";
  document.getElementById("auth-switch-text").textContent = isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?";
  document.getElementById("auth-switch").textContent      = isLogin ? "Зарегистрироваться" : "Войти";
  const emailLabel = document.getElementById("email-label");
  emailLabel.hidden = isLogin;
  emailLabel.querySelector("input").required = !isLogin;
  authError.hidden = true;
}

function openAuth(mode = "login") {
  setAuthMode(mode);
  authModal.showModal();
}

authForm.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(authForm);
  const nickname = data.get("nickname").trim();
  const password = data.get("password");

  if (authMode === "register") {
    if (users[nickname]) { showError("Такой никнейм уже занят."); return; }
    users[nickname] = { password, email: data.get("email") };
    localStorage.setItem("users", JSON.stringify(users));
  } else if (!users[nickname] || users[nickname].password !== password) {
    showError("Неверный никнейм или пароль."); return;
  }

  user = { nickname, email: users[nickname].email };
  localStorage.setItem("user", JSON.stringify(user));
  renderUser();
  authForm.reset();
  authModal.close();
});

function showError(text) { authError.textContent = text; authError.hidden = false; }

document.getElementById("auth-switch").addEventListener("click", () => setAuthMode(authMode === "login" ? "register" : "login"));
document.getElementById("auth-close").addEventListener("click", () => authModal.close());
loginBtn.addEventListener("click", () => openAuth("login"));
logoutBtn.addEventListener("click", () => { user = null; localStorage.removeItem("user"); renderUser(); });
authModal.addEventListener("click", e => { if (e.target === authModal) authModal.close(); });

// Чекаут без входа → окно входа
checkoutBtn.addEventListener("click", e => {
  if (user === null) { e.preventDefault(); closeCart(); openAuth("login"); }
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
