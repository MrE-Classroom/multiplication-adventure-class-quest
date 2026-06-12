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

v21 — responsive character select screen with one start button.


## v25 Code-Only Rebuild

This ZIP intentionally does not include the `assets/` folder.

Changes:
- Hero portraits use `assets/heroes/*.png` as the primary path.
- Hero portrait images fall back to `assets/heroes/portraits/*.png`.
- Auras do not render on hero portraits or the side hero panel.
- Auras render only through real battle spritesheet assets.
- Previous shop aura IDs map to the real new aura spritesheets.
- Shop aura preview is clipped inside a fixed preview box so it does not cover item text.


## v26 Code-Only Rebuild

This ZIP intentionally does not include the `assets/` folder.

Changes:
- Rebuilt character select as a responsive, non-overlapping layout.
- Added selected hero preview card with class, HP, Mana, stars, and ability.
- Reworked gender and class choices into separate panels.
- Reduced oversized class cards and fixed viewport scaling.
- Preserved v25 aura fixes and portrait path fallback behavior.


## v27 Code-Only Rebuild

This ZIP intentionally does not include the `assets/` folder.

Changes:
- Mastery table cells now show multiplication products instead of mastery level numbers.
- Mastery progress still controls the cell color.
- Mastery summary now shows only:
  - Mastered facts
  - Accuracy
  - Facts practiced
  - Current focus facts
