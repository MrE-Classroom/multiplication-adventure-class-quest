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

v22 — new asset folder structure, real portrait-frame PNGs, and animated battle aura spritesheets in the cosmetics shop.


## v22 Asset Structure

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
