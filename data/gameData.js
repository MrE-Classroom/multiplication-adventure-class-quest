
window.GameData = (() => {
  const classes = {
    knight: { name:'Knight', icon:'🛡️', difficulty:'★★☆☆☆', hp:5, mana:2, portraits:{boy:'assets/heroes/knight-boy.png', girl:'assets/heroes/knight-girl.png'}, stats:{attack:2,defense:4,speed:1,focus:1}, ability:'Shield Block', abilityText:'Automatically blocks one wrong answer during each boss battle.' },
    archer: { name:'Archer', icon:'🏹', difficulty:'★★★☆☆', hp:4, mana:3, portraits:{boy:'assets/heroes/archer-boy.png', girl:'assets/heroes/archer-girl.png'}, stats:{attack:3,defense:2,speed:4,focus:2}, ability:'Streak Shot', abilityText:'Automatically earns bonus coins after every 3 correct answers in a row.' },
    mage: { name:'Mage', icon:'🔮', difficulty:'★★★★☆', hp:3, mana:5, portraits:{boy:'assets/heroes/mage-boy.png', girl:'assets/heroes/mage-girl.png'}, stats:{attack:4,defense:1,speed:2,focus:5}, ability:'Focus Spell', abilityText:'Spend 1 mana to remove two wrong choices once each round or boss attempt.' }
  };

  const areas = [
    { id:'meadow', name:'Meadow', focus:[0,1,2,5,10], boss:'Meadow Slime', requiredRounds:2, requiredAccuracy:70, unlockAfter:null, background:'assets/backgrounds/meadow.jpg', bossImage:'assets/bosses/meadow-boss.png', enemies:['assets/enemies/meadow-enemy-1.png','assets/enemies/meadow-enemy-2.png'] },
    { id:'forest', name:'Forest', focus:[3,4], boss:'Forest Troll', requiredRounds:2, requiredAccuracy:75, unlockAfter:'meadow', background:'assets/backgrounds/forest.jpg', bossImage:'assets/bosses/forest-boss.png', enemies:['assets/enemies/forest-enemy-1.png','assets/enemies/forest-enemy-2.png'] },
    { id:'cave', name:'Cave', focus:[6,7], boss:'Cave Golem', requiredRounds:2, requiredAccuracy:75, unlockAfter:'forest', background:'assets/backgrounds/cave.jpg', bossImage:'assets/bosses/cave-boss.png', enemies:['assets/enemies/cave-enemy-1.png','assets/enemies/cave-enemy-2.png'] },
    { id:'castle', name:'Castle', focus:[8,9], boss:'Castle Knight', requiredRounds:2, requiredAccuracy:80, unlockAfter:'cave', background:'assets/backgrounds/castle.jpg', bossImage:'assets/bosses/castle-boss.png', enemies:['assets/enemies/castle-enemy-1.png','assets/enemies/castle-enemy-2.png'] },
    { id:'dragon', name:'Dragon Mountain', focus:[0,1,2,3,4,5,6,7,8,9,10], boss:'Math Dragon', requiredRounds:3, requiredAccuracy:80, unlockAfter:'castle', background:'assets/backgrounds/dragon-mountain.jpg', bossImage:'assets/bosses/dragon-boss.png', enemies:['assets/enemies/dragon-mountain-enemy-1.png','assets/enemies/dragon-mountain-enemy-2.png'] }
  ];

  const unlockLabels = {
    start: 'Unlocked at start',
    meadow: 'Defeat the Meadow Boss',
    forest: 'Defeat the Forest Boss',
    cave: 'Defeat the Cave Boss',
    castle: 'Defeat the Castle Boss'
  };

  const items = [
    // Knight gear progression
    { id:'wood_sword', name:'Wooden Sword', type:'weapon', slot:'weapon', cls:['knight'], cost:15, rarity:'Common', tier:1, unlock:'start', stats:{attack:1}, desc:'A beginner sword for brave problem solvers.' },
    { id:'simple_helmet', name:'Simple Helmet', type:'head', slot:'head', cls:['knight'], cost:18, rarity:'Common', tier:1, unlock:'start', stats:{defense:1}, desc:'Basic head protection for new knights.' },
    { id:'training_shield', name:'Training Shield', type:'shield', slot:'cosmetic', cls:['knight'], cost:25, rarity:'Common', tier:1, unlock:'start', stats:{defense:1}, desc:'A shield cosmetic with a small defense bonus.' },
    { id:'iron_sword', name:'Iron Sword', type:'weapon', slot:'weapon', cls:['knight'], cost:45, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{attack:2}, desc:'A stronger knight weapon unlocked after the Meadow Boss.' },
    { id:'iron_helmet', name:'Iron Helmet', type:'head', slot:'head', cls:['knight'], cost:30, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{defense:2}, desc:'Heavy head gear for knights.' },
    { id:'steel_armor', name:'Steel Armor', type:'body', slot:'body', cls:['knight'], cost:55, rarity:'Rare', tier:3, unlock:'forest', stats:{defense:3}, desc:'Heavy armor for knights unlocked after the Forest Boss.' },
    { id:'knight_boots', name:'Knight Boots', type:'legs', slot:'legs', cls:['knight'], cost:40, rarity:'Rare', tier:3, unlock:'forest', stats:{defense:1,speed:1}, desc:'Sturdy boots for knights.' },
    { id:'royal_shield', name:'Royal Shield', type:'shield', slot:'cosmetic', cls:['knight'], cost:75, rarity:'Epic', tier:4, unlock:'cave', stats:{defense:3}, desc:'A powerful shield unlocked after the Cave Boss.' },
    { id:'dragon_plate', name:'Dragon Plate Armor', type:'body', slot:'body', cls:['knight'], cost:110, rarity:'Legendary', tier:5, unlock:'castle', stats:{defense:5,attack:1}, desc:'Legendary armor unlocked after the Castle Boss.' },

    // Archer gear progression
    { id:'practice_bow', name:'Practice Bow', type:'weapon', slot:'weapon', cls:['archer'], cost:15, rarity:'Common', tier:1, unlock:'start', stats:{attack:1,speed:1}, desc:'A beginner bow.' },
    { id:'leather_hood', name:'Leather Hood', type:'head', slot:'head', cls:['archer'], cost:25, rarity:'Common', tier:1, unlock:'start', stats:{speed:1}, desc:'Light head gear for archers.' },
    { id:'leather_armor', name:'Leather Armor', type:'body', slot:'body', cls:['archer'], cost:40, rarity:'Common', tier:1, unlock:'start', stats:{defense:1,speed:1}, desc:'Balanced archer armor.' },
    { id:'forest_bow', name:'Forest Bow', type:'weapon', slot:'weapon', cls:['archer'], cost:50, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{attack:2,speed:1}, desc:'A quick bow unlocked after the Meadow Boss.' },
    { id:'scout_boots', name:'Scout Boots', type:'legs', slot:'legs', cls:['archer'], cost:35, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{speed:2}, desc:'Fast boots for moving through areas.' },
    { id:'reinforced_leather', name:'Reinforced Leather Armor', type:'body', slot:'body', cls:['archer'], cost:65, rarity:'Rare', tier:3, unlock:'forest', stats:{defense:2,speed:2}, desc:'Stronger light armor unlocked after the Forest Boss.' },
    { id:'ranger_hood', name:'Ranger Hood', type:'head', slot:'head', cls:['archer'], cost:55, rarity:'Rare', tier:3, unlock:'forest', stats:{speed:2,focus:1}, desc:'A focused archer hood.' },
    { id:'castle_longbow', name:'Castle Longbow', type:'weapon', slot:'weapon', cls:['archer'], cost:85, rarity:'Epic', tier:4, unlock:'cave', stats:{attack:3,speed:2}, desc:'A powerful bow unlocked after the Cave Boss.' },
    { id:'dragon_quiver', name:'Dragon Quiver', type:'cosmetic', slot:'cosmetic', cls:['archer'], cost:100, rarity:'Legendary', tier:5, unlock:'castle', stats:{attack:2,speed:3}, desc:'Legendary archer gear unlocked after the Castle Boss.' },

    // Mage gear progression
    { id:'training_wand', name:'Training Wand', type:'weapon', slot:'weapon', cls:['mage'], cost:15, rarity:'Common', tier:1, unlock:'start', stats:{focus:1,attack:1}, desc:'A beginner wand.' },
    { id:'apprentice_hat', name:'Apprentice Hat', type:'head', slot:'head', cls:['mage'], cost:20, rarity:'Common', tier:1, unlock:'start', stats:{focus:1}, desc:'A simple cloth mage hat.' },
    { id:'blue_robe', name:'Blue Robe', type:'body', slot:'body', cls:['mage'], cost:40, rarity:'Common', tier:1, unlock:'start', stats:{focus:1,defense:1}, desc:'Cloth armor for mages.' },
    { id:'star_staff', name:'Star Staff', type:'weapon', slot:'weapon', cls:['mage'], cost:50, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{focus:2,attack:1}, desc:'A stronger magical tool unlocked after the Meadow Boss.' },
    { id:'magic_shoes', name:'Magic Shoes', type:'legs', slot:'legs', cls:['mage'], cost:35, rarity:'Uncommon', tier:2, unlock:'meadow', stats:{focus:1,speed:1}, desc:'Light shoes for mages.' },
    { id:'moon_robe', name:'Moon Robe', type:'body', slot:'body', cls:['mage'], cost:65, rarity:'Rare', tier:3, unlock:'forest', stats:{focus:3,defense:1}, desc:'A stronger robe unlocked after the Forest Boss.' },
    { id:'spell_book', name:'Spell Book', type:'cosmetic', slot:'cosmetic', cls:['mage'], cost:55, rarity:'Rare', tier:3, unlock:'forest', stats:{focus:2}, desc:'A mage cosmetic with a focus bonus.' },
    { id:'crystal_staff', name:'Crystal Staff', type:'weapon', slot:'weapon', cls:['mage'], cost:90, rarity:'Epic', tier:4, unlock:'cave', stats:{focus:3,attack:2}, desc:'A powerful staff unlocked after the Cave Boss.' },
    { id:'dragon_spellbook', name:'Dragon Spellbook', type:'cosmetic', slot:'cosmetic', cls:['mage'], cost:105, rarity:'Legendary', tier:5, unlock:'castle', stats:{focus:4,attack:1}, desc:'Legendary mage gear unlocked after the Castle Boss.' },

    // Universal cosmetics
    { id:'tiny_dragon', name:'Tiny Dragon Pet', type:'pet', slot:'pet', cls:['all'], cost:60, rarity:'Epic', tier:2, unlock:'meadow', stats:{}, cosmetic:true, desc:'A friendly dragon companion.' },
    { id:'sparkle_aura', name:'Sparkle Aura', type:'aura', slot:'aura', cls:['all'], cost:35, rarity:'Rare', tier:1, unlock:'start', stats:{}, cosmetic:true, desc:'A bright aura for math champions.' },
    { id:'gold_frame', name:'Gold Name Frame', type:'frame', slot:'frame', cls:['all'], cost:45, rarity:'Rare', tier:2, unlock:'meadow', stats:{}, cosmetic:true, desc:'A shiny frame for your hero name.' },
    { id:'fire_trail', name:'Fire Trail', type:'trail', slot:'cosmetic', cls:['all'], cost:70, rarity:'Epic', tier:3, unlock:'forest', stats:{}, cosmetic:true, desc:'A fiery movement trail.' }
  ];


  const townBackground = 'assets/backgrounds/town.jpg';
  const trainingBackground = 'assets/backgrounds/training-area.jpg';

  const ui = {
    coin:'assets/ui/coin.png', heart:'assets/ui/heart.png', mana:'assets/ui/mana.png', star:'assets/ui/star.png', badge:'assets/ui/badge.png', key:'assets/ui/key.png', lock:'assets/ui/lock.png', shop:'assets/ui/shop.png', backpack:'assets/ui/backpack.png', map:'assets/ui/map.png', bossWarning:'assets/ui/boss-warning.png', mastery:'assets/ui/mastery.png'
  };

  const itemAssets = {
    wood_sword:'assets/items/knight/wooden-sword.png', simple_helmet:'assets/items/knight/simple-helmet.png', training_shield:'assets/items/knight/training-shield.png', iron_sword:'assets/items/knight/iron-sword.png', iron_helmet:'assets/items/knight/iron-helmet.png', steel_armor:'assets/items/knight/steel-armor.png', knight_boots:'assets/items/knight/knight-boots.png', royal_shield:'assets/items/knight/royal-shield.png', dragon_plate:'assets/items/knight/dragon-plate-armor.png',
    practice_bow:'assets/items/archer/practice-bow.png', leather_hood:'assets/items/archer/leather-hood.png', leather_armor:'assets/items/archer/leather-armor.png', forest_bow:'assets/items/archer/forest-bow.png', scout_boots:'assets/items/archer/scout-boots.png', reinforced_leather:'assets/items/archer/reinforced-leather-armor.png', ranger_hood:'assets/items/archer/ranger-hood.png', castle_longbow:'assets/items/archer/castle-longbow.png', dragon_quiver:'assets/items/archer/dragon-quiver.png',
    training_wand:'assets/items/mage/training-wand.png', apprentice_hat:'assets/items/mage/apprentice-hat.png', blue_robe:'assets/items/mage/blue-robe.png', star_staff:'assets/items/mage/star-staff.png', magic_shoes:'assets/items/mage/magic-shoes.png', moon_robe:'assets/items/mage/moon-robe.png', spell_book:'assets/items/mage/spell-book.png', crystal_staff:'assets/items/mage/crystal-staff.png', dragon_spellbook:'assets/items/mage/dragon-spellbook.png',
    tiny_dragon:'assets/cosmetics/pets/tiny-dragon-pet.png', sparkle_aura:'assets/cosmetics/auras/sparkle-aura.png', gold_frame:'assets/cosmetics/frames/gold-name-frame.png', fire_trail:'assets/cosmetics/trails/fire-trail.png'
  };
  items.forEach(item => item.image = itemAssets[item.id] || '');

  const quests = [
    { id:'q_answer10', title:'Answer 10 Facts', target:10, metric:'answers', reward:20 },
    { id:'q_correct15', title:'Get 15 Correct', target:15, metric:'correctAnswers', reward:30 },
    { id:'q_train1', title:'Complete 1 Training Set', target:1, metric:'trainingSets', reward:25 },
    { id:'q_improve1', title:'Improve 1 Fact', target:1, metric:'improvedFacts', reward:20 },
    { id:'q_answer25', title:'Answer 25 Facts', target:25, metric:'answers', reward:40 },
    { id:'q_streak3', title:'Build a 3-Correct Streak', target:1, metric:'streak3', reward:25 },
    { id:'q_area2', title:'Complete 2 Adventure Rounds', target:2, metric:'areaRounds', reward:45 },
    { id:'q_train3', title:'Complete 3 Training Sets', target:3, metric:'trainingSets', reward:55 },
    { id:'q_improve3', title:'Improve 3 Facts', target:3, metric:'improvedFacts', reward:45 },
    { id:'q_perfect', title:'Finish a Perfect Round', target:1, metric:'perfectRounds', reward:60 },
    { id:'q_boss1', title:'Defeat 1 Boss', target:1, metric:'bossesDefeated', reward:75 },
    { id:'q_correct30', title:'Get 30 Correct', target:30, metric:'correctAnswers', reward:65 }
  ];
  const activeQuestCount = 4;

  return { classes, areas, items, quests, activeQuestCount, unlockLabels, ui, townBackground, trainingBackground, itemAssets };
})();
