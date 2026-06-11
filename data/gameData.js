
window.GameData = (() => {
  const classes = {
    knight: { id:'knight', name:'Knight', icon:'🛡️', difficulty:'★★☆☆☆', hp:5, mana:2, portraits:{boy:'assets/heroes/portraits/knight-boy.png', girl:'assets/heroes/portraits/knight-girl.png'}, heroNames:{boy:'Leo Shieldheart', girl:'Aria Shieldheart'}, stats:{attack:2,defense:4,speed:1,focus:1}, ability:'Shield Block', abilityText:'Blocks one wrong boss answer.' },
    archer: { id:'archer', name:'Archer', icon:'🏹', difficulty:'★★★☆☆', hp:4, mana:3, portraits:{boy:'assets/heroes/portraits/archer-boy.png', girl:'assets/heroes/portraits/archer-girl.png'}, heroNames:{boy:'Theo Swiftshot', girl:'Maya Swiftshot'}, stats:{attack:3,defense:2,speed:4,focus:2}, ability:'Streak Shot', abilityText:'+2 coins every 3 correct in a row.' },
    mage: { id:'mage', name:'Mage', icon:'🔮', difficulty:'★★★★☆', hp:3, mana:5, portraits:{boy:'assets/heroes/portraits/mage-boy.png', girl:'assets/heroes/portraits/mage-girl.png'}, heroNames:{boy:'Nico Starspell', girl:'Luna Starspell'}, stats:{attack:4,defense:1,speed:2,focus:5}, ability:'Focus Spell', abilityText:'Spend 1 mana to remove two wrong choices.' }
  };

  const battleModels = {
    knight: { boy:'assets/heroes/battle/battle_knight_boy_sword.png', girl:'assets/heroes/battle/battle_knight_girl_sword.png' },
    archer: { boy:'assets/heroes/battle/battle_archer_boy_arrow.png', girl:'assets/heroes/battle/battle_archer_girl_arrow.png' },
    mage: { boy:'assets/heroes/battle/battle_mage_purple_spell.png', girl:'assets/heroes/battle/battle_mage_blue_spell.png' }
  };
  const battleModelKeys = {
    knight: { boy:'knight_boy_sword', girl:'knight_girl_sword' },
    archer: { boy:'archer_boy_arrow', girl:'archer_girl_arrow' },
    mage: { boy:'mage_purple_spell', girl:'mage_blue_spell' }
  };
  const auraOptions = [
    {id:'prismatic_rose_aura', folder:'option_01_prismatic_rose', slug:'prismatic_rose', name:'Prismatic Rose Aura', cost:80, rarity:'Legendary', unlock:'start', desc:'A rose-pink prismatic pulse that follows the attack pose.'},
    {id:'inferno_outline_aura', folder:'option_02_inferno_outline', slug:'inferno_outline', name:'Inferno Outline Aura', cost:90, rarity:'Legendary', unlock:'meadow', desc:'A flame outline aura for battle and training.'},
    {id:'electric_outline_aura', folder:'option_03_electric_outline', slug:'electric_outline', name:'Electric Outline Aura', cost:95, rarity:'Legendary', unlock:'forest', desc:'A crackling lightning outline aura.'},
    {id:'frost_outline_aura', folder:'option_04_frost_outline', slug:'frost_outline', name:'Frost Outline Aura', cost:95, rarity:'Legendary', unlock:'forest', desc:'A crystalline frost outline aura.'},
    {id:'shadow_outline_aura', folder:'option_05_shadow_outline', slug:'shadow_outline', name:'Shadow Outline Aura', cost:105, rarity:'Legendary', unlock:'cave', desc:'A smoky violet shadow outline aura.'},
    {id:'celestial_radiance_aura', folder:'option_06_celestial_radiance', slug:'celestial_radiance', name:'Celestial Radiance Aura', cost:120, rarity:'Mythic', unlock:'castle', desc:'A radiant gold-and-pink celestial outline aura.'}
  ];
  const auraSprites = Object.fromEntries(auraOptions.map(o => [o.id, {
    knight_boy_sword:`assets/cosmetics/auras/${o.folder}/aura_knight_boy_sword_${o.slug}_pulse_sheet.png`,
    knight_girl_sword:`assets/cosmetics/auras/${o.folder}/aura_knight_girl_sword_${o.slug}_pulse_sheet.png`,
    archer_boy_arrow:`assets/cosmetics/auras/${o.folder}/aura_archer_boy_arrow_${o.slug}_pulse_sheet.png`,
    archer_girl_arrow:`assets/cosmetics/auras/${o.folder}/aura_archer_girl_arrow_${o.slug}_pulse_sheet.png`,
    mage_blue_spell:`assets/cosmetics/auras/${o.folder}/aura_mage_blue_spell_${o.slug}_pulse_sheet.png`,
    mage_purple_spell:`assets/cosmetics/auras/${o.folder}/aura_mage_purple_spell_${o.slug}_pulse_sheet.png`
  }]));

  const areas = [
    { id:'meadow', name:'Meadow', focus:[0,1,2,5,10], boss:'Meadow Slime', bossHp:6, unlockAfter:null, background:'assets/backgrounds/meadow.jpg', bossImage:'assets/bosses/meadow-boss.png', enemies:['assets/enemies/meadow-enemy-1.png','assets/enemies/meadow-enemy-2.png'] },
    { id:'forest', name:'Forest', focus:[3,4], boss:'Forest Guardian', bossHp:8, unlockAfter:'meadow', background:'assets/backgrounds/forest.jpg', bossImage:'assets/bosses/forest-boss.png', enemies:['assets/enemies/forest-enemy-1.png','assets/enemies/forest-enemy-2.png'] },
    { id:'cave', name:'Cave', focus:[6,7], boss:'Crystal Golem', bossHp:10, unlockAfter:'forest', background:'assets/backgrounds/cave.jpg', bossImage:'assets/bosses/cave-boss.png', enemies:['assets/enemies/cave-enemy-1.png','assets/enemies/cave-enemy-2.png'] },
    { id:'castle', name:'Castle', focus:[8,9], boss:'Castle Knight', bossHp:12, unlockAfter:'cave', background:'assets/backgrounds/castle.jpg', bossImage:'assets/bosses/castle-boss.png', enemies:['assets/enemies/castle-enemy-1.png','assets/enemies/castle-enemy-2.png'] },
    { id:'dragon', name:'Dragon Mountain', focus:[0,1,2,3,4,5,6,7,8,9,10], boss:'Math Dragon', bossHp:15, unlockAfter:'castle', background:'assets/backgrounds/dragon-mountain.jpg', bossImage:'assets/bosses/dragon-boss.png', enemies:['assets/enemies/dragon-mountain-enemy-1.png','assets/enemies/dragon-mountain-enemy-2.png'] }
  ];
  const backgrounds = { town:'assets/backgrounds/town.jpg', training:'assets/backgrounds/training-area.jpg' };
  const unlockLabels = { start:'Unlocked', meadow:'Defeat Meadow Boss', forest:'Defeat Forest Boss', cave:'Defeat Cave Boss', castle:'Defeat Castle Boss' };
  const itemImages = {
    wood_sword:'assets/items/knight/wooden-sword.png', simple_helmet:'assets/items/knight/simple-helmet.png', training_shield:'assets/items/knight/training-shield.png', iron_sword:'assets/items/knight/iron-sword.png', iron_helmet:'assets/items/knight/iron-helmet.png', steel_armor:'assets/items/knight/steel-armor.png', knight_boots:'assets/items/knight/knight-boots.png', royal_shield:'assets/items/knight/royal-shield.png', dragon_plate:'assets/items/knight/dragon-plate-armor.png',
    practice_bow:'assets/items/archer/practice-bow.png', leather_hood:'assets/items/archer/leather-hood.png', leather_armor:'assets/items/archer/leather-armor.png', forest_bow:'assets/items/archer/forest-bow.png', scout_boots:'assets/items/archer/scout-boots.png', reinforced_leather:'assets/items/archer/reinforced-leather-armor.png', ranger_hood:'assets/items/archer/ranger-hood.png', castle_longbow:'assets/items/archer/castle-longbow.png', dragon_quiver:'assets/items/archer/dragon-quiver.png',
    training_wand:'assets/items/mage/training-wand.png', apprentice_hat:'assets/items/mage/apprentice-hat.png', blue_robe:'assets/items/mage/blue-robe.png', star_staff:'assets/items/mage/star-staff.png', magic_shoes:'assets/items/mage/magic-shoes.png', moon_robe:'assets/items/mage/moon-robe.png', spell_book:'assets/items/mage/spell-book.png', crystal_staff:'assets/items/mage/crystal-staff.png', dragon_spellbook:'assets/items/mage/dragon-spellbook.png',
    tiny_dragon:'assets/cosmetics/pets/tiny-dragon-pet.png', tiny_phoenix:'assets/cosmetics/pets/tiny-phoenix-pet.png', crystal_cat:'assets/cosmetics/pets/crystal-cat-pet.png', forest_owl:'assets/cosmetics/pets/forest-owl-pet.png', rainbow_unicorn:'assets/cosmetics/pets/rainbow-unicorn-pet.png', shadow_wolf:'assets/cosmetics/pets/shadow-wolf-pet.png',
    fire_trail:'assets/cosmetics/trails/fire-trail.png', rainbow_trail:'assets/cosmetics/trails/rainbow-trail.png', star_trail:'assets/cosmetics/trails/star-trail.png', ice_trail:'assets/cosmetics/trails/ice-trail.png', leaf_trail:'assets/cosmetics/trails/leaf-trail.png', shadow_trail:'assets/cosmetics/trails/shadow-trail.png',
    sparkle_aura:'assets/cosmetics/auras/sparkle-aura.png', fire_aura:'assets/cosmetics/auras/fire-aura.png', ice_aura:'assets/cosmetics/auras/ice-aura.png', nature_aura:'assets/cosmetics/auras/nature-aura.png', lightning_aura:'assets/cosmetics/auras/lightning-aura.png', shadow_aura:'assets/cosmetics/auras/shadow-aura.png', royal_aura:'assets/cosmetics/auras/royal-aura.png', rainbow_aura:'assets/cosmetics/auras/rainbow-aura.png', pink_sparkle_aura:'assets/cosmetics/auras/pink-sparkle-aura.png', galaxy_aura:'assets/cosmetics/auras/galaxy-aura.png', bright_sparkle_aura:'assets/cosmetics/auras/bright-sparkle-aura.png',
    gold_frame:'assets/cosmetics/frames/gold-name-frame.png', silver_frame:'assets/cosmetics/frames/silver-frame.png', blue_frame:'assets/cosmetics/frames/blue-frame.png', green_frame:'assets/cosmetics/frames/green-frame.png', purple_frame:'assets/cosmetics/frames/purple-frame.png', pink_frame:'assets/cosmetics/frames/pink-frame.png', red_fire_frame:'assets/cosmetics/frames/red-fire-frame.png', ice_frame:'assets/cosmetics/frames/ice-frame.png', rainbow_frame:'assets/cosmetics/frames/rainbow-frame.png', shadow_frame:'assets/cosmetics/frames/shadow-frame.png', galaxy_frame:'assets/cosmetics/frames/galaxy-frame.png'
  };
  const items = [
    {id:'wood_sword',name:'Wooden Sword',type:'weapon',slot:'weapon',cls:['knight'],cost:15,rarity:'Common',unlock:'start',stats:{attack:1},desc:'A beginner sword.'},
    {id:'simple_helmet',name:'Simple Helmet',type:'head',slot:'head',cls:['knight'],cost:18,rarity:'Common',unlock:'start',stats:{defense:1},desc:'Basic knight protection.'},
    {id:'training_shield',name:'Training Shield',type:'shield',slot:'cosmetic',cls:['knight'],cost:25,rarity:'Common',unlock:'start',stats:{defense:1},desc:'A practice shield.'},
    {id:'iron_sword',name:'Iron Sword',type:'weapon',slot:'weapon',cls:['knight'],cost:45,rarity:'Uncommon',unlock:'meadow',stats:{attack:2},desc:'A stronger knight weapon.'},
    {id:'iron_helmet',name:'Iron Helmet',type:'head',slot:'head',cls:['knight'],cost:30,rarity:'Uncommon',unlock:'meadow',stats:{defense:2},desc:'Heavy knight helmet.'},
    {id:'steel_armor',name:'Steel Armor',type:'body',slot:'body',cls:['knight'],cost:55,rarity:'Rare',unlock:'forest',stats:{defense:3},desc:'Strong knight armor.'},
    {id:'knight_boots',name:'Knight Boots',type:'legs',slot:'legs',cls:['knight'],cost:40,rarity:'Rare',unlock:'forest',stats:{defense:1,speed:1},desc:'Sturdy knight boots.'},
    {id:'royal_shield',name:'Royal Shield',type:'shield',slot:'cosmetic',cls:['knight'],cost:75,rarity:'Epic',unlock:'cave',stats:{defense:3},desc:'A royal shield.'},
    {id:'dragon_plate',name:'Dragon Plate Armor',type:'body',slot:'body',cls:['knight'],cost:110,rarity:'Legendary',unlock:'castle',stats:{defense:5,attack:1},desc:'Legendary dragon armor.'},
    {id:'practice_bow',name:'Practice Bow',type:'weapon',slot:'weapon',cls:['archer'],cost:15,rarity:'Common',unlock:'start',stats:{attack:1,speed:1},desc:'A beginner bow.'},
    {id:'leather_hood',name:'Leather Hood',type:'head',slot:'head',cls:['archer'],cost:25,rarity:'Common',unlock:'start',stats:{speed:1},desc:'Light archer head gear.'},
    {id:'leather_armor',name:'Leather Armor',type:'body',slot:'body',cls:['archer'],cost:40,rarity:'Common',unlock:'start',stats:{defense:1,speed:1},desc:'Balanced archer armor.'},
    {id:'forest_bow',name:'Forest Bow',type:'weapon',slot:'weapon',cls:['archer'],cost:50,rarity:'Uncommon',unlock:'meadow',stats:{attack:2,speed:1},desc:'A faster forest bow.'},
    {id:'scout_boots',name:'Scout Boots',type:'legs',slot:'legs',cls:['archer'],cost:35,rarity:'Uncommon',unlock:'meadow',stats:{speed:2},desc:'Boots for quick moves.'},
    {id:'reinforced_leather',name:'Reinforced Leather',type:'body',slot:'body',cls:['archer'],cost:65,rarity:'Rare',unlock:'forest',stats:{defense:2,speed:2},desc:'Strong light armor.'},
    {id:'ranger_hood',name:'Ranger Hood',type:'head',slot:'head',cls:['archer'],cost:55,rarity:'Rare',unlock:'forest',stats:{speed:2,focus:1},desc:'A focused ranger hood.'},
    {id:'castle_longbow',name:'Castle Longbow',type:'weapon',slot:'weapon',cls:['archer'],cost:85,rarity:'Epic',unlock:'cave',stats:{attack:3,speed:2},desc:'A powerful longbow.'},
    {id:'dragon_quiver',name:'Dragon Quiver',type:'cosmetic',slot:'cosmetic',cls:['archer'],cost:100,rarity:'Legendary',unlock:'castle',stats:{attack:2,speed:3},desc:'Legendary archer gear.'},
    {id:'training_wand',name:'Training Wand',type:'weapon',slot:'weapon',cls:['mage'],cost:15,rarity:'Common',unlock:'start',stats:{focus:1,attack:1},desc:'A beginner wand.'},
    {id:'apprentice_hat',name:'Apprentice Hat',type:'head',slot:'head',cls:['mage'],cost:20,rarity:'Common',unlock:'start',stats:{focus:1},desc:'A simple mage hat.'},
    {id:'blue_robe',name:'Blue Robe',type:'body',slot:'body',cls:['mage'],cost:40,rarity:'Common',unlock:'start',stats:{focus:1,defense:1},desc:'Cloth armor for mages.'},
    {id:'star_staff',name:'Star Staff',type:'weapon',slot:'weapon',cls:['mage'],cost:50,rarity:'Uncommon',unlock:'meadow',stats:{focus:2,attack:1},desc:'A stronger magical tool.'},
    {id:'magic_shoes',name:'Magic Shoes',type:'legs',slot:'legs',cls:['mage'],cost:35,rarity:'Uncommon',unlock:'meadow',stats:{focus:1,speed:1},desc:'Light magical shoes.'},
    {id:'moon_robe',name:'Moon Robe',type:'body',slot:'body',cls:['mage'],cost:65,rarity:'Rare',unlock:'forest',stats:{focus:3,defense:1},desc:'A stronger robe.'},
    {id:'spell_book',name:'Spell Book',type:'cosmetic',slot:'cosmetic',cls:['mage'],cost:55,rarity:'Rare',unlock:'forest',stats:{focus:2},desc:'A focus-boosting spell book.'},
    {id:'crystal_staff',name:'Crystal Staff',type:'weapon',slot:'weapon',cls:['mage'],cost:90,rarity:'Epic',unlock:'cave',stats:{focus:3,attack:2},desc:'A powerful staff.'},
    {id:'dragon_spellbook',name:'Dragon Spellbook',type:'cosmetic',slot:'cosmetic',cls:['mage'],cost:105,rarity:'Legendary',unlock:'castle',stats:{focus:4,attack:1},desc:'Legendary mage gear.'},
    {id:'tiny_dragon',name:'Tiny Dragon Pet',type:'pet',slot:'pet',cls:['all'],cost:60,rarity:'Epic',unlock:'meadow',stats:{},cosmetic:true,desc:'A friendly dragon companion.'},
    {id:'tiny_phoenix',name:'Tiny Phoenix Pet',type:'pet',slot:'pet',cls:['all'],cost:65,rarity:'Epic',unlock:'forest',stats:{},cosmetic:true,desc:'A bright phoenix companion.'},
    {id:'crystal_cat',name:'Crystal Cat Pet',type:'pet',slot:'pet',cls:['all'],cost:55,rarity:'Rare',unlock:'meadow',stats:{},cosmetic:true,desc:'A sparkling cat companion.'},
    {id:'forest_owl',name:'Forest Owl Pet',type:'pet',slot:'pet',cls:['all'],cost:45,rarity:'Rare',unlock:'start',stats:{},cosmetic:true,desc:'A wise owl companion.'},
    {id:'rainbow_unicorn',name:'Rainbow Unicorn Pet',type:'pet',slot:'pet',cls:['all'],cost:90,rarity:'Legendary',unlock:'cave',stats:{},cosmetic:true,desc:'A colorful unicorn companion.'},
    {id:'shadow_wolf',name:'Shadow Wolf Pet',type:'pet',slot:'pet',cls:['all'],cost:95,rarity:'Legendary',unlock:'castle',stats:{},cosmetic:true,desc:'A loyal shadow wolf companion.'},
    {id:'sparkle_aura',name:'Sparkle Aura',type:'aura',slot:'aura',cls:['all'],cost:35,rarity:'Rare',unlock:'start',stats:{},cosmetic:true,desc:'A bright sparkle glow.'},
    {id:'fire_aura',name:'Fire Aura',type:'aura',slot:'aura',cls:['all'],cost:40,rarity:'Rare',unlock:'start',stats:{},cosmetic:true,desc:'A warm flame glow.'},
    {id:'ice_aura',name:'Ice Aura',type:'aura',slot:'aura',cls:['all'],cost:40,rarity:'Rare',unlock:'meadow',stats:{},cosmetic:true,desc:'A cool icy glow.'},
    {id:'nature_aura',name:'Nature Aura',type:'aura',slot:'aura',cls:['all'],cost:45,rarity:'Rare',unlock:'meadow',stats:{},cosmetic:true,desc:'A green nature glow.'},
    {id:'lightning_aura',name:'Lightning Aura',type:'aura',slot:'aura',cls:['all'],cost:60,rarity:'Epic',unlock:'forest',stats:{},cosmetic:true,desc:'An electric glow.'},
    {id:'shadow_aura',name:'Shadow Aura',type:'aura',slot:'aura',cls:['all'],cost:60,rarity:'Epic',unlock:'forest',stats:{},cosmetic:true,desc:'A dark purple glow.'},
    {id:'royal_aura',name:'Royal Aura',type:'aura',slot:'aura',cls:['all'],cost:70,rarity:'Epic',unlock:'cave',stats:{},cosmetic:true,desc:'A gold and purple glow.'},
    {id:'rainbow_aura',name:'Rainbow Aura',type:'aura',slot:'aura',cls:['all'],cost:80,rarity:'Legendary',unlock:'cave',stats:{},cosmetic:true,desc:'A rainbow glow.'},
    {id:'pink_sparkle_aura',name:'Pink Sparkle Aura',type:'aura',slot:'aura',cls:['all'],cost:40,rarity:'Rare',unlock:'start',stats:{},cosmetic:true,desc:'A pink sparkle glow.'},
    {id:'galaxy_aura',name:'Galaxy Aura',type:'aura',slot:'aura',cls:['all'],cost:95,rarity:'Legendary',unlock:'castle',stats:{},cosmetic:true,desc:'A cosmic glow.'},
    {id:'bright_sparkle_aura',name:'Bright Sparkle Aura',type:'aura',slot:'aura',cls:['all'],cost:55,rarity:'Epic',unlock:'forest',stats:{},cosmetic:true,desc:'A bright white sparkle glow.'},
    ...auraOptions.map(o => ({id:o.id,name:o.name,type:'aura',slot:'aura',cls:['all'],cost:o.cost,rarity:o.rarity,unlock:o.unlock,stats:{},cosmetic:true,desc:o.desc,sprite:true})),
    {id:'gold_frame',name:'Gold Frame',type:'frame',slot:'frame',cls:['all'],cost:45,rarity:'Rare',unlock:'meadow',stats:{},cosmetic:true,desc:'A shiny gold portrait frame.'},
    {id:'silver_frame',name:'Silver Frame',type:'frame',slot:'frame',cls:['all'],cost:30,rarity:'Common',unlock:'start',stats:{},cosmetic:true,desc:'A clean silver portrait frame.'},
    {id:'blue_frame',name:'Blue Frame',type:'frame',slot:'frame',cls:['all'],cost:30,rarity:'Common',unlock:'start',stats:{},cosmetic:true,desc:'A bright blue portrait frame.'},
    {id:'green_frame',name:'Green Frame',type:'frame',slot:'frame',cls:['all'],cost:35,rarity:'Common',unlock:'start',stats:{},cosmetic:true,desc:'A green nature frame.'},
    {id:'purple_frame',name:'Purple Frame',type:'frame',slot:'frame',cls:['all'],cost:35,rarity:'Rare',unlock:'start',stats:{},cosmetic:true,desc:'A purple magical frame.'},
    {id:'pink_frame',name:'Pink Frame',type:'frame',slot:'frame',cls:['all'],cost:35,rarity:'Rare',unlock:'start',stats:{},cosmetic:true,desc:'A bright pink frame.'},
    {id:'red_fire_frame',name:'Red Fire Frame',type:'frame',slot:'frame',cls:['all'],cost:55,rarity:'Rare',unlock:'meadow',stats:{},cosmetic:true,desc:'A fiery red frame.'},
    {id:'ice_frame',name:'Ice Frame',type:'frame',slot:'frame',cls:['all'],cost:55,rarity:'Rare',unlock:'meadow',stats:{},cosmetic:true,desc:'A cool ice frame.'},
    {id:'rainbow_frame',name:'Rainbow Frame',type:'frame',slot:'frame',cls:['all'],cost:75,rarity:'Epic',unlock:'forest',stats:{},cosmetic:true,desc:'A colorful rainbow frame.'},
    {id:'shadow_frame',name:'Shadow Frame',type:'frame',slot:'frame',cls:['all'],cost:75,rarity:'Epic',unlock:'forest',stats:{},cosmetic:true,desc:'A dark shadow frame.'},
    {id:'galaxy_frame',name:'Galaxy Frame',type:'frame',slot:'frame',cls:['all'],cost:95,rarity:'Legendary',unlock:'cave',stats:{},cosmetic:true,desc:'A cosmic galaxy frame.'},
    {id:'fire_trail',name:'Fire Trail',type:'trail',slot:'trail',cls:['all'],cost:70,rarity:'Epic',unlock:'forest',stats:{},cosmetic:true,desc:'A fiery movement trail.'},
    {id:'rainbow_trail',name:'Rainbow Trail',type:'trail',slot:'trail',cls:['all'],cost:70,rarity:'Epic',unlock:'forest',stats:{},cosmetic:true,desc:'A rainbow movement trail.'},
    {id:'star_trail',name:'Star Trail',type:'trail',slot:'trail',cls:['all'],cost:60,rarity:'Rare',unlock:'meadow',stats:{},cosmetic:true,desc:'A starry trail.'},
    {id:'ice_trail',name:'Ice Trail',type:'trail',slot:'trail',cls:['all'],cost:60,rarity:'Rare',unlock:'meadow',stats:{},cosmetic:true,desc:'A frosty trail.'},
    {id:'leaf_trail',name:'Leaf Trail',type:'trail',slot:'trail',cls:['all'],cost:50,rarity:'Rare',unlock:'start',stats:{},cosmetic:true,desc:'A leafy trail.'},
    {id:'shadow_trail',name:'Shadow Trail',type:'trail',slot:'trail',cls:['all'],cost:80,rarity:'Epic',unlock:'cave',stats:{},cosmetic:true,desc:'A shadowy trail.'}
  ];
  items.forEach(i => { i.image = itemImages[i.id] || i.image || ''; });
  const ui = { coin:'assets/ui/coin.png', heart:'assets/ui/heart.png', mana:'assets/ui/mana.png', key:'assets/ui/key.png', map:'assets/ui/map.png', shop:'assets/ui/shop.png', backpack:'assets/ui/backpack.png', star:'assets/ui/star.png', mastery:'assets/ui/mastery.png', badge:'assets/ui/badge.png', lock:'assets/ui/lock.png' };
  const assets = [...new Set([...areas.flatMap(a => [a.background,a.bossImage,...a.enemies]), backgrounds.town, backgrounds.training, ...Object.values(ui), ...Object.values(itemImages), ...Object.values(classes).flatMap(c => Object.values(c.portraits)), ...Object.values(battleModels).flatMap(v => Object.values(v)), ...Object.values(auraSprites).flatMap(v => Object.values(v))])].sort();
  return { classes, areas, backgrounds, items, itemImages, unlockLabels, ui, assets, battleModels, battleModelKeys, auraOptions, auraSprites };
})();
