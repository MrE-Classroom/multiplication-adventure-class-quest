# Multiplication Adventure: Class Quest v34 Code-Only Rebuild

This ZIP is code-only and intentionally does not include the `assets/` folder. Upload the contents of this folder to the GitHub repository root, replacing matching files. Keep the existing root-level `assets/` folder in place.

## v34 fixes

- Replaced the guessed asset manifest with paths verified against the provided `assets.zip`.
- Corrected hero portraits from `assets/heroes/portraits/...` to the real `assets/heroes/...` structure.
- Corrected boss art to the real files: `meadow-boss.png`, `forest-boss.png`, `cave-boss.png`, `castle-boss.png`, and `dragon-boss.png`.
- Corrected enemy art to the real files such as `meadow-enemy-1.png` and `dragon-mountain-enemy-1.png`.
- Corrected hero frame assets to `assets/ui/hero-frames/...`.
- Corrected item icons to the real class item folders and removed nonexistent item paths such as `assets/items/potions/...`.
- Kept potions functional by using existing UI assets: `heart.png` and `mana.png`.
- Removed pet shop entries because no pet asset folder exists in the provided asset package.
- Kept the dark RPG-style full-screen UI, Town graphics, item preview modal, correct-answer blocking popup with auto-advance, wrong-answer correction popup, shop scrolling, Coach panel, Quest Log, and hidden Cosmetic/Trail tabs.

## Deployment

Expected root structure after upload:

```text
repository-root/
  index.html
  README.md
  css/styles.css
  data/gameData.js
  js/game.js
  js/mastery.js
  js/storage.js
  assets/
```

Do not upload the outer folder as the GitHub Pages root.
