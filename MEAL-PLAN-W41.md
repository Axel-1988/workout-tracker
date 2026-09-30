# Meal plan — ISO W41 (Mon 5 – Sun 11 Oct 2026)

**Delivery:** Wednesday **7 October 2026** · Youfoodz · Cecil Park 2178 · status COMING UP  
**Targets:** ~2450 kcal · ~180 g protein · body recomp (~95 kg)  
**Avoid:** seafood, tomatoes, lamb, mashed potato (other potato OK)  
**Note:** Calendar week is Mon **5** – Sun **11** Oct (ISO W41). “Mon 6–Sun 12” in the brief was off by one day vs Wed 7 delivery.

## Youfoodz assignment (tick in app → macros auto-count that day)

| Day | Training / work | Youfoodz meal(s) | kcal | Protein |
|-----|-----------------|------------------|------|---------|
| Mon 5 Oct | Upper · late 12–9 | *(pre-delivery — home meals)* | — | — |
| Tue 6 Oct | Rest · 8–6 | *(pre-delivery — home meals)* | — | — |
| **Wed 7 Oct** | Lower · OFF · **delivery** | **Portuguese Chicken & Rice** ⚠️ tomato-risk — check / skip if tomato-heavy | 718 | 44.9 g |
| **Thu 8 Oct** | Upper · late 12–9 | **Creamy Chicken Alfredo** (easy post-9 heat-up) | 626 | 40.7 g |
| **Fri 9 Oct** | Rest · 8–6 | **Creamy Mushroom Chicken** + **Sliced Chicken Breast Double Up** (+ rice/veg) | 295+224 | 21.1+42.9 g |
| **Sat 10 Oct** | Lower · OFF | **Chicken Carbonara** (lunch) | 542 | 41 g |
| **Sun 11 Oct** | Optional pull · OFF | **Chicken & Spinach Penne** (lunch) | 515 | 41.5 g |

Fat macros were not on the order — left blank in the app.

## Example day — Thu 8 Oct (Upper, late dinner)

| Slot | Item | kcal | P (g) |
|------|------|------|-------|
| Breakfast | Oats + whey + berries + honey | 450 | 35 |
| Snack | Cottage cheese + rice cakes | 250 | 22 |
| Lunch | Chicken + microwave rice + frozen veg | 520 | 42 |
| Snack | YoPRO yoghurt | 160 | 25 |
| Dinner (post-9) | Youfoodz Creamy Chicken Alfredo | 626 | 40.7 |
| Sweet | Greek yoghurt + honey | 180 | 15 |
| Treat | ~180 kcal allowance | 180 | 1 |
| **Planned total** | | **~2366** | **~181** |

## Shopping list highlights (non-Youfoodz)

- High-protein yoghurt (YoPRO / Chobani Fit / similar)
- Muscle Nation or similar protein puddings
- Whey protein; high-protein milk (Pauls PLUS / similar)
- Eggs, chicken breast/thigh, lean beef mince, steak
- Oats, Weet-Bix, bread/wraps, microwave rice cups
- Cottage cheese, cheese slices
- Peanut butter, honey, bananas, berries, apples
- Rice cakes, frozen veg, broccoli, baby spinach, avocado
- Baked/roast potatoes (not mash)
- Creamy mushroom pasta sauce or ingredients (no tomato)
- Dark chocolate or other ~150–200 kcal treats

## App data

Stored in `localStorage` under `S.meals`. Youfoodz checklist: `S.meals.delivery` (`week`, `date`, `items[]`).  
New weekly order: replace `delivery` via `applyYoufoodzDelivery({week, date, area, items})` (or parent sync). Tick items to log macros on their `assignDay`.
