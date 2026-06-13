# Multiplication Adventure: Class Quest — v31 Code-Only Rebuild

This package is a code-only rebuild for the GitHub Pages browser game. It intentionally does **not** include the `assets/` folder. Keep the existing live repository `assets/` directory in place and upload/replace these files at the repository root.

## Version

- `const VERSION = 31;`
- Query strings in `index.html` use `?v=31`.

## Files included

```text
index.html
README.md
css/styles.css
data/gameData.js
js/game.js
js/mastery.js
js/storage.js
```

## v31 changes

- Correct answers now show a green blocking “Correct” popup.
- The correct popup blocks other input and auto-advances after a short delay.
- Wrong answers show a correction modal with the full equation and a Next Question button.
- Town, Shop, Map, Mastery, Settings, and Summary use a scrollable screen body.
- Battle and Boss screens remain no-scroll and fit into the available viewport.
- Shop tabs no longer include Trail or Cosmetic.
- Aura shop previews use a static first-frame preview so the full spritesheet does not appear.
- Battle auras render behind the battle hero only and animate from the 10-frame spritesheet.
- Quest cards are compact rows with inline claim buttons.
- Coach panel appears above the Quest Log and uses expanded action-specific guidance.
- Potions are universal items and can be used in battle if owned.
- Buying items during an active battle is blocked.

## Deployment

Upload the contents of this folder directly to the GitHub repository root. Do not upload the outer folder as a nested directory. The repository root should contain `index.html`.

## Asset expectations

This code references the existing project asset paths such as:

- `assets/backgrounds/meadow.jpg`
- `assets/backgrounds/town.jpg`
- `assets/heroes/portraits/knight-boy.png`
- `assets/heroes/battle/battle_knight_boy_sword.png`
- `assets/items/potions/hp-potion.png`
- `assets/items/potions/mana-potion.png`
- `assets/cosmetics/auras/option_01_prismatic_rose/..._pulse_sheet.png`

GitHub Pages paths are case-sensitive, so filenames must match the code exactly.

## Verification completed before packaging

- JavaScript syntax check with `node --check`.
- Static smoke validation for required version strings, hidden Trail/Cosmetic shop tabs, correct-answer modal strings, wrong-answer modal strings, scroll-screen and combat-screen classes, potion item data, and aura static/battle classes.
