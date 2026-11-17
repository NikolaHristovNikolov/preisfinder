"use strict";
// Personal profile: hidden products/brands/categories, favourites, shopping list.
// Stored in this browser (localStorage). Optional sync between devices through a PRIVATE GitHub Gist:
// each device stores its own GitHub token (scope "gist" only); nothing personal is in the repository.

const PROFILE_FILE = "preisfinder-profile.json";
const MAPS = ["fav", "list", "hp", "hb", "hc", "pref"];  // hp/hb/hc = hidden product / brand / category; pref = interests
let P = loadProfile();

function loadProfile() {
  let p = null;
  try { p = JSON.parse(localStorage.getItem("pf.profile")); } catch (e) {}
  p = p && typeof p === "object" ? p : {};
  for (const m of MAPS) p[m] = p[m] || {};
  return p;
}
function saveProfile(push = true) {
  try { localStorage.setItem("pf.profile", JSON.stringify(P)); } catch (e) {}
  updateListCount();
  if (push) scheduleSync();
}
const liveEntries = (m) => Object.entries(P[m]).filter(([, v]) => !v.del);
const has = (m, k) => !!(P[m][k] && !P[m][k].del);
function setEntry(m, k, val) { P[m][k] = val ? { ...val, t: Date.now() } : { del: 1, t: Date.now() }; saveProfile(); }

const isFav = (k) => has("fav", k);
const inShopList = (k) => has("list", k);
const brandKey = (b) => norm(b || "");
const catKey = (it) => it.s + "|" + (it.c || "");
let showHidden = false;
function isHidden(it) {
  if (showHidden) return false;
  return has("hp", keyOf(it)) || (it.b && has("hb", brandKey(it.b))) || (it.c && has("hc", catKey(it)));
}
const snap = (it) => ({ n: it.ne || it.n, s: it.s, q: it.q || "", p: it.p, up: it.up, uu: it.uu, url: it.url || "", img: it.img || "",
  pr: it.o != null ? 1 : 0 });   // pr: added while on promotion
// a list item still counts if the shop still lists it and, if it was added for a promotion, the promotion still runs
function listState(k, v) {
  const it = current(k);
  if (!it || it.gone) return { it, live: false, why: t("notListed") };
  if (v.pr && it.o == null) return { it, live: false, why: t("promoEnded") };
  return { it, live: true };
}

// ---------------------------------------------------------------- card buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-a]");
  if (!btn) return;
  const li = btn.closest("[data-i]");
  const it = li && cardItems[+li.dataset.i];
  const a = btn.dataset.a;
  if (a === "fav" || a === "list") {
    if (!it) return;
    const k = keyOf(it), m = a === "fav" ? "fav" : "list";
    setEntry(m, k, has(m, k) ? null : snap(it));
    btn.setAttribute("aria-pressed", has(m, k));
    if (m === "list") { const lbl = has(m, k) ? t("removeList") : t("addList"); btn.title = lbl; btn.setAttribute("aria-label", lbl); }
    if (view === "list") renderListView();
  } else if (a === "hide" && it) {
    const menu = li.querySelector(".hidemenu");
    if (menu) { menu.remove(); return; }
    li.insertAdjacentHTML("beforeend", `<div class="hidemenu"><span>${t("hide")}</span>
      <button type="button" data-a="hp">${t("thisProduct")}</button>
      ${it.b ? `<button type="button" data-a="hb">${t("brand")} ${esc(it.b)}</button>` : ""}
      ${it.c ? `<button type="button" data-a="hc">${esc(t("allAt", { c: it.c, s: storeOf(it.s).label }))}</button>` : ""}</div>`);
  } else if ((a === "hp" || a === "hb" || a === "hc") && it) {
    const k = a === "hp" ? keyOf(it) : a === "hb" ? brandKey(it.b) : catKey(it);
    setEntry(a, k, { label: a === "hp" ? it.ne || it.n : a === "hb" ? it.b : `${it.c} (${storeOf(it.s).label})` });
    (window.foldAway || ((x) => x.remove()))(li);
  } else if (a === "lvl") {
    setEntry("pref", btn.dataset.g, { v: btn.dataset.v });
    for (const b of btn.parentElement.children) b.setAttribute("aria-pressed", b === btn);
    if (btn.dataset.g.startsWith("shop:")) shopPrefsChanged();
    else if (view !== "list" && !$("#q").value.trim()) showDeals();
  } else if (a === "info") {
    const open = btn.getAttribute("aria-expanded") === "true";
    closePops();
    if (!open) btn.setAttribute("aria-expanded", "true");
  } else if (a === "share-list" || a === "copy-list") {
    const text = listText();
    if (a === "share-list" && navigator.share) navigator.share({ title: t("shoppingList"), text }).catch(() => {});
    else navigator.clipboard.writeText(text).then(() => { btn.textContent = t("copied"); }).catch(() => {});
  } else if (a === "lang") {
    setLang(btn.dataset.l);
    renderSettings();
    if (typeof renderChips === "function") { renderChips(); if (view === "list") renderListView(); else search(); }
  } else if (a === "unhide") {
    setEntry(btn.dataset.m, btn.dataset.k, null);
    renderSettings();
  } else if (a === "tick") {
    const k = btn.dataset.k, e2 = P.list[k];
    if (e2 && !e2.del) { e2.done = !e2.done; e2.t = Date.now(); saveProfile(); renderListView(); }
  } else if (a === "rm") {
    setEntry(btn.dataset.m, btn.dataset.k, null); renderListView();
  } else if (a === "addfav") {
    const f = P.fav[btn.dataset.k];
    if (f && !f.del) { setEntry("list", btn.dataset.k, { ...f }); renderListView(); }
  } else if (a === "clear-done") {
    for (const [k, v] of liveEntries("list")) if (v.done) P.list[k] = { del: 1, t: Date.now() };
    saveProfile(); renderListView();
  }
});

// ---------------------------------------------------------------- views: search / deals / list
let view = "search";
function setView(v) {
  view = v;
  document.body.dataset.mode = v;
  for (const b of document.querySelectorAll("nav [data-view]")) b.setAttribute("aria-current", b.dataset.view === v);
  if (v === "list") renderListView(); else { $("#lv").hidden = true; $("#results").hidden = false; search(); }
}
function current(k, saved) {
  const it = all.find((x) => keyOf(x) === k);
  return it || null;
}

function renderListView() {
  $("#results").hidden = true;
  const box = $("#lv");
  box.hidden = false;
  const byStore = new Map();
  for (const [k, v] of liveEntries("list")) {
    const st = listState(k, v);
    const row = { k, v, ...st, p: st.it && !st.it.gone ? st.it.p : v.p, s: v.s };
    (byStore.get(row.s) || byStore.set(row.s, []).get(row.s)).push(row);
  }
  let html = `<h2>${t("shoppingList")}</h2>`;
  if (!byStore.size) html += `<p class="empty">${t("listEmpty")}</p>`;
  else html += `<div class="row share"><button type="button" class="textbtn" data-a="share-list">${t("shareList")}</button>
    <button type="button" class="textbtn" data-a="copy-list">${t("copyList")}</button></div>
    <p class="note">${t("shareTip")}</p>`;
  for (const [s, rows] of byStore) {
    rows.sort((x, y) => (y.live - x.live));                       // what still counts first, ended ones greyed below
    const total = rows.filter((r) => r.live && !r.v.done).reduce((a, r) => a + (r.p || 0), 0);
    html += `<section class="ls"><header>${wordmark(s)}<span class="tot">${fmt(total)}</span></header><ul>` +
      rows.map((r) => {
        const promo = r.live && r.it.o != null;
        return `<li class="${r.v.done ? "done" : ""}${promo ? " promo" : ""}${r.live ? "" : " ended"}">
          <button type="button" class="tick" data-a="tick" data-k="${esc(r.k)}" aria-pressed="${!!r.v.done}" aria-label="${t("gotIt")}"${r.live ? "" : " disabled"}></button>
          <span class="ln">${esc(r.v.n)}<small>${esc(r.v.q || "")}${r.live ? "" : " · " + r.why}</small></span>
          <span class="lp">${promo ? `<span class="off">−${r.it.pct}%</span>` : ""}${fmt(r.p)}</span>
          <button type="button" class="x" data-a="rm" data-m="list" data-k="${esc(r.k)}" aria-label="${t("removeList")}" title="${t("removeList")}">${ICON.hide}</button></li>`;
      }).join("") + `</ul></section>`;
  }
  if ([...liveEntries("list")].some(([, v]) => v.done)) html += `<button type="button" class="textbtn" data-a="clear-done">${t("removeTicked")}</button>`;
  box.innerHTML = html;
}

// the shopping list as plain text, one item per line, grouped by shop (pasted into Reminders: one to-do per line)
function listText() {
  const byStore = new Map();
  for (const [k, v] of liveEntries("list")) {
    if (v.done || !listState(k, v).live) continue;
    const it = current(k);
    const p = it ? it.p : v.p;
    (byStore.get(v.s) || byStore.set(v.s, []).get(v.s)).push(`${v.n}${v.q ? " (" + v.q + ")" : ""}${p != null ? " – " + fmt(p) : ""}`);
  }
  return [...byStore].map(([s, rows]) => `${storeOf(s).label}\n` + rows.join("\n")).join("\n\n");
}

// favourites currently on sale, shown at the top of the Deals view
function favDealsHtml() {
  const on = liveEntries("fav").map(([k]) => current(k)).filter((it) => it && it.o != null && active.has(it.s));
  if (!on.length) return "";
  return `<li class="sep"><i class="mark mark-fav"></i>${t("favsOnSale")}</li>` + on.map(card).join("");
}

function updateListCount() {
  const n = typeof all !== "undefined" && all.length ? liveEntries("list").filter(([k, v]) => !v.done && listState(k, v).live).length
    : liveEntries("list").filter(([, v]) => !v.done).length;
  const el = $("#listCount");
  if (el) el.textContent = n ? n : "";
}

// ---------------------------------------------------------------- settings: hidden items, sync, export
function renderSettings() {
  const hidden = ["hp", "hb", "hc"].flatMap((m) => liveEntries(m).map(([k, v]) => ({ m, k, label: v.label || k })));
  const sync = (() => { try { return JSON.parse(localStorage.getItem("pf.sync")) || {}; } catch (e) { return {}; } })();
  const levels = [["show", t("show")], ["hide", t("hide")]];
  const groups = [...FOOD_GROUPS.map(([id]) => id), "other", "pets", "household"];
  $("#settingsBody").innerHTML = `
    <h3>${t("language")}</h3>
    <span class="seg lang">${LANGS.map(([l, lab]) => `<button type="button" data-a="lang" data-l="${l}" aria-pressed="${UIL === l}">${lab}</button>`).join("")}</span>
    <h3>${t("interests")}</h3>
    <p class="note">${t("interestsNote")}</p>
    <ul class="interests">${groups.map((g) => `<li><span>${esc(GROUP_LABEL[g])}${groupInfo(g) ? ` <span class="infowrap"><button type="button" class="infobtn" data-a="info" aria-label="Info" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 10.5v6.5"/><circle cx="12" cy="7.3" r="1.1" class="dot"/></svg></button><span class="pop" role="tooltip">${esc(groupInfo(g))}</span></span>` : ""}</span><span class="seg">${levels.map(([v, l]) =>
      `<button type="button" data-a="lvl" data-g="${g}" data-v="${v}" aria-pressed="${interest(g) === v}">${l}</button>`).join("")}</span></li>`).join("")}</ul>
    <h3>${t("shops")}</h3>
    <p class="note">${t("shopsNote")}</p>
    <ul class="interests shoplist">${stores.map((s) => `<li><span>${esc(s.label)}${shopInfo(s.id) ? ` <span class="infowrap"><button type="button" class="infobtn" data-a="info" aria-label="Info" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 10.5v6.5"/><circle cx="12" cy="7.3" r="1.1" class="dot"/></svg></button><span class="pop" role="tooltip">${esc(shopInfo(s.id))}${(SHOP_LINKS[s.id] || []).map(([l, u]) => ` <a href="${u}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join(" ·")}</span></span>` : ""}</span><span class="seg">${levels.map(([v, l]) =>
      `<button type="button" data-a="lvl" data-g="shop:${s.id}" data-v="${v}" aria-pressed="${(shopOff(s.id) ? "hide" : "show") === v}">${l}</button>`).join("")}</span></li>`).join("")}</ul>
    <h3>${t("hiddenH")}</h3>
    ${hidden.length ? `<ul class="hidden">${hidden.map((h) => `<li><span>${{ hp: t("product"), hb: t("brandH"), hc: t("category") }[h.m]}</span> ${esc(h.label)}
      <button type="button" class="textbtn" data-a="unhide" data-m="${h.m}" data-k="${esc(h.k)}">${t("showAgain")}</button></li>`).join("")}</ul>`
      : `<p class="empty">${t("hiddenNone")}</p>`}
    <h3>${t("syncH")}</h3>
    <p class="note">${t("syncNote")}</p>
    <label class="fld">${t("token")} <input id="syncToken" type="password" autocomplete="off" value="${esc(sync.token || "")}" placeholder="ghp_…"></label>
    <div class="row"><button type="button" class="textbtn" id="syncSave">${t("syncSave")}</button>
      ${sync.token ? `<button type="button" class="textbtn" id="syncOff">${t("syncOff")}</button>` : ""}</div>
    <p class="note" id="syncStatus">${sync.token ? `${t("synced")}${sync.last ? " " + new Date(sync.last).toLocaleString("de-CH") : ""}` : t("syncIsOff")}</p>
    <h3>${t("backupH")}</h3>
    <div class="row"><button type="button" class="textbtn" id="exportBtn">${t("copyProfile")}</button>
      <button type="button" class="textbtn" id="importBtn">${t("pasteProfile")}</button></div>`;
  $("#syncSave").onclick = async () => {
    const token = $("#syncToken").value.trim();
    const s = { ...sync, token };
    try { localStorage.setItem("pf.sync", JSON.stringify(s)); } catch (e) {}
    $("#syncStatus").textContent = t("syncing");
    $("#syncStatus").textContent = await syncNow() ? t("synced") + "." : t("syncFailed");
  };
  if ($("#syncOff")) $("#syncOff").onclick = () => { try { localStorage.removeItem("pf.sync"); } catch (e) {} renderSettings(); };
  $("#exportBtn").onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(P)); $("#exportBtn").textContent = t("copied"); } catch (e) {} };
  $("#importBtn").onclick = async () => {
    try { const other = JSON.parse(await navigator.clipboard.readText()); mergeProfile(other); saveProfile(); renderSettings(); $("#importBtn").textContent = t("imported"); }
    catch (e) { $("#importBtn").textContent = t("noProfile"); }
  };
}

// ---------------------------------------------------------------- Gist sync (newest change per item wins)
function mergeProfile(other) {
  let changed = false;
  for (const m of MAPS) for (const [k, v] of Object.entries((other || {})[m] || {})) {
    if (!P[m][k] || (v.t || 0) > (P[m][k].t || 0)) { P[m][k] = v; changed = true; }
  }
  const old = Date.now() - 90 * 864e5;                      // forget deletions after 90 days
  for (const m of MAPS) for (const [k, v] of Object.entries(P[m])) if (v.del && v.t < old) delete P[m][k];
  return changed;
}
let syncTimer = null, syncing = false;
function scheduleSync() { clearTimeout(syncTimer); syncTimer = setTimeout(syncNow, 2500); }
async function syncNow() {
  let s;
  try { s = JSON.parse(localStorage.getItem("pf.sync")) || {}; } catch (e) { s = {}; }
  if (!s.token || syncing) return false;
  syncing = true;
  const H = { Authorization: "Bearer " + s.token, Accept: "application/vnd.github+json" };
  try {
    if (!s.gist) {                                            // find an existing profile Gist (other device) …
      const list = await (await fetch("https://api.github.com/gists?per_page=100", { headers: H })).json();
      const g = Array.isArray(list) && list.find((x) => x.files && x.files[PROFILE_FILE]);
      if (g) s.gist = g.id;
    }
    if (s.gist) {
      const g = await (await fetch("https://api.github.com/gists/" + s.gist, { headers: H })).json();
      const f = g.files && g.files[PROFILE_FILE];
      if (f) {
        const content = f.truncated ? await (await fetch(f.raw_url)).text() : f.content;
        if (mergeProfile(JSON.parse(content || "{}"))) { saveProfile(false); if (view === "list") renderListView(); else search(); }
      }
      await fetch("https://api.github.com/gists/" + s.gist, { method: "PATCH", headers: H,
        body: JSON.stringify({ files: { [PROFILE_FILE]: { content: JSON.stringify(P) } } }) });
    } else {                                                  // … or create a new private one
      const r = await fetch("https://api.github.com/gists", { method: "POST", headers: H, body: JSON.stringify({
        description: "Preisfinder profile (favourites, list, hidden items)", public: false,
        files: { [PROFILE_FILE]: { content: JSON.stringify(P) } } }) });
      if (!r.ok) throw new Error(r.status);
      s.gist = (await r.json()).id;
    }
    s.last = Date.now();
    localStorage.setItem("pf.sync", JSON.stringify(s));
    return true;
  } catch (e) {
    return false;
  } finally { syncing = false; }
}

// ---------------------------------------------------------------- interests preset from a link (?prefs=meat:more,…)
(function presetFromLink() {
  // ?prefs=drinks:hide,sweets:hide · ?shops=all (every shop on) or ?shops=aligro,denner (switch these on)
  const u = new URL(location.href), s = u.searchParams.get("prefs"), sh = u.searchParams.get("shops");
  if (!s && !sh) return;
  // a personal link (e.g. a home-screen icon) is applied once: later changes in Settings are kept
  const linkKey = (s || "") + "|" + (sh || "");
  try { if (localStorage.getItem("pf.preset") === linkKey) return; localStorage.setItem("pf.preset", linkKey); } catch (e) {}
  for (const part of (s || "").split(",").filter(Boolean)) {
    const [g, v] = part.split(":");
    if (g && ["show", "hide", "more", "normal", "top"].includes(v)) P.pref[g] = { v: v === "hide" ? "hide" : "show", t: Date.now() };
  }
  if (sh) {
    const ids = sh === "all" ? ["aligro", "aldi", "asiaway", "coop", "denner", "lianhua", "lidl", "maxim", "migros", "ottos", "prodega", "volg"] : sh.split(",");
    for (const id of ids) P.pref["shop:" + id.trim()] = { v: "show", t: Date.now() };
  }
  saveProfile();       // the settings stay in the address, so "Add to Home Screen" keeps them
})();

// shop info bubbles: one open at a time, a tap anywhere else closes it
function closePops() { for (const b of document.querySelectorAll('.infobtn[aria-expanded="true"]')) b.setAttribute("aria-expanded", "false"); }
document.addEventListener("click", (e) => { if (!e.target.closest(".infowrap")) closePops(); }, true);

// ---------------------------------------------------------------- wiring
for (const b of document.querySelectorAll("nav [data-view]")) b.addEventListener("click", () => setView(b.dataset.view));
$("#settingsBtn").addEventListener("click", () => { renderSettings(); $("#settings").showModal(); });
$("#settingsClose").addEventListener("click", () => $("#settings").close());
$("#layoutBtn").addEventListener("click", () => (window.morphLayout || ((f) => f()))(() => {
  const grid = document.body.classList.toggle("grid");
  layoutIcon();
  try { localStorage.setItem("pf.layout", grid ? "grid" : "list"); } catch (e) {}
}));
try { if (localStorage.getItem("pf.layout") === "grid") { document.body.classList.add("grid"); } layoutIcon(); } catch (e) {}
updateListCount();
document.addEventListener("visibilitychange", () => { if (!document.hidden) syncNow(); });
setTimeout(syncNow, 1500);
