(function () {
  'use strict';

  const ASSETS = window.MA_ASSET_MANIFEST;
  if (!ASSETS) throw new Error('Missing data/assetManifest.js. Load assetManifest before gameData.');

  const HERO_CLASSES = {
    knight: {
      id: 'knight', label: 'Knight',
      defaultNames: { boy: 'Leo Shieldheart', girl: 'Aria Shieldheart' },
      hp: 5, mana: 2,
      stats: { attack: 2, defense: 4, speed: 1, focus: 1 },
      ability: { name: 'Shield Block', summary: 'Blocks one wrong boss answer each boss battle.' },
      difficulty: '★★☆☆☆',
      description: 'Best for students who want more HP and a forgiving boss battle.'
    },
    archer: {
      id: 'archer', label: 'Archer',
      defaultNames: { boy: 'Theo Swiftshot', girl: 'Maya Swiftshot' },
      hp: 4, mana: 3,
      stats: { attack: 3, defense: 2, speed: 4, focus: 2 },
      ability: { name: 'Streak Shot', summary: '+2 bonus coins every 3 correct answers in a row.' },
      difficulty: '★★★☆☆',
      description: 'Fast and rewarding for students who build answer streaks.'
    },
    mage: {
      id: 'mage', label: 'Mage',
      defaultNames: { boy: 'Nico Starspell', girl: 'Luna Starspell' },
      hp: 3, mana: 5,
      stats: { attack: 4, defense: 1, speed: 2, focus: 5 },
      ability: { name: 'Focus Spell', summary: 'Spend 1 mana to remove two wrong answer choices.' },
      difficulty: '★★★★☆',
      description: 'Powerful, but needs careful mana use.'
    }
  };

  const AREAS = [
    { id: 'meadow', label: 'Meadow', subtitle: 'Warm-up facts', focusFacts: [0, 1, 2, 5, 10], boss: { id: 'meadow-slime', label: 'Meadow Slime', hp: 6, asset: ASSETS.bosses.meadow }, enemies: ASSETS.enemies.meadow, background: ASSETS.backgrounds.meadow, unlockBoss: null, reward: { coins: 18, xp: 25 } },
    { id: 'forest', label: 'Forest', subtitle: '3s and 4s', focusFacts: [3, 4], boss: { id: 'forest-guardian', label: 'Forest Guardian', hp: 8, asset: ASSETS.bosses.forest }, enemies: ASSETS.enemies.forest, background: ASSETS.backgrounds.forest, unlockBoss: 'meadow-slime', reward: { coins: 22, xp: 32 } },
    { id: 'cave', label: 'Cave', subtitle: '6s and 7s', focusFacts: [6, 7], boss: { id: 'crystal-golem', label: 'Crystal Golem', hp: 10, asset: ASSETS.bosses.cave }, enemies: ASSETS.enemies.cave, background: ASSETS.backgrounds.cave, unlockBoss: 'forest-guardian', reward: { coins: 26, xp: 40 } },
    { id: 'castle', label: 'Castle', subtitle: '8s and 9s', focusFacts: [8, 9], boss: { id: 'castle-knight', label: 'Castle Knight', hp: 12, asset: ASSETS.bosses.castle }, enemies: ASSETS.enemies.castle, background: ASSETS.backgrounds.castle, unlockBoss: 'crystal-golem', reward: { coins: 30, xp: 48 } },
    { id: 'dragon', label: 'Dragon Mountain', subtitle: '0–10 mixed review', focusFacts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], boss: { id: 'math-dragon', label: 'Math Dragon', hp: 15, asset: ASSETS.bosses.dragon }, enemies: ASSETS.enemies.dragon, background: ASSETS.backgrounds.dragon, unlockBoss: 'castle-knight', reward: { coins: 40, xp: 65 } }
  ];

  const AURA_OPTIONS = [
    { id: 'aura-prismatic-rose', label: 'Prismatic Rose Aura', slug: 'prismatic_rose', folder: 'prismatic-rose', cost: 35, icon: ASSETS.auras.icons.prismaticRose },
    { id: 'aura-inferno-outline', label: 'Inferno Outline Aura', slug: 'inferno_outline', folder: 'inferno-outline', cost: 35, icon: ASSETS.auras.icons.infernoOutline },
    { id: 'aura-electric-outline', label: 'Electric Outline Aura', slug: 'electric_outline', folder: 'electric-outline', cost: 35, icon: ASSETS.auras.icons.electricOutline },
    { id: 'aura-frost-outline', label: 'Frost Outline Aura', slug: 'frost_outline', folder: 'frost-outline', cost: 35, icon: ASSETS.auras.icons.frostOutline },
    { id: 'aura-shadow-outline', label: 'Shadow Outline Aura', slug: 'shadow_outline', folder: 'shadow-outline', cost: 35, icon: ASSETS.auras.icons.shadowOutline },
    { id: 'aura-celestial-radiance', label: 'Celestial Radiance Aura', slug: 'celestial_radiance', folder: 'celestial-radiance', cost: 45, icon: ASSETS.auras.icons.celestialRadiance }
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
    const root = ASSETS.auras.animatedRoot;
    if (aura?.id === 'aura-silhouette') return `${root}/silhouette/${heroFile}_pulse_sheet.png`;
    return `${root}/${aura.folder}/${heroFile}_${aura.slug}_pulse_sheet.png`;
  }

  const FRAME_ITEMS = [
    { id: 'frame-common-wood', label: 'Common Wood Frame', cost: 18, asset: ASSETS.frames.commonWood },
    { id: 'frame-ranger-emerald', label: 'Ranger Emerald Frame', cost: 20, asset: ASSETS.frames.rangerEmerald },
    { id: 'frame-knight-royal', label: 'Knight Royal Frame', cost: 20, asset: ASSETS.frames.knightRoyal },
    { id: 'frame-arcane-starfire', label: 'Arcane Starfire Frame', cost: 24, asset: ASSETS.frames.arcaneStarfire },
    { id: 'frame-legend-ruby', label: 'Legend Ruby Frame', cost: 28, asset: ASSETS.frames.legendRuby },
    { id: 'frame-celestial-guardian', label: 'Celestial Guardian Frame', cost: 32, asset: ASSETS.frames.celestialGuardian },
    { id: 'frame-shadow-void', label: 'Shadow Void Frame', cost: 32, asset: ASSETS.frames.shadowVoid },
    { id: 'frame-druidic-vine', label: 'Druidic Vine Frame', cost: 34, asset: ASSETS.frames.druidicVine },
    { id: 'frame-infernal-spike', label: 'Infernal Spike Frame', cost: 38, asset: ASSETS.frames.infernalSpike },
    { id: 'frame-cosmic-moon', label: 'Cosmic Moon Frame', cost: 40, asset: ASSETS.frames.cosmicMoon }
  ];

  const I = ASSETS.items;
  const ITEMS = [
    { id: 'wooden-sword', label: 'Wooden Sword', cls: ['knight'], category: 'weapon', slot: 'weapon', cost: 12, stats: { attack: 1 }, asset: I.knight.weapons.woodenSword },
    { id: 'iron-sword', label: 'Iron Sword', cls: ['knight'], category: 'weapon', slot: 'weapon', cost: 30, stats: { attack: 2 }, asset: I.knight.weapons.ironSword },
    { id: 'training-shield', label: 'Training Shield', cls: ['knight'], category: 'body', slot: 'body', cost: 16, stats: { defense: 1 }, asset: I.knight.armor.trainingShield },
    { id: 'royal-shield', label: 'Royal Shield', cls: ['knight'], category: 'body', slot: 'body', cost: 36, stats: { defense: 2, hp: 1 }, asset: I.knight.armor.royalShield },
    { id: 'simple-helmet', label: 'Simple Helmet', cls: ['knight'], category: 'head', slot: 'head', cost: 14, stats: { defense: 1 }, asset: I.knight.helmets.simpleHelmet },
    { id: 'iron-helmet', label: 'Iron Helmet', cls: ['knight'], category: 'head', slot: 'head', cost: 24, stats: { defense: 2 }, asset: I.knight.helmets.ironHelmet },
    { id: 'steel-armor', label: 'Steel Armor', cls: ['knight'], category: 'body', slot: 'body', cost: 26, stats: { hp: 1, defense: 1 }, asset: I.knight.armor.steelArmor },
    { id: 'dragon-plate-armor', label: 'Dragon Plate Armor', cls: ['knight'], category: 'body', slot: 'body', cost: 44, stats: { hp: 2, defense: 2 }, asset: I.knight.armor.dragonPlateArmor },
    { id: 'knight-boots', label: 'Knight Boots', cls: ['knight'], category: 'legs', slot: 'legs', cost: 18, stats: { speed: 1 }, asset: I.knight.boots.knightBoots },

    { id: 'practice-bow', label: 'Practice Bow', cls: ['archer'], category: 'weapon', slot: 'weapon', cost: 12, stats: { attack: 1 }, asset: I.archer.weapons.practiceBow },
    { id: 'forest-bow', label: 'Forest Bow', cls: ['archer'], category: 'weapon', slot: 'weapon', cost: 26, stats: { attack: 2 }, asset: I.archer.weapons.forestBow },
    { id: 'castle-longbow', label: 'Castle Longbow', cls: ['archer'], category: 'weapon', slot: 'weapon', cost: 34, stats: { attack: 2, focus: 1 }, asset: I.archer.weapons.castleLongbow },
    { id: 'dragon-quiver', label: 'Dragon Quiver', cls: ['archer'], category: 'weapon', slot: 'weapon', cost: 42, stats: { attack: 2, speed: 1 }, asset: I.archer.weapons.dragonQuiver },
    { id: 'leather-hood', label: 'Leather Hood', cls: ['archer'], category: 'head', slot: 'head', cost: 14, stats: { focus: 1 }, asset: I.archer.helmets.leatherHood },
    { id: 'ranger-hood', label: 'Ranger Hood', cls: ['archer'], category: 'head', slot: 'head', cost: 24, stats: { focus: 2 }, asset: I.archer.helmets.rangerHood },
    { id: 'leather-armor', label: 'Leather Armor', cls: ['archer'], category: 'body', slot: 'body', cost: 22, stats: { defense: 1 }, asset: I.archer.armor.leatherArmor },
    { id: 'reinforced-leather-armor', label: 'Reinforced Leather Armor', cls: ['archer'], category: 'body', slot: 'body', cost: 32, stats: { defense: 2 }, asset: I.archer.armor.reinforcedLeatherArmor },
    { id: 'scout-boots', label: 'Scout Boots', cls: ['archer'], category: 'legs', slot: 'legs', cost: 20, stats: { speed: 2 }, asset: I.archer.boots.scoutBoots },

    { id: 'training-wand', label: 'Training Wand', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 12, stats: { attack: 1 }, asset: I.mage.weapons.trainingWand },
    { id: 'crystal-staff', label: 'Crystal Staff', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 30, stats: { attack: 2, focus: 1 }, asset: I.mage.weapons.crystalStaff },
    { id: 'star-staff', label: 'Star Staff', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 34, stats: { attack: 2, focus: 1 }, asset: I.mage.weapons.starStaff },
    { id: 'spell-book', label: 'Spell Book', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 28, stats: { focus: 2 }, asset: I.mage.books.spellBook },
    { id: 'dragon-spellbook', label: 'Dragon Spellbook', cls: ['mage'], category: 'weapon', slot: 'weapon', cost: 46, stats: { attack: 2, focus: 2 }, asset: I.mage.books.dragonSpellbook },
    { id: 'apprentice-hat', label: 'Apprentice Hat', cls: ['mage'], category: 'head', slot: 'head', cost: 14, stats: { mana: 1 }, asset: I.mage.hats.apprenticeHat },
    { id: 'blue-robe', label: 'Blue Robe', cls: ['mage'], category: 'body', slot: 'body', cost: 22, stats: { mana: 1, defense: 1 }, asset: I.mage.armor.blueRobe },
    { id: 'moon-robe', label: 'Moon Robe', cls: ['mage'], category: 'body', slot: 'body', cost: 26, stats: { mana: 1, defense: 1 }, asset: I.mage.armor.moonRobe },
    { id: 'magic-shoes', label: 'Magic Shoes', cls: ['mage'], category: 'legs', slot: 'legs', cost: 18, stats: { speed: 1 }, asset: I.mage.boots.magicShoes },

    { id: 'hp-potion', label: 'HP Potion', cls: ['all'], category: 'item', slot: 'item', cost: 8, effect: { hp: 2 }, asset: I.universal.potions.hpPotion, description: 'Restores 2 HP. Can be used in battle if owned.' },
    { id: 'mana-potion', label: 'Mana Potion', cls: ['all'], category: 'item', slot: 'item', cost: 8, effect: { mana: 2 }, asset: I.universal.potions.manaPotion, description: 'Restores 2 Mana. Can be used in battle if owned.' },

    ...FRAME_ITEMS.map(item => ({ ...item, cls: ['all'], category: 'frame', slot: 'frame', type: 'visual' })),
    { id: 'aura-silhouette', label: 'Silhouette Aura', cls: ['all'], category: 'aura', slot: 'aura', type: 'visual', assetType: 'aura', cost: 20, folder: 'silhouette', slug: '', icon: ASSETS.auras.icons.silhouette },
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
    VERSION: 35,
    ASSETS,
    HERO_CLASSES,
    AREAS,
    ITEMS,
    SHOP_CATEGORIES,
    QUESTS,
    auraSheetPath
  };
}());
