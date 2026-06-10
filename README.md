# Multiplication Adventure Class Quest — v6

Static GitHub Pages build. Upload these files to the root of the repository:

- index.html
- css/
- js/
- data/
- ASSET_PATHS.json

Do not upload this zip as a single file to GitHub Pages. Extract it first.

## Assets

This zip intentionally does not include the assets folder. Upload your asset folders separately using the paths listed in ASSET_PATHS.json.

Required cosmetic folders include:

- assets/cosmetics/frames/
- assets/cosmetics/auras/
- assets/cosmetics/pets/
- assets/cosmetics/trails/

Frame files must be true transparent PNG overlays. The center and background must be transparent, not a visible checkerboard pattern.

## v6 changes

- Fixed cosmetic stack logic: aura glow behind hero, hero portrait in the middle, frame overlay on top.
- Aura now creates a glow around the portrait through CSS, preventing square aura images from covering the hero.
- Frame overlay no longer replaces the hero image in the rendering logic.
- Area background now covers the full center question panel during training, adventure, and boss battles.
- Shop preview now opens in a centered modal instead of appearing at the bottom of the shop scroll area.
- Side panel scrolling remains available as fallback on smaller screens.
