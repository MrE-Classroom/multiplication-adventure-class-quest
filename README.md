# Multiplication Adventure: Class Quest — Version 2

Static GitHub Pages game build. This ZIP intentionally does **not** include the `assets/` folder.

## Upload to GitHub
Upload these files and folders to the repository root:

- `index.html`
- `css/`
- `js/`
- `data/`
- `README.md`
- `ASSET_PATHS.json` (reference only)

Then upload your separate `assets/` folder beside them:

```text
assets/heroes/
assets/backgrounds/
assets/bosses/
assets/enemies/
assets/items/
assets/cosmetics/
assets/ui/
```

## Version 2 fixes

- Start page fits without scrolling on normal laptop/tablet browser heights.
- Battle/training/boss question screen fits without internal scrolling.
- Asset images use `object-fit: contain` where appropriate so icons and portraits are not stretched.
- UI cards no longer crop shop, backpack, mastery, and quest icons as banner strips.
- Hero fallback emoji now only appears when an image fails to load.
- Mage Focus Spell button now shows the correct cost: 1 mana.

## Main mechanics checked

- Boy/Girl hero choice is saved with class choice.
- Knight, Archer, and Mage classes load correct portraits.
- Training, area battles, boss battles, boss keys, quests, mastery tracking, shop, inventory, equipment, class changes, and reset flow are still connected.
- Local save key: `multiplicationAdventureClassQuestV2`.
