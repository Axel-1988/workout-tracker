# Meal plan — ISO W40 (Mon 28 Sep – Sun 4 Oct 2026)

**Delivery:** Wednesday **30 September 2026** · Youfoodz · Cecil Park 2178 · status **Delivered**  
**Targets:** ~2450 kcal · ~180 g protein · body recomp (~95 kg)  
**Avoid (new home meals):** seafood, tomato-forward sauces, lamb, mashed potato (other potato OK)  
**Note:** Youfoodz are a **week checklist** — not assigned to calendar days. Tick when eaten; macros go to the **selected day** in the Meals tab (defaults to today).

## Youfoodz checklist (tick in app → macros on selected day)

| Meal | kcal | P | C | F | Notes |
|------|------|---|---|---|-------|
| Butter Chicken — Naan & Brown Rice | 871 | 40.9 | 90.7 | 36.4 | ⚠ tomato paste |
| Portuguese Chicken & Rice | 718 | 44.9 | 86.5 | 19.9 | ⚠ tomato sauce |
| Spaghetti Bolognese — Beef Ragu | 626 | 40.7 | 76.9 | 15.7 | ⚠ tomato-heavy |
| Beef Lasagne | 701 | 43.2 | 36.4 | 41.6 | 🚫 **Damaged · credit** — not tickable |
| Lebanese Chicken Shawarma | 584 | 50 | 42.7 | 21.5 | ✓ **Already eaten Wed 30 Sep** (pre-ticked) |
| Chicken Carbonara — Ham & Mushrooms | 542 | 41 | 54.4 | 16.2 | Contains pork |

Tomato-flagged meals stay listed with warnings (already ordered).

## Home week plan (flexible suggestions)

Mon 28 – Sun 4 · home meals only (~2450 / 180). Use ⓘ Recipe on any item. Youfoodz fill gaps when you tick them.

| Day | Training / work | Notes |
|-----|-----------------|-------|
| Mon 28 Sep | Upper · late 12–9 | Pre-delivery home day |
| Tue 29 Sep | Rest · 8–6 | Pre-delivery |
| **Wed 30 Sep** | Lower · OFF · **delivery** | Shawarma already logged; pick other YF as needed |
| Thu 1 Oct | Upper · late 12–9 | Easy post-9 Youfoodz heat-up optional |
| Fri 2 Oct | Rest · 8–6 | Take a YF to work if you want |
| Sat 3 Oct | Lower · OFF | Higher carbs around training |
| Sun 4 Oct | Optional pull · OFF | Finish remaining YF before next Wed |

## Recipe popups

Every Youfoodz checklist item and every home plan item has an **ⓘ** control. Opens a modal with name, macros, ingredients / method, allergens, tomato/pork warnings, and Youfoodz URL when available.

## Shopping list highlights (non-Youfoodz)

- High-protein yoghurt (YoPRO / Chobani Fit)
- Muscle Nation or similar protein puddings
- Whey; high-protein milk (Pauls PLUS)
- Eggs, chicken breast/thigh, lean beef mince, steak
- Oats, Weet-Bix, bread/wraps, microwave rice cups
- Cottage cheese, cheese slices
- Peanut butter, honey, bananas, berries, apples
- Rice cakes, frozen veg, broccoli, baby spinach, avocado
- Baked/roast potatoes (not mash)
- Creamy mushroom pasta ingredients (no tomato)
- Dark chocolate or ~150–200 kcal treats

## App data

`localStorage` → `S.meals`. Delivery: `S.meals.delivery` (`week`, `date`, `status`, `items[]` with `eaten` / `eatenOn` / `damaged`).  
Tick Youfoodz → `eatenOn` = selected Meals day. Damaged items stay listed, checkbox disabled.  
Next order (W41, Wed 7 Oct): see `MEAL-PLAN-W41.md` — Monday sync / `applyYoufoodzDelivery` will replace primary UI.
