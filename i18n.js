// Page texts in English, German, French and Italian. Product names stay as the shops write them
// (Migros also gives English and French names; those are used when that language is chosen).
const LANGS = [["en", "EN"], ["de", "DE"], ["fr", "FR"], ["it", "IT"]];
let UIL = (() => {
  try { const s = localStorage.getItem("pf.lang"); if (s) return JSON.parse(s); } catch (e) {}
  const nav = (navigator.language || "en").slice(0, 2);
  return LANGS.some(([l]) => l === nav) ? nav : "en";
})();

const TX = {
  deals: ["Deals", "Aktionen", "Promos", "Offerte"],
  list: ["List", "Liste", "Liste", "Lista"],
  grid: ["Grid", "Raster", "Grille", "Griglia"],
  rows: ["Rows", "Zeilen", "Lignes", "Righe"],
  settings: ["Settings", "Einstellungen", "Réglages", "Impostazioni"],
  close: ["Close", "Schliessen", "Fermer", "Chiudi"],
  bioOnly: ["Bio", "Bio", "Bio", "Bio"],
  promosOnly: ["Promos", "Aktionen", "Promos", "Offerte"],
  sortUnit: ["per kg / l", "pro kg / l", "par kg / l", "al kg / l"],
  sortPrice: ["price", "Preis", "prix", "prezzo"],
  sortPct: ["discount", "Rabatt", "rabais", "sconto"],
  sortBy: ["Sort", "Sort.", "Tri", "Ord."],
  loading: ["Loading prices …", "Preise werden geladen …", "Chargement des prix …", "Caricamento prezzi …"],
  offline: ["Could not load prices. Offline?", "Preise nicht geladen. Offline?", "Prix non chargés. Hors ligne ?", "Prezzi non caricati. Offline?"],
  products: ["products", "Produkte", "produits", "prodotti"],
  onOffer: ["on offer", "in Aktion", "en promo", "in offerta"],
  onOfferH: ["On offer", "In Aktion", "En promo", "In offerta"],
  otherProducts: ["Other products", "Weitere Produkte", "Autres produits", "Altri prodotti"],
  showingFor: ["Showing results for", "Ergebnisse für", "Résultats pour", "Risultati per"],
  noExact: ["No exact match for", "Nichts genau zu", "Rien d'exact pour", "Niente di esatto per"],
  showing: ["showing", "zeige", "affiché :", "mostro"],
  result: ["result", "Ergebnis", "résultat", "risultato"],
  results: ["results", "Ergebnisse", "résultats", "risultati"],
  sortedPer: ["CHF per", "CHF pro", "CHF par", "CHF al"],
  nothing: ["Nothing found. Try another word.", "Nichts gefunden. Anderes Wort versuchen.", "Rien trouvé. Essayez un autre mot.", "Nessun risultato. Prova un'altra parola."],
  only: ["only", "nur", "seulement", "solo"],
  allShops: ["all shops", "alle Läden", "tous les magasins", "tutti i negozi"],
  kinds: ["Kinds:", "Sorten:", "Sortes :", "Tipi:"],
  all: ["All", "Alle", "Tous", "Tutti"],
  allLc: ["all", "alle", "tous", "tutti"],
  organic: ["Organic", "Bio", "Bio", "Bio"],
  cheapest: ["cheapest", "am günstigsten", "le moins cher", "il più economico"],
  goodPrice: ["good price", "guter Preis", "bon prix", "buon prezzo"],
  typical: ["typical", "üblich", "habituel", "di solito"],
  pricePer: ["price per", "Preis pro", "prix par", "prezzo al"],
  notPerPack: ["not per pack", "nicht pro Packung", "pas par paquet", "non a confezione"],
  goodDealNow: ["Good deal right now:", "Gerade günstig:", "Bonne affaire en ce moment :", "Ora conviene:"],
  until: ["until", "bis", "jusqu'au", "fino al"],
  foodDrinks: ["Food & drinks", "Essen & Getränke", "Alimentation", "Alimentari"],
  household: ["Household & care", "Haushalt & Pflege", "Ménage & soins", "Casa & cura"],
  myInterests: ["My interests", "Meine Interessen", "Mes intérêts", "I miei interessi"],
  goodDealsToo: ["Good deals too", "Auch gute Angebote", "Aussi les bonnes affaires", "Anche buone offerte"],
  inCat: ["· in:", "· in:", "· dans :", "· in:"],
  topDealsWeek: ["Top deals this week", "Top-Angebote dieser Woche", "Meilleures affaires de la semaine", "Migliori offerte della settimana"],
  goodDeals: ["good deals", "gute Angebote", "bonnes affaires", "buone offerte"],
  topDealsH: ["Top deals — a real discount, and clearly cheaper per kg / l than similar products in all shops",
    "Top-Angebote — echter Rabatt und pro kg / l klar günstiger als ähnliche Produkte in allen Läden",
    "Meilleures affaires — vrai rabais et nettement moins cher au kg / l que les produits similaires de tous les magasins",
    "Migliori offerte — vero sconto e al kg / l nettamente meno caro dei prodotti simili in tutti i negozi"],
  goodDealsH: ["Good deals — discounted and cheaper than similar products", "Gute Angebote — reduziert und günstiger als ähnliche Produkte",
    "Bonnes affaires — en promo et moins cher que les produits similaires", "Buone offerte — scontato e meno caro dei prodotti simili"],
  favsOnSale: ["Your favourites on sale", "Deine Favoriten in Aktion", "Vos favoris en promo", "I tuoi preferiti in offerta"],
  hint: ["Type a product, in German, English or French. Try:", "Produkt eingeben, auf Deutsch, Englisch oder Französisch. Zum Beispiel:",
    "Tapez un produit, en allemand, anglais ou français. Par exemple :", "Scrivi un prodotto, in tedesco, inglese o francese. Per esempio:"],
  promo: ["Promo", "Aktion", "Promo", "Offerta"],
  lastPromo: ["Last promo", "Letzte Aktion", "Dernière promo", "Ultima offerta"],
  ended: ["ended", "endete", "fini le", "finita il"],
  endedTag: ["Ended", "Vorbei", "Terminé", "Finita"],
  topDeal: ["Top deal", "Top-Angebot", "Top affaire", "Top offerta"],
  goodDeal: ["Good deal", "Gutes Angebot", "Bonne affaire", "Buona offerta"],
  vsUsual: ["vs similar products", "vs. ähnliche Produkte", "vs produits similaires", "vs prodotti simili"],
  onShelf: ["on this shelf", "in diesem Regal", "dans ce rayon", "in questo reparto"],
  related: ["Related products", "Ähnliche Produkte", "Produits liés", "Prodotti simili"],
  otherMatches: ["Other matches", "Weitere Treffer", "Autres résultats", "Altri risultati"],
  pastPromos: ["Past promotions", "Vergangene Aktionen", "Promos passées", "Offerte passate"],
  showMore: ["Show more", "Mehr zeigen", "Voir plus", "Mostra altro"],
  fav: ["Favourite", "Favorit", "Favori", "Preferito"],
  addList: ["Add to list", "Auf die Liste", "Ajouter à la liste", "Aggiungi alla lista"],
  removeList: ["Remove from list", "Von der Liste entfernen", "Retirer de la liste", "Togli dalla lista"],
  promoEnded: ["promotion ended", "Aktion vorbei", "promo terminée", "offerta finita"],
  notInterested: ["Not interested", "Nicht interessiert", "Pas intéressé", "Non mi interessa"],
  openShop: ["Open in shop", "Im Shop öffnen", "Ouvrir dans le magasin", "Apri nel negozio"],
  hide: ["Hide", "Ausblenden", "Masquer", "Nascondi"],
  show: ["Show", "Zeigen", "Afficher", "Mostra"],
  thisProduct: ["this product", "dieses Produkt", "ce produit", "questo prodotto"],
  brand: ["brand", "Marke", "marque", "marca"],
  allAt: ["all {c} at {s}", "alles {c} bei {s}", "tout {c} chez {s}", "tutto {c} da {s}"],
  shoppingList: ["Shopping list", "Einkaufsliste", "Liste de courses", "Lista della spesa"],
  listEmpty: ["Empty. Tap + on a product to add it.", "Leer. Tippe + bei einem Produkt.", "Vide. Touchez + sur un produit.", "Vuota. Tocca + su un prodotto."],
  shareList: ["Share list", "Liste teilen", "Partager la liste", "Condividi lista"],
  copyList: ["Copy", "Kopieren", "Copier", "Copia"],
  shareTip: ["Send it to Notes, Reminders or a chat. Pasted into a Reminders list, every line becomes a to-do.",
    "An Notizen, Erinnerungen oder einen Chat senden. In eine Erinnerungen-Liste eingefügt wird jede Zeile ein Eintrag.",
    "Envoyez-la vers Notes, Rappels ou une discussion. Collée dans une liste de Rappels, chaque ligne devient une tâche.",
    "Inviala a Note, Promemoria o in chat. Incollata in un elenco Promemoria, ogni riga diventa una voce."],
  gotIt: ["Got it", "Habe ich", "Pris", "Preso"],
  remove: ["Remove", "Entfernen", "Retirer", "Rimuovi"],
  notListed: ["not listed this week", "diese Woche nicht im Angebot", "pas listé cette semaine", "non in lista questa settimana"],
  removeTicked: ["Remove ticked items", "Abgehakte entfernen", "Retirer les articles cochés", "Rimuovi gli spuntati"],
  favourites: ["Favourites", "Favoriten", "Favoris", "Preferiti"],
  favsEmpty: ["Tap the heart on a product to keep it here and see it first when it's on sale.",
    "Tippe auf das Herz, um ein Produkt hier zu behalten und es zuerst zu sehen, wenn es in Aktion ist.",
    "Touchez le cœur pour garder un produit ici et le voir en premier quand il est en promo.",
    "Tocca il cuore per tenere un prodotto qui e vederlo per primo quando è in offerta."],
  // settings
  language: ["Language", "Sprache", "Langue", "Lingua"],
  interests: ["What you're interested in", "Was dich interessiert", "Ce qui vous intéresse", "Cosa ti interessa"],
  interestsNote: ["Deals only shows what you set to Show. Search always finds everything.",
    "Aktionen zeigt nur, was auf Zeigen steht. Die Suche findet immer alles.",
    "Les promos ne montrent que ce qui est sur Afficher. La recherche trouve tout.",
    "Le offerte mostrano solo ciò che è su Mostra. La ricerca trova sempre tutto."],
  shops: ["Shops", "Läden", "Magasins", "Negozi"],
  shopsNote: ["Hide shops you never go to.", "Läden ausblenden, in die du nie gehst.", "Masquez les magasins où vous n'allez jamais.", "Nascondi i negozi dove non vai mai."],
  hiddenH: ["Hidden products", "Ausgeblendete Produkte", "Produits masqués", "Prodotti nascosti"],
  hiddenNone: ["Nothing hidden. Tap × on a product to hide it.", "Nichts ausgeblendet. Tippe × bei einem Produkt.", "Rien de masqué. Touchez × sur un produit.", "Niente nascosto. Tocca × su un prodotto."],
  product: ["Product", "Produkt", "Produit", "Prodotto"],
  brandH: ["Brand", "Marke", "Marque", "Marca"],
  category: ["Category", "Kategorie", "Catégorie", "Categoria"],
  showAgain: ["show again", "wieder zeigen", "réafficher", "mostra di nuovo"],
  syncH: ["Same list on your phone", "Gleiche Liste auf dem Handy", "Même liste sur le téléphone", "Stessa lista sul telefono"],
  syncNote: ["Want your list and settings on your phone too? Paste a GitHub token here, on each device. Make one at github.com › Settings › Developer settings › Tokens (classic), tick only “gist”.",
    "Liste und Einstellungen auch auf dem Handy? Hier auf jedem Gerät einen GitHub-Token einfügen. Erstellen: github.com › Settings › Developer settings › Tokens (classic), nur “gist” ankreuzen.",
    "Votre liste et vos réglages aussi sur le téléphone ? Collez un jeton GitHub ici, sur chaque appareil. À créer sur github.com › Settings › Developer settings › Tokens (classic), cochez seulement “gist”.",
    "Lista e impostazioni anche sul telefono? Incolla qui un token GitHub, su ogni dispositivo. Crealo su github.com › Settings › Developer settings › Tokens (classic), spunta solo “gist”."],
  token: ["GitHub token", "GitHub-Token", "Jeton GitHub", "Token GitHub"],
  syncSave: ["Save & sync", "Speichern & abgleichen", "Enregistrer & synchroniser", "Salva & sincronizza"],
  syncOff: ["Turn off here", "Hier ausschalten", "Désactiver ici", "Disattiva qui"],
  synced: ["Synced", "Abgeglichen", "Synchronisé", "Sincronizzato"],
  syncIsOff: ["Off.", "Aus.", "Désactivé.", "Spento."],
  syncing: ["Syncing …", "Abgleich …", "Synchronisation …", "Sincronizzo …"],
  syncFailed: ["Didn't work. Is the token right, with “gist” ticked?", "Hat nicht geklappt. Stimmt der Token, mit “gist”?",
    "Échec. Le jeton est-il correct, avec “gist” coché ?", "Non riuscito. Il token è giusto, con “gist” spuntato?"],
  backupH: ["Backup", "Sicherung", "Sauvegarde", "Backup"],
  copyProfile: ["Copy my settings", "Einstellungen kopieren", "Copier mes réglages", "Copia le impostazioni"],
  pasteProfile: ["Paste settings", "Einstellungen einfügen", "Coller des réglages", "Incolla impostazioni"],
  copied: ["Copied", "Kopiert", "Copié", "Copiato"],
  imported: ["Done", "Erledigt", "Fait", "Fatto"],
  noProfile: ["Nothing to paste", "Nichts zum Einfügen", "Rien à coller", "Niente da incollare"],
  footer: ["{n} products · prices from {d}", "{n} Produkte · Preise vom {d}", "{n} produits · prix du {d}", "{n} prodotti · prezzi del {d}"],
  footerTo: [" to {d}", " bis {d}", " au {d}", " al {d}"],
  footerEnd: [" · incl. VAT · not affiliated with any shop · ", " · inkl. MwSt. · mit keinem Laden verbunden · ",
    " · TVA incl. · sans lien avec les magasins · ", " · IVA incl. · nessun legame con i negozi · "],
  sources: ["Sources & limits", "Quellen & Grenzen", "Sources & limites", "Fonti & limiti"],
  regularFrom: ["normal price from past promotion ({d})", "Normalpreis aus vergangener Aktion ({d})", "prix normal d'une promo passée ({d})", "prezzo normale da un'offerta passata ({d})"],
  // food groups
  g_vegfruit: ["Fruit & vegetables", "Früchte & Gemüse", "Fruits & légumes", "Frutta & verdura"],
  g_meatfish: ["Meat & fish", "Fleisch & Fisch", "Viande & poisson", "Carne & pesce"],
  g_dairy: ["Dairy & eggs", "Milchprodukte & Eier", "Produits laitiers & œufs", "Latticini & uova"],
  g_bread: ["Bread & bakery", "Brot & Backwaren", "Pain & boulangerie", "Pane & panetteria"],
  g_pantry: ["Pantry: rice, pasta, oils, nuts, coffee", "Vorräte: Reis, Pasta, Öl, Nüsse, Kaffee", "Épicerie : riz, pâtes, huiles, noix, café", "Dispensa: riso, pasta, olio, noci, caffè"],
  g_sweets: ["Sweets & snacks", "Süsses & Snacks", "Sucreries & snacks", "Dolci & snack"],
  g_drinks: ["Drinks: water, soft drinks, juice", "Getränke: Wasser, Süssgetränke, Saft", "Boissons : eau, sodas, jus", "Bevande: acqua, bibite, succhi"],
  g_alcohol: ["Wine, beer & spirits", "Wein, Bier & Spirituosen", "Vin, bière & spiritueux", "Vino, birra & alcolici"],
  g_other: ["Other food", "Andere Lebensmittel", "Autres aliments", "Altri alimenti"],
  g_pets: ["Pet food & care", "Tiernahrung & -bedarf", "Animaux : nourriture & soins", "Animali: cibo & cura"],
  g_household: ["Household & care", "Haushalt & Pflege", "Ménage & soins", "Casa & cura"],
};
const LI = () => Math.max(0, LANGS.findIndex(([l]) => l === UIL));
function t(key, vars) {
  const row = TX[key];
  let s = row ? row[LI()] || row[0] : key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace("{" + k + "}", v);
  return s;
}
// product name in the chosen language, where the shop gives one (Migros: English and French names)
const pname = (it) => (UIL === "en" ? it.ne : UIL === "fr" ? it.nf : null) || it.n;
function setLang(l) {
  UIL = l;
  try { localStorage.setItem("pf.lang", JSON.stringify(l)); } catch (e) {}
  document.documentElement.lang = l;
  applyStaticTexts();
}
// texts that sit in index.html
function applyStaticTexts() {
  document.documentElement.lang = UIL;
  const set = (sel, txt) => { const el = document.querySelector(sel); if (el) el.textContent = txt; };
  set("#dealsBtn", t("deals"));
  const lb = document.querySelector('nav [data-view="list"]');
  if (lb) lb.firstChild.textContent = t("list") + " ";
  layoutIcon();
  const sb = document.querySelector("#settingsBtn");
  if (sb) { sb.setAttribute("aria-label", t("settings")); sb.title = t("settings"); }
  set("#settingsClose", t("close"));
  set("#settings h2", t("settings"));
  set("#promo", t("promosOnly"));
  set("#bio", t("bioOnly"));
  set("#more", t("showMore"));
  const so = document.querySelector("#sort");
  if (so) { so.options[0].text = t("sortUnit"); so.options[1].text = t("sortPrice"); so.options[2].text = t("sortPct"); }
  set(".sortlbl", t("sortBy"));
  if (so) set(".sortval", so.options[so.selectedIndex].text);
}

// the layout button shows what you switch TO: a grid icon in rows view, a lines icon in grid view
const ICON_GRID = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7.2" height="7.2"/><rect x="13.8" y="3" width="7.2" height="7.2"/><rect x="3" y="13.8" width="7.2" height="7.2"/><rect x="13.8" y="13.8" width="7.2" height="7.2"/></svg>';
const ICON_ROWS = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="3.4"/><rect x="3" y="10.3" width="18" height="3.4"/><rect x="3" y="16.6" width="18" height="3.4"/></svg>';
function layoutIcon() {
  const b = document.querySelector("#layoutBtn");
  if (!b) return;
  const grid = document.body.classList.contains("grid");
  b.innerHTML = grid ? ICON_ROWS : ICON_GRID;
  b.setAttribute("aria-label", grid ? t("rows") : t("grid")); b.title = grid ? t("rows") : t("grid");
}

// what each shop's data is, shown behind the (i) next to the shop in Settings
const SHOP_INFO = {
  aligro: ["Full range from aligro.ch. Promo prices are always current; regular prices are checked every few weeks.",
    "Ganzes Sortiment von aligro.ch. Aktionspreise sind immer aktuell, Normalpreise werden alle paar Wochen geprüft.",
    "Tout l'assortiment d'aligro.ch. Les prix promo sont toujours à jour, les prix normaux vérifiés toutes les quelques semaines.",
    "Tutto l'assortimento di aligro.ch. I prezzi in offerta sono sempre aggiornati, quelli normali ogni poche settimane."],
  migros: ["Food and household range from migros.ch: national prices and this week's promotions.",
    "Lebensmittel und Haushalt von migros.ch: nationale Preise und die Aktionen dieser Woche.",
    "Alimentation et ménage de migros.ch : prix nationaux et promos de la semaine.",
    "Alimentari e casa da migros.ch: prezzi nazionali e offerte della settimana."],
  coop: ["About 10,000 products from coop.ch plus the weekly promotions. Usually updated every Monday morning.",
    "Rund 10'000 Produkte von coop.ch plus die Wochenaktionen. Meist jeden Montagmorgen aktualisiert.",
    "Environ 10 000 produits de coop.ch et les promos de la semaine. Mis à jour en général chaque lundi matin.",
    "Circa 10'000 prodotti da coop.ch e le offerte della settimana. Di solito aggiornato ogni lunedì mattina."],
  volg: ["The whole range of the Volg online shop (volgshop.ch), about 700 products. Usually updated every Monday morning.",
    "Sortiment des Volg-Onlineshops (volgshop.ch). Meist jeden Montagmorgen aktualisiert.",
    "Assortiment de la boutique en ligne Volg (volgshop.ch). Mis à jour en général chaque lundi matin.",
    "Assortimento del negozio online Volg (volgshop.ch). Di solito aggiornato ogni lunedì mattina."],
  ottos: ["Otto's food and wine range (ottos.ch, about 2,900 products). Otto's doesn't publish the normal price of its promotions, so they show as \u201cAktion\u201d without a percentage. Usually updated every Monday morning.",
    "Lebensmittel und Drogerie von ottos.ch. Meist jeden Montagmorgen aktualisiert.",
    "Alimentation et droguerie d'ottos.ch. Mis à jour en général chaque lundi matin.",
    "Alimentari e drogheria da ottos.ch. Di solito aggiornato ogni lunedì mattina."],
  aldi: ["In-store range and current promotions from Aldi Suisse. Aldi rarely shows the old price, so many promos have no % off.",
    "Ladensortiment und aktuelle Aktionen von Aldi Suisse. Aldi nennt selten den alten Preis, darum fehlt oft der Rabatt in %.",
    "Assortiment en magasin et promos d'Aldi Suisse. Aldi indique rarement l'ancien prix, d'où souvent pas de % de rabais.",
    "Assortimento in negozio e offerte di Aldi Suisse. Aldi indica di rado il prezzo vecchio, quindi spesso manca lo sconto in %."],
  lidl: ["What lidl.ch lists online: mostly this and next week's offers, about 430 products, not the whole store.",
    "Was lidl.ch online zeigt: vor allem die Angebote dieser und nächster Woche, rund 430 Produkte, nicht das ganze Sortiment.",
    "Ce que lidl.ch montre en ligne : surtout les offres de cette semaine et de la suivante, env. 430 produits.",
    "Ciò che lidl.ch mostra online: soprattutto le offerte di questa e della prossima settimana, circa 430 prodotti."],
  denner: ["Denner only publishes its offers (this and next week). Normal prices are calculated from the offers of the past year: each one shows the crossed-out normal price.",
    "Angebote dieser und nächster Woche von denner.ch. Normalpreise stammen aus dem \u201cstatt\u201d-Preis der Angebote des letzten Jahres.",
    "Offres de cette semaine et de la suivante sur denner.ch. Les prix normaux viennent du prix \u201cau lieu de\u201d des offres de l'année écoulée.",
    "Offerte di questa e della prossima settimana da denner.ch. I prezzi normali vengono dal prezzo \u201cinvece di\u201d delle offerte dell'ultimo anno."],
  prodega: ["Prodega (a wholesaler) only publishes its promotions. Normal prices are calculated from them: each promotion shows the crossed-out normal price. VAT is added (2.6% food, 8.1% other).",
    "Prodega ist ein Grosshändler und zeigt nur Aktionspreise. Normalpreise stammen aus dem \u201cstatt\u201d-Preis vergangener Aktionen. MwSt. ist dazugerechnet (2,6% Lebensmittel, 8,1% Übriges).",
    "Prodega est un grossiste qui n'affiche que ses prix promo. Les prix normaux viennent du prix \u201cau lieu de\u201d des promos passées. TVA ajoutée (2,6% alimentation, 8,1% autres).",
    "Prodega è un grossista che mostra solo i prezzi in offerta. I prezzi normali vengono dal prezzo \u201cinvece di\u201d delle offerte passate. IVA aggiunta (2,6% alimentari, 8,1% altro)."],
  receipts: ["Prices from my own receipts (2024–2026). Not updated automatically.",
    "Preise von meinen eigenen Quittungen (2024–2026). Werden nicht automatisch aktualisiert.",
    "Prix tirés de mes propres tickets (2024–2026). Pas mis à jour automatiquement.",
    "Prezzi dai miei scontrini (2024–2026). Non aggiornati automaticamente."],
};
// my three favourite shops (personal opinion); prices are what I paid there
const PAID = [" Prices are what I paid (2024–2026), not updated automatically.", " Preise sind, was ich bezahlt habe (2024–2026), nicht automatisch aktualisiert.",
  " Les prix sont ceux que j'ai payés (2024–2026), pas mis à jour automatiquement.", " I prezzi sono quelli che ho pagato (2024–2026), non aggiornati automaticamente."];
SHOP_INFO.maxim = ["Turkish and Mediterranean grocer with two shops in Zurich: fresh vegetables and herbs, pulses, spices, cheese, bread. In my personal opinion the best food shop in Zurich.",
  "Türkisch-mediterraner Lebensmittelladen mit zwei Filialen in Zürich: frisches Gemüse und Kräuter, Hülsenfrüchte, Gewürze, Käse, Brot. Meiner persönlichen Meinung nach der beste Lebensmittelladen in Zürich.",
  "Épicerie turque et méditerranéenne avec deux magasins à Zurich : légumes et herbes frais, légumineuses, épices, fromage, pain. À mon avis personnel, le meilleur magasin d'alimentation de Zurich.",
  "Alimentari turco e mediterraneo con due negozi a Zurigo: verdure ed erbe fresche, legumi, spezie, formaggi, pane. Secondo me il miglior negozio di alimentari di Zurigo."].map((x, i) => x + PAID[i]);
SHOP_INFO.lianhua = ["Asian supermarket at Schaffhauserstrasse 269, Zurich: sauces, noodles, dried and frozen goods. A really good Asian shop, in my personal opinion.",
  "Asiatischer Supermarkt an der Schaffhauserstrasse 269, Zürich: Saucen, Nudeln, Getrocknetes und Tiefgekühltes. Meiner persönlichen Meinung nach ein richtig guter Asia-Laden.",
  "Supermarché asiatique, Schaffhauserstrasse 269, Zurich : sauces, nouilles, produits secs et surgelés. À mon avis personnel, une très bonne épicerie asiatique.",
  "Supermercato asiatico in Schaffhauserstrasse 269, Zurigo: salse, noodles, prodotti secchi e surgelati. Secondo me un ottimo negozio asiatico."].map((x, i) => x + PAID[i]);
SHOP_INFO.asiaway = ["Asian supermarket at Schwamendingenstrasse 10, Zurich: sauces, miso, noodles, pickles, dried goods. A really good Asian shop, in my personal opinion.",
  "Asiatischer Supermarkt an der Schwamendingenstrasse 10, Zürich: Saucen, Miso, Nudeln, Eingelegtes, Getrocknetes. Meiner persönlichen Meinung nach ein richtig guter Asia-Laden.",
  "Supermarché asiatique, Schwamendingenstrasse 10, Zurich : sauces, miso, nouilles, pickles, produits secs. À mon avis personnel, une très bonne épicerie asiatique.",
  "Supermercato asiatico in Schwamendingenstrasse 10, Zurigo: salse, miso, noodles, sottaceti, prodotti secchi. Secondo me un ottimo negozio asiatico."].map((x, i) => x + PAID[i]);
const shopInfo = (id) => { const r = SHOP_INFO[id.replace(/_flyer$/, "")]; return r ? r[LI()] || r[0] : ""; };

// links shown under the shop note: map (all branches) and the shop's own site
const SHOP_LINKS = {
  maxim: [["Google Maps", "https://www.google.com/maps/search/Maxim+Food+Z%C3%BCrich"]],
  lianhua: [["Google Maps", "https://www.google.com/maps/search/Lianhua+Schaffhauserstrasse+269+Z%C3%BCrich"]],
  asiaway: [["asiaway.ch", "https://www.asiaway.ch"], ["Google Maps", "https://www.google.com/maps/search/Asiaway+Schwamendingenstrasse+10+Z%C3%BCrich"]],
};

// (i) next to a shelf in Settings, where the name alone isn't clear
const GROUP_INFO = {
  other: ["Food that fits none of the shelves above: cereals and muesli, ready meals, plant-based products, baking mixes, and food from shops that don't say which shelf it is on.",
    "Lebensmittel, die in kein Regal oben passen: Müesli und Cerealien, Fertiggerichte, pflanzliche Produkte, Backmischungen und Produkte aus Läden, die ihr Regal nicht angeben.",
    "Aliments qui n'entrent dans aucun rayon ci-dessus : céréales et muesli, plats préparés, produits végétaux, préparations pour gâteaux, et produits de magasins qui n'indiquent pas leur rayon.",
    "Alimenti che non rientrano in nessun reparto sopra: cereali e muesli, piatti pronti, prodotti vegetali, preparati per dolci e prodotti di negozi che non indicano il reparto."],
};
const groupInfo = (g) => { const r = GROUP_INFO[g]; return r ? r[LI()] || r[0] : ""; };
