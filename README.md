# Multiplication Adventure: Class Quest — Version 5

Repository name: `multiplication-adventure-class-quest`

This ZIP does not include the `assets/` folder. Upload your existing assets folder to the repository root so paths like `assets/heroes/knight-boy.png` resolve correctly.

## Version 5 changes

- Added 20 new cosmetic options to the shop data:
  - 10 new frames: silver, blue, green, purple, pink, red/fire, ice, rainbow, shadow, galaxy.
  - 10 new auras: fire, ice, nature, lightning, shadow, royal, rainbow, pink sparkle, galaxy, bright sparkle.
- Aura rendering was rebuilt so aura art sits behind/outside the hero portrait and remains visible when a frame is equipped.
- Frame rendering now uses frame image overlays instead of only a CSS border.
- Area and training backgrounds now fill the entire center question panel during battle/training/boss screens.
- Added a dark overlay and panel contrast protection so questions, answers, hero, and enemies remain readable over colorful backgrounds.
- Coach messages are now dynamic but short. They respond to the current question, area, boss, answer result, repeated mistakes, training, and weak facts.
- Scrolling remains available as a fallback for smaller devices; it was not fully removed.

## Required upload structure

```text
index.html
css/styles.css
data/gameData.js
js/game.js
js/mastery.js
js/storage.js
js/ui.js
assets/
```

See `ASSET_PATHS.json` for every referenced asset path.
