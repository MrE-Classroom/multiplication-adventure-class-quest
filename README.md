# Multiplication Adventure: Final Asset-Referenced Build

This ZIP contains the final game code only. It does **not** include the `assets/` folder because assets will be uploaded separately to GitHub.

## Required GitHub folder structure

Place the generated asset folders at the root of the repository next to `index.html`:

```text
index.html
css/
data/
js/
assets/
  heroes/
  backgrounds/
  bosses/
  enemies/
  items/
  cosmetics/
  ui/
```

## New in this build

- Boy / girl hero style choice at the start.
- Hero portraits change based on class and selected boy/girl style.
- Area backgrounds are referenced from `assets/backgrounds/`.
- Boss and enemy images are referenced from `assets/bosses/` and `assets/enemies/`.
- Gear, item, cosmetic, and UI icons are referenced from the generated asset folders.
- Assets are referenced in the code, but no `assets/` folder is included in this ZIP.
- Existing features remain: local progress saving, class abilities, mastery tracking, boss keys, gear unlocks, shop, inventory, quests, and reset.

## Upload order

1. Upload this game ZIP contents to the repository root.
2. Upload/unzip the asset ZIPs so the final root folder contains `assets/`.
3. Confirm GitHub Pages is serving `index.html` from the repository root.

## Save data note

This build uses a new localStorage key:

```text
multiplicationAdventureClassQuestFinalV11
```

Students using the previous version may start fresh unless the browser keeps and migrates old data manually.
