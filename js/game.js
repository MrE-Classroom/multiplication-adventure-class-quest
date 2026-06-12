(() => {
  'use strict';
  const D = window.GameData;
  const M = window.Mastery;
  const S = window.GameStorage;
  const app = document.getElementById('app');
  const VERSION = 27;
  const slots = ['weapon','head','body','legs','pet','aura','frame','trail','cosmetic'];
  const filters = ['all','weapon','head','body','legs','pet','aura','frame','trail','cosmetic'];
  let state = S.load();
  let selectedClass = 'mage';
  let selectedGender = 'girl';
  let shopFilter = 'all';
  let modal = '';

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cap = s => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1).replaceAll('_',' ');
  const itemById = id => D.items.find(i => i.id === id);
  const areaById = id => D.areas.find(a => a.id === id);
  const currentClass = () => D.classes[state?.classId] || D.classes.knight;
  const heroName = () => state?.heroName || currentClass().heroNames[state?.gender || 'girl'];
  const heroPortrait = () => currentClass().portraits[state?.gender || 'girl'];
  const heroBattleModel = () => D.battleModels?.[state?.classId]?.[state?.gender || 'girl'] || heroPortrait();
  const heroBattleKey = () => D.battleModelKeys?.[state?.classId]?.[state?.gender || 'girl'] || '';
  const auraAssetId = (id) => (id && D.auraSprites?.[id]) ? id : D.legacyAuraSpriteMap?.[id];
  const auraSpritePath = (id) => (auraAssetId(id) && D.auraSprites?.[auraAssetId(id)]?.[heroBattleKey()]) || null;
  const firstAuraSpritePath = (id) => auraAssetId(id) && D.auraSprites?.[auraAssetId(id)] ? Object.values(D.auraSprites[auraAssetId(id)])[0] : null;
  function img(src, cls='', alt=''){
    if(!src) return '';
    const safeSrc = esc(src);
    const safeAlt = esc(alt);
    let fallback = '';
    if(safeSrc.includes('assets/heroes/portraits/')){
      fallback = safeSrc.replace('assets/heroes/portraits/', 'assets/heroes/');
    }else if(/^assets\/heroes\/(knight|archer|mage)-(boy|girl)\.png$/.test(safeSrc)){
      fallback = safeSrc.replace('assets/heroes/', 'assets/heroes/portraits/');
    }
    const err = fallback ? `this.onerror=null;this.src='${fallback}'` : `this.remove()`;
    return `<img class="${cls}" src="${safeSrc}" alt="${safeAlt}" onerror="${err}">`;
  }
  const save = () => { if (state) S.save(state); };

  function freshState(classId, gender){
    const c = D.classes[classId] || D.classes.knight;
    return {
      version: VERSION, classId: c.id, gender, heroName: c.heroNames[gender], screen:'town', areaId:'town', coins:50,
      hp:c.hp, mana:c.mana, level:1, xp:0, streak:0, totalCorrect:0, totalAttempts:0,
      inventory:[], equipped:Object.fromEntries(slots.map(s => [s,null])), bosses:{}, areaProgress:{}, mastery:M.init(),
      quests:newQuestSet(1), questProgress:{}, records:{bestStreak:0,bestAccuracy:0}, recentFacts:[], session:null,
      coach:'Choose an activity to begin.'
    };
  }

  function migrate(){
    if(!state) return;
    try{
      if(!D.classes[state.classId]) state.classId = 'knight';
      if(!['boy','girl'].includes(state.gender)) state.gender = 'girl';
      const c = currentClass();
      state.version = VERSION;
      state.heroName = state.heroName || c.heroNames[state.gender];
      state.screen = ['town','map','shop','inventory','mastery','records','settings','adventure','boss'].includes(state.screen) ? state.screen : 'town';
      state.areaId = state.areaId || 'town';
      state.coins = Number.isFinite(state.coins) ? state.coins : 50;
      state.hp = Number.isFinite(state.hp) ? state.hp : c.hp;
      state.mana = Number.isFinite(state.mana) ? state.mana : c.mana;
      state.level = Number.isFinite(state.level) ? state.level : 1;
      state.xp = Number.isFinite(state.xp) ? state.xp : 0;
      state.streak = Number.isFinite(state.streak) ? state.streak : 0;
      state.totalCorrect = Number.isFinite(state.totalCorrect) ? state.totalCorrect : 0;
      state.totalAttempts = Number.isFinite(state.totalAttempts) ? state.totalAttempts : 0;
      state.inventory = Array.isArray(state.inventory) ? state.inventory.filter(id => itemById(id)) : [];
      state.equipped = state.equipped && typeof state.equipped === 'object' ? state.equipped : {};
      for(const slot of slots){ if(!(slot in state.equipped)) state.equipped[slot] = null; if(state.equipped[slot] && !itemById(state.equipped[slot])) state.equipped[slot] = null; }
      state.bosses = state.bosses && typeof state.bosses === 'object' ? state.bosses : {};
      state.areaProgress = state.areaProgress && typeof state.areaProgress === 'object' ? state.areaProgress : {};
      state.mastery = state.mastery && typeof state.mastery === 'object' ? state.mastery : M.init();
      state.quests = state.quests && Array.isArray(state.quests.list) ? state.quests : newQuestSet(1);
      state.questProgress = state.questProgress && typeof state.questProgress === 'object' ? state.questProgress : {};
      state.records = state.records && typeof state.records === 'object' ? state.records : {bestStreak:0,bestAccuracy:0};
      state.recentFacts = Array.isArray(state.recentFacts) ? state.recentFacts : [];
      state.session = null; // avoid old in-progress layout data after rebuilds
      state.coach = state.coach || 'Choose an activity to begin.';
      save();
    }catch(err){
      console.error('Migration failed. Resetting local state.', err);
      S.clear(); state = null;
    }
  }

  function newQuestSet(batch){
    return { batch, list:[
      {id:`q${batch}_facts`,label:'Answer 10 Facts',type:'attempts',target:10,reward:20,claimed:false},
      {id:`q${batch}_correct`,label:'Get 15 Correct',type:'correct',target:15,reward:30,claimed:false},
      {id:`q${batch}_training`,label:'Complete 1 Training Set',type:'training',target:1,reward:25,claimed:false},
      {id:`q${batch}_improve`,label:'Improve 1 Fact',type:'improve',target:1,reward:20,claimed:false}
    ]};
  }
  function questProgress(q){ const p=state.questProgress||{}; return Math.min(q.target, p[q.type]||0); }
  function incQuest(type,n=1){ state.questProgress = state.questProgress || {}; state.questProgress[type] = (state.questProgress[type]||0)+n; }
  function maybeNewQuests(){ if(state.quests.list.every(q=>q.claimed)){ state.quests = newQuestSet((state.quests.batch||1)+1); state.questProgress = {}; } }

  function equippedItems(){ return Object.values(state.equipped||{}).filter(Boolean).map(itemById).filter(Boolean); }
  function stats(){ const out={...currentClass().stats}; for(const it of equippedItems()) for(const [k,v] of Object.entries(it.stats||{})) out[k]=(out[k]||0)+v; return out; }
  function maxHp(){ return currentClass().hp + Math.floor((stats().defense||0)/3); }
  function maxMana(){ return currentClass().mana + Math.floor((stats().focus||0)/3); }
  function restoreVitals(){ state.hp = maxHp(); state.mana = maxMana(); }
  function addXp(n){ state.xp += n; while(state.xp >= 100){ state.xp -= 100; state.level += 1; state.coins += 25; } }
  function canUseItem(it){ return Array.isArray(it?.cls) && (it.cls.includes('all') || it.cls.includes(state.classId)); }
  function isUnlocked(it){ return it.unlock === 'start' || !!state.bosses[it.unlock]; }
  function sanitizeClass(id){ return String(id || '').replace(/[^a-z0-9_-]/gi,''); }

  function auraClass(id){ return id ? `aura-css aura-${sanitizeClass(id)}` : ''; }
  function frameClass(id){ return id ? `frame-css frame-${sanitizeClass(id)}` : ''; }
  function portraitStack(size='medium', override={}){
    const frame = override.frame !== undefined ? override.frame : state?.equipped?.frame;
    const petId = override.pet !== undefined ? override.pet : state?.equipped?.pet;
    const trailId = override.trail !== undefined ? override.trail : state?.equipped?.trail;
    const pet = petId && itemById(petId); const trail = trailId && itemById(trailId);
    const frameSrc = frame ? itemById(frame)?.image : '';
    return `<div class="portrait-stack ${size}">
      ${trail ? img(trail.image,'trail-img',trail.name) : ''}
      <div class="portrait-core">${img(heroPortrait(),'hero-img',heroName())}</div>
      ${frame ? (frameSrc ? img(frameSrc,'portrait-frame-img',itemById(frame)?.name || 'frame') : `<div class="${frameClass(frame)}"></div>`) : ''}
      ${pet ? img(pet.image,'pet-img',pet.name) : ''}
    </div>`;
  }
  function portraitStackSelect(classId, gender){ const c=D.classes[classId]; return `<div class="portrait-stack medium"><div class="portrait-core">${img(c.portraits[gender],'hero-img',c.name)}</div></div>`; }
  function battleHeroStack(size='battle-model', override={}){
    const aura = override.aura !== undefined ? override.aura : state?.equipped?.aura;
    const auraPath = auraSpritePath(aura);
    return `<div class="battle-hero-stack ${size}">
      ${auraPath ? `<div class="battle-aura-sprite" style="background-image:url('${esc(auraPath)}')"></div>` : ''}
      ${img(heroBattleModel(),'battle-hero-img',heroName())}
    </div>`;
  }
  function itemIcon(it){
    if(!it) return '';
    if(it.slot === 'aura'){
      const sprite = firstAuraSpritePath(it.id);
      return sprite ? `<div class="icon-token aura-token"><div class="aura-shop-sprite" style="background-image:url('${esc(sprite)}')"></div></div>` : `<div class="icon-token aura-token">${it.image ? img(it.image,'',it.name) : ''}</div>`;
    }
    if(it.slot === 'frame') return `<div class="icon-token frame-token">${it.image ? img(it.image,'',it.name) : `<div class="${frameClass(it.id)}"></div>`}</div>`;
    return `<div class="icon-token">${img(it.image,'',it.name)}</div>`;
  }
  function enemyArt(src,label,extra=''){
    return `<div class="enemy-art ${extra}">${src?`<img src="${src}" alt="${esc(label)}" onerror="this.closest('.enemy-art').classList.add('missing');this.remove()">`:''}<div class="enemy-fallback">${esc(label)}</div></div>`;
  }

  function render(){
    try{
      if(!state){ renderSelect(); return; }
      const c=currentClass(); const sum=M.summary(state.mastery);
      app.innerHTML = `<div class="game">
        <header class="topbar"><div class="top-left"><span class="pill">${c.icon} ${esc(c.name)}</span><span class="pill">${img(D.ui.map,'tiny-icon','map')} Area: ${esc(areaTitle())}</span><span class="pill">${img(D.ui.coin,'tiny-icon','coins')} ${state.coins}</span><span class="pill">${img(D.ui.key,'tiny-icon','key')} ${bossReadyText()}</span></div><div class="top-right"><button onclick="Game.goTown()">Town</button><button onclick="Game.goMap()">Map</button><button onclick="Game.goMastery()">Mastery</button><button onclick="Game.goSettings()">⚙ Settings</button></div></header>
        <section class="layout"><aside class="panel hero-mini-panel"><div class="panel-title">Hero</div><div class="panel-body hero-mini-body">${renderHero()}</div></aside><main class="panel center-panel"><div class="panel-title">${esc(centerTitle())}</div><div class="panel-body">${renderCenter()}</div></main><aside class="panel quest-panel"><div class="panel-title">Quests + Coach</div><div class="panel-body">${renderQuests()}</div></aside></section>
        <footer class="statusbar"><span class="pill">${img(D.ui.heart,'tiny-icon','heart')} HP ${state.hp}</span><span class="pill">${img(D.ui.mana,'tiny-icon','mana')} Mana ${state.mana}</span><span class="pill">${img(D.ui.star,'tiny-icon','level')} Level ${state.level}</span><span class="pill">XP ${state.xp}/100</span><span class="pill">Streak ${state.streak}</span><span class="pill">Accuracy ${sum.accuracy}%</span><span class="pill">${img(D.ui.mastery,'tiny-icon','mastery')} Mastered ${sum.mastered}/121</span></footer>
        ${modal}
      </div>`;
    }catch(err){
      console.error('Render failed:', err);
      app.innerHTML = `<div class="game"><header class="topbar"><span class="pill">Recovered</span></header><main class="panel" style="margin:12px"><div class="panel-title">Screen recovered</div><div class="panel-body"><p>The saved screen failed to display. Return to Town or reset from Settings.</p><button class="primary" onclick="Game.goTown()">Return to Town</button> <button onclick="Game.goSettings()">Settings</button></div></main><footer class="statusbar"><span class="pill">Game Ready</span></footer></div>`;
    }
  }

  function areaTitle(){ if(state.session?.mode==='boss') return `${areaById(state.session.areaId)?.name || 'Area'} Boss`; if(state.session?.mode==='adventure') return areaById(state.session.areaId)?.name || 'Adventure'; if(state.areaId==='training') return 'Training'; if(state.areaId==='town') return 'Town'; return areaById(state.areaId)?.name || 'Town'; }
  function centerTitle(){ if(state.session?.mode==='boss') return `${areaById(state.session.areaId)?.name || ''} Boss Battle`; if(state.session) return `${areaById(state.session.areaId)?.name || 'Training'} Adventure`; return {town:'Town',map:'Adventure Map',shop:'Class Shop',inventory:'Inventory',mastery:'Current Mastery',records:'Personal Records',settings:'Settings / Reset'}[state.screen] || 'Town'; }
  function bossReadyText(){ const a=areaById(state.areaId); return a && readyForBoss(a) ? 'Ready' : 'Not Ready'; }
  function readyForBoss(area){ const p=state.areaProgress[area.id]||{}; return (p.wins||0) >= 1 || (p.rounds||0) >= 2; }
  function sceneUrl(){ if(state.session?.mode==='training' || state.areaId==='training') return D.backgrounds.training; if(state.session?.areaId) return areaById(state.session.areaId)?.background || D.backgrounds.town; if(areaById(state.areaId)) return areaById(state.areaId).background; return D.backgrounds.town; }
  function sceneStyle(){ return `background-image:url('${sceneUrl()}')`; }

  function renderHero(){ return `<div class="hero-mini-wrap">${portraitStack('hero-mini')}<div class="hero-mini-name">${esc(heroName())}</div><div class="hero-mini-class">${esc(currentClass().name)}</div></div>`; }
  function renderQuests(){ return `<b>Quest Log</b><div class="stack">${state.quests.list.map(q=>{const p=questProgress(q),done=p>=q.target;return `<div class="card"><b>${esc(q.label)}</b><div>${p}/${q.target}</div><div class="muted">Reward: ${q.reward} coins</div>${q.claimed?'<div class="good">Claimed</div>':done?`<button class="primary" onclick="Game.claimQuest('${q.id}')">Claim</button>`:''}</div>`}).join('')}</div><div class="divider"></div><b>Coach</b><div class="card">${esc(state.coach)}</div>`; }
  function renderCenter(){ if(state.session) return state.session.mode==='boss' ? renderBoss() : renderBattle(); if(state.screen==='map') return renderMap(); if(state.screen==='shop') return renderShop(); if(state.screen==='inventory') return renderInventory(); if(state.screen==='mastery') return renderMastery(); if(state.screen==='records') return renderRecords(); if(state.screen==='settings') return renderSettings(); return renderTown(); }
  function renderTown(){ return `<div class="center-pad"><p class="muted">Choose what to do next.</p><div class="grid2">${townCard('Training Area','Practice weak facts anytime.',D.backgrounds.training,'Game.startTraining()','Open')}${townCard('Adventure Map','Choose an area or boss.',D.ui.map,'Game.goMap()','Open','contain')}${townCard('Class Shop','Buy class gear and cosmetics.',D.ui.shop,'Game.goShop()','Open','contain')}${townCard('Inventory','Manage gear and cosmetics.',D.ui.backpack,'Game.goInventory()','Open','contain')}${townCard('Current Mastery','View your 0–10 mastery table.',D.ui.mastery,'Game.goMastery()','Open','contain')}${townCard('Settings / Reset','Reset the game with confirmation.',D.ui.lock,'Game.goSettings()','Open','contain')}</div></div>`; }
  function townCard(title,desc,src,action,label,contain=''){ return `<div class="card menu-card"><div class="menu-art ${contain}">${img(src,'',title)}</div><h3>${title}</h3><p class="muted">${desc}</p><button class="primary" onclick="${action}">${label}</button></div>`; }
  function renderMap(){ return `<div class="center-pad"><div class="area-grid">${D.areas.map(a=>{const locked=a.unlockAfter&&!state.bosses[a.unlockAfter];const p=state.areaProgress[a.id]||{};return `<div class="card"><div class="menu-art">${img(a.background,'',a.name)}</div><h3>${a.name}</h3><p class="muted">Focus facts: ${a.focus.join(', ')}</p><p>${locked?`Locked: ${D.unlockLabels[a.unlockAfter]}`:`Progress: ${p.rounds||0} sets`}</p><button class="primary" ${locked?'disabled':''} onclick="Game.startArea('${a.id}')">Adventure</button> <button ${locked||!readyForBoss(a)?'disabled':''} onclick="Game.startBoss('${a.id}')">Boss</button></div>`}).join('')}</div></div>`; }
  function renderShop(){
    let items=[];
    try{ items = D.items.filter(it => canUseItem(it) && (shopFilter==='all' || it.slot===shopFilter || it.type===shopFilter)); }catch(e){ console.error('Shop filter failed', e); }
    return `<div class="shop-content"><div class="tabs">${filters.map(f=>`<button class="${shopFilter===f?'active':''}" onclick="Game.setShopFilter('${f}')">${cap(f)}</button>`).join('')}</div><div class="shop-message">Showing ${items.length} item${items.length===1?'':'s'} for <b>${cap(shopFilter)}</b>.</div><div class="item-grid" style="margin-top:10px">${items.length?items.map(renderItemCard).join(''):'<div class="card">No items found for this filter.</div>'}</div></div>`;
  }
  function renderItemCard(it){ const locked=!isUnlocked(it), owned=state.inventory.includes(it.id); return `<div class="item-card card ${locked?'locked':''}">${itemIcon(it)}<h3>${esc(it.name)} ${locked?'🔒':''}</h3><div>${esc(it.rarity)} · ${it.cost} coins</div><div class="muted">${esc(it.desc)}</div><div>${locked?'Locked: '+esc(D.unlockLabels[it.unlock] || it.unlock):(owned?'Owned':'Available')}</div><button class="primary" onclick="Game.previewItem('${it.id}')">Preview</button></div>`; }
  function renderInventory(){ const owned=state.inventory.map(itemById).filter(Boolean); return `<div class="center-pad"><h3>Equipped</h3>${slots.map(slot=>{const it=itemById(state.equipped[slot]);return `<div class="gear-row"><span>${cap(slot)}</span><b>${it?esc(it.name):'None'}</b>${it?`<button onclick="Game.unequip('${slot}')">Unequip</button>`:'<span></span>'}</div>`}).join('')}<h3>Inventory</h3><div class="inventory-grid">${owned.length?owned.map(it=>`<div class="card">${itemIcon(it)}<h3>${esc(it.name)}</h3><button class="primary" onclick="Game.equip('${it.id}')">Equip</button></div>`).join(''):'<p class="muted">No items yet.</p>'}</div></div>`; }
  function renderMastery(){
    const facts = state.mastery;
    const sum = M.summary(facts);
    const activeArea = state.session?.areaId ? areaById(state.session.areaId) : areaById(state.areaId);
    const focusLabel = state.areaId === 'training'
      ? 'All facts'
      : (activeArea?.focus?.length ? `${activeArea.name}: ${activeArea.focus.join(', ')}` : 'All facts');
    let rows = '';
    for(let a=0;a<=10;a++){
      rows += `<tr><th>${a}</th>`;
      for(let b=0;b<=10;b++){
        const f = facts[M.key(a,b)] || {level:0,attempts:0,correct:0};
        const product = a * b;
        const factAccuracy = f.attempts ? Math.round((f.correct / f.attempts) * 100) : 0;
        const title = `${a} × ${b} = ${product} · ${f.attempts || 0} practiced · ${factAccuracy}% correct`;
        rows += `<td class="m${f.level || 0}" title="${esc(title)}"><span class="fact-product">${product}</span></td>`;
      }
      rows += '</tr>';
    }
    return `<div class="center-pad mastery-screen-v27">
      <div class="mastery-summary-v27">
        <div class="card"><b>Mastered facts</b><span>${sum.mastered}/121</span></div>
        <div class="card"><b>Accuracy</b><span>${sum.accuracy}%</span></div>
        <div class="card"><b>Facts practiced</b><span>${sum.practiced}/121</span></div>
        <div class="card mastery-focus-card-v27"><b>Current focus facts</b><span>${esc(focusLabel)}</span></div>
      </div>
      <div class="mastery-table-wrap-v27">
        <table class="mastery-table">
          <tr><th>×</th>${Array.from({length:11},(_,i)=>`<th>${i}</th>`).join('')}</tr>
          ${rows}
        </table>
      </div>
    </div>`;
  }
  function renderRecords(){ const sum=M.summary(state.mastery); return `<div class="center-pad"><div class="card"><h3>Records</h3><p>Best streak: ${state.records.bestStreak||0}</p><p>Best accuracy: ${state.records.bestAccuracy||0}%</p><p>Total attempts: ${sum.attempts}</p></div></div>`; }
  function renderSettings(){ return `<div class="center-pad"><div class="card"><h3>Settings</h3><p class="muted">Use this screen to reset progress or return to Town.</p><button class="danger" onclick="Game.resetModal()">Reset Game</button> <button onclick="Game.goTown()">Back to Town</button></div></div>`; }
  function renderBattle(){ const s=state.session, a=areaById(s.areaId), q=s.question; const areaName=esc(a?.name || 'Training'); return `<section class="scene-panel combat-screen" style="${sceneStyle()}"><div class="combat-stage transparent-stage"><div class="combat-area-badge">${areaName} Adventure</div><div class="combat-fighters"><div class="combat-hero">${battleHeroStack('battle-model')}<span>${esc(heroName())}</span></div><div class="combat-versus">×</div><div class="combat-enemy">${enemyArt(s.enemy, `${a?.name || 'Training'} Enemy`)}</div></div></div><div class="combat-question-zone">${questionCard(`${areaName} · Question ${s.index+1}/${s.total}`)}</div></section>`; }
  function renderBoss(){ const s=state.session, a=areaById(s.areaId), hpPct=Math.max(0,Math.round((s.bossHp/s.bossMaxHp)*100)); return `<section class="scene-panel combat-screen" style="${sceneStyle()}"><div class="combat-stage transparent-stage"><div class="combat-area-badge">${esc(a.name)} Boss Battle</div><div class="boss-hp combat-hp"><div class="boss-fill" style="width:${hpPct}%"></div><div class="boss-text">${esc(a.boss)} HP ${s.bossHp}/${s.bossMaxHp}</div></div><div class="combat-fighters boss-fighters"><div class="combat-hero">${battleHeroStack('battle-model')}<span>${esc(heroName())}</span></div><div class="combat-versus">VS</div><div class="combat-enemy">${enemyArt(a.bossImage,a.boss,'boss-art')}</div></div></div><div class="combat-question-zone">${questionCard(`${a.name} Boss · Boss Question ${s.index+1} · Damage until HP reaches 0`)}</div></section>`; }
  function questionCard(label){ const s=state.session,q=s.question; return `<div class="question-card"><div class="pill">${esc(label)}</div><div class="question">${q.a} × ${q.b} = ?</div>${abilityLine()}<div class="answers">${s.answers.map(v=>`<button class="primary" ${s.answered||s.removed?.includes(v)?'disabled':''} onclick="Game.answer(${v})">${v}</button>`).join('')}</div><div class="feedback ${s.feedbackClass||''}">${s.feedback||''}</div>${s.answered?'<button class="primary" onclick="Game.nextQuestion()">Next Question</button>':''}</div>`; }
  function abilityLine(){ if(state.classId==='mage' && !state.session.answered) return `<div class="row" style="justify-content:center;margin-bottom:8px"><button onclick="Game.focusSpell()" ${state.mana<1||state.session.focusUsed?'disabled':''}>Use Focus Spell (1 mana)</button><span class="muted">Mana: ${state.mana}</span></div>`; if(state.classId==='archer') return `<div class="pill" style="margin-bottom:8px">Streak Shot: +2 coins every 3-correct streak</div>`; if(state.classId==='knight') return `<div class="pill" style="margin-bottom:8px">Shield Block: one boss mistake blocked</div>`; return ''; }

  function makeQuestion(mode, areaId){ const area=areaId&&areaById(areaId); const q=M.chooseFact(state.mastery, area?.focus||[], mode, state.recentFacts); const choices=new Set([q.product]); const offsets=[-12,-10,-8,-5,-3,-2,-1,1,2,3,5,8,10,12]; while(choices.size<4){ choices.add(Math.max(0,q.product+offsets[Math.floor(Math.random()*offsets.length)])); } return {...q, answers:[...choices].sort(()=>Math.random()-.5)}; }
  function startSession(mode, areaId=null){ restoreVitals(); const q=makeQuestion(mode,areaId); const area=areaId&&areaById(areaId); state.session={mode,areaId,index:0,total:mode==='boss'?null:10,question:q,answers:q.answers,enemy:area?pick(area.enemies):null,answered:false,feedback:'',feedbackClass:'',removed:[],focusUsed:false,shieldUsed:false}; if(mode==='boss'){ state.session.bossMaxHp=area.bossHp; state.session.bossHp=area.bossHp; } state.screen=mode==='boss'?'boss':'adventure'; state.areaId=mode==='training'?'training':areaId; state.coach=mode==='training'?'Training has no HP loss.':mode==='boss'?'Correct answers damage the boss.':'Adventure wrong answers cost HP.'; save(); render(); }
  function submitAnswer(value){ const s=state.session; if(!s||s.answered) return; const q=s.question, correct=value===q.product; s.answered=true; state.totalAttempts++; incQuest('attempts'); state.recentFacts.push(M.key(q.a,q.b)); state.recentFacts=state.recentFacts.slice(-6); const rec=M.record(state.mastery,q.a,q.b,correct); if(rec.improved) incQuest('improve'); if(correct){ state.totalCorrect++; incQuest('correct'); state.streak++; state.records.bestStreak=Math.max(state.records.bestStreak||0,state.streak); state.coins+=5; addXp(10); s.feedback='Correct!'; s.feedbackClass='good'; if(state.classId==='archer' && state.streak%3===0){ state.coins+=2; s.feedback='Correct! Streak Shot +2 coins.'; } if(s.mode==='boss'){ const dmg=Math.max(1,Math.floor((stats().attack||1)/3)); s.bossHp=Math.max(0,s.bossHp-dmg); if(s.bossHp===0) s.feedback='Boss defeated!'; } } else { state.streak=0; s.feedback=`Not quite. ${q.a} × ${q.b} = ${q.product}.`; s.feedbackClass='bad'; if(s.mode==='boss' && state.classId==='knight' && !s.shieldUsed){ s.shieldUsed=true; s.feedback='Shield Block saved your HP. Try the next fact.'; s.feedbackClass='warn'; } else if(s.mode==='adventure'||s.mode==='boss'){ state.hp=Math.max(0,state.hp-1); s.feedback+=' -1 HP.'; } } const sum=M.summary(state.mastery); state.records.bestAccuracy=Math.max(state.records.bestAccuracy||0,sum.accuracy); state.coach=correct?'Nice hit. Keep going.':'Check the product before choosing.'; save(); render(); }
  function nextQuestion(){ const s=state.session; if(!s) return; if(s.mode==='boss' && s.bossHp<=0){ const areaId=s.areaId, a=areaById(areaId); state.bosses[areaId]=true; state.coins+=50; state.session=null; state.areaId='town'; state.screen='town'; state.coach='Boss defeated. New gear unlocked.'; save(); showNotice('Boss Defeated',`You defeated ${a.boss} and earned 50 coins.`); return; } if(state.hp<=0 && (s.mode==='adventure'||s.mode==='boss')){ state.session=null; state.areaId='town'; state.screen='town'; state.coach='HP reached 0. Try again from Town.'; save(); showNotice('Try Again','Your HP reached 0. You returned to Town.'); return; } s.index++; if(s.mode!=='boss' && s.index>=s.total){ if(s.mode==='training'){ incQuest('training'); state.coins+=15; state.coach='Training set complete.'; } if(s.mode==='adventure'){ const p=state.areaProgress[s.areaId]||{}; p.rounds=(p.rounds||0)+1; p.wins=(p.wins||0)+1; state.areaProgress[s.areaId]=p; state.coins+=20; state.coach='Adventure complete. Boss may be ready.'; } state.session=null; state.areaId='town'; state.screen='town'; save(); render(); return; } const q=makeQuestion(s.mode,s.areaId); Object.assign(s,{question:q,answers:q.answers,answered:false,feedback:'',feedbackClass:'',removed:[],focusUsed:false}); if(s.mode!=='boss') s.enemy=areaById(s.areaId)?pick(areaById(s.areaId).enemies):null; save(); render(); }
  function focusSpell(){ const s=state.session; if(!s||s.focusUsed||state.mana<1) return; state.mana--; s.focusUsed=true; s.removed=s.answers.filter(v=>v!==s.question.product).slice(0,2); state.coach='Two wrong choices removed.'; save(); render(); }
  function claimQuest(id){ const q=state.quests.list.find(q=>q.id===id); if(!q||q.claimed||questProgress(q)<q.target) return; q.claimed=true; state.coins+=q.reward; state.coach=`Claimed ${q.reward} coins.`; maybeNewQuests(); save(); render(); }
  function previewItem(id){
    const it=itemById(id); if(!it) return;
    const owned=state.inventory.includes(id), locked=!isUnlocked(it), canAfford=state.coins>=it.cost;
    const ov={};
    if(it.slot==='frame') ov.frame=it.id;
    if(it.slot==='aura') ov.aura=it.id;
    if(it.slot==='pet') ov.pet=it.id;
    if(it.slot==='trail') ov.trail=it.id;
    const preview = it.slot==='aura' && auraSpritePath(it.id)
      ? `<div class="aura-preview-box">${battleHeroStack('preview-battle', ov)}</div>`
      : (['frame','pet','trail'].includes(it.slot)
        ? `<div class="portrait-preview-box">${portraitStack('big',ov)}</div>`
        : itemIcon(it));
    modal=`<div class="modal-backdrop" onclick="Game.closeModal(event)">
      <div class="modal item-preview-modal" onclick="event.stopPropagation()">
        <h2>Preview Item</h2>
        <div class="preview-layout contained-preview-layout">
          <div class="preview-left">${preview}</div>
          <div class="preview-right">
            <h3>${esc(it.name)}</h3>
            <p>${esc(it.rarity)} · ${it.cost} coins</p>
            <p class="muted">${esc(it.desc)}</p>
            <p>${locked?'Locked: '+esc(D.unlockLabels[it.unlock]||it.unlock):(owned?'Owned':'Available')}</p>
          </div>
        </div>
        <div class="modal-actions">
          <button onclick="Game.closeModal()">Close</button>
          ${owned?`<button class="primary" onclick="Game.equip('${it.id}')">Equip</button>`:`<button class="primary" ${locked||!canAfford?'disabled':''} onclick="Game.buy('${it.id}')">Buy</button>`}
        </div>
      </div>
    </div>`;
    render();
  };

  function buy(id){ const it=itemById(id); if(!it||state.inventory.includes(id)||!isUnlocked(it)||state.coins<it.cost) return; state.coins-=it.cost; state.inventory.push(id); state.coach=`Bought ${it.name}.`; save(); previewItem(id); }
  function equip(id){ const it=itemById(id); if(!it||!state.inventory.includes(id)) return; state.equipped[it.slot]=id; state.coach=`Equipped ${it.name}.`; state.hp=Math.min(state.hp,maxHp()); state.mana=Math.min(state.mana,maxMana()); modal=''; save(); render(); }
  function unequip(slot){ state.equipped[slot]=null; state.coach=`Unequipped ${cap(slot)}.`; save(); render(); }
  function showNotice(title,body){ modal=`<div class="modal-backdrop" onclick="Game.closeModal(event)"><div class="modal" onclick="event.stopPropagation()"><h2>${esc(title)}</h2><p>${esc(body)}</p><div class="modal-actions"><button class="primary" onclick="Game.closeModal()">OK</button></div></div></div>`; render(); }
  function resetModal(){ modal=`<div class="modal-backdrop" onclick="Game.closeModal(event)"><div class="modal" onclick="event.stopPropagation()"><h2>Reset Game</h2><p>This erases progress, gear, coins, mastery, and quests on this browser.</p><div class="modal-actions"><button onclick="Game.closeModal()">Cancel</button><button class="danger" onclick="Game.confirmReset()">Reset</button></div></div></div>`; render(); }
  function renderSelect(){
    const active = D.classes[selectedClass];
    const hero = active.heroNames[selectedGender];
    const portrait = active.portraits[selectedGender];
    const otherGender = selectedGender === 'boy' ? 'girl' : 'boy';
    app.innerHTML = `<div class="hero-select select-v26">
      <div class="select-shell">
        <div class="select-header-v26">
          <div>
            <h1>Multiplication Adventure</h1>
            <p class="select-subtitle">Choose your hero, class, and play style.</p>
          </div>
          <button class="primary start-game-btn-v26" onclick="Game.startNew('${selectedClass}','${selectedGender}')">Start as ${esc(hero)}</button>
        </div>

        <div class="selected-hero-card-v26">
          <div class="selected-portrait-wrap-v26">${portraitStackSelect(selectedClass, selectedGender)}</div>
          <div class="selected-hero-info-v26">
            <div class="eyebrow-v26">Selected Hero</div>
            <h2>${esc(hero)}</h2>
            <div class="selected-meta-v26">
              <span>${esc(active.name)}</span>
              <span>HP ${active.hp}</span>
              <span>Mana ${active.mana}</span>
              <span>${active.difficulty}</span>
            </div>
            <p><b>${esc(active.ability)}:</b> ${esc(active.abilityText)}</p>
          </div>
        </div>

        <div class="select-options-grid-v26">
          <section class="select-panel-v26 hero-choice-panel-v26">
            <div class="panel-heading-v26">
              <h3>Hero Style</h3>
              <span>Pick one</span>
            </div>
            <div class="gender-grid-v26">
              ${['boy','girl'].map(g=>`
                <button class="gender-choice-v26 ${selectedGender===g?'active':''}" onclick="Game.pickGender('${g}')">
                  ${portraitStackSelect(selectedClass,g)}
                  <b>${cap(g)} Hero</b>
                  <span>${esc(active.heroNames[g])}</span>
                </button>
              `).join('')}
            </div>
          </section>

          <section class="select-panel-v26 class-choice-panel-v26">
            <div class="panel-heading-v26">
              <h3>Class</h3>
              <span>Choose your strategy</span>
            </div>
            <div class="class-grid-v26">
              ${Object.values(D.classes).map(k=>`
                <button class="class-choice-v26 ${selectedClass===k.id?'active':''}" onclick="Game.pickClass('${k.id}')">
                  <div class="class-top-v26">
                    ${portraitStackSelect(k.id, selectedGender)}
                    <div>
                      <h4>${esc(k.name)}</h4>
                      <div class="stars-v26">${k.difficulty}</div>
                    </div>
                  </div>
                  <p><b>${esc(k.ability)}:</b> ${esc(k.abilityText)}</p>
                  <div class="stat-row-v26">
                    <span>HP ${k.hp}</span>
                    <span>Mana ${k.mana}</span>
                    <span>${esc(k.heroNames[selectedGender])}</span>
                  </div>
                </button>
              `).join('')}
            </div>
          </section>
        </div>
      </div>
    </div>`;
  };


  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function setScreen(screen){ state.screen=screen; state.session=null; modal=''; save(); render(); }

  window.Game = {
    pickGender:g=>{selectedGender=g;renderSelect();},
    pickClass:c=>{selectedClass=c;renderSelect();},
    startNew:(c,g)=>{state=freshState(c,g);save();render();},
    goTown:()=>setScreen('town'),
    goMap:()=>setScreen('map'),
    goShop:()=>setScreen('shop'),
    goInventory:()=>setScreen('inventory'),
    goMastery:()=>setScreen('mastery'),
    goRecords:()=>setScreen('records'),
    goSettings:()=>setScreen('settings'),
    setShopFilter:f=>{shopFilter=filters.includes(f)?f:'all';render();},
    startTraining:()=>startSession('training'),
    startArea:id=>startSession('adventure',id),
    startBoss:id=>startSession('boss',id),
    answer:submitAnswer,
    nextQuestion,
    focusSpell,
    claimQuest,
    previewItem,
    buy,
    equip,
    unequip,
    resetModal,
    confirmReset:()=>{S.clear();state=null;modal='';renderSelect();},
    closeModal:(e)=>{if(e&&e.target!==e.currentTarget)return;modal='';render();},
    _state:()=>state,
    _render:render,
    _fresh:freshState,
    _shopHTML:renderShop,
    _auraSpritePath:auraSpritePath,
    _battleHeroStack:battleHeroStack
  };

  migrate();
  render();
})();
