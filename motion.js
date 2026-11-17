// Motion layer (test branch): small, interruptible details on top of the page. Nothing here changes data or layout.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const list = document.querySelector("#list");
  // results settle in: only cards that are new and on screen, staggered
  let seen = new WeakSet();
  const settle = () => {
    let i = 0;
    for (const li of list.querySelectorAll(".card")) {
      if (seen.has(li)) continue;
      seen.add(li);
      if (i > 14) continue;
      const r = li.getBoundingClientRect();
      if (r.top > innerHeight) continue;
      li.style.setProperty("--i", i++);
      li.classList.add("enter");
      li.addEventListener("animationend", () => li.classList.remove("enter"), { once: true });
    }
  };
  new MutationObserver(settle).observe(list, { childList: true });

  // heart / + pop when switched on
  document.addEventListener("click", (e) => {
    const b = e.target.closest('.acts button[data-a="fav"]');   // the list + rotates into × instead
    if (!b) return;
    requestAnimationFrame(() => {
      if (b.getAttribute("aria-pressed") === "true") { b.classList.remove("popping"); void b.offsetWidth; b.classList.add("popping"); }
    });
  });

  // a hidden card folds away (called by profile.js instead of li.remove())
  window.foldAway = (li) => {
    if (reduce.matches) { li.remove(); return; }
    li.style.maxHeight = li.offsetHeight + "px";
    li.classList.add("leaving");
    requestAnimationFrame(() => requestAnimationFrame(() => li.classList.add("gone-now")));
    setTimeout(() => li.remove(), 380);
  };

  // rows ⇄ grid: morph the cards on screen to their new place
  window.morphLayout = (change) => {
    if (!document.startViewTransition || reduce.matches) { change(); return; }
    const cards = [...list.querySelectorAll(".card")].filter((c) => { const r = c.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).slice(0, 24);
    cards.forEach((c, i) => (c.style.viewTransitionName = "card-" + i));
    const t = document.startViewTransition(change);
    t.finished.finally(() => cards.forEach((c) => (c.style.viewTransitionName = "")));
  };

  // settings: let the closing animation play before the dialog leaves
  const dlg = document.querySelector("#settings");
  if (dlg) dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });   // tap outside closes
})();
