<p align="center"><img src="icon-180.png" alt="Preisfinder" width="96"></p>

<h1 align="center">Preisfinder</h1>

<p align="center">
  Grocery prices around Zurich in one search, cheapest per kg / l first.<br>
  <b><a href="https://nikolahristovnikolov.github.io/preisfinder/">nikolahristovnikolov.github.io/preisfinder</a></b>
</p>

This repository holds the published page; it is rebuilt every week from a private source repository.

## What's in it

Migros, Aldi, Lidl (whole range), Denner (offers, and a year of past offers), Aligro, Prodega (offers), Volg,
Otto's, and three small shops — about 50,000 products, compared per kg / l, with this week's deals rated against
similar products. Search in English, German, French or Italian; works on a phone and offline.

**Coop is not included.** Coop's website blocks automated requests. If you want Coop for yourself, the
open-source [swissgroceries-mcp](https://github.com/nicktcode/swissgroceries-mcp) can fetch it — for personal
use only, under its own licence (PolyForm Shield), which does not allow using it in a public or competing
product. That is why it isn't part of this page.

## Use it with an AI

Give an assistant <https://nikolahristovnikolov.github.io/preisfinder/llms.txt> and your menu or shopping list:
it points to a compact table with every shop's cheapest product per kind of food.

## Disclaimer

A personal, non-commercial project. It is **not affiliated with, endorsed by or sponsored by** any of the shops.
It shows prices the shops publish themselves on their websites, read gently once a week, and links every
product back to the shop. **Prices can be wrong or out of date** — they are copied automatically, and some are
calculated (price per kg, normal prices worked out from past offers); the price on the shelf counts. No warranty
of any kind. Shop names, logos and colours belong to the shops and are shown only to say where a price comes
from.

**If you represent one of the shops** and want something changed or removed, please
[open an issue](https://github.com/NikolaHristovNikolov/preisfinder/issues): requests from shops are handled
first and honoured.

## Licence

- **Code** (HTML, CSS, JavaScript): [PolyForm Noncommercial 1.0.0](LICENSE) — free to use, change and share for
  any non-commercial purpose; commercial use is not allowed.
- **Prices, product names and images** belong to the shops; they are shown here for personal reference only and
  are not licensed for reuse.
- **Product types and translations**: [Open Food Facts](https://world.openfoodfacts.org), ODbL 1.0.
  **Past offers**: the [Internet Archive](https://web.archive.org).
