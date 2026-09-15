// =====================================================================
//  ЧЕКАУТ
// =====================================================================
const cart = JSON.parse(localStorage.getItem("cart")) || [];
const user = JSON.parse(localStorage.getItem("user")) || null;

if (user === null || cart.length === 0) {
  window.location.href = "index.html";
}

if (user) {
  document.getElementById("field-nickname").value = user.nickname;
  document.getElementById("field-email").value = user.email || "";
}

const items = cart.map(findListing).filter(Boolean);
const total = items.reduce((s, p) => s + p.price, 0);

document.getElementById("order-items").innerHTML = items.map(p => `
  <div class="cart-item" style="--rarity: ${RARITIES[p.rarity].color}">
    <div class="cart-item-info">
      <div class="cart-item-name">${p.fullName}</div>
      <div class="cart-item-wear">${WEARS[p.wear].label} · float ${p.float.toFixed(4)}</div>
    </div>
    <span class="cart-item-price">${formatPrice(p.price)}</span>
  </div>
`).join("");
document.getElementById("order-total").textContent = formatPrice(total);
document.getElementById("order-count").textContent = items.length;

document.getElementById("checkout-form").addEventListener("submit", e => {
  e.preventDefault();
  document.getElementById("order-number").textContent = "SD-" + Math.floor(10000 + Math.random() * 90000);
  localStorage.removeItem("cart");
  document.getElementById("checkout-form-section").hidden = true;
  document.getElementById("order-done").hidden = false;
  window.scrollTo(0, 0);
});
