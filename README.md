# Multiplication Adventure: Class Quest v33 Code-Only Rebuild

This ZIP is code-only and intentionally does not include the `assets/` folder. Upload the contents of this folder to the GitHub repository root, replacing matching files. Keep the existing root-level `assets/` folder in place.

## v33 fixes

- Corrected the v32 asset-loading regression by adding resilient image fallback handling for hero portraits, hero battle art, enemies, bosses, frames, pets, and item icons.
- Enemy, boss, and hero image fallbacks now try common hyphen/underscore, padded-number, and extension variants before showing a missing-art label.
- Missing opponent art is now labeled correctly as `Enemy art missing` or `Boss art missing`; it no longer reports enemy failures as `Hero art missing`.
- Restored visible combat-side support: hero portrait panel, Coach panel, and compact Quest Log now appear during battle/boss screens.
- Removed duplicate bottom status bar render from v32.
- Kept the dark RPG-style full-screen UI, Town graphics, item preview modal, correct-answer blocking popup with auto-advance, wrong-answer correction popup, shop scrolling, and hidden Cosmetic/Trail tabs.

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
