"use strict";
// Preisfinder — static client-side search over docs/data/*.json (built by scrapers/build.py)

const $ = (s) => document.querySelector(s);
const COLORS = {};
const UNIT_LABEL = { kg: "kg", l: "l", pc: "pc", Bund: "bunch", Pack: "pack" };
const PAGE = 60;
const TODAY = new Date().toISOString().slice(0, 10);

function norm(s) {
  return (s || "").toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/œ/g, "oe")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%.]+/g, " ").trim();
}

// ---------------------------------------------------------------- words
// German variants that differ between shops / regions
const SYN = [
  ["rahm", "sahne"], ["peterli", "petersilie"], ["rueebli", "ruebli", "karotte", "karotten", "moehre"],
  ["zucchetti", "zucchini"], ["poulet", "haehnchen", "huhn"], ["hackfleisch", "gehacktes"],
  ["kartoffel", "kartoffeln", "haerdoepfel"], ["aubergine", "auberginen", "melanzani"],
  ["joghurt", "jogurt", "yogurt", "yoghurt"], ["nuesse", "nuss"], ["baumnuss", "walnuss"],
  ["crevetten", "garnelen", "shrimps"], ["sojasauce", "sojasosse"],
  ["fruehlingszwiebel", "lauchzwiebel", "bundzwiebel"], ["toilettenpapier", "wc papier"], ["ei", "eier"],
];
// English / French → German (Aldi, Lidl and Prodega only have German names). "word:de1,de2;…"
const DICT = `olive oil:olivenöl;sunflower oil:sonnenblumenöl;rapeseed oil:rapsöl;sesame oil:sesamöl;coconut oil:kokosöl;
soy sauce:sojasauce;spring onion:frühlingszwiebel;spring onions:frühlingszwiebel;green beans:bohnen;baking powder:backpulver;
baking soda:natron;ice cream:glace;minced meat:hackfleisch;ground beef:rindshackfleisch,hackfleisch;
chicken breast:pouletbrust;toilet paper:toilettenpapier;kitchen paper:haushaltpapier;dish soap:abwaschmittel;
washing powder:waschmittel;laundry detergent:waschmittel;sour cream:sauerrahm;cream cheese:frischkäse;
cottage cheese:hüttenkäse;whipping cream:vollrahm,schlagrahm;peanut butter:erdnussbutter,erdnusspaste,erdnussmus;erdnussbutter:erdnusspaste,erdnussmus;erdnusspaste:erdnussbutter;sparkling water:mineralwasser;
mineral water:mineralwasser;orange juice:orangensaft;apple juice:apfelsaft;red wine:rotwein;white wine:weisswein;
black pepper:pfeffer;sweet potato:süsskartoffel;bell pepper:peperoni;cherry tomatoes:cherrytomaten;coconut milk:kokosmilch;
oat milk:haferdrink;almond milk:mandeldrink;rice noodles:reisnudeln;brown sugar:rohrzucker;
butter:butter;milk:milch;cream:rahm;cheese:käse;egg:eier;eggs:eier;yoghurt:joghurt;yogurt:joghurt;bread:brot;flour:mehl;
sugar:zucker;salt:salz;pepper:pfeffer;rice:reis;pasta:teigwaren,pasta;noodles:nudeln;oil:öl;vinegar:essig;honey:honig;
jam:konfitüre;coffee:kaffee;tea:tee;water:wasser;juice:saft;beer:bier;wine:wein;chicken:poulet;beef:rind,rinds;
pork:schwein,schweins;lamb:lamm;veal:kalb;fish:fisch;salmon:lachs;tuna:thunfisch;shrimp:crevetten;prawns:crevetten;
sausage:wurst;ham:schinken;bacon:speck;mince:hackfleisch;ginger:ingwer;garlic:knoblauch;onion:zwiebel;onions:zwiebeln;
potato:kartoffel;potatoes:kartoffeln;tomato:tomaten;tomatoes:tomaten;carrot:karotten;carrots:karotten;cucumber:gurke;
lettuce:salat;salad:salat;spinach:spinat;cabbage:kohl;cauliflower:blumenkohl;mushroom:champignons,pilze;
mushrooms:champignons,pilze;courgette:zucchetti;eggplant:aubergine;leek:lauch;celery:sellerie;pumpkin:kürbis;corn:mais;
peas:erbsen;beans:bohnen;lentils:linsen;chickpeas:kichererbsen;lemon:zitronen;lemons:zitronen;lime:limette;
apple:äpfel,apfel;apples:äpfel;banana:bananen;bananas:bananen;pear:birnen;grapes:trauben;strawberries:erdbeeren;
raspberries:himbeeren;blueberries:heidelbeeren;cherries:kirschen;pineapple:ananas;melon:melone;watermelon:wassermelone;
peach:pfirsich;plum:zwetschgen;dates:datteln;figs:feigen;pomegranate:granatapfel;coconut:kokos;nuts:nüsse;
almonds:mandeln;walnuts:baumnüsse;hazelnuts:haselnüsse;peanuts:erdnüsse;pistachios:pistazien;raisins:rosinen;
parsley:petersilie;basil:basilikum;coriander:koriander;cilantro:koriander;mint:minze;rosemary:rosmarin;thyme:thymian;
cinnamon:zimt;cumin:kreuzkümmel;turmeric:kurkuma;oats:haferflocken;cereal:müesli;chocolate:schokolade;
biscuits:biscuits,guetzli;cookies:guetzli,cookies;crisps:chips;cake:kuchen;soup:suppe;mustard:senf;
detergent:waschmittel;soap:seife;toothpaste:zahnpasta;diapers:windeln;nappies:windeln;dog food:hundefutter;
cat food:katzenfutter;organic:bio;
turkey:truthahn,truten,trute,pute;turkey breast:trutenbrust;duck:ente;goose:gans;rabbit:kaninchen;venison:hirsch,reh;
deer:hirsch,reh;whole:ganz,ganze,ganzer,ganzes;fresh:frisch;frozen:tiefgekühlt,tk;smoked:geräuchert;dried:getrocknet;
ground:gemahlen;sliced:geschnitten;minced:gehackt;breast:brust;thigh:schenkel;leg:schenkel,keule;wings:flügeli,flügel;
fillet:filet;cod:kabeljau,dorsch;trout:forelle;seabass:wolfsbarsch;sea bass:wolfsbarsch;squid:tintenfisch,calamares;
mussels:miesmuscheln;oyster:austern;anchovies:sardellen;sardines:sardinen;liver:leber;kidney:niere;
zucchinis:zucchetti;radish:rettich,radiesli;beetroot:rande;asparagus:spargel;artichoke:artischocke;fennel:fenchel;
chili:chili,peperoncini;sprouts:sprossen;kale:federkohl,grünkohl;quinoa:quinoa;couscous:couscous;bulgur:bulgur;
yeast:hefe;semolina:griess;cornflour:maisstärke;starch:stärke;breadcrumbs:paniermehl;pickles:essiggurken;olives:oliven;
capers:kapern;tomato paste:tomatenpüree;stock:bouillon;broth:bouillon;sweetener:süssstoff;
dinde:truthahn,truten;canard:ente;oie:gans;lapin:kaninchen;entier:ganz;entiere:ganz;frais:frisch;surgele:tiefgekühlt;
huile d olive:olivenöl;sauce soja:sojasauce;pomme de terre:kartoffel;pommes de terre:kartoffeln;papier toilette:toilettenpapier;
beurre:butter;lait:milch;creme:rahm;fromage:käse;oeuf:eier;oeufs:eier;yaourt:joghurt;pain:brot;farine:mehl;sucre:zucker;
sel:salz;poivre:pfeffer;riz:reis;pates:teigwaren;huile:öl;vinaigre:essig;miel:honig;confiture:konfitüre;cafe:kaffee;
eau:wasser;jus:saft;biere:bier;vin:wein;poulet:poulet;boeuf:rind;porc:schwein;agneau:lamm;veau:kalb;
poisson:fisch;saumon:lachs;thon:thunfisch;crevettes:crevetten;saucisse:wurst;jambon:schinken;lard:speck;
gingembre:ingwer;ail:knoblauch;oignon:zwiebel;oignons:zwiebeln;tomate:tomaten;tomates:tomaten;carotte:karotten;
carottes:karotten;concombre:gurke;salade:salat;epinards:spinat;chou:kohl;chou fleur:blumenkohl;champignon:champignons;
poireau:lauch;citrouille:kürbis;courge:kürbis;mais:mais;petits pois:erbsen;haricots:bohnen;lentilles:linsen;
pois chiches:kichererbsen;citron:zitronen;pomme:äpfel;pommes:äpfel;banane:bananen;poire:birnen;
fraises:erdbeeren;framboises:himbeeren;myrtilles:heidelbeeren;cerises:kirschen;noix:nüsse,baumnüsse;amandes:mandeln;
noisettes:haselnüsse;persil:petersilie;basilic:basilikum;menthe:minze;cannelle:zimt;chocolat:schokolade;lessive:waschmittel;
savon:seife;dentifrice:zahnpasta;couches:windeln`;
const dict = new Map(), phrases = [], LANG = new Map();   // LANG: word -> "en" | "fr"
let lang = "en";
for (const part of DICT.split(/;\s*/)) {
  const [w, de] = part.split(":");
  if (!w || !de) continue;
  const k = norm(w);
  if (k === "huile d olive") lang = "fr";                   // French part of the list starts here
  if (!LANG.has(k)) LANG.set(k, lang);
  dict.set(k, [...new Set([...(dict.get(k) || []), ...de.split(",").map(norm)])]);
  if (k.includes(" ")) phrases.push(k);
}
const synMap = new Map();
for (const g of SYN) for (const w of g) synMap.set(norm(w), g.map(norm));

// words that make it a different product: "Butter Gipfel", "Ingwer Shot", "Butter croissant"
const TYPE_WORDS = new Set(("gipfel gipfeli croissant croissants bretzel brezel zopf brot broetli toast kekse keks guetzli " +
  "biscuits cookies kuchen torte cake muffin waffeln sauce sosse dressing chips cracker tee shot saft drink sirup " +
  "pulver aroma konfituere aufstrich pizza pasta ravioli tortelloni gnocchi lasagne suppe bonbons schokolade riegel " +
  "glace praline pralinen snack mix tabletten kapseln spray shampoo duschgel seife bier likoer ale beer gebaeck " +
  "stollen spekulatius pastetli brei bread pastry spread tea juice pie biscuit pain gateau jus tarte terrine pastete " +
  "mousse pate paste fond bouillon soup soupe rillettes leberwurst salami wurst snack fett schmalz leber liver " +
  "foie graisse tagliatelle spaetzli nudeln teigwaren").split(" "));
const TYPE_SUFFIX = [...TYPE_WORDS].filter((w) => w.length >= 4).concat(["teig", "gebaeck", "creme", "fuellung"]);
const isType = (w) => TYPE_WORDS.has(w) || TYPE_SUFFIX.some((x) => w.endsWith(x));
// a word in front that changes the product: "Erdnuss Butter", "Pastetli mit Butter", "peanut butter"
const MODIFY = new Set(("mit und an auf in ohne with au aux a la de erdnuss peanut kraeuter knoblauch schoko kakao " +
  "cocoa shea mandel almond cashew haselnuss hazelnut sesam apfel kokos kokosnuss coconut hafer oat soja soy reis rice " +
  "dinkel erbsen pear birnen birne herb garlic body nut almond apricot plum fruit wie like pflanzlich pflanzliche " +
  "pflanzlicher planzlicher pflanzen vegan vegane veganer plant based imitat ersatz alternative comme facon " +
  "vegetal vegetale vegetaux du").split(" "));
// compounds that are still the same product: Kochbutter, Vorzugsbutter, Vollmilch, Halbrahm, Bergkäse …
const KIND = new Set(("koch vorzugs tafel alp alpen berg land bio gras voll halb mager frisch roh past uht bauern " +
  "sauer schlag kaffee jung alt rinds schweins kalbs lamm poulet trink hart weich reib rahm seiden natur raeucher " +
  "bio").split(" "));

// describing words that can be dropped when a search finds nothing
const SOFT = new Set(("whole fresh frozen smoked dried organic big small large mini sliced ground minced raw cooked " +
  "ganz ganze ganzer ganzes frisch frische frischer tiefgekuehlt bio gross klein entier entiere frais surgele").split(" "));
const PET_CAT = /tierbedarf|tiernahrung|futter|hunde|katzen|pet food/;
const PET_Q = /\b(dog|cat|pet|hund|hunde|katze|katzen|tier|futter|chien|chat)\b/;

// ---------------------------------------------------------------- state
// "Show more" stays expanded until the search or filters change: background updates (sync with your other devices,
// type lists arriving, your private shops loading) redraw the list but no longer fold it back to the first 60
let moreKey = "";
function keepMore(key) { if (key !== moreKey) { moreKey = key; shown = PAGE; } }
let all = [], stores = [], active = new Set(), promoOnly = false, bioOnly = false, shown = PAGE, results = [], good = null;
const fmt = (x) => x == null ? "" : x.toFixed(2);
const ddmm = (d) => d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.` : "";
const save = (k, v) => { try { localStorage.setItem("pf." + k, JSON.stringify(v)); } catch (e) {} };
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem("pf." + k)); return v ?? d; } catch (e) { return d; } };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const storeOf = (id) => stores.find((s) => s.id === id) || { label: id };
const keyOf = (it) => it.s + "|" + (it.url || it.n + "|" + (it.q || ""));
const isBio = (it) => / bio|naturaplan|alnatura|retour aux sources|demeter|knospe/.test(it.h);

function variant(name, brand) {
  // name without the brand / leading CAPS brand ("MILBONA Mozzarella", "Alfredo · Mozzarella")
  let core = name.replace(/^(?:[A-ZÄÖÜÉ0-9'&.\-]{2,}\s+)+(?=[A-ZÄÖÜÉ][a-zäöüé])/, "");
  if (brand && core.toLowerCase().startsWith(brand.toLowerCase())) core = core.slice(brand.length);
  core = core.replace(/^(bio|m-budget|m-classic|naturaplan|qualité & prix|swiss|schweizer)\s+/i, "");
  const nh = " " + norm(name + " " + (brand || ""));
  const c = " " + norm(core);
  return { core: c, cw: c.trim().split(" "), hw: norm(core.split(",")[0]).split(" "), nh, nw: nh.trim().split(" ") };
}

function prep(it, d) {
  // "statt .75" (Rappen) stored as 75 francs in older data
  if (it.o != null && it.p && Number.isInteger(it.o) && it.o < 100 && it.o > 8 * it.p) {
    it.o = it.o / 100;
    if (it.o > it.p) it.pct = Math.round(100 * (it.o - it.p) / it.o); else { it.o = null; it.pct = null; }
  }
  if (it.img && d.ip && !/^https?:/.test(it.img)) it.img = d.ip + it.img;
  if (it.url && d.lp && !/^https?:/.test(it.url)) it.url = d.lp + it.url;
  // a promotion whose end date has passed since the last refresh: show the regular price, keep the promo as history
  if (it.o != null && it.until && it.until < TODAY) {
    it.was = { p: it.p, up: it.up, pct: it.pct, until: it.until };
    if (it.up != null) it.up = it.up * it.o / it.p;
    it.p = it.o; delete it.o; delete it.pct;
  }
  it.h = " " + norm([it.n, it.ne, it.nf, it.b, it.c].filter(Boolean).join(" "));
  it.v = [variant(it.n, it.b)];
  if (it.ne) it.v.push(Object.assign(variant(it.ne, it.b), { en: true }));
  if (it.nf) it.v.push(Object.assign(variant(it.nf, it.b), { fr: true }));
  return it;
}

// ---------------------------------------------------------------- load
async function privateExtras() {
  let tok = null;
  try { tok = (JSON.parse(localStorage.getItem("pf.sync")) || {}).token; } catch (e) {}
  if (!tok) return [];
  const H = { Authorization: "Bearer " + tok, Accept: "application/vnd.github+json" };
  const list = await (await fetch("https://api.github.com/gists?per_page=100", { headers: H })).json();
  const g = Array.isArray(list) && list.find((x) => x.files && x.files["preisfinder-private.txt"]);
  if (!g) return [];
  // stores.meta: name, date, count of each private shop (Coop, and Maxim / Lianhua / Asiaway from your receipts)
  let meta = [{ id: "coop", label: "Coop" }];
  if (g.files["stores.meta"]) try { meta = await (await fetch(g.files["stores.meta"].raw_url)).json(); } catch (e) {}
  const byId = Object.fromEntries(meta.map((s) => [s.id, s]));
  return Object.values(g.files).filter((f) => f.filename.endsWith(".json")).map((f) => {
    const id = f.filename.replace(/\.json$/, "");
    return byId[id] ? { store: { ...byId[id], file: f.raw_url, private: true } } : { url: f.raw_url };
  });
}

async function init() {
  applyStaticTexts(); showSort();
  $("#q").value = new URLSearchParams(location.search).get("q") || "";   // before anything can call search()
  let index;
  try {
    index = await (await fetch("data/index.json", { cache: "no-cache" })).json();
  } catch (e) {
    $("#status").textContent = t("offline");
    return;
  }
  stores = index.stores.sort((a, b) => a.label.localeCompare(b.label, "de"));   // shops A–Z
  active = new Set(stores.map((s) => s.id));                              // every visit starts with all shops
  applyShopPrefs();
  renderChips();
  const css = getComputedStyle(document.documentElement);
  for (const s of stores) COLORS[s.id] = css.getPropertyValue("--" + s.id).trim() || "#888";

  const v = "?v=" + encodeURIComponent(index.built || "");          // new build = fresh files (no stale cache)
  if (index.kinds) fetch(index.kinds + v).then((r) => r.json()).then(loadKinds).then(() => { if (all.length) { rateDeals(); search(); } }).catch(() => {});
  if (index.synonyms) fetch(index.synonyms + v).then((r) => r.json()).then(addSynonyms).then(() => all.length && search()).catch(() => {});
  // your own extra shops (Coop, Denner's full range): only on your devices, from a secret Gist in your GitHub account,
  // found with the sync token from Settings. Visitors without your token never see them.
  const extra = await Promise.race([privateExtras(), new Promise((r) => setTimeout(() => r([]), 6000))]).catch(() => []);
  for (const x of extra) if (x.store && !stores.some((s) => s.id === x.store.id)) {
    stores.push(x.store); stores.sort((a, b) => a.label.localeCompare(b.label, "de")); active.add(x.store.id);
  }
  if (extra.length) { applyShopPrefs(); renderChips(); }
  const files = stores.map((s) => s.file).concat(extra.filter((x) => !x.store).map((x) => x.url)).concat(index.history ? [index.history] : []);
  const parts = await Promise.all(files.map(async (f) => {
    try { const d = await (await fetch(f + v)).json(); return { f, d }; } catch (e) { return { f, d: { items: [] } }; }
  }));
  for (const { f, d } of parts) if (f !== index.history) for (const it of d.items) {
    if (d.flyer && it.until && it.until < TODAY) continue;       // flyer deal of a past week
    all.push(prep(it, d));
  }

  // promo history: products whose promotion has ended
  const hist = parts.find((p) => p.f === index.history);
  if (hist) {
    const byKey = new Map(all.map((it) => [keyOf(it), it]));
    const pidOf = (it) => it.s + "|" + (((it.url || "").match(/~p(\d+)/) || [])[1] || keyOf(it));
    const byPid = new Set(all.map(pidOf));
    for (const h of hist.d.items) {
      h.hk = h.k; h.k = h.kt; delete h.kt;               // "k" there is the history key; the product type is "kt"
      if (h.until && h.until >= TODAY) {                // still running
        // an offer only the printed flyer has (not the shop's website): show it as a current offer
        if (!byKey.has(keyOf(h)) && !byPid.has(pidOf(h)) && h.o != null) { all.push(prep(h, hist.d)); byPid.add(pidOf(h)); }
        continue;
      }
      const promo = { p: h.p, up: h.up, pct: h.pct, until: h.until };
      const regular = h.o;
      delete h.o; delete h.until; delete h.pct;
      prep(h, hist.d);
      const cur = byKey.get(keyOf(h));
      if (cur) {
        if (cur.o == null && !cur.was) cur.was = promo;
      } else if (h.p != null && regular && !h.cmp) {
        // catalogue: the flyer told us the normal price, so keep the product at that price
        h.p = regular; if (h.up != null) h.up = h.up * regular / promo.p;
        h.was = promo; h.cat = true;
        h.note = [h.note, t("regularFrom", { d: ddmm(h.seen) || "?" })].filter(Boolean).join(" · ");
        all.push(h);
      } else if (h.p != null) {
        h.gone = true; h.was = promo;
        all.push(h);                                    // no regular price known: show the old promo faded
      }
    }
  }
  buildVocab();
  rateDeals();
  if (typeof updateListCount === "function") updateListCount();   // ended promotions no longer count
  const dates = stores.filter((s) => !s.static).map((s) => s.updated).sort();
  $("#foot").innerHTML = t("footer", { n: all.filter((i) => !i.gone).length.toLocaleString("de-CH"), d: dates[0] || "?" }) +
    (dates.length && dates[0] !== dates[dates.length - 1] ? t("footerTo", { d: dates[dates.length - 1] }) : "") +
    t("footerEnd") + `<a href="https://github.com/NikolaHristovNikolov/preisfinder#readme">${t("sources")}</a>`;
  search();
}

// shops you never want (Settings › Shops › Hide): gone from the chips, search and deals; synced like your interests
// new visitors see the four big chains; the rest (wholesale, regional, the receipt shops) are one tap away in Settings
const DEFAULT_SHOPS = new Set(["aldi", "coop", "lidl", "migros"]);
const shopOff = (id) => {
  const p = typeof P !== "undefined" && P.pref && P.pref["shop:" + id];
  if (p && !p.del) return p.v === "hide";
  return !DEFAULT_SHOPS.has(id.replace(/_flyer$/, ""));
};
const visibleStores = () => stores.filter((s) => !shopOff(s.id));
function applyShopPrefs() {                 // after a Settings change: all the shops you show
  active = new Set(visibleStores().map((s) => s.id));
}
function shopPrefsChanged() {
  applyShopPrefs(); renderChips();
  if (document.body.dataset.mode !== "list") search();      // empty search = the Deals page
}
function renderChips() {
  const box = $("#stores");
  box.innerHTML = "";
  for (const s of visibleStores()) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip";
    b.setAttribute("aria-pressed", active.has(s.id));
    b.innerHTML = wordmark(s.id);
    b.title = s.label;
    // tap: only this shop (for the current search or the deals); tap it again: all shops.
    // Shops you never use are hidden for good in Settings › Shops.
    b.onclick = () => {
      const solo = active.size === 1 && active.has(s.id);
      active = solo ? new Set(visibleStores().map((x) => x.id)) : new Set([s.id]);
      renderChips(); search();
      if (!solo) b.scrollIntoView({ block: "nearest", inline: "nearest" });
    };
    box.appendChild(b);
  }
}

// Open Food Facts synonym groups: [[de…], [en…], [fr…]] → every name finds the others
function addSynonyms(d) {
  // a French word that is another group's English word is a false friend: French "raisin" (grapes) vs English
  // "raisins" (dried grapes). The English meaning wins.
  const EN = new Set((d.groups || []).flatMap((g) => g[1] || []).map(stem));
  for (const g0 of d.groups || []) {
    const ownEn = new Set((g0[1] || []).map(stem));
    const g = [g0[0] || [], g0[1] || [], (g0[2] || []).filter((n) => ownEn.has(stem(n)) || !EN.has(stem(n)))];
    const members = g.flat();
    g.forEach((names, i) => names.forEach((n) => { if (!LANG.has(n)) LANG.set(n, ["de", "en", "fr"][i]); }));
    for (const m of members) {
      dict.set(m, [...new Set([...(dict.get(m) || []), ...members.filter((x) => x !== m)])]);
      if (m.includes(" ") && !phrases.includes(m)) phrases.push(m);
    }
  }
  phrases.sort((a, b) => b.length - a.length);   // longest phrase first
  for (const m of dict.keys()) if (m.length >= 3 && !VOCAB.has(m)) VOCAB.set(m, 0);
}

// ---------------------------------------------------------------- search
function terms(q) {
  let s = " " + norm(q) + " ";
  const groups = [];
  for (const p of phrases) {                 // "olive oil", "pommes de terre" → one term
    if (s.includes(" " + p + " ")) { groups.push({ w: p, alts: [p, ...dict.get(p)] }); s = s.replace(" " + p + " ", " "); }
  }
  for (const t of s.trim().split(" ").filter(Boolean)) {
    const alts = new Set([t, ...(dict.get(t) || [])]);
    for (const a of [...alts]) for (const x of synMap.get(a) || []) alts.add(x);
    groups.push({ w: t, alts: [...alts] });
  }
  return groups;
}

// singular / plural and common endings count as the same word: Gurke/Gurken, Zitrone/Zitronen, lemon/lemons, Ei/Eier
function stem(w) {
  if (w.length <= 3) return w;
  // only real plural / inflection endings (-en -er -es -s -e): Zitronen→zitron = Zitrone, but citron ≠ Citro
  for (const e of ["en", "er", "es", "s", "e"]) if (w.length - e.length >= 3 && w.endsWith(e)) return w.slice(0, -e.length);
  if (w.length >= 5 && w.endsWith("n") && "lr".includes(w[w.length - 2])) return w.slice(0, -1);   // Kartoffeln, Zwiebeln
  return w;
}
const same = (w, a) => w === a || (a.length >= 3 && w.length >= 3 && stem(w) === stem(a));
const endsSame = (w, a) => same(w, a) || (a.length >= 4 && (w.endsWith(a) || w.endsWith(stem(a)) && KIND.has(w.slice(0, -stem(a).length))));

// 0 = name starts with the word ("Butter", "Butter mild"); 1 = whole word or a kind of it ("Kochbutter");
// 2 = compound / other product with the word ("Butterbretzel", "Butter Gipfel"); 3 = inside a word; 4 = brand/category.
function scoreV(v, a, qwords) {
  let s = 9;
  if (v.fr && !a.includes(" ")) {
    // French: the product is the FIRST noun ("Beurre doux"); "Petit Beurre", "Beurre de cacahuètes" are something else
    const hw = v.hw.filter((w) => w && !/^\d/.test(w));
    if (same(hw[0] || "", a)) return ["de", "d", "aux", "au", "a", "pour"].includes(hw[1]) ? 2 : hw.length === 1 ? 0 : 1;
    const j = v.nw.findIndex((w) => same(w, a));
    if (j >= 0) return (MODIFY.has(v.nw[j - 1]) || MODIFY.has(v.nw[j - 2]) || isType(hw[0])) ? 3 : 2;
    if (a.length >= 5 && v.nw.some((w) => w.includes(a))) return 3;
    return 9;
  }
  if (v.en && !a.includes(" ")) {
    // English: the product is the LAST noun ("Butter Waffles" are waffles, "Whole Milk" is milk)
    const hw = v.hw.filter((w) => w && !/^\d/.test(w));
    const i = hw.length - 1;
    if (i >= 0 && same(hw[i], a)) {
      if (hw.slice(0, i).some((w) => w === "with" || w === "and" || w === "in" || MODIFY.has(w))) return 3;
      return hw.length === 1 ? 0 : 1;
    }
    if (v.nw.some((w) => same(w, a))) return 2;
    if (a.length >= 5 && v.nw.some((w) => w.includes(a))) return 3;
    return 9;
  }
  if (a.includes(" ")) {
    if (v.core.startsWith(" " + a)) s = 0; else if (v.nh.includes(" " + a)) s = 1;
  } else if (same(v.cw[0] || "", a)) s = 0;
  else {
    for (const w of v.nw) {
      if (same(w, a) || (a.length >= 4 && w.endsWith(a) && KIND.has(w.slice(0, -a.length))) ||
          (a.length >= 4 && w.endsWith(stem(a)) && KIND.has(w.slice(0, -stem(a).length)))) { s = 1; break; }
      if (a.length >= 3 && w.startsWith(a)) s = Math.min(s, 2);
      else if (a.length >= 5 && w.includes(a)) s = Math.min(s, 3);
    }
  }
  if (s === 1) {
    const i = v.hw.findIndex((w) => endsSame(w, a));
    if (i < 0 || (i > 0 && MODIFY.has(v.hw[i - 1]))) s = 3;
    else {
      // German: the product noun is first or last ("Butter mild", "Schweizer Butter"); in the middle it's an
      // ingredient ("Joghurt Honig & Baumnuss")
      const words = v.hw.filter((w) => w && !/\d/.test(w));
      const k = words.findIndex((w) => endsSame(w, a));
      if (k > 0 && k < words.length - 1) s = 2;
    }
  }
  if (s <= 1 && v.cw.some((w) => !same(w, a) && !qwords.has(w) && !w.endsWith(a) && isType(w))) s = 3;
  return s;
}

function score(it, term, qwords) {
  let best = 9;
  for (const a of term.alts) {
    if (a === "bio" && isBio(it)) { best = Math.min(best, 1); continue; }
    const lg = LANG.get(a);
    const foreign = a === term.w && (lg === "en" || lg === "fr") ? lg : null;   // "ginger", "beurre"
    for (const v of it.v) {
      let s = scoreV(v, a, qwords);
      // a foreign word only counts fully in names of its own language ("beurre" vs "Croissant pur beurre", "Ginger Ale")
      if (foreign && !(foreign === "en" ? v.en : v.fr) && s < 2) s = 2;
      best = Math.min(best, s);
    }
    if (best === 9 && a.length >= 3 && it.h.includes(a)) best = 4;
    if (best === 0) break;
  }
  return best;
}

// relevance group: 0 = the product itself, 1 = contains the word, 2 = other matches, 3 = ended promotions
function grp(it) { return it.g ?? (it.gone ? 3 : it.t <= 1 ? 0 : it.t <= 3 ? 1 : 2); }

// Which shop categories is the user after? Each shop's clearest matches (name starts with the word, ideally the
// name IS the word: "Butter") vote with their category. Products in a voted category count as the product itself
// (incl. compounds like "Kochbutter"); products of the same shop in other categories ("Butter Gipfel" in bakery,
// "Erdnussbutter" in spreads) move down to "Related products". Shops without categories keep the text rules.
function intents(out, ts) {
  const words = ts.flatMap((t) => t.alts).filter((a) => a.length >= 3 && !a.includes(" "));
  // 2 = a category word IS the searched word ("Äpfel & Birnen"), 1 = starts with it ("Apfelsaft"), 0 = no
  const named = (c) => Math.max(0, ...norm(c).split(" ").map((w) => words.some((a) => same(w, a)) ? 2 :
    words.some((a) => a.length >= 4 && w.startsWith(a)) ? 1 : 0));
  const votes = {}, loose = {}, byName = {};
  for (const it of out) {
    if (it.gone || !it.c || it.t > 3) continue;
    const nm = named(it.c);                                           // 1. category named after the word
    if (nm) { const m = (byName[it.s] ||= new Map()); m.set(it.c, nm); }
    if (it.t > 1) continue;
    // 2. the clearest matches vote: names that START with the word ("Zitronen …"), not "Schweppes Zitrone"
    const w = it.plain ? 4 : it.t === 0 ? 2 : 1;
    const box = it.t === 0 ? votes : loose;
    const m = (box[it.s] ||= new Map());
    m.set(it.c, (m.get(it.c) || 0) + w);
  }
  for (const s of Object.keys(loose)) if (!votes[s]) votes[s] = loose[s];   // shops without such names
  const res = {};
  for (const s of new Set([...Object.keys(votes), ...Object.keys(byName)])) {
    if (byName[s]) {
      const top = Math.max(...byName[s].values());
      res[s] = new Set([...byName[s]].filter(([, n]) => n === top).map(([c]) => c));
      continue;
    }
    const m = votes[s], total = [...m.values()].reduce((a, b) => a + b, 0);
    const top = Math.max(...m.values());          // keep categories close to the shop's leading one
    res[s] = new Set([...m].filter(([, n]) => n >= Math.max(total * 0.15, top * 0.35)).map(([c]) => c));
  }
  return res;
}
const UNITW = new Set("kg g gr l ml cl dl stk st pc pcs x ca env detail".split(" "));
// ---------------------------------------------------------------- product types (Open Food Facts category tree)
// Every product has a type "k" (scrapers/classify.py). A search is mapped to types by name; its main results are the
// products of that type or a narrower one, from every shop; typed products of other types are only "related".
let KINDS = [], KCHILD = [], KNAME = new Map(), KANC = [];
function loadKinds(d) {
  KINDS = d.kinds || [];
  const anc = (i, seen = new Set()) => { for (const p of KINDS[i].p) if (!seen.has(p)) { seen.add(p); anc(p, seen); } return seen; };
  KANC = KINDS.map((k, i) => [k.id, ...[...anc(i)].map((j) => KINDS[j].id)].join(" "));
  for (const it of all) delete it.fg;
  KCHILD = KINDS.map(() => []);
  KINDS.forEach((k, i) => {
    for (const p of k.p) KCHILD[p].push(i);
    for (const n of k.n) {
      const key = n.split(" ").map(stem).join(" ");
      (KNAME.get(key) || KNAME.set(key, []).get(key)).push(i);
    }
  });
}
// a narrower kind that is another product made with it is related, not the product: chocolate drink, strawberry
// yogurt, butter biscuits, vanilla pudding, cake mix
const MADE_FROM = /drink|getrank|getraenk|boisson|cake|kuchen|torte|\bmix|mischung|flan|pudding|cookie|keks|biscuit|guetzli|riegel|\bbar\b|glace|ice cream|eis\b|sauce|dessert|joghurt|yogh?urt|muffin|croissant|gipfel|spread|aufstrich|creme|cream|mousse|cereal|muesli|pulver|powder|sirup|syrup|tee\b|\btea\b|konfit|jam\b|confiture|bonbon|candy|praline|pralin|waffel|waffle|brot\b|bread\b/;
function queryKinds(ts) {
  const q = new Set();
  if (!KINDS.length || !ts.length || ts.length > 3) return q;
  if (ts.length > 1) {                                   // "jasmin rice": try the words together as one phrase
    let combos = [[]];
    for (const t of ts) combos = combos.flatMap((c) => t.alts.slice(0, 6).map((a) => [...c, a])).slice(0, 80);
    for (const c of combos) for (const i of KNAME.get(c.join(" ").split(" ").map(stem).join(" ")) || []) q.add(i);
    if (!q.size) return q;
    const out = new Set(q), stack = [...q];               // + narrower types (jasmine rice > Thai jasmine rice)
    while (stack.length) for (const c of KCHILD[stack.pop()]) if (!out.has(c)) { out.add(c); stack.push(c); }
    return out;
  }
  // several types share a stem ("beer" ~ beers, Beeren; "butter" ~ butterfat): keep only the type(s) whose name is
  // spelled closest to what was typed (or its direct translation)
  const cand = [];
  for (const a of ts[0].alts) for (const i of KNAME.get(a.split(" ").map(stem).join(" ")) || []) {
    const d = Math.min(...KINDS[i].n.map((n) => n === a ? 0 : Math.abs(n.length - a.length) + (n.slice(0, 3) === a.slice(0, 3) ? 0 : 5)));
    cand.push([i, d + (a === ts[0].w || (dict.get(ts[0].w) || []).includes(a) ? 0 : 2)]);
  }
  // a fruit and a spirit of the same name (Kirschen / Kirsch) in a tie: the fruit. "beer" stays beer.
  const alc = (i) => / alcoholic-beverages/.test(" " + KANC[i]);
  const bestFood = Math.min(Infinity, ...cand.filter((c) => !alc(c[0])).map((c) => c[1]));
  for (let j = cand.length - 1; j >= 0; j--) if (alc(cand[j][0]) && cand[j][1] >= bestFood) cand.splice(j, 1);
  const best = Math.min(Infinity, ...cand.map((c) => c[1]));
  for (const [i, d] of cand) if (d === best) q.add(i);
  // + narrower types whose name still contains the word (butters -> salted butters, but not peanut butter / ghee
  // that the open tree also files under butters)
  const stems = ts[0].alts.filter((a) => !a.includes(" ")).map(stem);
  const named = (i) => KINDS[i].n.some((n) => n.split(" ").some((w) => stems.some((s) => s.length >= 3 && (stem(w) === s || (w.endsWith(s) && w.length > s.length + 2)))));
  const out = new Set(q), stack = [...q];
  while (stack.length) {
    for (const c of KCHILD[stack.pop()]) if (!out.has(c) && named(c) && !KINDS[c].n.some((n) => /peanut|erdnuss|cacahuete|nut |shea|kakao|cocoa/.test(n))
        && !KINDS[c].n.some((n) => MADE_FROM.test(n))) { out.add(c); stack.push(c); }
  }
  return out;
}
let KQ = null;   // types of the current search (null = no type known: word rules only)

// plant-based stand-ins ("Rahm Alternative Hafer", "Schlagsahne pflanzlich") are related, not main, for dairy / meat
const PLANT_RE = /\b(pflanz|planzl|wie butter|like butter|ersatz|vegan|vegetal|veggie|vegi\b|vegetari|plant|alternativ|margarin|planted|hafer drink|oat drink|soja ?drink)/;
let QPLANT = false, PET_SEARCH = false;
const broaderCache = new Map();
function broaderThanQuery(k) {          // is type k an ancestor of one of the search's types?
  const key = k + "|" + [...KQ].join(",");
  if (!broaderCache.has(key)) {
    const id = KINDS[k] && KINDS[k].id;
    broaderCache.set(key, !!id && [...KQ].some((q) => q !== k && (KANC[q] || "").split(" ").includes(id)));
  }
  return broaderCache.get(key);
}
function groupOf(it, intent) {
  if (it.gone) return 3;
  // pet food and non-food are never the product when you search for food ("salmon" ≠ cat food with salmon)
  if (KQ && !PET_SEARCH && (foodGroup(it) === "pets" || foodGroup(it) === "household")) return 2;
  if (!QPLANT && PLANT_RE.test(norm(it.n + " " + (it.ne || ""))) && ["dairy", "meatfish"].includes(foodGroup(it))) return 1;
  // typed: the type decides; typed only by its shelf (not its name) and the name lacks the word: related
  // a broader type (rice) whose name has every searched word (Jasmin … Parfümreis) is the product too
  if (KQ && it.k != null) return (KQ.has(it.k) && !(it.kc && it.t >= 4) && !it.kx) || (it.t <= 2 && broaderThanQuery(it.k)) ? 0 : it.t <= 3 ? 1 : 2;
  if (KQ && (!isFood(it) || it.t >= 2)) return it.t <= 3 && isFood(it) ? 1 : 2;  // untyped: non-food never main
  if (it.plain) return 0;
  const set = intent[it.s];
  if (set && set.size && it.c) return set.has(it.c) && it.t <= 2 ? 0 : it.t <= 3 ? 1 : 2;
  if (!it.c) return it.t === 0 ? 0 : it.t <= 3 ? 1 : 2;              // 3. no category: name must start with it
  return it.t <= 1 ? 0 : it.t <= 3 ? 1 : 2;
}


function find(ts) {
  const out = [];
  const petQ = ts.some((t) => t.alts.some((a) => PET_Q.test(a)));
  const qwords = new Set(ts.flatMap((t) => t.alts).flatMap((a) => a.split(" ")));
  for (const it of all) {
    if (!active.has(it.s) || (promoOnly && (it.o == null || it.gone)) || (bioOnly && !isBio(it)) || isHidden(it)) continue;
    let tier = 0, ok = true;
    for (const [i, t] of ts.entries()) {
      let s = score(it, t, qwords);
      if (s === 9) { ok = false; break; }
      if (i > 0 && s === 0) s = 1;                   // only the first word decides "starts with"
      tier = Math.max(tier, s);
    }
    if (ok) {
      // the name is just the word (plus pack size): "Gurken", "Zitronen 1 kg", "Lemons" — always the product
      it.plain = ts.length === 1 && tier === 0 && it.v.some((v) => {
        const words = v.cw.filter((w) => /^[a-z]{2,}$/.test(w) && !UNITW.has(w));
        return words.length === 1 && ts[0].alts.some((a) => same(words[0], a));
      });
      if (!petQ && PET_CAT.test(it.h)) tier = Math.max(tier, 4);   // cat/dog food only when asked for
      it.t = tier; out.push(it);
    }
  }
  return out;
}

// ---------------------------------------------------------------- typos
const VOCAB = new Map();   // every word in product names -> how many products use it
function buildVocab() {
  for (const it of all) for (const v of it.v) for (const w of v.nw) if (w.length >= 3 && /^[a-z]+$/.test(w)) VOCAB.set(w, (VOCAB.get(w) || 0) + 1);
}
function dist(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
// closest known word (1 typo for short words, 2 for long ones); prefers common words
function correct(w) {
  if (VOCAB.has(w) || dict.has(w) || w.length < 3) return w;
  const max = w.length <= 5 ? 1 : 2;
  let best = w, bd = max + 1, bc = 0;
  for (const [v, c] of VOCAB) {
    if (Math.abs(v.length - w.length) > max) continue;
    const d = dist(w, v, max);
    if (d < bd || (d === bd && c > bc)) { best = v; bd = d; bc = c; }
  }
  for (const v of dict.keys()) {             // English / French words too ("chiken" → chicken)
    const d = dist(w, v, max);
    if (d < bd) { best = v; bd = d; bc = 1e9; }
  }
  return best;
}

function search() {
  const q = $("#q").value.trim();
  const url = new URL(location.href);
  q ? url.searchParams.set("q", q) : url.searchParams.delete("q");
  history.replaceState(null, "", url);
  let ts = terms(q), note = "";
  if (!ts.length) { showDeals(); return; }
  keepMore("q|" + q + "|" + promoOnly + bioOnly + $("#sort").value + [...active].join());
  // a shop's name ("lidl", "denner") lists that shop: offers first, best deals on top
  const shop = stores.find((s) => norm(q) && [norm(s.id), norm(s.label), norm(s.label.split(" ")[0])].includes(norm(q)));
  if (shop) {
    results = all.filter((it) => it.s === shop.id && !it.gone && !isHidden(it))
      .sort((a, b) => (b.o != null) - (a.o != null) || (b.ds || 0) - (a.ds || 0) || (b.pct || 0) - (a.pct || 0));
    for (const it of results) it.g = it.o != null ? 0 : 1;
    $("#sum").hidden = true; $("#sum").innerHTML = ""; $("#kinds").innerHTML = ""; good = null;
    const nPromo = results.filter((it) => it.o != null).length;
    $("#status").innerHTML = `${wordmark(shop.id)} · ${results.length.toLocaleString("de-CH")} ${t("products")} · ${nPromo} ${t("onOffer")}`;
    cardItems = [];
    let html = "", g = -1;
    for (const it of results.slice(0, shown)) {
      if (it.g !== g) { g = it.g; html += `<li class="sep">${g ? t("otherProducts") : t("onOfferH")}</li>`; }
      html += card(it);
    }
    $("#list").innerHTML = html; $("#more").hidden = results.length <= shown;
    return;
  }
  let out = find(ts);
  if (!out.some((it) => !it.gone && it.t <= 3) && q) {      // nothing real found: try fixing typos
    const fixed = norm(q).split(" ").map(correct).join(" ");
    if (fixed !== norm(q)) {
      const out2 = find(terms(fixed));
      if (out2.length) { out = out2; ts = terms(fixed); note = `${t("showingFor")} <b>${esc(fixed)}</b> · `; }
    }
  }
  // several words but nothing found: drop the word(s) that block it ("whole turkey" → turkey)
  if (ts.length > 1 && !out.some((it) => !it.gone && it.t <= 3)) {
    let cur = ts;
    while (cur.length > 1) {
      // drop describing words first ("whole", "fresh"); otherwise keep the more specific word (fewer hits)
      let bestSet = null, bestN = Infinity, bestSoft = false;
      for (let i = 0; i < cur.length; i++) {
        const sub = cur.filter((_, j) => j !== i);
        const n = find(sub).filter((it) => !it.gone && it.t <= 3).length;
        const soft = SOFT.has(cur[i].w);
        if (n > 0 && (soft > bestSoft || (soft === bestSoft && n < bestN))) { bestN = n; bestSet = sub; bestSoft = soft; }
      }
      if (bestSet) { out = find(bestSet); ts = bestSet; break; }
      cur = cur.slice(0, -1);
    }
    if (ts.length < terms(q).length) note = `${t("noExact")} <b>${esc(q)}</b> · ${t("showing")} <b>${esc(ts.map((t) => t.w).join(" "))}</b> · ` + note;
  }
  // product types: the search's type(s), and products of that type that don't even contain the word
  KQ = queryKinds(ts);
  PET_SEARCH = ts.some((t) => t.alts.some((a) => PET_RE.test(a) || /\b(cat|dog|katze|hund|tier|chat|chien)/.test(a)));
  QPLANT = ts.some((t) => t.alts.some((a) => PLANT_RE.test(a)));
  if (KQ.size && all.some((it) => it.k != null && KQ.has(it.k))) {
    const inOut = new Set(out);
    for (const it of all) {
      if (it.k != null && KQ.has(it.k) && !inOut.has(it) && !it.gone && active.has(it.s) && !isHidden(it) &&
          !(promoOnly && it.o == null) && !(bioOnly && !isBio(it))) { it.t = it.kc ? 4 : 1; out.push(it); }
    }
  } else KQ = null;
  const intent = intents(out, ts);
  for (const it of out) it.g = groupOf(it, intent);
  const mode = $("#sort").value;
  // the most common unit among the best matches goes first (so kg prices are compared with kg prices)
  const live = out.filter((it) => !it.gone);
  const top = live.length ? Math.min(...live.map(grp)) : 0;
  const cnt = {};
  for (const it of live) if (grp(it) === top && it.uu) cnt[it.uu] = (cnt[it.uu] || 0) + 1;
  const main = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
  const up = (it) => it.gone ? it.was.up : it.up;
  const key = (it) => mode === "price" ? it.p : mode === "pct" ? -(it.pct || (it.was && it.was.pct) || 0) : (up(it) ?? 1e9);
  out.sort((a, b) => grp(a) - grp(b) ||
    (mode === "unit" ? (a.uu !== main) - (b.uu !== main) || (a.uu || "~").localeCompare(b.uu || "~") : 0) ||
    key(a) - key(b) || a.p - b.p);
  results = out;
  const nLive = live.length;
  const filt = active.size < visibleStores().length
    ? ` · ${t("only")} ${[...active].map((id) => esc(storeOf(id).label)).join(", ")} <button type="button" class="allshops">${t("allShops")}</button>` : "";
  $("#status").innerHTML = note + (out.length
    ? `${nLive} ${nLive === 1 ? t("result") : t("results")}` + (mode === "unit" && main ? ` · ${t("sortedPer")} ${UNIT_LABEL[main] || main}` : "")
    : t("nothing")) + filt;
  const best = live.filter((it) => grp(it) === top);
  summarize(q, best, main, ts);
  kinds(q, best, ts);
  render();
}

// ---------------------------------------------------------------- kinds ("Seidentofu", "geräuchert", "Bio" …)
const STOP = new Set(("und mit the and with les des pour aus von fuer pro per nature natur classic original " +
  "pack stk stueck x").split(" "));
function kinds(q, best, ts) {
  const box = $("#kinds");
  box.innerHTML = "";
  if (best.length < 4) return;
  const alts = ts.flatMap((t) => t.alts);
  const qwords = new Set(alts.flatMap((a) => a.split(" ")));
  const count = new Map(), label = new Map(), compound = new Set();
  for (const it of best) {
    const words = new Set();
    const brand = new Set(norm(it.b || "").split(" "));
    for (const tok of it.n.split(/[^A-Za-zÀ-ÿ]+/)) {
      const w = norm(tok);
      if (w.length < 4 || qwords.has(w) || brand.has(w) || STOP.has(w)) continue;
      if (!label.has(w)) label.set(w, tok.length > 3 && tok === tok.toUpperCase() ? tok[0] + tok.slice(1).toLowerCase() : tok);
      if (alts.some((a) => a.length >= 3 && w.endsWith(a))) compound.add(w);
      words.add(w);
    }
    for (const w of words) count.set(w, (count.get(w) || 0) + 1);
  }
  const top = [...count].filter(([w, c]) => c >= 2 && c < best.length * 0.9)
    .sort((a, b) => (compound.has(b[0]) - compound.has(a[0])) || b[1] - a[1]).slice(0, 10);
  if (!top.length) return;
  box.innerHTML = `<span class="kl">${t("kinds")}</span>` + top.map(([w, c]) =>
    `<button type="button" class="chip kind" data-q="${esc(compound.has(w) ? label.get(w) : q + " " + label.get(w))}">${esc(label.get(w))} <span class="n">${c}</span></button>`).join("");
}

const pct = (xs, p) => { const s = [...xs].sort((a, b) => a - b); const i = (s.length - 1) * p;
  return s[Math.floor(i)] + (s[Math.ceil(i)] - s[Math.floor(i)]) * (i % 1); };

// Summary on top: cheapest, what counts as a good price (cheapest quarter), typical (median), for all and for organic.
function summarize(q, best, unit, ts) {
  good = null;
  const box = $("#sum");
  const live = best.filter((it) => it.uu === unit && it.up != null && !storeOf(it.s).static);
  if (!q || !unit || live.length < 3) { box.hidden = true; box.innerHTML = ""; return; }
  const u = UNIT_LABEL[unit] || unit;
  const qBio = ts.some((t) => t.alts.includes("bio"));
  const sets = qBio ? [["bio", live]] : [["all", live], ["bio", live.filter(isBio)]];
  good = { unit };
  let rows = "";
  for (const [name, xs] of sets) {
    if (xs.length < 3) continue;
    const ups = xs.map((it) => it.up);
    const cheapest = xs.reduce((a, b) => (b.up < a.up ? b : a));
    // "good" = what a few shops sell it for, close to the very cheapest: the 5th-cheapest product, but never more than
    // 20% above the cheapest (one odd cheap item can't drag it down: at least 5% above the cheapest)
    const sorted = [...ups].sort((a, b) => a - b);
    const fifth = sorted[Math.min(4, sorted.length - 1)];
    const thr = Math.max(cheapest.up * 1.05, Math.min(fifth, cheapest.up * 1.2));
    if (name === "bio" && !qBio) good.bio = thr; else good.std = thr;
    rows += `<div class="srow"><b>${name === "bio" ? t("organic") : t("all")}</b>
      <span>${t("cheapest")} <strong>${fmt(cheapest.up)}/${u}</strong> <small>${esc(storeOf(cheapest.s).label)}</small></span>
      <span>${t("goodPrice")} <strong class="g">≤ ${fmt(thr)}/${u}</strong></span>
      <span>${t("typical")} ${fmt(pct(ups, 0.5))}/${u}</span></div>`;
  }
  const promos = live.filter((it) => it.o != null && it.up <= ((isBio(it) && good.bio) || good.std || Infinity))
    .sort((a, b) => a.up - b.up).slice(0, 2);
  const promoTxt = promos.map((it) => `${esc(storeOf(it.s).label)} ${esc(pname(it))} <strong>${fmt(it.up)}/${u}</strong> (−${it.pct}%${it.until ? ", " + t("until") + " " + ddmm(it.until) : ""})`).join(" · ");
  box.innerHTML = rows ? `<div class="sh">${esc(q)} · ${t("pricePer")} ${u} <small>(${t("notPerPack")}) · ${live.length} ${t("products")}</small></div>${rows}` +
    (promoTxt ? `<div class="sp">${t("goodDealNow")} ${promoTxt}</div>` : "") : "";
  box.hidden = !rows;
}

function isGood(it) {
  if (!good || it.gone || it.uu !== good.unit || it.up == null || grp(it) !== 0) return false;
  const thr = isBio(it) && good.bio != null ? good.bio : good.std;
  return thr != null && it.up <= thr + 1e-9;
}

// ---------------------------------------------------------------- deals
// A promotion is rated against (a) its own regular price (% off) and (b) what similar products cost:
// the median price per kg/l/pc of the same shop's category. "top" = extremely good, "good" = good deal.
let dealCat = "", dealScope = "food";
const NONFOOD = /kuechenbedarf|raumduft|bettbez|handpflege|verpackung|kochgeschirr|besteck|papierartikel|grill ?zubehoer|holzkohle|anzuend|beauty|gesundheit|kosmetik|koerperpflege|dusch|bade|haar|reinig|wasch|haushalt|papeterie|buero|tier|non food|nonfood|drogerie|baby|windel|hygiene|zahn|deo|parfum(?!reis)|make up|garten|spiel|kueche|wohn|putz|katzen|hunde|maschine|geraet|elektro|\btisch|\bdeko|serviette/;
const NONFOOD_NAME = new RegExp("\\b(listerine|odol|persil|omo|ariel|lenor|tempo|airwick|air wick|finish|calgon|somat|sipuro|axe|nivea|rexona|" +
  "colgate|elmex|trisa|zwilling|silvercrest|tesa|duracell|varta|pampers|always|gillette|plenty|wc|deo|pants|lotion)\\b|" +
  "waschmittel|weichspuel|geschirrspuel|spuelmittel|fettloeser|entkalk|reiniger|shampoo|duschgel|dusche|seife|bodylotion|" +
  "handbalsam|zahnbuerst|zahnpasta|zahncreme|windel|feuchttuech|allzwecktuech|haushaltstuch|haushaltspapier|" +
  "toilettenpapier|wc papier|kuechenrolle|taschentuech|brotmesser|messer set|pfanne|alufolie|frischhaltefolie|kerze|" +
  "batterie|milchaufschaeum|duftstecker|freshmatic|gewebeveredler|schale karton|kartonschale|einweg|lessive|detergent|" +
  "becher karton|to go|klappstuhl|stuhl|handschuh|deostick|deo stick|febreze|glitter|deko|serviette|pappteller|besteck|" +
  "stift|notizbuch|socken|strumpf|shirt|sonnencreme|lippen|mascara|shower|dove|kartonteller|pappteller|teller|" +
  "schale aus karton|sun brilliant|all in 1|geschirr|revlon|rostschreck|rost|kabel|lampe|werkzeug|conditioner|bettwaesche|desinfekt|tisch\\b|vanish|spuelmaschin|" +
  "thermowaesche|deospray|haarspray|shampoo");
const isFood = (it) => !NONFOOD.test(norm((it.ct || "") + " " + (it.c || ""))) && !NONFOOD_NAME.test(norm(it.n));
function rateDeals() {
  // What a kind of product normally costs per kg / l across ALL shops: "jasmine rice" from every shop and brand,
  // at regular prices. A 40% discount on a premium brand that still costs more than ordinary jasmine rice is no deal.
  const regular = (it) => (it.o != null ? it.up * it.o / it.p : it.up);
  const byKind = new Map(), byShelf = new Map(), kindShops = new Map();
  const add = (m, k, v) => (m.get(k) || m.set(k, []).get(k)).push(v);
  for (const it of all) {
    if (it.gone || it.up == null || (it.uu !== "kg" && it.uu !== "l")) continue;   // pieces aren't comparable
    if (it.k != null) { add(byKind, it.k + "|" + it.uu, regular(it)); add(kindShops, it.k + "|" + it.uu, it.s); }
    if (it.c) add(byShelf, it.s + "|" + it.c + "|" + it.uu, regular(it));
  }
  // only groups whose products cost roughly the same per kg/l (not nail polish remover next to perfume)
  const median = (v, spread = 3, n = 6) => (v && v.length >= n && pct(v, 0.75) <= spread * pct(v, 0.25) ? pct(v, 0.5) : null);
  // a type is a fair yardstick only if it is specific (jasmine rice, butter — not "vegetables" or "meats") and
  // at least two shops sell it
  const specific = (k) => KINDS[k] && KANC[k] && KANC[k].split(" ").length >= 4;
  const ref = (k, uu) => specific(k) && new Set(kindShops.get(k + "|" + uu) || []).size >= 2 ? median(byKind.get(k + "|" + uu), 4) : null;
  const kindRef = (it) => {                    // the product's own type, else its (specific) parent: jasmine rice -> rice
    if (it.k == null) return null;
    const own = ref(it.k, it.uu);
    if (own) return [own, it.k];
    for (const p of (KINDS[it.k] && KINDS[it.k].p) || []) {
      const m = ref(p, it.uu);
      if (m) return [m, p];
    }
    return null;
  };
  for (const it of all) {
    it.deal = null; it.rel = null; it.relKind = null;
    if (it.gone || it.o == null) continue;
    if (it.up != null) {
      const kr = kindRef(it);
      // no type: the shop's shelf, but only a narrow one (Denner's "Sonstiges" mixes everything)
      const m = kr ? kr[0] : it.c ? median(byShelf.get(it.s + "|" + it.c + "|" + it.uu), 2, 8) : null;
      if (m) { it.rel = it.up / m; it.relKind = kr ? kr[1] : null; }   // 0.6 = 40% below what this kind usually costs
    }
    const pc = (it.pct || 0) * (it.cmp ? 0.5 : 1);   // "statt" = competitor's price: less reliable
    const r = it.rel;
    if (r != null) {
      // top = clearly cheaper than this kind usually costs anywhere, AND a real discount
      if ((pc >= 25 && r <= 0.7) || (pc >= 40 && r <= 0.85)) it.deal = "top";
      else if ((pc >= 15 && r <= 0.9) || (pc >= 30 && r <= 1.05)) it.deal = "good";
      // discounted but still dearer than usual for this kind: no label
    } else if (pc >= 50) it.deal = "top";            // nothing to compare with: only a very big discount counts
    else if (pc >= 35) it.deal = "good";
    it.ds = pc / 100 + (r != null ? Math.min(0.3, Math.max(0, 1 - r)) * 0.5 : 0);   // ranking: mainly the discount
  }
}
const kindLabel = (k) => (KINDS[k] ? KINDS[k].id.replace(/-/g, " ") : "");

// ---------------------------------------------------------------- food groups + your interests
// The shops' own top shelves (Migros / Coop): every product falls into one, from its product type and the shop's shelf.
// In Settings each is set to show or hide; the Deals page follows that. Search is never filtered by it.
// Order matters: the first match wins (beer before drinks, juices before fruit, cakes before bread …).
const FOOD_GROUPS = [
  ["vegfruit", "Fruit & vegetables", /trauben|grapes|raisins|vegetables|gemuese|fruits|obst|frucht|fruechte|salads|salat|mushroom|pilze|herbs|kraeuter/],
  ["meatfish", "Meat & fish", /schuefeli|schinkli|pferd|saucisse|rippli|cervelat|salami|bratwurst|meats|poultr|fleisch|gefluegel|beef|rind|pork|schwein|veal|kalb|lamb|lamm|sausage|wurst|charcuter|hams|schinken|metzger|chicken|poulet|turkey|trute|duck|ente|bacon|speck|hackfleisch|fishes|seafood|fisch|meeresfruecht|salmon|lachs|tuna|thunfisch|shrimp|crevett|garnel|mussel|muschel/],
  ["dairy", "Dairy & eggs", /dairies|milch|milk|cheese|kaese|butter|eggs|eier|rahm|cream|molkerei|yogurt|joghurt|yoghurt|quark|pudding|dessert/],
  ["bread", "Bread & bakery", /breads|brot|backwaren|baeckerei|bakery|cakes|kuchen|\btorte|patisserie|pastries|croissant|gipfel|viennoiser|stollen/],
  ["pantry", "Pantry: rice, pasta, oils, nuts, coffee", /spaghett|lasagne|tagliatell|tagliolin|penne|fusilli|farfalle|knoepfli|spaetzli|hoernli|muesli|mueesli|granola|crunch|flakes|cereals|oliven|olives|tortilla|wraps|cereal-grains|cereals-and-potatoes|rices|reis|pastas|teigwaren|flours|mehl|legumes|huelsenfr|lentil|linsen|bohnen|beans|chickpea|kichererbs|polenta|couscous|bulgur|oat|hafer|potato|kartoffel|grundnahrungsmittel|semolina|griess|noodles|nudeln|nuts|nuss|nuesse|seeds|samen|kerne|almond|mandel|cashew|pistaz|pistach|peanut|erdnuss|dried-fruits|trockenfr|oils|oel|fats|ghee|margarin|fett|condiments|sauces|spices|gewuerz|wuerz|konserven|canned|vinegar|essig|ketchup|mustard|senf|mayo|bouillon|meals|fertiggericht|pizza|coffee|kaffee|teas|tee|tea-bags|herbal|infusion/],
  ["sweets", "Sweets & snacks", /mentos|toblerone|merci|biber|tuc\b|ragusa|kambly|haribo|chocolate|schokolad|confectioner|candies|bonbon|suessigkeit|sweets|pralin|riegel|gummi|marshmallow|sugary-snacks|brotaufstrich|sweet-spreads|chocolate-spreads|nut-spreads|honig|honey|konfituere|jams|biscuits|cookies|gebaeck|guetzli|keks|waffel|lebkuchen|gingerbread|ice-creams|glace|frozen-desserts|salty-snacks|crisps|chips|snack|apero|crackers|popcorn|pretzel|salzstangen|flips/],
  ["drinks", "Drinks: water, soft drinks, juice", /soft-drinks|sodas|colas|iced-teas|energy-drinks|lemonades|sweetened-beverages|suessgetraenk|softdrink|limonade|eistee|erfrischungsgetraenk|energydrink|funktionsgetraenk|sirup|syrup|fruit-juices|juices|nectars|saefte|saft|nektar|smoothie|waters|mineralwasser|wasser|suessgetraenk|erfrischungsgetraenk|energiegetraenk|sportgetraenk/],
  ["alcohol", "Wine, beer & spirits", /crianza|reserva|ribera|bordeaux|dole|valais|\b(rose|rosé|syrah|merlot|pinot|chianti|rioja|primitivo|chardonnay|sauvignon|riesling|cava|igp|igt|docg?)\b|(?<!non[- ])alcoholic|beers|wines|spirits|bier|(?<!sch)wein|spirituos|liqueur|likoer|cider|prosecco|champagne/],
];
// matching order (first match wins) differs from the display order above
const MATCH_ORDER = ["alcohol", "drinks", "sweets", "meatfish", "bread", "dairy", "vegfruit", "pantry"]
  .map((id) => FOOD_GROUPS.find((g) => g[0] === id));
// earlier, finer groups: a new group is hidden if every old group in it you had set was hidden
const OLD_GROUPS = { drinks: ["softdrinks", "juices", "water"], sweets: ["sweets", "cakes", "snacks"], dairy: ["dairy", "yogurt"],
  meatfish: ["meat", "fish"], pantry: ["staples", "nuts", "oils", "pantry", "coffee"], bread: ["bread"], vegfruit: ["vegfruit"], alcohol: ["alcohol"] };
const GROUP_LABEL = new Proxy({}, { get: (_, g) => t("g_" + String(g)) });
const SOFT_NAME = /\b(capri sun|pepsi|coca cola|cola zero|fanta|sprite|red bull|rivella|schweppes|ice tea|icetea|eistee|energy drink|7 ?up|mountain dew|monster energy|mineralwasser|valser|henniez|evian|vittel|san pellegrino|softdrink|limonade|orangensaft|apfelsaft|multivitaminsaft)\b/;
// pet food and care, by name or shelf: Whiskas, Felix, Katzenstreu, the shops' "Tierbedarf" shelves
const PET_RE = /\b(whiskas|felix|sheba|purina|pedigree|frolic|kitekat|cesar|gourmet gold|gourmet perle|perfect fit|vitakraft|catsan|animonda|royal canin|hill s|friskies|kattovit|bozita|cat food|dog food|katzenfutter|hundefutter|katzenstreu|nagerfutter|vogelfutter|tierfutter|tiernahrung|tierbedarf|haustier|katzen?snack|hunde?snack|nassfutter|trockenfutter|cats?|dogs?)\b|katze(?!nzunge)|hunde(?!rt)/;
function foodGroup(it) {
  if (it.fg !== undefined) return it.fg;
  if (PET_RE.test(norm([it.n, it.c, it.ct].filter(Boolean).join(" ")))) return (it.fg = "pets");
  if (!isFood(it)) return (it.fg = "household");
  // soft drinks by name: brands and kinds every shop sells, whatever shelf or type they got
  if (SOFT_NAME.test(norm(it.n + " " + (it.ne || "")))) return (it.fg = "drinks");
  const txt = (it.k != null && KANC[it.k] ? KANC[it.k] + " " : "") + norm([it.c, it.ct].filter(Boolean).join(" ")) +
    (it.k == null ? " " + norm(it.n) : "");
  for (const [id, , re] of MATCH_ORDER) if (re.test(txt)) return (it.fg = id);
  const nm = norm(it.n + " " + (it.ne || ""));                     // type and shelf say nothing: the name decides
  for (const [id, , re] of MATCH_ORDER) if (re.test(nm)) return (it.fg = id);
  return (it.fg = "other");
}
// per group just show or hide (older "more"/"normal"/"top" settings count as show)
function interest(g) {
  const pref = (typeof P !== "undefined" && P.pref) || {};
  const v = (k) => (pref[k] && !pref[k].del ? pref[k].v : null);
  if (pref[g] && !pref[g].del) return v(g) === "hide" ? "hide" : "show";
  const set = (OLD_GROUPS[g] || []).map(v).filter(Boolean);
  return set.length && set.every((x) => x === "hide") ? "hide" : "show";
}
const goodToo = () => load("goodDeals", false);
const usePrefs = () => load("usePrefs", true);
// buying in quantity: 1 kg / 1 l packs and more rank higher
const packAmount = (it) => (it.up && (it.uu === "kg" || it.uu === "l") ? it.p / it.up : null);
const bulkBoost = (it) => { const a = packAmount(it); return a == null ? 1 : a >= 2.5 ? 1.35 : a >= 1 ? 1.2 : 1; };

function showDeals() {
  const prefsOn = usePrefs();
  // only top deals (good deals on request), from the food groups you show
  const pool = all.filter((it) => {
    if (!(it.deal && active.has(it.s) && !isHidden(it) && (dealScope === "all" || (dealScope === "food") === (isFood(it) && foodGroup(it) !== "pets")))) return false;
    if (it.deal !== "top" && !goodToo()) return false;
    if (bioOnly && !isBio(it)) return false;
    return !prefsOn || interest(foodGroup(it)) !== "hide";
  });
  for (const it of pool) it.score = it.ds * bulkBoost(it);
  const cats = new Map();
  for (const it of pool) if (it.c) cats.set(it.c, (cats.get(it.c) || 0) + 1);
  const deals = pool.filter((it) => !dealCat || it.c === dealCat)
    .sort((a, b) => (a.deal === "top" ? 0 : 1) - (b.deal === "top" ? 0 : 1) || b.score - a.score);
  for (const it of deals) it.g = it.deal === "top" ? 0 : 1;
  results = deals; good = null;
  keepMore("d|" + dealCat + "|" + dealScope + goodToo() + usePrefs() + [...active].join());
  $("#sum").hidden = true; $("#sum").innerHTML = "";
  const topCats = [...cats].sort((a, b) => b[1] - a[1]).slice(0, 14);
  const scopes = [["food", t("foodDrinks")], ["home", t("household")], ["all", t("all")]];
  $("#kinds").innerHTML = `<button type="button" class="chip kind interests" data-prefs="1" aria-pressed="${prefsOn}">${t("myInterests")}</button>` +
    `<button type="button" class="chip kind" data-good="1" aria-pressed="${goodToo()}">${t("goodDealsToo")}</button>` + scopes.map(([k, l]) => `<button type="button" class="chip kind" data-scope="${k}"${dealScope === k ? ' aria-pressed="true"' : ""}>${l}</button>`).join("") +
    (pool.length ? `<span class="kl">${t("inCat")}</span>` +
    `<button type="button" class="chip kind" data-cat=""${dealCat ? "" : ' aria-pressed="true"'}>${t("allLc")} <span class="n">${pool.length}</span></button>` +
    topCats.map(([c, n]) => `<button type="button" class="chip kind" data-cat="${esc(c)}"${dealCat === c ? ' aria-pressed="true"' : ""}>${esc(c)} <span class="n">${n}</span></button>`).join("") : "");
  const nTop = deals.filter((it) => it.deal === "top").length;
  $("#status").innerHTML = all.length
    ? `<b>${t("topDealsWeek")}</b> · ${nTop}${goodToo() ? ` · ${deals.length - nTop} ${t("goodDeals")}` : ""}`
    : t("loading");
  renderDeals();
}

function renderDeals() {
  cardItems = [];
  const lbl = [t("topDealsH"), t("goodDealsH")];
  let html = "", g = -1;
  for (const it of results.slice(0, shown)) {
    if (it.g !== g) { g = it.g; html += `<li class="sep"><i class="mark mark-${g ? "good" : "top"}"></i>${lbl[g]}</li>`; }
    html += card(it);
  }
  $("#list").innerHTML = html;
  $("#more").hidden = results.length <= shown;
}

function hint() {
  const ex = ["Ingwer", "Mozzarella", "Butter", "rice", "chicken breast", "tofu", "huile d'olive", "Kaffee"];
  return `<span class="hint">${t("hint")}<br>${ex.map((e) => `<button type="button" data-q="${esc(e)}">${esc(e)}</button>`).join("")}</span>`;
}

// ---------------------------------------------------------------- render
// shop wordmarks: typography in each shop's colours (styled in style.css as .wm-<id>)
const WORDMARK = { aligro: "ALIGRO", migros: "MIGROS", lidl: "LIDL", aldi: "ALDI", denner: "DENNER", prodega: "PRODEGA",
  maxim: "MAXIM", asia: "ASIA", coop: "COOP" };
// shop marks: the full name in each shop's typography and colours (pure HTML/CSS, see .wm-* in style.css)
const MARK = {
  aligro: '<svg class="aligromark" viewBox="0 0 457.56 56.69" aria-hidden="true"><defs></defs><title>Logo</title><g id="Calque_2" data-name="Calque 2"><g id="Logo"><path fill="#e3000b" d="M89.6,1.76H69a2,2,0,0,0-1.71,1L37.68,53.65a.85.85,0,0,0,.74,1.28H58a2,2,0,0,0,1.7-1l4.73-7.87a.86.86,0,0,1,.73-.41H93a.86.86,0,0,1,.74.43l4.42,7.8a2,2,0,0,0,1.72,1h19.7a.85.85,0,0,0,.74-1.27l-29-50.9A2,2,0,0,0,89.6,1.76ZM70.72,34.62l8.14-15.94a.4.4,0,0,1,.71,0l8.05,15.94a.35.35,0,0,1-.3.5H71A.34.34,0,0,1,70.72,34.62Zm78.64,8.6h22.82a1.7,1.7,0,0,1,1.7,1.7v8.31a1.7,1.7,0,0,1-1.7,1.7H129.56a1.7,1.7,0,0,1-1.7-1.7V3.46a1.7,1.7,0,0,1,1.7-1.7h17.53a1.7,1.7,0,0,1,1.7,1.7v39.2A.56.56,0,0,0,149.36,43.22ZM182.7,1.76h17.53a1.7,1.7,0,0,1,1.7,1.7V53.23a1.7,1.7,0,0,1-1.7,1.7H182.7a1.7,1.7,0,0,1-1.7-1.7V3.46A1.7,1.7,0,0,1,182.7,1.76ZM390.29,27.43c0,9.17,10.26,15.87,22.75,15.87s22.74-6.7,22.74-15.87c0-7.34-10.25-14-22.74-14s-22.75,6.69-22.75,14Zm67.27-.07c0,17.21-18.68,29.33-44.52,29.33s-44.53-12.12-44.53-29.33C368.51,11.28,389.87,0,413,0s44.52,11.28,44.52,27.36ZM292.11,25.24a1.88,1.88,0,0,1,1.87,2c-.33,6.92-1.6,13-8.15,19-7.9,7.26-19.75,10.43-33.2,10.43-25.31,0-42.92-11.35-42.92-28.06C209.71,11.35,227.43,0,253.38,0c15.65,0,28,4.41,35.12,13.31a1.31,1.31,0,0,1-.67,2.08L271.15,20a1.83,1.83,0,0,1-2-.72c-3.11-4.47-8.91-7.38-16.73-7.38-13.77,0-20.93,8.68-20.93,16.79S239,45.34,252.74,45.34c8.82,0,15.62-2.93,16.78-8.73a.44.44,0,0,0-.43-.51h-14.7a1.87,1.87,0,0,1-1.87-1.87V27.12a1.88,1.88,0,0,1,1.87-1.88Zm30.62-.15a.51.51,0,0,0,.51.51h1.52c6.84,0,14.53-.85,14.53-6.63s-7.69-6.63-14.53-6.63h-1.52a.51.51,0,0,0-.51.51Zm43.73,29.84h-23a1.7,1.7,0,0,1-1.22-.52l-19-19.65c-.27-.27-.49-.18-.49.2V53.23a1.7,1.7,0,0,1-1.7,1.7H303.51a1.7,1.7,0,0,1-1.7-1.7V3.46a1.7,1.7,0,0,1,1.7-1.7h29.58c15.91,0,28,5,28,16.36,0,7.2-6,13.45-17,14.94a.28.28,0,0,0-.16.49L367,53.44C368,54.26,367.72,54.93,366.46,54.93Z"/><path fill="#82da00" d="M49.17,1.76H1.7A1.7,1.7,0,0,0,0,3.46V53.23a1.7,1.7,0,0,0,1.7,1.7H18.55a2,2,0,0,0,1.71-1L49.91,3C50.32,2.34,50,1.76,49.17,1.76Z"/></g></g></svg>', migros: "MIGROS",
  lidl: '<svg class="lidlmark" viewBox="6.3 19.2 47.4 18.9" aria-hidden="true"><path fill="#e60a14" d="M28.377 30.736l-4.617-4.617-5.322 5.332v1.79l1.341-1.346 3.715 3.725-1.372 1.367 0.892 0.897 7.43-7.44v-1.784l-2.066 2.077z"/><path fill="#0050aa" d="M6.824 25.148h8.223v1.774h-1.372v5.739l4.763-2.65v4.857h-11.614v-1.784h1.377v-6.162h-1.377v-1.774zM41.494 25.148v1.774h1.377v6.162h-1.377v1.784h11.624v-4.857l-4.769 2.65v-5.739h1.377v-1.774h-8.233z"/><path fill="#e60a14" d="M23.082 19.623c1.616 0 2.927 1.31 2.927 2.927s-1.31 2.927-2.927 2.927c-1.616 0-2.927-1.31-2.927-2.927 0-0.004 0-0.007 0-0.011v0.001c0 0 0 0 0 0 0-1.611 1.306-2.917 2.917-2.917 0.004 0 0.007 0 0.011 0h-0.001z"/><path fill="#0050aa" d="M36.913 25.148h-7.826v1.774h1.372v6.162h-1.388v1.784h7.826c5.812 0 5.885-9.72 0.016-9.72z"/><path fill="#fff000" d="M35.812 31.826h-0.391v-3.652h0.329c1.717 0 1.717 3.652 0.063 3.652z"/></svg>',
  aldi: '<svg class="aldiA" viewBox="118 120 474 335" aria-hidden="true"><defs><linearGradient id="aldiA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset=".55" stop-color="#5bb8ee"/><stop offset="1" stop-color="#2f8fd6"/></linearGradient></defs><path fill="url(#aldiA)" d="M338.44,124.22c-24.4,0-34.23,16.79-43.39,43.66l-83.21,244.95c-7.14,21.03-16.19,33.78-31.34,35.6v1.35h43.19c24.4,0,34.23-16.79,43.39-43.66l83.21-244.95c7.14-21.03,17.02-33.76,32.18-35.6v-1.35h-44.04,0Z"/><path fill="url(#aldiA)" d="M416.68,123.77c-24.4,0-34.23,16.79-43.39,43.66l-83.16,244.7c-7.14,21.03-16.19,33.81-31.34,35.6v1.35h43.19c24.4,0,34.23-16.79,43.39-43.66l83.13-244.7c7.14-21.03,17.02-33.76,32.18-35.6v-1.35h-44.01,0Z"/><path fill="url(#aldiA)" d="M260.25,124.7c-24.4,0-34.23,16.79-43.39,43.69l-95.96,282.13h24.45c24.4,0,34.23-16.79,43.39-43.66l83.28-245.18c7.14-21.03,17.02-33.76,32.18-35.6v-1.35h-43.99l.02-.02Z"/><path fill="url(#aldiA)" d="M508.92,238.27c-9.06-18.46-18.81-20.81-35.85-20.81h-43.39l-17.14,50.47h85.13c12.25,0,22.16,1.6,29.04,10.75h1.52s-17.09-35.98-19.29-40.42h-.02Z"/><path fill="url(#aldiA)" d="M539.81,311.1c-8.51-17.84-18.74-20.76-35.88-20.76h-99.05l-17.14,50.47h140.07c12.6,0,21.93,1.85,28.99,11.1h1.52s-16.37-36.33-18.51-40.82h0Z"/><path fill="url(#aldiA)" d="M571.49,386.47c-8.88-19.88-19.91-22.85-37.03-22.85h-154.46l-14.2,41.82c-1.02,3.02-2.07,5.91-3.12,8.66h195.5c11.4,0,20.78,2.02,28.02,11.43h1.52s-15.19-36.8-16.19-39.05h-.05Z"/></svg><svg class="aldimark" viewBox="120 488 460 138" aria-hidden="true"><path fill="#fff" d="M225.14,621.74c-1.6-6.81-4.67-18.99-6.16-23.98h-46.93c-1.55,5.04-4.57,17.19-6.16,23.98h-42.11c17.86-56.44,26.02-80.19,45.96-130.21h51.57c19.93,50.05,28.12,73.8,45.96,130.21h-42.11ZM177.94,569.67h35.13c-4.94-17.44-14.27-46.41-17.56-54.69-3.29,8.28-12.62,37.25-17.56,54.69h0Z"/><path fill="#fff" d="M313.54,621.74c-21.88,0-33.96-12.47-33.96-35.15v-95.06h39.4v87.52c0,10.95,3.02,13.8,14.62,13.8h38.25l5.84,28.89h-64.17.02Z"/><path fill="#fff" d="M393.38,621.74v-130.21h54.44c39.99,0,68.01,16.32,68.01,64.07s-22.38,66.14-66.27,66.14h-56.19ZM432.77,593.6h11.1c24.13,0,33.76-10.78,33.76-38,0-25.57-11.68-35.9-35.13-35.9h-9.73v73.9Z"/><rect fill="#fff" x="537.01" y="491.53" width="39.37" height="130.21"/></svg>', denner: '<svg class="dennermark" viewBox="0 0 187 40" aria-hidden="true"><path fill="#dd0a0a" d="M0 0h186.7v40H0z"></path><path d="M164.5 19.3c3.5 0 4.6-1.3 4.6-3 0-1.6-1.5-2.3-3.4-2.3h-3l-1.5 5.3h3.3Zm-8.7-12.6h10.5c6.8 0 11.8 2.1 11.8 8.5 0 4-2.1 7.7-7.4 9.3l3.7 8.8h-9.7l-2.7-7.7h-2.5l-2 7.7h-8.9l7.2-26.6Zm-25.6 0H153l-2 7.3h-13.8l-.8 2.9h13l-1.7 6.2h-13l-.8 3H148l-2 7.2H123l7.2-26.6Zm-29.7 0h8.4l6 12.8 3.4-12.8h8.8L120 33.3h-8l-6.3-13.2-3.6 13.2h-8.8l7.2-26.6Zm-29.7 0h8.4l6 13.1 3.4-13.1h8.9l-7.2 26.6h-8l-6.2-13.6-3.7 13.6h-8.8l7.2-26.6Zm-25.6 0h22.6l-2 7.3H52.2l-.9 2.9h13L62.5 23H49.6l-.8 3h14L61 33.2H38l7.3-26.6ZM21.3 25.5c4.8 0 8.6-1.7 8.6-6.7 0-3.2-2.1-4.4-5.4-4.4h-2l-3 11.1h1.8ZM15.7 6.7H25c8.8 0 14.3 3.5 14.3 11.2 0 10.2-8 15.4-18.5 15.4H8.5l7.2-26.6Z" fill="#fff" fill-rule="nonzero"></path></svg>',
  prodega: '<svg class="prodegamark" viewBox="50.5 16.2 234.5 31.2" aria-hidden="true"><g transform="translate(51.5 17.4) scale(.45)"><path fill="#ED1B2F" d="M4.774 3.53c-12.69 10.686 1.813 57.436 19.845 60.49 24.997 4.198 63.256-29.291 56.005-45.701C75.28 6.202 45.132 0 24.237 0 15.077 0 7.636 1.145 4.774 3.53"/><path fill="#fff" d="M76.304 13.001c-3.37 1.018-8.55 2.501-15.636 4.32-11.728 3.01-19.524 2.684-22.095 2.576-1.048-.042-1.438-.685-2.038-1.668-.726-1.183-1.623-2.667-4.12-3.606-1.352-.516-2.427-.655-9.847-.801l-6.089-.147c-4.805-.143-6.092-.176-6.578.384-.248.27-.189.63-.17.744.218 1.369 1.988 2.965 13.824 3.173 8.305.152 9.38 1.953 10.518 3.862l.516.83.482.786c.58 1 1.177 2.03 2.823 2.268 1.736.255 8.554-.979 20.907-3.21l4.908-.89c6.868-1.237 12.51-2.885 16.175-4.644-.875-1.415-2.083-2.742-3.58-3.977"/><path fill="#fff" d="M81.015 19.413c-3.944 2.607-17.009 9.891-40.018 13.753-17.97 3.023-34.919.768-38.702.34a73 73 0 0 0 1.338 4.383c3.219 1.446 14.9 5.07 25.13 6.177 11.251 1.218 11.233-2.296 11.509-3.297.295-1.01 1.314-2.018 2.52-2.346 1.213-.327 5.646.328 20.652-4.47 9.872-3.154 15.51-7.742 18.063-10.835.023-1.3-.133-2.538-.492-3.705"/><path fill="#fff" d="M9.248 27.946c-.03.206-.015.607.462.902.85.525 7.418 2.706 14.732 1.992 7.006-.677 8.66-1.41 9.16-2.441.12-.215.32-.563.153-1.167a3 3 0 0 0-.139-.416c-.49-1.152-1.441-.92-2.293-.71-.13.03-.754.212-.754.212-1.241.372-3.818 1.148-9.47 1.278-4.84.114-7.892-.494-9.365-.791l-1.227-.15c-.445.11-1.157.665-1.26 1.29"/><path fill="#fff" d="M10.447 20.996l-.15.58.041.172c.057.424.196 1.31 1.428 1.48l.357.051c1.442.207 4.43.64 9.352.602l4.697.028c2.427.028 3.338.045 3.694-.234.462-.35.486-.453.467-.904l-.005-.286c-.019-1.139-1.152-1.3-2.256-1.311l-1.615.014-6.41-.078c-2.391-.123-4.975-.453-6.674-.682l-1.723-.175c-.389.032-.953.384-1.203.743"/></g><path fill="#ED1B2F" d="M140.988 46.347c1.77 0 3.92-.901 3.92-.901l-2.237-7.87c-.813-2.903-2.178-4.473-4.065-5.08v-.117c2.409-.873 5.37-3.545 5.37-6.797 0-5.604-4.267-7.959-12.806-7.959-3.573 0-6.969.205-9.088.612v27.182h6.679V34.323h1.975c3.137 0 4.616 1.307 5.515 4.649l1.337 4.906c.523 1.916 1.917 2.469 3.4 2.469m-9.587-16.12h-2.64V22.36c.55-.175 1.597-.349 2.99-.349 3.6 0 5.488 1.54 5.488 4.183 0 2.612-2.148 4.035-5.838 4.035m29.248 15.627c9.205 0 14.2-6.014 14.2-14.552 0-7.665-4.618-13.94-13.679-13.94-9.265 0-14.144 6.245-14.144 13.97 0 7.29 4.357 14.522 13.623 14.522m.319-5.082c-4.908 0-6.913-4.387-6.913-9.586 0-5.169 1.944-8.74 6.913-8.74 4.935 0 6.852 4.064 6.852 9.06 0 5.43-1.973 9.266-6.852 9.266m-42.722-14.697c0-5.257-4.704-8.452-12.72-8.452-3.630 0-6.680.205-9.060.612v27.182h6.678v-9.873h2.061c8.365 0 13.04-2.382 13.04-9.469m-15.102 5.026V22.36c.755-.205 1.627-.35 2.964-.35 3.6 0 5.4 1.713 5.4 4.705s-1.887 4.386-5.604 4.386zm171.06 7.405 2.205 6.91h7.056l-8.133-23.987c-.955-2.846-3.02-4.067-5.807-4.067-1.654 0-3.483.35-4.907 1.076l-9.09 26.979h6.62l2.208-6.911zm-8.483-4.792 3.368-10.92h.349l3.4 10.92zm-51.694.03h8.538v-5.142h-8.538v-5.665h9.643c1.827 0 2.555-.696 2.555-3.28 0-.583-.029-1.306-.116-1.859h-18.617v27.619h19.255c.087-.435.117-1.278.117-1.858 0-2.615-.727-3.282-2.555-3.282h-10.282zm29.622 12.11c3.572 0 7.057-.698 9.264-1.454V30.083h-10.425V34.7h4.212v5.606c-.67.32-1.802.465-2.818.465-5.634 0-9.004-3.806-9.004-9.236 0-5.257 3.138-9.09 8.656-9.09 2.263 0 4.445.551 6.824 1.742.58-1.19 1.248-3.107 1.248-4.21 0-.904-.55-1.627-1.8-1.975-1.452-.436-3.428-.64-5.373-.64-10.338 0-16.582 5.547-16.582 14.55 0 3.95 1.626 7.725 4.269 10.107 2.758 2.526 6.332 3.834 11.529 3.834m-55.818-.262c8.918 0 15.306-4.153 15.306-14.318 0-8.858-6.13-13.65-14.784-13.65-3.950 0-6.390.232-9.263.611v26.747c1.798.377 5.342.61 8.741.61m-2.062-22.71c.61-.205 1.626-.379 2.645-.379 4.906 0 7.694 2.758 7.694 9.12 0 6.215-2.526 9.06-7.378 9.06-1.22 0-2.294-.115-2.961-.348z"/></svg>', maxim: '<svg class="apple" viewBox="0 0 96 122" aria-hidden="true"><path fill="#e6252d" fill-rule="evenodd" d="M15.2 32.3 12.5 34.2 8.2 38.3 7.8 39.5 6.5 40.8 6.2 42.3 4.3 45.7 3.5 48.3 2.7 54.0 2.5 65.8 3.3 74.5 6.7 89.2 9.7 97.5 16.5 110.8 21.0 115.8 24.0 118.0 27.7 118.8 31.3 118.8 34.3 118.2 40.7 115.0 44.8 113.5 48.8 113.8 56.3 118.2 59.0 118.8 63.3 118.7 66.5 117.7 69.0 115.2 69.2 114.0 68.5 114.0 66.7 115.5 65.2 115.3 62.2 115.8 59.5 115.3 58.0 114.5 55.3 112.0 54.2 111.7 51.7 109.3 47.3 107.3 42.2 107.3 33.8 110.2 30.7 110.5 28.3 110.2 26.3 108.3 24.7 106.2 21.5 99.5 20.7 96.3 19.7 95.0 18.3 88.8 17.3 87.2 14.3 71.2 14.0 56.5 14.7 51.5 16.2 47.0 17.7 45.0 21.2 42.2 24.3 41.3 26.2 41.5 29.2 42.8 32.5 43.7 40.7 47.0 44.5 47.8 51.0 47.8 55.2 46.8 60.5 44.7 63.3 43.2 64.3 42.2 67.2 41.3 69.2 40.2 72.5 39.7 79.2 40.0 84.0 42.3 87.0 44.3 91.0 49.2 91.8 49.7 92.2 49.3 92.0 47.3 89.8 43.0 84.8 38.0 82.7 36.5 79.2 35.0 73.8 33.7 68.7 33.8 64.8 34.5 63.2 35.5 61.5 35.7 55.0 38.2 51.7 38.8 48.2 38.8 42.3 37.3 30.8 31.7 26.2 30.8 22.5 30.7Z"/><path fill="#2a7b38" d="M78.3 5.0 75.2 3.7 70.0 3.0 61.5 3.8 54.0 6.3 48.8 10.7 46.3 13.8 45.0 17.3 44.5 22.7 45.0 26.0 46.0 27.0 47.3 27.0 48.3 24.5 49.7 23.8 49.8 21.8 51.3 20.5 53.5 20.5 53.7 22.8 52.3 24.5 51.5 24.7 51.5 26.3 50.0 30.5 50.0 31.7 50.5 32.2 53.8 32.2 56.5 31.3 60.5 28.5 63.2 25.7 65.0 23.0 67.7 16.2 72.5 9.2Z"/></svg>Maxim Merdan', lianhua: '<svg class="cart" viewBox="-1 -1 26.5 21" aria-hidden="true"><path d="M0 .4h2.6l4.7 14.6h13.3" fill="none" stroke="#5c3d1e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.9 3.9 10.5 12M8.1 6.7h14.2M24 3.6l-4.3 8.8" fill="none" stroke="#b08a5a" stroke-width="1.6" stroke-linecap="round"/><circle cx="8.6" cy="18" r="1.4" fill="#b08a5a"/><circle cx="17.6" cy="18" r="1.4" fill="#b08a5a"/></svg>LIANHUA<span lang="zh">联华</span>',
  asiaway: '<svg class="asiawaymark" viewBox="0 0 362.8 100" aria-hidden="true"><rect width="362.8" height="100" rx="20" fill="#b21f25"/><path fill="#fff" fill-rule="evenodd" d="M305.7 59.3 305.5 67.4 305.9 69.1 308.0 73.0 310.6 75.3 312.5 76.4 315.7 77.2 334.1 77.2 335.4 77.7 337.1 79.4 337.7 81.3 337.1 83.7 335.6 85.2 334.3 85.8 311.4 85.8 310.8 86.4 310.8 92.6 311.4 93.3 335.0 93.3 339.0 92.0 342.4 89.2 344.6 85.6 345.0 83.9 344.8 78.1 343.3 74.9 342.2 73.6 344.1 70.4 345.0 67.8 344.8 59.1 338.2 59.1 337.7 59.5 337.5 66.6 335.6 69.1 333.7 69.8 315.7 69.6 313.8 68.1 312.9 66.3 312.7 59.3ZM180.4 54.2 180.4 67.4 181.3 70.4 183.4 73.6 184.9 74.9 187.5 76.4 189.6 77.0 209.5 77.2 212.9 76.4 216.3 74.3 219.5 76.4 223.0 77.2 241.8 77.2 244.6 76.6 247.1 75.3 248.6 74.0 250.5 71.7 252.0 67.8 252.0 54.0 251.2 53.5 245.6 53.5 244.8 54.2 244.6 66.8 242.8 68.9 240.7 69.8 224.0 69.8 222.3 69.3 220.6 67.6 220.0 65.9 220.0 54.2 218.9 53.5 213.6 53.5 212.7 54.0 212.5 66.3 211.6 68.1 210.1 69.3 208.6 69.8 190.7 69.6 188.6 67.8 187.9 66.6 187.9 54.6 187.5 53.7 181.3 53.5ZM111.0 43.1 110.8 71.1 111.2 72.3 112.7 74.7 115.9 76.8 117.8 77.2 126.4 77.2 127.2 76.2 127.2 70.6 126.8 70.0 118.7 69.8 118.0 68.9 118.0 43.3ZM264.6 37.7 264.2 38.8 264.2 43.9 264.9 45.0 287.3 45.0 290.1 46.5 291.1 48.4 291.1 50.1 290.5 51.6 288.1 53.5 270.4 53.5 267.4 54.0 263.6 55.9 260.8 58.9 259.1 63.1 258.9 66.3 259.3 68.7 260.6 71.7 262.1 73.6 265.1 76.0 269.3 77.2 288.4 77.2 292.0 76.2 294.3 74.7 297.1 71.5 298.6 67.2 298.2 61.6 297.3 59.7 295.6 57.4 297.1 55.4 298.2 53.1 298.6 47.5 297.8 44.6 295.8 41.6 292.9 39.0 289.6 37.7 287.9 37.5ZM266.3 65.5 267.0 63.4 267.8 62.3 269.6 61.2 287.9 61.2 289.0 61.6 290.5 63.1 291.1 64.4 291.1 66.3 290.3 68.1 288.4 69.6 287.1 69.8 269.3 69.6 267.2 67.8ZM139.6 37.7 139.2 38.4 139.2 44.3 140.3 45.2 163.1 45.2 164.0 45.6 165.7 47.5 165.9 50.7 165.3 51.8 163.1 53.5 145.2 53.5 143.0 53.7 139.4 55.2 135.6 59.1 134.1 62.5 134.1 68.3 134.9 70.6 136.6 73.2 140.0 76.0 144.3 77.2 163.1 77.2 167.0 76.2 169.5 74.5 172.1 71.3 173.2 68.9 173.6 66.6 173.2 62.1 172.1 59.5 170.6 57.4 172.1 55.2 173.2 52.7 173.6 48.2 172.7 44.8 170.6 41.3 168.0 39.2 165.3 37.9 162.9 37.5ZM141.3 64.6 142.0 63.1 143.5 61.6 144.5 61.2 162.9 61.2 164.2 61.9 165.7 63.6 165.9 66.8 164.2 68.9 162.3 69.8 145.4 69.8 143.0 68.9 142.2 68.1 141.3 66.3ZM68.4 40.1 65.5 43.7 64.2 47.5 64.6 53.1 66.1 56.1 67.8 58.0 70.4 59.9 74.9 61.2 93.2 61.2 95.2 62.5 96.4 65.3 95.6 67.8 93.9 69.3 92.4 69.8 70.2 69.8 69.5 70.4 69.5 76.6 70.4 77.2 93.4 77.2 97.3 76.2 100.7 73.6 103.3 69.3 103.9 64.6 103.5 62.1 102.0 58.9 99.2 55.9 95.4 54.0 92.4 53.5 74.6 53.5 72.3 51.6 71.6 50.3 71.6 48.4 72.3 47.1 74.6 45.2 97.9 45.0 98.6 44.1 98.4 37.9 97.7 37.5 74.9 37.5 71.2 38.4ZM23.3 37.7 22.9 38.6 22.9 44.1 23.6 45.0 46.9 45.2 49.2 47.1 49.9 48.4 49.9 50.3 49.2 51.6 46.9 53.5 27.0 53.7 24.8 54.4 22.1 56.1 19.5 58.9 17.8 63.1 18.0 68.7 19.7 72.3 23.8 76.0 28.1 77.2 47.1 77.2 50.7 76.2 53.1 74.7 55.6 71.9 57.3 67.4 57.3 63.6 56.9 61.6 55.4 58.7 54.3 57.6 56.9 53.1 57.3 51.2 57.3 47.3 56.3 44.1 54.6 41.6 51.6 39.0 48.4 37.7 46.6 37.5ZM25.1 65.3 26.1 62.7 28.3 61.2 46.6 61.2 47.7 61.6 49.2 63.1 49.9 64.4 49.9 66.3 48.4 68.7 46.0 69.8 29.1 69.8 27.2 69.1 25.9 67.8ZM112.7 6.7 108.0 8.0 105.2 9.7 102.4 12.5 101.1 14.4 99.9 17.6 99.4 19.5 99.4 24.2 100.3 27.5 101.4 29.6 102.9 31.7 105.4 34.1 110.1 36.4 115.2 37.1 118.9 36.4 122.3 34.9 125.1 32.8 126.8 30.9 128.3 28.3 129.6 24.2 129.6 19.3 128.7 16.3 126.6 12.5 123.2 9.3 119.5 7.4 117.8 6.9ZM114.0 15.3 118.0 15.1 120.4 15.9 123.4 18.5 124.9 21.5 125.1 24.7 123.8 28.3 121.4 30.9 118.9 32.2 115.0 32.4 113.3 31.9 110.3 30.0 108.2 26.8 107.6 24.2 108.2 20.6 109.5 18.5 111.2 16.8Z"/></svg>',
  coop: '<svg class="coopmark" viewBox="0 0 602.4 204.8" aria-hidden="true"><g transform="translate(-48.8 -429.9)"><path fill="#ff5404" d="M 280.8,550.9 C 260.8,550.9 244.6,534.8 244.6,514.9 C 244.6,495.0 260.8,478.9 280.8,478.9 C 300.7,478.9 316.8,495.0 316.8,514.9 C 316.8,534.8 300.7,550.9 280.8,550.9 M 341.8,465.9 C 324.9,454.2 302.0,449.3 280.8,449.3 C 241.1,449.3 194.5,466.4 194.5,514.4 C 194.5,520.8 195.5,526.7 196.5,531.7 C 188.0,541.2 174.1,550.6 156.8,550.6 C 134.0,550.6 117.9,536.1 117.9,513.7 C 117.9,493.0 133.9,477.7 154.7,477.7 C 165.3,477.7 173.0,481.3 177.4,484.2 L 194.1,457.7 C 185.7,453.5 169.5,447.6 147.9,447.6 C 106.9,447.6 66.5,469.7 66.5,514.0 C 66.5,558.2 102.9,581.0 146.6,581.0 C 174.2,581.0 196.4,567.2 208.9,553.4 C 225.2,571.0 252.7,579.4 280.8,579.4 C 301.4,579.4 324.6,574.8 341.8,563.0 L 341.8,465.9 L 341.8,465.9 z"/><path fill="#ff8605" d="M 549.0,553.1 L 548.6,553.1 C 528.4,552.8 512.0,537.1 512.0,514.6 C 512.0,493.0 528.8,477.2 548.6,477.0 L 549.0,477.0 C 569.8,477.0 585.3,493.5 585.3,514.3 C 585.3,534.3 570.2,553.1 549.0,553.1 M 403.0,550.3 C 383.1,550.3 366.9,534.2 366.9,514.3 C 366.9,494.3 383.1,478.2 403.0,478.2 C 422.8,478.2 438.9,494.3 438.9,514.3 C 438.9,534.2 422.8,550.3 403.0,550.3 M 558.2,451.9 C 554.9,451.9 551.7,452.2 548.6,452.5 C 533.7,454.2 522.1,459.6 513.0,465.9 L 513.0,454.1 L 473.1,454.1 L 473.1,473.3 C 456.2,456.3 426.4,449.3 403.1,449.3 L 403.0,449.3 C 381.8,449.3 358.7,454.2 341.8,466.0 L 341.8,562.8 C 358.6,574.5 381.5,579.4 403.0,579.4 L 403.1,579.4 C 429.9,579.4 455.2,570.9 472.2,556.5 L 472.2,617.0 L 513.0,617.0 L 513.0,563.3 C 519.3,569.2 531.4,576.6 548.6,578.7 C 552.0,579.2 555.6,579.4 559.4,579.4 C 591.5,579.4 633.4,560.1 633.4,514.7 C 633.4,472.6 599.5,451.9 558.2,451.9 z"/><path fill="#dc3002" d="M 341.9,562.9 C 327.2,552.8 316.8,537.1 316.8,514.4 C 316.8,492.0 326.9,476.3 341.9,465.9 C 356.7,476.3 366.9,492.0 366.9,514.4 C 366.9,537.1 356.7,552.6 341.9,562.9 L 341.9,562.9 z"/></g></svg>',
  volg: '<svg class="volgmark" viewBox="0 0 227 113.6" aria-hidden="true"><rect width="227" height="113.6" fill="#004982"/><path fill="#ffed00" d="M99.87,68.67C94.39,68.67,90,63,90,55.92s4.44-12.76,9.92-12.76,9.92,5.71,9.92,12.76S105.35,68.67,99.87,68.67Zm86.82-.1c-5.48,0-9.92-5.71-9.92-12.76s4.44-12.75,9.92-12.75,9.92,5.71,9.92,12.75S192.17,68.57,186.69,68.57Zm-32,14.72a19,19,0,0,0,7,12.13c9,7.48,17.71,8.25,24,8.25a30.7,30.7,0,0,0,21.5-8.06,28.26,28.26,0,0,0,9.62-21.25v-43L197.84,34c-5-5-14.64-6.81-22-5.4-11.7,2.24-19.23,12.2-21.14,22.9V12.59l-22.52,3V52.24C129.65,38.49,116.15,28,99.87,28c-12.84,0-24,6.53-29.31,16L81.32,12.57l-23.63,3L44.37,60.19,31.14,12.59l-22,2.78L31.71,83.29H57.13l10.26-30a27.21,27.21,0,0,0-.26,3.63c0,16,14.66,28.91,32.74,28.91,16.28,0,29.78-10.5,32.31-24.25V83.29H154.7V61.49c1.26,8.56,6.45,14.29,13.24,17.72,7.07,3.57,19.92,3.8,28.66-2.34,0,6.91-1.66,13.42-10,13.42a9.44,9.44,0,0,1-9.36-7Z"/></svg>', ottos: '<svg class="ottosmark" viewBox="0 0 524.3 142.5" aria-hidden="true"><rect width="524.3" height="142.5" fill="#a3002f"/><path fill="#fff" d="M36.8 12.2 34.8 13.4 31.9 17.1 30.3 20.3 28.7 28.0 28.7 33.7 28.3 34.1 28.7 64.2 28.3 64.6 28.3 70.2 26.2 78.0 26.6 89.7 28.7 94.6 33.5 101.1 35.6 105.1 37.6 110.8 38.0 113.7 38.0 118.9 37.6 119.3 32.3 119.3 32.3 130.7 78.6 130.7 78.6 119.3 74.1 119.3 73.7 118.9 73.3 112.9 74.9 106.4 79.4 99.5 82.2 93.8 83.9 88.5 84.7 77.1 85.5 74.3 85.5 62.1 84.3 57.3 83.5 55.6 80.6 53.6 77.0 53.6 73.7 56.0 71.3 51.6 68.8 50.4 65.2 50.4 62.0 52.8 61.1 52.8 57.5 49.1 53.4 49.1 51.0 50.4 49.0 52.8 48.2 52.8 47.3 51.6 47.7 47.5 47.3 32.9 45.3 17.1 42.9 12.6 41.3 11.8Z"/><path fill="#a3002f" fill-rule="evenodd" d="M49.0 56.9 46.1 58.5 38.0 65.0 32.7 69.8 29.9 73.5 27.9 78.4 27.5 82.4 27.9 87.7 28.7 90.5 37.2 104.3 38.8 109.2 40.0 118.5 71.7 118.5 72.1 118.1 71.7 114.1 72.9 107.6 75.7 101.5 80.6 93.8 82.2 88.1 82.2 86.1 79.0 88.1 76.2 87.7 73.7 85.3 72.5 82.4 68.4 87.3 66.4 88.1 64.8 88.1 63.2 87.3 63.6 95.8 62.0 99.5 60.3 100.7 59.9 98.2 61.1 95.0 61.1 91.3 59.9 88.1 58.7 86.9 56.7 89.3 54.6 90.1 52.6 90.1 50.6 89.3 48.2 86.9 46.9 84.4 46.5 82.0 43.3 84.0 42.5 84.0 41.3 82.8 48.6 75.1 51.0 70.6 53.0 64.2 52.6 58.5 51.0 56.9ZM79.0 55.2 76.6 56.0 74.9 58.5 74.5 79.2 75.3 82.4 77.4 84.9 79.4 84.9 81.0 83.6 82.6 80.0 83.9 72.3 83.9 63.8 83.1 58.9 80.6 55.6ZM68.4 52.0 66.0 52.0 64.4 52.8 62.4 55.6 62.8 71.5 62.0 79.6 63.2 83.2 64.8 84.9 66.8 84.9 68.8 83.2 70.5 80.0 72.1 73.5 71.7 57.7 70.1 53.2ZM56.3 50.8 53.0 51.2 50.6 53.6 50.6 54.0 52.6 54.4 55.1 56.9 55.9 59.7 55.5 66.2 54.2 70.6 51.8 75.1 49.0 78.8 49.0 82.0 50.6 85.7 52.6 87.3 55.1 86.9 57.1 84.9 58.7 80.8 59.9 74.3 59.9 69.8 60.3 69.4 59.9 56.4 58.3 52.0ZM40.0 13.4 37.2 13.8 34.4 16.3 32.3 19.9 30.7 25.6 30.3 28.4 30.3 51.6 30.7 52.0 30.3 69.0 38.4 61.3 44.5 56.9 45.7 55.2 45.7 46.3 46.1 45.9 45.7 45.5 45.7 36.2 45.3 35.8 44.9 25.6 42.9 15.9 41.7 14.2Z"/><path fill="#f7ae91" fill-rule="evenodd" d="M48.2 57.3 36.8 66.2 30.3 73.1 28.7 76.3 27.9 79.6 27.9 86.5 28.7 90.1 31.1 95.0 36.4 102.3 38.0 106.0 39.6 112.9 39.6 118.1 71.7 118.1 71.7 112.4 72.9 106.8 80.2 94.2 82.2 86.5 79.4 88.1 76.6 88.1 74.1 86.1 72.5 82.4 70.9 85.3 68.0 87.7 64.4 88.1 63.6 87.3 64.0 94.6 62.4 99.1 60.3 100.7 59.5 99.1 60.7 96.2 61.1 92.6 60.7 90.1 59.1 87.3 56.3 89.7 52.2 90.1 49.8 88.9 47.7 86.5 46.1 82.0 43.7 84.0 42.1 84.0 41.3 83.2 41.7 81.6 48.2 75.5 52.2 67.0 53.0 62.9 52.6 58.9 51.4 57.3 50.2 56.9ZM77.8 55.6 75.3 57.7 74.9 58.9 75.3 71.1 74.5 78.0 76.2 83.6 77.8 84.9 79.4 84.9 81.4 82.8 83.5 75.1 83.5 61.3 81.8 56.9 80.2 55.6ZM67.6 52.0 64.0 53.2 62.8 54.8 62.4 80.8 62.8 82.4 64.8 84.9 66.4 84.9 68.0 84.0 69.7 81.6 72.1 72.3 71.7 58.1 70.1 53.6ZM57.1 51.2 53.4 51.2 51.0 53.2 51.0 54.0 53.4 54.8 54.6 56.0 55.9 58.9 55.9 64.6 54.2 71.1 49.0 79.2 49.4 82.8 50.6 85.3 52.6 87.3 55.1 86.9 56.7 85.3 58.7 80.4 59.5 75.9 59.9 67.4 60.3 67.0 59.9 57.7 59.1 53.6ZM39.2 13.4 36.8 14.2 34.0 17.1 32.3 20.3 30.7 26.4 30.3 29.7 30.7 67.0 30.3 68.6 39.6 60.1 45.3 56.0 45.7 54.4 45.7 37.8 44.1 21.1 42.5 15.5 40.8 13.8Z"/><path fill="#fff" fill-rule="evenodd" d="M424.1 32.3 416.1 35.3 414.1 39.3 414.1 47.3 419.1 53.3 418.1 63.3 419.1 65.3 422.1 66.3 427.1 63.3 435.1 45.3 435.1 42.3 432.1 36.3ZM367.1 31.3 357.1 33.3 347.1 38.3 336.1 49.3 331.1 59.3 330.1 79.3 336.1 94.3 347.1 105.3 357.1 110.3 366.1 112.3 374.1 112.3 384.1 110.3 392.1 106.3 401.1 99.3 405.1 94.3 411.1 80.3 411.1 64.3 406.1 51.3 399.1 42.3 389.1 35.3 380.1 32.3ZM367.1 55.3 377.1 56.3 385.1 63.3 387.1 67.3 387.1 76.3 385.1 80.3 380.1 85.3 374.1 88.3 367.1 88.3 362.1 86.3 356.1 80.3 354.1 76.3 355.1 64.3 362.1 57.3ZM270.1 32.3 265.1 36.3 264.1 39.3 265.1 48.3 267.1 51.3 271.1 53.3 282.1 53.3 284.1 55.3 284.1 105.3 286.1 109.3 292.1 112.3 302.1 111.3 306.1 108.3 308.1 103.3 308.1 55.3 310.1 53.3 322.1 52.3 327.1 46.3 327.1 38.3 323.1 33.3 316.1 31.3ZM198.1 33.3 194.1 39.3 195.1 48.3 201.1 53.3 212.1 53.3 214.1 55.3 214.1 105.3 216.1 109.3 223.1 112.3 232.1 111.3 236.1 108.3 238.1 104.3 238.1 55.3 240.1 53.3 252.1 52.3 257.1 46.3 257.1 38.3 253.1 33.3 246.1 31.3 205.1 31.3ZM147.1 31.3 138.1 33.3 129.1 37.3 117.1 48.3 112.1 57.3 110.1 65.3 110.1 78.3 115.1 92.3 126.1 104.3 137.1 110.3 146.1 112.3 154.1 112.3 164.1 110.3 174.1 105.3 182.1 98.3 188.1 89.3 191.1 80.3 192.1 70.3 188.1 54.3 178.1 41.3 164.1 33.3 155.1 31.3ZM147.1 55.3 154.1 55.3 159.1 57.3 165.1 63.3 168.1 71.3 165.1 80.3 160.1 85.3 154.1 88.3 144.1 87.3 136.1 80.3 134.1 76.3 134.1 67.3 136.1 63.3 141.1 58.3ZM463.1 30.3 452.1 35.3 446.1 42.3 443.1 49.3 443.1 62.3 446.1 69.3 450.1 73.3 457.1 77.3 460.1 77.3 469.1 81.3 474.1 87.3 470.1 90.3 466.1 90.3 455.1 84.3 448.1 84.3 444.1 86.3 442.1 89.3 441.1 98.3 444.1 103.3 454.1 109.3 462.1 111.3 475.1 111.3 483.1 109.3 491.1 104.3 497.1 93.3 498.1 81.3 496.1 72.3 491.1 66.3 483.1 61.3 468.1 56.3 466.1 52.3 469.1 49.3 473.1 49.3 481.1 54.3 490.1 53.3 493.1 49.3 494.1 41.3 492.1 37.3 486.1 32.3 480.1 30.3Z"/></svg>',
};
const wordmark = (id) => {
  const base = id.replace(/_flyer$/, "");
  return `<span class="wm wm-${esc(base)}" title="${esc(storeOf(id).label)}">${MARK[base] || esc(storeOf(id).label)}</span>`;
};
const ICON = {
  fav: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  hide: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  // not interested: an eye with a line through it (so it can't be mistaken for the list's ×)
  eyeoff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.6"/><path d="M4 20L20 4"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16L16 8M9 8h7v7"/></svg>',
};
let cardItems = [];   // items currently on screen, addressed by data-i

function card(it) {
  const i = cardItems.push(it) - 1;
  const promo = it.o != null && !it.gone;
  const name = pname(it);
  const u = UNIT_LABEL[it.uu] || it.uu;
  const sub = [it.q, it.b && !name.toLowerCase().includes(it.b.toLowerCase()) ? it.b : "", it.note].filter(Boolean).join(" · ");
  const img = it.img ? `<img loading="lazy" decoding="async" src="${esc(it.img)}" alt="" onerror="this.remove()">` : "";
  const was = it.was ? `<div class="was">${it.gone ? t("promo") : t("lastPromo")} ${fmt(it.was.p)}${it.was.up != null ? ` · ${fmt(it.was.up)}/${u}` : ""}${it.was.pct ? ` · −${it.was.pct}%` : ""} · ${t("ended")} ${ddmm(it.was.until) || "?"}</div>` : "";
  const k = keyOf(it);
  const fav = typeof isFav === "function" && isFav(k), inList = typeof inShopList === "function" && inShopList(k);
  const price = it.gone
    ? `<span class="tag-ended">${t("endedTag")}</span><b class="p">${fmt(it.was.p)}</b>${it.was.up != null ? `<span class="u">${fmt(it.was.up)}/${u}</span>` : ""}`
    : `${promo ? `<span class="off">−${it.pct}%</span><s>${fmt(it.o)}</s>` : ""}<b class="p${it.deal || isGood(it) ? " goodp" : ""}">${fmt(it.p)}</b>` +
      (it.up != null ? `<span class="u${isGood(it) ? " good" : ""}">${fmt(it.up)}/${u}</span>` : "") +
      (promo && it.until ? `<span class="until">${t("until")} ${ddmm(it.until)}</span>` : "") +
      (it.deal === "top" ? `<span class="dealtag top">${t("topDeal")}</span>` : it.deal === "good" ? `<span class="dealtag good">${t("goodDeal")}</span>` : "") +
      (it.o != null && it.rel != null ? `<span class="vs"${it.relKind != null ? ` title="${esc(kindLabel(it.relKind))}"` : ""}>${it.rel <= 1 ? "−" : "+"}${Math.round(Math.abs(1 - it.rel) * 100)}% ${t("vsUsual")}</span>` : "");
  return `<li class="card${promo ? " promo" : ""}${it.deal ? " deal-" + it.deal : ""}${it.gone ? " gone" : ""}" data-i="${i}">
    <div class="pic">${img}</div>
    <div class="info">
      ${wordmark(it.s)}
      <div class="name"${name !== it.n ? ` title="${esc(it.n)}"` : ""}>${esc(name)}</div>
      <div class="sub">${esc(sub)}</div>${was}
    </div>
    <div class="price">${price}</div>
    <div class="acts">
      <button type="button" data-a="list" class="addbtn" aria-pressed="${inList}" aria-label="${inList ? t("removeList") : t("addList")}" title="${inList ? t("removeList") : t("addList")}">${ICON.list}</button>
      <button type="button" data-a="hide" aria-label="${t("notInterested")}" title="${t("notInterested")}">${ICON.eyeoff}</button>
      ${it.url ? `<a href="${esc(it.url)}" target="_blank" rel="noopener" aria-label="${t("openShop")}" title="${t("openShop")}">${ICON.link}</a>` : ""}
    </div>
  </li>`;
}

function render() {
  cardItems = [];
  const lbl = ["", t("related"), t("otherMatches"), t("pastPromos")];
  let html = "", g = results.length ? grp(results[0]) : 0;
  if (g > 0) html += `<li class="sep">${lbl[g]}</li>`;
  for (const it of results.slice(0, shown)) {
    const gi = grp(it);
    if (gi !== g) { g = gi; html += `<li class="sep">${lbl[g]}</li>`; }
    html += card(it);
  }
  $("#list").innerHTML = html;
  $("#more").hidden = results.length <= shown;
}

let timer;
$("#q").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => (view === "list" ? setView("search") : search()), 120); });
$("#f").addEventListener("submit", (e) => { e.preventDefault(); $("#q").blur(); search(); });
const showSort = () => { const so = $("#sort"); $(".sortval").textContent = so.options[so.selectedIndex].text; };
$("#sort").addEventListener("change", () => { save("sort", $("#sort").value); showSort(); search(); });
$("#promo").addEventListener("click", (e) => {
  promoOnly = !promoOnly; e.currentTarget.setAttribute("aria-pressed", promoOnly); search();
});
$("#bio").addEventListener("click", (e) => {
  bioOnly = !bioOnly; e.currentTarget.setAttribute("aria-pressed", bioOnly); search();
});
$("#dealsBtn").addEventListener("click", () => { $("#q").value = ""; dealCat = ""; setView("search"); window.scrollTo({ top: 0 }); });
$("#more").addEventListener("click", () => { shown += PAGE; if ($("#q").value.trim()) render(); else renderDeals(); });
$("#kinds").addEventListener("click", (e) => {
  if (e.target.closest("[data-prefs]")) { save("usePrefs", !usePrefs()); showDeals(); return; }
  if (e.target.closest("[data-good]")) { save("goodDeals", !goodToo()); showDeals(); return; }
  const sc = e.target.closest("[data-scope]");
  if (sc) { dealScope = sc.dataset.scope; dealCat = ""; showDeals(); return; }
  const c = e.target.closest("[data-cat]");
  if (c) { dealCat = c.dataset.cat; showDeals(); return; }
  const b = e.target.closest("[data-q]");
  if (b) { $("#q").value = b.dataset.q; search(); window.scrollTo({ top: 0 }); }
});
$("#status").addEventListener("click", (e) => {
  if (e.target.closest(".allshops")) { active = new Set(visibleStores().map((s) => s.id)); renderChips(); search(); return; }
  const q = e.target.dataset && e.target.dataset.q;
  if (q) { $("#q").value = q; search(); }
});
$("#sort").value = load("sort", "unit");
init();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
