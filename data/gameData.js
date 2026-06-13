(function () {
  'use strict';

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
      'knight-boy': 'assets/heroes/portraits/knight-boy.png',
      'knight-girl': 'assets/heroes/portraits/knight-girl.png',
      'archer-boy': 'assets/heroes/portraits/archer-boy.png',
      'archer-girl': 'assets/heroes/portraits/archer-girl.png',
      'mage-boy': 'assets/heroes/portraits/mage-boy.png',
      'mage-girl': 'assets/heroes/portraits/mage-girl.png'
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
      lock: 'assets/ui/lock.png'
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
      ability: {
        name: 'Shield Block',
        summary: 'Blocks one wrong boss answer each boss battle.'
      },
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
      ability: {
        name: 'Streak Shot',
        summary: '+2 bonus coins every 3 correct answers in a row.'
      },
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
      ability: {
        name: 'Focus Spell',
        summary: 'Spend 1 mana to remove two wrong answer choices.'
      },
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
      boss: { id: 'meadow-slime', label: 'Meadow Slime', hp: 6, asset: 'assets/bosses/meadow-slime.png' },
      enemies: ['assets/enemies/meadow-1.png', 'assets/enemies/meadow-2.png'],
      background: ASSETS.backgrounds.meadow,
      unlockBoss: null,
      reward: { coins: 18, xp: 25 }
    },
    {
      id: 'forest',
      label: 'Forest',
      subtitle: '3s and 4s',
      focusFacts: [3, 4],
      boss: { id: 'forest-guardian', label: 'Forest Guardian', hp: 8, asset: 'assets/bosses/forest-guardian.png' },
      enemies: ['assets/enemies/forest-1.png', 'assets/enemies/forest-2.png'],
      background: ASSETS.backgrounds.forest,
      unlockBoss: 'meadow-slime',
      reward: { coins: 22, xp: 32 }
    },
    {
      id: 'cave',
      label: 'Cave',
      subtitle: '6s and 7s',
      focusFacts: [6, 7],
      boss: { id: 'crystal-golem', label: 'Crystal Golem', hp: 10, asset: 'assets/bosses/crystal-golem.png' },
      enemies: ['assets/enemies/cave-1.png', 'assets/enemies/cave-2.png'],
      background: ASSETS.backgrounds.cave,
      unlockBoss: 'forest-guardian',
      reward: { coins: 26, xp: 40 }
    },
    {
      id: 'castle',
      label: 'Castle',
      subtitle: '8s and 9s',
      focusFacts: [8, 9],
      boss: { id: 'castle-knight', label: 'Castle Knight', hp: 12, asset: 'assets/bosses/castle-knight.png' },
      enemies: ['assets/enemies/castle-1.png', 'assets/enemies/castle-2.png'],
      background: ASSETS.backgrounds.castle,
      unlockBoss: 'crystal-golem',
      reward: { coins: 30, xp: 48 }
    },
    {
      id: 'dragon',
      label: 'Dragon Mountain',
      subtitle: '0–10 mixed review',
      focusFacts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      boss: { id: 'math-dragon', label: 'Math Dragon', hp: 15, asset: 'assets/bosses/math-dragon.png' },
      enemies: ['assets/enemies/dragon-1.png', 'assets/enemies/dragon-2.png'],
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
    return `assets/cosmetics/auras/${aura.folder}/${heroFile}_${aura.slug}_pulse_sheet.png`;
  }

  const FRAME_ITEMS = [
    { id: 'frame-silver', label: 'Silver Hero Frame', cost: 18, asset: 'assets/cosmetics/frames/silver-frame.png' },
    { id: 'frame-blue', label: 'Blue Hero Frame', cost: 20, asset: 'assets/cosmetics/frames/blue-frame.png' },
    { id: 'frame-green', label: 'Green Hero Frame', cost: 20, asset: 'assets/cosmetics/frames/green-frame.png' },
    { id: 'frame-purple', label: 'Purple Hero Frame', cost: 25, asset: 'assets/cosmetics/frames/purple-frame.png' },
    { id: 'frame-rainbow', label: 'Rainbow Hero Frame', cost: 40, asset: 'assets/cosmetics/frames/rainbow-frame.png' }
  ];

  const PET_ITEMS = [
    { id: 'pet-sparrow', label: 'Garden Sparrow', cost: 18, asset: 'assets/cosmetics/pets/garden-sparrow.png' },
    { id: 'pet-fox', label: 'Brave Fox', cost: 26, asset: 'assets/cosmetics/pets/brave-fox.png' },
    { id: 'pet-dragonling', label: 'Tiny Dragon', cost: 45, asset: 'assets/cosmetics/pets/tiny-dragon.png' }
  ];

  const ITEMS = [
    { id: 'wooden-sword', label: 'Wooden Sword', cls: ['knight'], category: 'weapon', slot: 'weapon', cost: 12, stats: { attack: 1 }, asset: 'assets/items/knight/wooden-sword.png' },
    { id: 'iron-sword', label: 'Iron Sword', cls: ['knight'], category: 'weapon', slot: 'weapon', cost: 30, stats: { attack: 2 }, asset: 'assets/items/knight/iron-sword.png' },
    { id: 'simple-helmet', label: 'Simple Helmet', cls: ['knight'], category: 'head', slot: 'head', cost: 14, stats: { defense: 1 }, asset: 'assets/items/knight/simple-helmet.png' },
    { id: 'bronze-armor', label: 'Bronze Armor', cls: ['knight'], category: 'body', slot: 'body', cost: 24, stats: { hp: 1, defense: 1 }, asset: 'assets/items/knight/bronze-armor.png' },
    { id: 'sturdy-boots', label: 'Sturdy Boots', cls: ['knight'], category: 'legs', slot: 'legs', cost: 18, stats: { speed: 1 }, asset: 'assets/items/knight/sturdy-boots.png' },

    { id: 'practice-bow', label: 'Practice Bow', cls: ['archer'], category: 'weapon', slot: 'weapon', cost: 12, stats: { attack: 1 }, asset: 'assets/items/archer/practice-bow.png' },
    { id: 'dragon-quiver', label: 'Dragon Quiver', cls: ['archer'], category: 'weapon', slot: 'weapon', cost: 42, stats: { attack: 2, speed: 1 }, asset: 'assets/items/archer/dragon-quiver.png' },
    { id: 'leather-hood', label: 'Leather Hood', cls: ['archer'], category: 'head', slot: 'head', cost: 14, stats: { focus: 1 }, asset: 'assets/items/archer/leather-hood.png' },
    { id: 'scout-vest', label: 'Scout Vest', cls: ['archer'], category: 'body', slot: 'body', cost: 24, stats: { defense: 1 }, asset: 'assets/items/archer/scout-vest.png' },
    { id: 'swift-boots', label: 'Swift Boots', cls: ['archer'], category: 'legs', slot: 'legs', cost: 20, stats: { speed: 2 }, asset: 'assets/items/archer/swift-boots.png' },

    { id: 'training-wand', label: 'Training Wand', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 12, stats: { attack: 1 }, asset: 'assets/items/mage/training-wand.png' },
    { id: 'star-wand', label: 'Star Wand', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 34, stats: { attack: 2, focus: 1 }, asset: 'assets/items/mage/star-wand.png' },
    { id: 'apprentice-hat', label: 'Apprentice Hat', cls: ['mage'], category: 'head', slot: 'head', cost: 14, stats: { mana: 1 }, asset: 'assets/items/mage/apprentice-hat.png' },
    { id: 'moon-robe', label: 'Moon Robe', cls: ['mage'], category: 'body', slot: 'body', cost: 26, stats: { mana: 1, defense: 1 }, asset: 'assets/items/mage/moon-robe.png' },
    { id: 'spell-shoes', label: 'Spell Shoes', cls: ['mage'], category: 'legs', slot: 'legs', cost: 18, stats: { speed: 1 }, asset: 'assets/items/mage/spell-shoes.png' },

    { id: 'hp-potion', label: 'HP Potion', cls: ['all'], category: 'item', slot: 'item', cost: 8, effect: { hp: 2 }, asset: 'assets/items/potions/hp-potion.png', description: 'Restores 2 HP. Can be used in battle if owned.' },
    { id: 'mana-potion', label: 'Mana Potion', cls: ['all'], category: 'item', slot: 'item', cost: 8, effect: { mana: 2 }, asset: 'assets/items/potions/mana-potion.png', description: 'Restores 2 Mana. Can be used in battle if owned.' },

    ...FRAME_ITEMS.map(item => ({ ...item, cls: ['all'], category: 'frame', slot: 'frame', type: 'visual' })),
    ...PET_ITEMS.map(item => ({ ...item, cls: ['all'], category: 'pet', slot: 'pet', type: 'visual' })),
    ...AURA_OPTIONS.map(item => ({ ...item, cls: ['all'], category: 'aura', slot: 'aura', type: 'visual', assetType: 'aura' }))
  ];

  const SHOP_CATEGORIES = [
    { id: 'weapon', label: 'Weapon' },
    { id: 'head', label: 'Head' },
    { id: 'body', label: 'Body' },
    { id: 'legs', label: 'Legs' },
    { id: 'item', label: 'Item' },
    { id: 'frame', label: 'Frame' },
    { id: 'aura', label: 'Aura' },
    { id: 'pet', label: 'Pet' }
  ];

  const QUESTS = [
    { id: 'answer-10', label: 'Answer 10 Facts', target: 10, reward: { coins: 20 }, metric: 'factsAnswered' },
    { id: 'correct-8', label: 'Get 8 Correct', target: 8, reward: { xp: 25 }, metric: 'correctAnswers' },
    { id: 'master-5', label: 'Raise 5 Facts', target: 5, reward: { coins: 30 }, metric: 'masteredFacts' }
  ];

  window.MULTIPLICATION_ADVENTURE_DATA = {
    VERSION: 31,
    ASSETS,
    HERO_CLASSES,
    AREAS,
    ITEMS,
    SHOP_CATEGORIES,
    QUESTS,
    auraSheetPath
  };
}());
