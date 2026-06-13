(function () {
  'use strict';

  // v34 asset manifest is aligned to the provided assets.zip folder tree.
  // Do not add guessed subfolders such as assets/heroes/portraits or assets/items/potions.
  const ASSETS = {
    backgrounds: {
      town: 'assets/backgrounds/town.jpg',
      training: 'assets/backgrounds/training-area.jpg',
      meadow: 'assets/backgrounds/meadow.jpg',
      forest: 'assets/backgrounds/forest.jpg',
      cave: 'assets/backgrounds/cave.jpg',
      castle: 'assets/backgrounds/castle.jpg',
      dragon: 'assets/backgrounds/dragon-mountain.jpg'
    },
    portraits: {
      'knight-boy': 'assets/heroes/knight-boy.png',
      'knight-girl': 'assets/heroes/knight-girl.png',
      'archer-boy': 'assets/heroes/archer-boy.png',
      'archer-girl': 'assets/heroes/archer-girl.png',
      'mage-boy': 'assets/heroes/mage-boy.png',
      'mage-girl': 'assets/heroes/mage-girl.png'
    },
    battle: {
      'knight-boy': 'assets/heroes/battle/battle_knight_boy_sword.png',
      'knight-girl': 'assets/heroes/battle/battle_knight_girl_sword.png',
      'archer-boy': 'assets/heroes/battle/battle_archer_boy_arrow.png',
      'archer-girl': 'assets/heroes/battle/battle_archer_girl_arrow.png',
      'mage-boy': 'assets/heroes/battle/battle_mage_blue_spell.png',
      'mage-girl': 'assets/heroes/battle/battle_mage_purple_spell.png'
    },
    ui: {
      coin: 'assets/ui/coin.png',
      heart: 'assets/ui/heart.png',
      mana: 'assets/ui/mana.png',
      key: 'assets/ui/key.png',
      map: 'assets/ui/map.png',
      shop: 'assets/ui/shop.png',
      backpack: 'assets/ui/backpack.png',
      star: 'assets/ui/star.png',
      mastery: 'assets/ui/mastery.png',
      badge: 'assets/ui/badge.png',
      lock: 'assets/ui/lock.png',
      bossWarning: 'assets/ui/boss-warning.png'
    }
  };

  const HERO_CLASSES = {
    knight: {
      id: 'knight',
      label: 'Knight',
      defaultNames: { boy: 'Leo Shieldheart', girl: 'Aria Shieldheart' },
      hp: 5,
      mana: 2,
      stats: { attack: 2, defense: 4, speed: 1, focus: 1 },
      ability: { name: 'Shield Block', summary: 'Blocks one wrong boss answer each boss battle.' },
      difficulty: '★★☆☆☆',
      description: 'Best for students who want more HP and a forgiving boss battle.'
    },
    archer: {
      id: 'archer',
      label: 'Archer',
      defaultNames: { boy: 'Theo Swiftshot', girl: 'Maya Swiftshot' },
      hp: 4,
      mana: 3,
      stats: { attack: 3, defense: 2, speed: 4, focus: 2 },
      ability: { name: 'Streak Shot', summary: '+2 bonus coins every 3 correct answers in a row.' },
      difficulty: '★★★☆☆',
      description: 'Fast and rewarding for students who build answer streaks.'
    },
    mage: {
      id: 'mage',
      label: 'Mage',
      defaultNames: { boy: 'Nico Starspell', girl: 'Luna Starspell' },
      hp: 3,
      mana: 5,
      stats: { attack: 4, defense: 1, speed: 2, focus: 5 },
      ability: { name: 'Focus Spell', summary: 'Spend 1 mana to remove two wrong answer choices.' },
      difficulty: '★★★★☆',
      description: 'Powerful, but needs careful mana use.'
    }
  };

  const AREAS = [
    {
      id: 'meadow',
      label: 'Meadow',
      subtitle: 'Warm-up facts',
      focusFacts: [0, 1, 2, 5, 10],
      boss: { id: 'meadow-slime', label: 'Meadow Slime', hp: 6, asset: 'assets/bosses/meadow-boss.png' },
      enemies: ['assets/enemies/meadow-enemy-1.png', 'assets/enemies/meadow-enemy-2.png'],
      background: ASSETS.backgrounds.meadow,
      unlockBoss: null,
      reward: { coins: 18, xp: 25 }
    },
    {
      id: 'forest',
      label: 'Forest',
      subtitle: '3s and 4s',
      focusFacts: [3, 4],
      boss: { id: 'forest-guardian', label: 'Forest Guardian', hp: 8, asset: 'assets/bosses/forest-boss.png' },
      enemies: ['assets/enemies/forest-enemy-1.png', 'assets/enemies/forest-enemy-2.png'],
      background: ASSETS.backgrounds.forest,
      unlockBoss: 'meadow-slime',
      reward: { coins: 22, xp: 32 }
    },
    {
      id: 'cave',
      label: 'Cave',
      subtitle: '6s and 7s',
      focusFacts: [6, 7],
      boss: { id: 'crystal-golem', label: 'Crystal Golem', hp: 10, asset: 'assets/bosses/cave-boss.png' },
      enemies: ['assets/enemies/cave-enemy-1.png', 'assets/enemies/cave-enemy-2.png'],
      background: ASSETS.backgrounds.cave,
      unlockBoss: 'forest-guardian',
      reward: { coins: 26, xp: 40 }
    },
    {
      id: 'castle',
      label: 'Castle',
      subtitle: '8s and 9s',
      focusFacts: [8, 9],
      boss: { id: 'castle-knight', label: 'Castle Knight', hp: 12, asset: 'assets/bosses/castle-boss.png' },
      enemies: ['assets/enemies/castle-enemy-1.png', 'assets/enemies/castle-enemy-2.png'],
      background: ASSETS.backgrounds.castle,
      unlockBoss: 'crystal-golem',
      reward: { coins: 30, xp: 48 }
    },
    {
      id: 'dragon',
      label: 'Dragon Mountain',
      subtitle: '0–10 mixed review',
      focusFacts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      boss: { id: 'math-dragon', label: 'Math Dragon', hp: 15, asset: 'assets/bosses/dragon-boss.png' },
      enemies: ['assets/enemies/dragon-mountain-enemy-1.png', 'assets/enemies/dragon-mountain-enemy-2.png'],
      background: ASSETS.backgrounds.dragon,
      unlockBoss: 'castle-knight',
      reward: { coins: 40, xp: 65 }
    }
  ];

  const AURA_OPTIONS = [
    { id: 'aura-prismatic-rose', label: 'Prismatic Rose Aura', slug: 'prismatic_rose', folder: 'option_01_prismatic_rose', cost: 35 },
    { id: 'aura-inferno-outline', label: 'Inferno Outline Aura', slug: 'inferno_outline', folder: 'option_02_inferno_outline', cost: 35 },
    { id: 'aura-electric-outline', label: 'Electric Outline Aura', slug: 'electric_outline', folder: 'option_03_electric_outline', cost: 35 },
    { id: 'aura-frost-outline', label: 'Frost Outline Aura', slug: 'frost_outline', folder: 'option_04_frost_outline', cost: 35 },
    { id: 'aura-shadow-outline', label: 'Shadow Outline Aura', slug: 'shadow_outline', folder: 'option_05_shadow_outline', cost: 35 },
    { id: 'aura-celestial-radiance', label: 'Celestial Radiance Aura', slug: 'celestial_radiance', folder: 'option_06_celestial_radiance', cost: 45 }
  ];

  function auraSheetPath(aura, heroKey) {
    const heroFile = {
      'knight-boy': 'aura_knight_boy_sword',
      'knight-girl': 'aura_knight_girl_sword',
      'archer-boy': 'aura_archer_boy_arrow',
      'archer-girl': 'aura_archer_girl_arrow',
      'mage-boy': 'aura_mage_blue_spell',
      'mage-girl': 'aura_mage_purple_spell'
    }[heroKey] || 'aura_knight_boy_sword';

    if (aura?.id === 'aura-silhouette') {
      return `assets/effects/auras/silhouette/${heroFile}_pulse_sheet.png`;
    }
    return `assets/cosmetics/auras/${aura.folder}/${heroFile}_${aura.slug}_pulse_sheet.png`;
  }

  const FRAME_ITEMS = [
    { id: 'frame-common-wood', label: 'Common Wood Frame', cost: 18, asset: 'assets/ui/hero-frames/frame_01_common_wood.png' },
    { id: 'frame-ranger-emerald', label: 'Ranger Emerald Frame', cost: 20, asset: 'assets/ui/hero-frames/frame_02_ranger_emerald.png' },
    { id: 'frame-knight-royal', label: 'Knight Royal Frame', cost: 20, asset: 'assets/ui/hero-frames/frame_03_knight_royal.png' },
    { id: 'frame-arcane-starfire', label: 'Arcane Starfire Frame', cost: 24, asset: 'assets/ui/hero-frames/frame_04_arcane_starfire.png' },
    { id: 'frame-legend-ruby', label: 'Legend Ruby Frame', cost: 28, asset: 'assets/ui/hero-frames/frame_05_legend_ruby.png' },
    { id: 'frame-celestial-guardian', label: 'Celestial Guardian Frame', cost: 32, asset: 'assets/ui/hero-frames/frame_06_celestial_guardian.png' },
    { id: 'frame-shadow-void', label: 'Shadow Void Frame', cost: 32, asset: 'assets/ui/hero-frames/frame_07_shadow_void.png' },
    { id: 'frame-druidic-vine', label: 'Druidic Vine Frame', cost: 34, asset: 'assets/ui/hero-frames/frame_08_druidic_vine.png' },
    { id: 'frame-infernal-spike', label: 'Infernal Spike Frame', cost: 38, asset: 'assets/ui/hero-frames/frame_09_infernal_spike.png' },
    { id: 'frame-cosmic-moon', label: 'Cosmic Moon Frame', cost: 40, asset: 'assets/ui/hero-frames/frame_10_cosmic_moon.png' }
  ];

  const ITEMS = [
    { id: 'wooden-sword', label: 'Wooden Sword', cls: ['knight'], category: 'weapon', slot: 'weapon', cost: 12, stats: { attack: 1 }, asset: 'assets/items/knight/wooden-sword.png' },
    { id: 'iron-sword', label: 'Iron Sword', cls: ['knight'], category: 'weapon', slot: 'weapon', cost: 30, stats: { attack: 2 }, asset: 'assets/items/knight/iron-sword.png' },
    { id: 'training-shield', label: 'Training Shield', cls: ['knight'], category: 'body', slot: 'body', cost: 16, stats: { defense: 1 }, asset: 'assets/items/knight/training-shield.png' },
    { id: 'royal-shield', label: 'Royal Shield', cls: ['knight'], category: 'body', slot: 'body', cost: 36, stats: { defense: 2, hp: 1 }, asset: 'assets/items/knight/royal-shield.png' },
    { id: 'simple-helmet', label: 'Simple Helmet', cls: ['knight'], category: 'head', slot: 'head', cost: 14, stats: { defense: 1 }, asset: 'assets/items/knight/simple-helmet.png' },
    { id: 'iron-helmet', label: 'Iron Helmet', cls: ['knight'], category: 'head', slot: 'head', cost: 24, stats: { defense: 2 }, asset: 'assets/items/knight/iron-helmet.png' },
    { id: 'steel-armor', label: 'Steel Armor', cls: ['knight'], category: 'body', slot: 'body', cost: 26, stats: { hp: 1, defense: 1 }, asset: 'assets/items/knight/steel-armor.png' },
    { id: 'dragon-plate-armor', label: 'Dragon Plate Armor', cls: ['knight'], category: 'body', slot: 'body', cost: 44, stats: { hp: 2, defense: 2 }, asset: 'assets/items/knight/dragon-plate-armor.png' },
    { id: 'knight-boots', label: 'Knight Boots', cls: ['knight'], category: 'legs', slot: 'legs', cost: 18, stats: { speed: 1 }, asset: 'assets/items/knight/knight-boots.png' },

    { id: 'practice-bow', label: 'Practice Bow', cls: ['archer'], category: 'weapon', slot: 'weapon', cost: 12, stats: { attack: 1 }, asset: 'assets/items/archer/practice-bow.png' },
    { id: 'forest-bow', label: 'Forest Bow', cls: ['archer'], category: 'weapon', slot: 'weapon', cost: 26, stats: { attack: 2 }, asset: 'assets/items/archer/forest-bow.png' },
    { id: 'castle-longbow', label: 'Castle Longbow', cls: ['archer'], category: 'weapon', slot: 'weapon', cost: 34, stats: { attack: 2, focus: 1 }, asset: 'assets/items/archer/castle-longbow.png' },
    { id: 'dragon-quiver', label: 'Dragon Quiver', cls: ['archer'], category: 'weapon', slot: 'weapon', cost: 42, stats: { attack: 2, speed: 1 }, asset: 'assets/items/archer/dragon-quiver.png' },
    { id: 'leather-hood', label: 'Leather Hood', cls: ['archer'], category: 'head', slot: 'head', cost: 14, stats: { focus: 1 }, asset: 'assets/items/archer/leather-hood.png' },
    { id: 'ranger-hood', label: 'Ranger Hood', cls: ['archer'], category: 'head', slot: 'head', cost: 24, stats: { focus: 2 }, asset: 'assets/items/archer/ranger-hood.png' },
    { id: 'leather-armor', label: 'Leather Armor', cls: ['archer'], category: 'body', slot: 'body', cost: 22, stats: { defense: 1 }, asset: 'assets/items/archer/leather-armor.png' },
    { id: 'reinforced-leather-armor', label: 'Reinforced Leather Armor', cls: ['archer'], category: 'body', slot: 'body', cost: 32, stats: { defense: 2 }, asset: 'assets/items/archer/reinforced-leather-armor.png' },
    { id: 'scout-boots', label: 'Scout Boots', cls: ['archer'], category: 'legs', slot: 'legs', cost: 20, stats: { speed: 2 }, asset: 'assets/items/archer/scout-boots.png' },

    { id: 'training-wand', label: 'Training Wand', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 12, stats: { attack: 1 }, asset: 'assets/items/mage/training-wand.png' },
    { id: 'crystal-staff', label: 'Crystal Staff', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 30, stats: { attack: 2, focus: 1 }, asset: 'assets/items/mage/crystal-staff.png' },
    { id: 'star-staff', label: 'Star Staff', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 34, stats: { attack: 2, focus: 1 }, asset: 'assets/items/mage/star-staff.png' },
    { id: 'spell-book', label: 'Spell Book', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 28, stats: { focus: 2 }, asset: 'assets/items/mage/spell-book.png' },
    { id: 'dragon-spellbook', label: 'Dragon Spellbook', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 46, stats: { attack: 2, focus: 2 }, asset: 'assets/items/mage/dragon-spellbook.png' },
    { id: 'apprentice-hat', label: 'Apprentice Hat', cls: ['mage'], category: 'head', slot: 'head', cost: 14, stats: { mana: 1 }, asset: 'assets/items/mage/apprentice-hat.png' },
    { id: 'blue-robe', label: 'Blue Robe', cls: ['mage'], category: 'body', slot: 'body', cost: 22, stats: { mana: 1, defense: 1 }, asset: 'assets/items/mage/blue-robe.png' },
    { id: 'moon-robe', label: 'Moon Robe', cls: ['mage'], category: 'body', slot: 'body', cost: 26, stats: { mana: 1, defense: 1 }, asset: 'assets/items/mage/moon-robe.png' },
    { id: 'magic-shoes', label: 'Magic Shoes', cls: ['mage'], category: 'legs', slot: 'legs', cost: 18, stats: { speed: 1 }, asset: 'assets/items/mage/magic-shoes.png' },

    { id: 'hp-potion', label: 'HP Potion', cls: ['all'], category: 'item', slot: 'item', cost: 8, effect: { hp: 2 }, asset: 'assets/ui/heart.png', description: 'Restores 2 HP. Can be used in battle if owned.' },
    { id: 'mana-potion', label: 'Mana Potion', cls: ['all'], category: 'item', slot: 'item', cost: 8, effect: { mana: 2 }, asset: 'assets/ui/mana.png', description: 'Restores 2 Mana. Can be used in battle if owned.' },

    ...FRAME_ITEMS.map(item => ({ ...item, cls: ['all'], category: 'frame', slot: 'frame', type: 'visual' })),
    { id: 'aura-silhouette', label: 'Silhouette Aura', cls: ['all'], category: 'aura', slot: 'aura', type: 'visual', assetType: 'aura', cost: 20 },
    ...AURA_OPTIONS.map(item => ({ ...item, cls: ['all'], category: 'aura', slot: 'aura', type: 'visual', assetType: 'aura' }))
  ];

  const SHOP_CATEGORIES = [
    { id: 'weapon', label: 'Weapon' },
    { id: 'head', label: 'Head' },
    { id: 'body', label: 'Armor' },
    { id: 'legs', label: 'Boots' },
    { id: 'item', label: 'Item' },
    { id: 'frame', label: 'Frame' },
    { id: 'aura', label: 'Aura' }
  ];

  const QUESTS = [
    { id: 'answer-10', label: 'Answer 10 Facts', target: 10, reward: { coins: 20 }, metric: 'factsAnswered' },
    { id: 'correct-8', label: 'Get 8 Correct', target: 8, reward: { xp: 25 }, metric: 'correctAnswers' },
    { id: 'master-5', label: 'Raise 5 Facts', target: 5, reward: { coins: 30 }, metric: 'masteredFacts' }
  ];

  window.MULTIPLICATION_ADVENTURE_DATA = {
    VERSION: 34,
    ASSETS,
    HERO_CLASSES,
    AREAS,
    ITEMS,
    SHOP_CATEGORIES,
    QUESTS,
    auraSheetPath
  };
}());
