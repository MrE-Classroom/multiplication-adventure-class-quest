# Multiplication Adventure Class Quest

A browser-based multiplication fluency game for students.

## How to Play

Students choose a hero, practice multiplication facts, earn coins, unlock gear, complete quests, and battle bosses.

## Hosting

This game is designed to run on GitHub Pages.

Required root files and folders:

```text
index.html
css/
js/
data/
assets/
```

## Saving Progress

Student progress saves locally in the browser using localStorage.

## Current Build

v24 — aura correction: auras are battle-only and old shop aura IDs map to real spritesheet assets.


## v24 — aura correction: auras are battle-only and old shop aura IDs map to real spritesheet assets.

Auras now live only in:

```text
assets/cosmetics/auras/
```

Hero assets are split into:

```text
assets/heroes/portraits/
assets/heroes/battle/
```

The previous incorrect aura folder has been removed:

```text
assets/effects/auras/
```

The six outline aura options are implemented as 10-frame horizontal spritesheets. Each sheet is 12540 × 1254, with each frame 1254 × 1254.


## GitHub-Ready Optimization

This build preserves the same paths and game code behavior, but the large aura spritesheets were optimized as indexed PNGs with alpha transparency. The files remain transparent in the browser and keep the same 12540 × 1254 spritesheet size.


## v24 — aura correction: auras are battle-only and old shop aura IDs map to real spritesheet assets.

- Character select screen scales to the visible device height.
- Hero portraits are kept in both `assets/heroes/portraits/` and `assets/heroes/` so the browser has a fallback path.
- Image tags now use a fallback for hero portrait paths before removing the image.


## v24 Aura Fix

- Auras no longer render on hero portrait cards or the side hero panel.
- Old shop aura IDs now map to the new real aura spritesheet assets.
- Battle auras use `assets/cosmetics/auras/option_*/aura_*_pulse_sheet.png`.
- CSS-only aura rendering has been removed from battle.


## v28 Code-Only Rebuild

This ZIP intentionally does not include the `assets/` folder.

Included changes:
- Hero name input, random name button, and real-name warning on character select.
- Character select compact full-screen layout.
- Battle screens constrained to avoid center-panel scrolling.
- Answer result pop-up with only correct/incorrect, answer if wrong, and Next Question.
- End-of-round summary with coins, XP, accuracy, and correct count.
- Hero side-panel buttons: Inventory, Items, Ability.
- Inventory and item windows open as modals and preserve the current screen.
- Rest at Town costs 10 coins and restores HP/Mana.
- HP Potion and Mana Potion added through the Items window.
- Boss defeat restores HP only.
- Mastery table shows products with simple summary.
- Aura spritesheets are forced into a clipped one-frame viewport.
- Stat gear moved out of Cosmetic category.


## v29 Code-Only Rebuild

This ZIP intentionally does not include the `assets/` folder.

Included changes:
- Optimized character select to reduce empty space.
- Restored scrolling for normal screens such as Town, Shop, Map, and Mastery.
- Kept combat screens no-scroll.
- Added universal HP Potion and Mana Potion to Shop → Item.
- Potion assets are referenced from `assets/items/potions/hp-potion.png` and `assets/items/potions/mana-potion.png`.
- Potion buying is allowed only in Town or Shop.
- Using owned potions remains available during Town, Adventure, or Boss.
- Added JavaScript aura frame stepping so the spritesheet advances frame by frame.
