# Multiplication Adventure: Class Quest v35

This is the latest rebuild aligned to the updated continuation guide.

## Package type

This ZIP is code-only. It does not include `assets/`.

For this version to load correctly, the deployment must use the v35 canonical asset tree. The matching full deploy package generated in this rebuild includes that reorganized tree and the new static aura shop icons.

## Key v35 changes

- Adds `data/assetManifest.js` as the source of truth for all asset paths.
- Uses canonical character paths under `assets/characters/`.
- Uses canonical cosmetic paths under `assets/cosmetics/`.
- Uses static aura icons for shop cards.
- Uses cropped one-frame aura rendering for item preview and cropped animated aura rendering in battle.
- Restores Town as a larger RPG hub scene with visual location cards.
- Keeps Coach above Quest Log and compact quest cards.
- Keeps correct-answer green blocking popup with auto-advance and wrong-answer correction popup.
- Keeps Trail and Cosmetic tabs hidden.

## Required root structure

```text
index.html
css/
data/
js/
assets/
```

Do not deploy a nested folder as the site root.
