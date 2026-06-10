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

## Assets

The game uses image assets stored in the `assets/` folder. Keep the folder structure exactly as listed in `ASSET_PATHS.json`.

## Saving Progress

Student progress saves locally in the browser using `localStorage`. Progress stays on the same device and browser unless site data is cleared or the game is reset.

## Resetting Progress

Use the Settings button inside the top panel to reset progress.

## Current Build

v19 — stable rebuild with fixed shop rendering, sticky top/bottom panels, settings reset, safer image fallbacks, and simplified CSS-only frames/auras.
