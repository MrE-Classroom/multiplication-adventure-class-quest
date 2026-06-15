(function () {
  'use strict';

  // v35+ canonical asset manifest. All game modules should reference this file instead of guessed paths.
  window.MA_ASSET_MANIFEST = {
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
      'knight-boy': 'assets/characters/heroes/portraits/knight-boy.png',
      'knight-girl': 'assets/characters/heroes/portraits/knight-girl.png',
      'archer-boy': 'assets/characters/heroes/portraits/archer-boy.png',
      'archer-girl': 'assets/characters/heroes/portraits/archer-girl.png',
      'mage-boy': 'assets/characters/heroes/portraits/mage-boy.png',
      'mage-girl': 'assets/characters/heroes/portraits/mage-girl.png'
    },
    battle: {
      'knight-boy': 'assets/characters/heroes/battle/battle_knight_boy_sword.png',
      'knight-girl': 'assets/characters/heroes/battle/battle_knight_girl_sword.png',
      'archer-boy': 'assets/characters/heroes/battle/battle_archer_boy_arrow.png',
      'archer-girl': 'assets/characters/heroes/battle/battle_archer_girl_arrow.png',
      'mage-boy': 'assets/characters/heroes/battle/battle_mage_blue_spell.png',
      'mage-girl': 'assets/characters/heroes/battle/battle_mage_purple_spell.png'
    },
    enemies: {
      meadow: [
        'assets/characters/enemies/meadow-enemy-1.png',
        'assets/characters/enemies/meadow-enemy-2.png'
      ],
      forest: [
        'assets/characters/enemies/forest-enemy-1.png',
        'assets/characters/enemies/forest-enemy-2.png'
      ],
      cave: [
        'assets/characters/enemies/cave-enemy-1.png',
        'assets/characters/enemies/cave-enemy-2.png'
      ],
      castle: [
        'assets/characters/enemies/castle-enemy-1.png',
        'assets/characters/enemies/castle-enemy-2.png'
      ],
      dragon: [
        'assets/characters/enemies/dragon-mountain-enemy-1.png',
        'assets/characters/enemies/dragon-mountain-enemy-2.png'
      ]
    },
    bosses: {
      meadow: 'assets/characters/bosses/meadow-boss.png',
      forest: 'assets/characters/bosses/forest-boss.png',
      cave: 'assets/characters/bosses/cave-boss.png',
      castle: 'assets/characters/bosses/castle-boss.png',
      dragon: 'assets/characters/bosses/dragon-boss.png'
    },
    ui: {
      coin: 'assets/ui/icons/coin.png',
      heart: 'assets/ui/icons/heart.png',
      mana: 'assets/ui/icons/mana.png',
      key: 'assets/ui/icons/key.png',
      map: 'assets/ui/icons/map.png',
      shop: 'assets/ui/icons/shop.png',
      backpack: 'assets/ui/icons/backpack.png',
      star: 'assets/ui/icons/star.png',
      mastery: 'assets/ui/icons/mastery.png',
      badge: 'assets/ui/icons/badge.png',
      lock: 'assets/ui/icons/lock.png',
      bossWarning: 'assets/ui/icons/boss-warning.png'
    },
    frames: {
      commonWood: 'assets/cosmetics/frames/frame_01_common_wood.png',
      rangerEmerald: 'assets/cosmetics/frames/frame_02_ranger_emerald.png',
      knightRoyal: 'assets/cosmetics/frames/frame_03_knight_royal.png',
      arcaneStarfire: 'assets/cosmetics/frames/frame_04_arcane_starfire.png',
      legendRuby: 'assets/cosmetics/frames/frame_05_legend_ruby.png',
      celestialGuardian: 'assets/cosmetics/frames/frame_06_celestial_guardian.png',
      shadowVoid: 'assets/cosmetics/frames/frame_07_shadow_void.png',
      druidicVine: 'assets/cosmetics/frames/frame_08_druidic_vine.png',
      infernalSpike: 'assets/cosmetics/frames/frame_09_infernal_spike.png',
      cosmicMoon: 'assets/cosmetics/frames/frame_10_cosmic_moon.png'
    },
    auras: {
      icons: {
        silhouette: 'assets/cosmetics/auras/icons/silhouette-aura.png',
        prismaticRose: 'assets/cosmetics/auras/icons/prismatic-rose-aura.png',
        infernoOutline: 'assets/cosmetics/auras/icons/inferno-outline-aura.png',
        electricOutline: 'assets/cosmetics/auras/icons/electric-outline-aura.png',
        frostOutline: 'assets/cosmetics/auras/icons/frost-outline-aura.png',
        shadowOutline: 'assets/cosmetics/auras/icons/shadow-outline-aura.png',
        celestialRadiance: 'assets/cosmetics/auras/icons/celestial-radiance-aura.png'
      },
      animatedRoot: 'assets/cosmetics/auras/animated'
    },
    items: {
      knight: {
        weapons: {
          woodenSword: 'assets/items/knight/weapons/wooden-sword.png',
          ironSword: 'assets/items/knight/weapons/iron-sword.png'
        },
        armor: {
          trainingShield: 'assets/items/knight/armor/training-shield.png',
          royalShield: 'assets/items/knight/armor/royal-shield.png',
          steelArmor: 'assets/items/knight/armor/steel-armor.png',
          dragonPlateArmor: 'assets/items/knight/armor/dragon-plate-armor.png'
        },
        helmets: {
          simpleHelmet: 'assets/items/knight/helmets/simple-helmet.png',
          ironHelmet: 'assets/items/knight/helmets/iron-helmet.png'
        },
        boots: {
          knightBoots: 'assets/items/knight/boots/knight-boots.png'
        }
      },
      archer: {
        weapons: {
          practiceBow: 'assets/items/archer/weapons/practice-bow.png',
          forestBow: 'assets/items/archer/weapons/forest-bow.png',
          castleLongbow: 'assets/items/archer/weapons/castle-longbow.png',
          dragonQuiver: 'assets/items/archer/weapons/dragon-quiver.png'
        },
        armor: {
          leatherArmor: 'assets/items/archer/armor/leather-armor.png',
          reinforcedLeatherArmor: 'assets/items/archer/armor/reinforced-leather-armor.png'
        },
        helmets: {
          leatherHood: 'assets/items/archer/helmets/leather-hood.png',
          rangerHood: 'assets/items/archer/helmets/ranger-hood.png'
        },
        boots: {
          scoutBoots: 'assets/items/archer/boots/scout-boots.png'
        }
      },
      mage: {
        weapons: {
          trainingWand: 'assets/items/mage/weapons/training-wand.png',
          crystalStaff: 'assets/items/mage/weapons/crystal-staff.png',
          starStaff: 'assets/items/mage/weapons/star-staff.png'
        },
        books: {
          spellBook: 'assets/items/mage/books/spell-book.png',
          dragonSpellbook: 'assets/items/mage/books/dragon-spellbook.png'
        },
        hats: {
          apprenticeHat: 'assets/items/mage/hats/apprentice-hat.png'
        },
        armor: {
          blueRobe: 'assets/items/mage/armor/blue-robe.png',
          moonRobe: 'assets/items/mage/armor/moon-robe.png'
        },
        boots: {
          magicShoes: 'assets/items/mage/boots/magic-shoes.png'
        }
      },
      universal: {
        potions: {
          hpPotion: 'assets/items/universal/potions/hp-potion.png',
          manaPotion: 'assets/items/universal/potions/mana-potion.png'
        }
      }
    }
  };
}());
