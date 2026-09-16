// =====================================================================
//  3D-НАКЛОН КАРТОЧЕК. Работает на всём, где есть [data-tilt].
//  Отключается при prefers-reduced-motion и на тач-устройствах.
// =====================================================================
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (matchMedia("(hover: none)").matches) return;

  const MAX = 7;          // градусов
  const SHIFT = 10;       // px параллакса предмета

  function bind(el) {
    if (el.dataset.tiltOn) return;
    el.dataset.tiltOn = "1";

    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0, active = false;

    function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.setProperty("--tx", (cx * MAX).toFixed(2) + "deg");
      el.style.setProperty("--ty", (-cy * MAX).toFixed(2) + "deg");
      el.style.setProperty("--px", (cx * SHIFT).toFixed(1) + "px");
      el.style.setProperty("--py", (cy * SHIFT * 0.6).toFixed(1) + "px");
      el.style.setProperty("--gx", (50 + cx * 46).toFixed(1) + "%");
      el.style.setProperty("--gy", (50 + cy * 46).toFixed(1) + "%");
      raf = (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 || active)
        ? requestAnimationFrame(loop) : 0;
    }

    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      active = true;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    el.addEventListener("pointerleave", () => {
      tx = 0; ty = 0; active = false;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  function scan() { document.querySelectorAll("[data-tilt]").forEach(bind); }

  scan();
  // каталог перерисовывается фильтрами — подхватываем новые карточки
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
