# Multiplication Adventure Class Quest

A browser-based multiplication fluency game for students. Students choose a hero, practice multiplication facts, earn coins, complete quests, unlock gear and cosmetics, and battle bosses.

## Current Build

**v18 — clean GitHub package**

This build keeps the sticky top panel, sticky bottom stats panel, Settings button, local progress saving, quests, mastery tracking, shop, inventory, adventure areas, and boss battles.

## Required GitHub Pages Structure

Upload these files and folders at the repository root:

```text
index.html
css/
js/
data/
assets/
```

Optional support file:

```text
ASSET_PATHS.json
```

## Assets

The game expects image files inside the existing `assets/` folder. Keep the asset folder structure unchanged.

Expected main folders:

```text
assets/backgrounds/
assets/bosses/
assets/cosmetics/
assets/enemies/
assets/heroes/
assets/items/
assets/ui/
```

## Saving Progress

Student progress is saved in the browser with `localStorage`. Progress stays on the same device and browser unless site data is cleared or the game is reset.

## Resetting Progress

Use the **Settings** button inside the game to reset progress.

## Notes for Updating

When replacing an older build, upload the new `index.html`, `css/`, `js/`, and `data/` files over the old files. Keep the existing `assets/` folder.

After uploading, hard refresh the browser:

```text
Ctrl + Shift + R
```
