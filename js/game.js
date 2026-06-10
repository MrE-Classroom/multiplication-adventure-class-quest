(() => {
  const D = window.GameData, M = window.Mastery, S = window.GameStorage;
  const app = document.getElementById('app');
  let state = S.load();
  let selectedGender = 'girl';
  let selectedClass = 'mage';
  let modal = null;
  const slots = ['weapon','head','body','legs','pet','aura','frame','trail','cosmetic'];
  const filters = ['all','weapon','head','body','legs','pet','aura','frame','trail','cosmetic'];
  let shopFilter = 'all';

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const img = (src, cls='', alt='') => src ? `<img class="${cls}" src="${src}" alt="${esc(alt)}" onerror="this.style.display='none'">` : '';
  const areaById = id => D.areas.find(a => a.id === id);
  const itemById = id => D.items.find(i => i.id === id);
  const cls = () => D.classes[state.classId];
  const heroName = () => state.heroName || cls().heroNames[state.gender];
  const heroPortrait = () => cls().portraits[state.gender];
  const save = () => S.save(state);
  const setScreen = screen => { state.screen = screen; state.session = null; save(); render(); };
  const isUnlocked = item => item.unlock === 'start' || state.bosses[item.unlock];
  const canUseItem = item => item.cls.includes('all') || item.cls.includes(state.classId);

  function freshState(classId, gender){
    const c = D.classes[classId];
    return {
      version:13, classId, gender, heroName:c.heroNames[gender], screen:'town', areaId:'town', coins:50,
      hp:c.hp, mana:c.mana, level:1, xp:0, streak:0, totalCorrect:0, totalAttempts:0,
      inventory:[], equipped:Object.fromEntries(slots.map(s => [s,null])), bosses:{}, areaProgress:{}, mastery:M.init(), quests:newQuestSet(1), records:{bestStreak:0,bestAccuracy:0}, recentFacts:[], session:null, coach:'Choose an activity to begin.'
    };
  }
  function newQuestSet(batch){
    return { batch, list:[
      {id:`q${batch}_facts`, label:'Answer 10 Facts', type:'attempts', target:10, reward:20, claimed:false},
      {id:`q${batch}_correct`, label:'Get 15 Correct', type:'correct', target:15, reward:30, claimed:false},
      {id:`q${batch}_training`, label:'Complete 1 Training Set', type:'training', target:1, reward:25, claimed:false},
      {id:`q${batch}_improve`, label:'Improve 1 Fact', type:'improve', target:1, reward:20, claimed:false}
    ]};
  }
  function questProgress(q){
    const p = state.questProgress || {};
    if(q.type==='attempts') return Math.min(q.target, p.attempts||0);
    if(q.type==='correct') return Math.min(q.target, p.correct||0);
    if(q.type==='training') return Math.min(q.target, p.training||0);
    if(q.type==='improve') return Math.min(q.target, p.improve||0);
    return 0;
  }
  function incQuest(type,n=1){ state.questProgress = state.questProgress || {}; state.questProgress[type] = (state.questProgress[type]||0)+n; }
  function allClaimed(){ return state.quests.list.every(q => q.claimed); }
  function maybeNewQuests(){ if(allClaimed()){ state.quests = newQuestSet((state.quests.batch||1)+1); state.questProgress = {}; } }

  function equippedItems(){ return Object.values(state.equipped).filter(Boolean).map(itemById).filter(Boolean); }
  function stats(){
    const c = cls(); const out = {...c.stats};
    for(const it of equippedItems()) for(const [k,v] of Object.entries(it.stats||{})) out[k]=(out[k]||0)+v;
    return out;
  }
  function maxHp(){ return cls().hp + Math.floor((stats().defense||0)/3); }
  function maxMana(){ return cls().mana + Math.floor((stats().focus||0)/3); }
  function restoreVitals(){ state.hp = maxHp(); state.mana = maxMana(); }
  function addXp(n){ state.xp += n; while(state.xp >= 100){ state.xp -= 100; state.level++; state.coins += 25; } }

  function auraClass(id){
    if(!id) return '';
    return `aura-css aura-${String(id).replace(/[^a-z0-9_-]/gi,'')}`;
  }
  function portraitStack(size='medium', override={}){
    const aura = override.aura !== undefined ? override.aura : state.equipped.aura;
    const frame = override.frame !== undefined ? override.frame : state.equipped.frame;
    const pet = override.pet !== undefined ? override.pet : state.equipped.pet;
    const trail = override.trail !== undefined ? override.trail : state.equipped.trail;
    const f = frame && itemById(frame), p = pet && itemById(pet), t = trail && itemById(trail);
    return `<div class="hero-display portrait-stack ${size}">
      ${aura ? `<div class="${auraClass(aura)}" aria-hidden="true"></div>` : ''}
      ${t ? img(t.image,'trail-img',t.name) : ''}
      <div class="portrait-core">${img(heroPortrait(),'hero-img',heroName())}</div>
      ${f ? img(f.image,'frame-img',f.name) : ''}
      ${p ? img(p.image,'pet-img',p.name) : ''}
    </div>`;
  }
  function cosmeticIcon(it){
    if(!it) return '';
    if(it.slot==='aura') return `<div class="aura-token ${auraClass(it.id)}"><span></span></div>`;
    return img(it.image,'',it.name);
  }

  function render(){
    if(!state){ renderSelect(); return; }
    if(!state.equipped.trail) state.equipped.trail = null;
    const sum = M.summary(state.mastery);
    const c = cls();
    app.innerHTML = `<div class="game">
      <div class="topbar"><div class="top-left">
        <span class="pill">${c.icon} ${c.name}</span><span class="pill">${img(D.ui.map,'tiny-icon')} Area: ${areaTitle()}</span><span class="pill">${img(D.ui.coin,'tiny-icon')} ${state.coins}</span><span class="pill">${img(D.ui.key,'tiny-icon')} ${bossReadyText()}</span>
      </div><div class="top-right"><button onclick="Game.goTown()" ${state.session?.mode==='boss'?'disabled':''}>Town</button><button onclick="Game.goMap()">Map</button><button onclick="Game.goMastery()">Mastery</button></div></div>
      <div class="layout">
        <aside class="panel hero-side"><div class="panel-title">Hero</div><div class="panel-body">${renderHero()}</div></aside>
        <main class="panel center-panel"><div class="panel-title">${centerTitle()}</div><div class="panel-body">${renderCenter()}</div></main>
        <aside class="panel"><div class="panel-title">Quests + Coach</div><div class="panel-body">${renderQuests()}</div></aside>
      </div>
      <div class="statusbar"><span class="pill">${img(D.ui.heart,'tiny-icon')} HP ${state.hp}</span><span class="pill">${img(D.ui.mana,'tiny-icon')} Mana ${state.mana}</span><span class="pill">${img(D.ui.star,'tiny-icon')} Level ${state.level}</span><span class="pill">XP ${state.xp}/100</span><span class="pill">Streak ${state.streak}</span><span class="pill">Accuracy ${sum.accuracy}%</span><span class="pill">${img(D.ui.mastery,'tiny-icon')} Mastered ${sum.mastered}/121</span></div>
      ${modal || ''}
    </div>`;
  }
  function areaTitle(){ if(state.session?.mode==='boss') return `${areaById(state.session.areaId).name} Boss`; if(state.areaId==='town') return 'Town'; if(state.areaId==='training') return 'Training'; const a = areaById(state.areaId); return a ? a.name : 'Town'; }
  function centerTitle(){ if(state.session) return state.session.mode==='boss'?'Boss Battle':'Adventure'; return state.screen==='shop'?'Class Shop':state.screen==='inventory'?'Inventory':state.screen==='map'?'Adventure Map':state.screen==='mastery'?'Current Mastery':state.screen==='records'?'Personal Records':state.screen==='settings'?'Settings / Reset':'Town'; }
  function bossReadyText(){ const a = areaById(state.areaId); if(!a) return '—'; return readyForBoss(a) ? 'Ready' : 'Not Ready'; }
  function readyForBoss(area){ const p = state.areaProgress[area.id] || {wins:0,acc:0}; return p.wins >= 1 || (p.rounds||0)>=2; }
  function renderHero(){
    const s = stats();
    return `${portraitStack('big')}<div class="hero-title">${esc(heroName())}</div><div class="hero-title small">${esc(cls().name)} ${cls().difficulty}</div><b>${cls().ability}</b><div class="muted">${cls().abilityText}</div><div class="divider"></div><b>Gear</b>${slots.map(slot=>{
      const id = state.equipped[slot], it=id&&itemById(id);
      return `<div class="gear-row"><span>${it?img(it.image,'',''):''} ${cap(slot)}</span><b>${it?esc(it.name):'None'}</b></div>`;
    }).join('')}<div class="divider"></div><b>Stats</b><div class="gear-row"><span>Attack</span><b>${s.attack}</b></div><div class="gear-row"><span>Defense</span><b>${s.defense}</b></div><div class="gear-row"><span>Speed</span><b>${s.speed}</b></div><div class="gear-row"><span>Focus</span><b>${s.focus}</b></div>`;
  }
  function renderQuests(){
    return `<b>Quest Log</b><div class="stack">${state.quests.list.map(q=>{
      const p=questProgress(q), done=p>=q.target;
      return `<div class="card"><b>${esc(q.label)}</b><div>${p}/${q.target}</div><div class="muted">Reward: ${q.reward} coins</div>${q.claimed?'<div class="good">Claimed</div>': done?`<button class="primary" onclick="Game.claimQuest('${q.id}')">Claim</button>`:''}</div>`;
    }).join('')}</div><div class="divider"></div><b>Coach</b><div class="card">${esc(state.coach || coach())}</div>`;
  }
  function sceneUrl(){
    let url = D.backgrounds.town;
    if(state.session?.mode==='training') url = D.backgrounds.training;
    else if(state.session?.areaId) url = areaById(state.session.areaId)?.background || url;
    else if(state.areaId==='training') url = D.backgrounds.training;
    else if(areaById(state.areaId)) url = areaById(state.areaId).background;
    return url;
  }
  function centerBackground(){
    const url = sceneUrl();
    return `--scene-bg:url(&quot;${url}&quot;); background-image:url(&quot;${url}&quot;);`;
  }
  function renderCenter(){
    if(state.session) return state.session.mode==='boss' ? renderBoss() : renderBattle();
    if(state.screen==='map') return renderMap();
    if(state.screen==='shop') return renderShop();
    if(state.screen==='inventory') return renderInventory();
    if(state.screen==='mastery') return renderMastery();
    if(state.screen==='records') return renderRecords();
    if(state.screen==='settings') return renderSettings();
    return renderTown();
  }
  function renderTown(){
    return `<div class="panel-body"><p class="muted">Choose what to do next.</p><div class="grid2">
      ${townCard('Training Area','Practice weak facts anytime.',D.backgrounds.training,'Game.startTraining()','Open')}
      ${townCard('Adventure Map','Choose an area or boss.',D.ui.map,'Game.goMap()','Open','contain')}
      ${townCard('Class Shop','Buy class gear and cosmetics.',D.ui.shop,'Game.goShop()','Open','contain')}
      ${townCard('Inventory','Manage gear and cosmetics.',D.ui.backpack,'Game.goInventory()','Open','contain')}
      ${townCard('Quest Board','View active quests.',D.ui.badge,'Game.noop()','Open','contain')}
      ${townCard('Current Mastery','View the 0–10 mastery table.',D.ui.mastery,'Game.goMastery()','Open','contain')}
      ${townCard('Personal Records','See your best records.',D.ui.star,'Game.goRecords()','Open','contain')}
      ${townCard('Settings / Reset','Reset the game with confirmation.',D.ui.lock,'Game.goSettings()','Open','contain')}
    </div></div>`;
  }
  function townCard(title,desc,src,action,label,contain=''){ return `<div class="card menu-card"><div class="menu-art ${contain}">${img(src,'',title)}</div><h3>${title}</h3><p class="muted">${desc}</p><button class="primary" onclick="${action}">${label}</button></div>`; }
  function renderMap(){
    return `<div class="panel-body"><div class="area-grid">${D.areas.map(a=>{
      const locked = a.unlockAfter && !state.bosses[a.unlockAfter];
      const p = state.areaProgress[a.id] || {};
      return `<div class="card"><div class="menu-art">${img(a.background,'',a.name)}</div><h3>${a.name}</h3><p class="muted">Focus facts: ${a.focus.join(', ')}</p><p>${locked?`Locked: ${D.unlockLabels[a.unlockAfter]}`:`Progress: ${p.rounds||0} sets`}</p><button class="primary" ${locked?'disabled':''} onclick="Game.startArea('${a.id}')">Adventure</button> <button ${locked||!readyForBoss(a)?'disabled':''} onclick="Game.startBoss('${a.id}')">Boss</button></div>`;
    }).join('')}</div></div>`;
  }
  function renderBattle(){
    const s = state.session, a = areaById(s.areaId), q=s.question;
    return `<section class="scene-panel adventure-scene" id="scenePanel" style="${centerBackground()}"><div class="adventure-layout">
      <div class="adventure-fighters">
        <div class="fighter-box hero-fighter">${portraitStack('small')}<div class="fighter-name">${esc(heroName())}</div></div>
        <div class="versus compact">×</div>
        <div class="fighter-box enemy-fighter"><img class="enemy-thumb" src="${s.enemy}" alt="enemy" onerror="this.style.display='none'"></div>
      </div>
      <div class="compact-question-card"><div class="progress-pill">Question ${s.index+1}/${s.total}</div><div class="question compact-q">${q.a} × ${q.b} = ?</div>${abilityLine()}${answerButtons()}<div class="feedback ${s.feedbackClass||''}">${s.feedback||''}</div>${s.answered?'<button class="primary next-button" onclick="Game.nextQuestion()">Next Question</button>':''}</div>
    </div></section>`;
  }
  function renderBoss(){
    const s = state.session, a = areaById(s.areaId), q=s.question;
    const hpPct = Math.max(0, Math.round((s.bossHp/s.bossMaxHp)*100));
    return `<section class="scene-panel boss-scene" id="scenePanel" style="${centerBackground()}"><div class="boss-battle-layout">
      <div class="boss-hp-bar"><div class="boss-hp-fill" style="width:${hpPct}%"></div><div class="boss-hp-text">${a.boss} HP ${s.bossHp}/${s.bossMaxHp}</div></div>
      <div class="boss-fighters-row"><div class="boss-combatant hero-combatant">${portraitStack('small')}<b>${esc(heroName())}</b></div><div class="boss-vs-fixed">VS</div><div class="boss-combatant enemy-combatant"><div class="boss-enemy-frame">${img(a.bossImage,'boss-enemy-img',a.boss)}</div><b>${esc(a.boss)}</b></div></div>
      <div class="boss-question-zone"><div class="compact-question-card boss-question-card"><div class="progress-pill">Boss Question ${s.index+1} · Damage the boss until HP reaches 0</div><div class="question compact-q">${q.a} × ${q.b} = ?</div>${abilityLine()}${answerButtons()}<div class="feedback ${s.feedbackClass||''}">${s.feedback||''}</div>${s.answered?'<button class="primary next-button" onclick="Game.nextQuestion()">Next Question</button>':''}</div></div>
    </div></section>`;
  }
  function abilityLine(){ if(state.classId==='mage' && !state.session.answered) return `<div class="row" style="justify-content:center"><button onclick="Game.focusSpell()" ${state.mana<1||state.session.focusUsed?'disabled':''}>Use Focus Spell (1 mana)</button><span class="muted">Removes two wrong choices. Mana: ${state.mana}</span></div>`; if(state.classId==='archer') return `<div class="pill" style="display:inline-flex">Streak Shot: +2 coins every 3-correct streak</div>`; if(state.classId==='knight') return `<div class="pill" style="display:inline-flex">Shield Block: one boss mistake blocked</div>`; return ''; }
  function answerButtons(){ const s=state.session; return `<div class="answers">${s.answers.map(v=>`<button class="primary" ${s.answered||s.removed?.includes(v)?'disabled':''} onclick="Game.answer(${v})">${v}</button>`).join('')}</div>`; }
  function renderShop(){
    const items = D.items.filter(it => (shopFilter==='all'||it.slot===shopFilter||it.type===shopFilter) && canUseItem(it));
    return `<div class="panel-body"><div class="tabs">${filters.map(f=>`<button class="${shopFilter===f?'active':''}" onclick="Game.setShopFilter('${f}')">${cap(f)}</button>`).join('')}</div><div class="item-grid">${items.map(renderItemCard).join('')}</div><button onclick="Game.goTown()">Back to Town</button></div>`;
  }
  function renderItemCard(it){ const locked=!isUnlocked(it), owned=state.inventory.includes(it.id); return `<div class="item-card card ${locked?'locked':''}"><div class="item-icon">${cosmeticIcon(it)}</div><h3>${esc(it.name)} ${locked?'🔒':''}</h3><div>${it.rarity} · ${it.cost} coins</div><div class="muted">${esc(it.desc)}</div><div>${locked?'Locked: '+D.unlockLabels[it.unlock]:(owned?'Owned':'Available')}</div><button class="primary" onclick="Game.previewItem('${it.id}')">Preview</button></div>`; }
  function renderInventory(){
    const owned = state.inventory.map(itemById).filter(Boolean);
    return `<div class="panel-body"><h3>Equipped</h3>${slots.map(slot=>{const id=state.equipped[slot],it=id&&itemById(id);return `<div class="gear-row"><span>${cap(slot)}</span><b>${it?esc(it.name):'None'}</b>${it?`<button onclick="Game.unequip('${slot}')">Unequip</button>`:''}</div>`}).join('')}<h3>Inventory</h3><div class="inventory-grid">${owned.length?owned.map(it=>`<div class="card"><div class="item-icon">${cosmeticIcon(it)}</div><h3>${it.name}</h3><button class="primary" onclick="Game.equip('${it.id}')">Equip</button></div>`).join(''):'<p class="muted">No items yet.</p>'}</div><button onclick="Game.goTown()">Back to Town</button></div>`;
  }
  function renderMastery(){
    const facts=state.mastery, sum=M.summary(facts); let rows=''; for(let a=0;a<=10;a++){ rows += `<tr><th>${a}</th>`; for(let b=0;b<=10;b++){ const f=facts[M.key(a,b)]; rows += `<td class="m${f.level}">${f.level}</td>`; } rows+='</tr>'; }
    return `<div class="panel-body"><div class="grid2"><div class="card">Mastered: ${sum.mastered}/121</div><div class="card">Accuracy: ${sum.accuracy}%</div></div><div style="overflow:auto"><table class="mastery-table"><tr><th>×</th>${Array.from({length:11},(_,i)=>`<th>${i}</th>`).join('')}</tr>${rows}</table></div></div>`;
  }
  function renderRecords(){ const sum=M.summary(state.mastery); return `<div class="panel-body"><div class="card"><h3>Records</h3><p>Best streak: ${state.records.bestStreak||0}</p><p>Best accuracy: ${state.records.bestAccuracy||0}%</p><p>Total attempts: ${sum.attempts}</p></div></div>`; }
  function renderSettings(){ return `<div class="panel-body"><div class="card"><h3>Reset Game</h3><p class="muted">Erase saved progress and start over.</p><button class="danger" onclick="Game.resetModal()">Reset Game</button></div></div>`; }

  function makeQuestion(mode, areaId){
    const area = areaId ? areaById(areaId) : null;
    const q = M.chooseFact(state.mastery, area?.focus || [], mode, state.recentFacts);
    const choices = new Set([q.product]);
    while(choices.size < 4){
      const offset = [-12,-10,-8,-5,-3,-2,-1,1,2,3,5,8,10,12][Math.floor(Math.random()*14)];
      const wrong = Math.max(0, q.product + offset);
      choices.add(wrong);
    }
    return {...q, answers:[...choices].sort(()=>Math.random()-.5)};
  }
  function startSession(mode, areaId=null){ restoreVitals(); const q=makeQuestion(mode, areaId); const enemy = areaId ? pick(areaById(areaId).enemies) : null; state.session={mode, areaId, index:0, total:mode==='boss'?null:10, question:q, answers:q.answers, enemy, answered:false, feedback:'', removed:[], focusUsed:false, shieldUsed:false}; if(mode==='boss'){ const a=areaById(areaId); state.session.bossMaxHp=a.bossHp; state.session.bossHp=a.bossHp; state.session.total=null; } state.screen = mode==='boss'?'boss':'adventure'; state.areaId=mode==='training'?'training':areaId; state.coach = mode==='training'?'Practice weak facts.': mode==='boss'?'Correct answers damage the boss.':'Adventure wrong answers cost HP.'; save(); render(); }
  function submitAnswer(value){
    const s=state.session; if(!s || s.answered) return; const q=s.question; const correct = value === q.product; s.answered=true; state.totalAttempts++; incQuest('attempts'); state.recentFacts.push(M.key(q.a,q.b)); state.recentFacts = state.recentFacts.slice(-6);
    const rec = M.record(state.mastery,q.a,q.b,correct); if(rec.improved) incQuest('improve');
    if(correct){ state.totalCorrect++; incQuest('correct'); state.streak++; state.records.bestStreak=Math.max(state.records.bestStreak||0,state.streak); state.coins += 5; addXp(10); if(state.classId==='archer' && state.streak % 3 === 0){ state.coins += 2; s.feedback='Correct! Streak Shot +2 coins.'; } else s.feedback='Correct!'; s.feedbackClass='good'; if(s.mode==='boss'){ const dmg = Math.max(1, Math.floor((stats().attack||1)/3)); s.bossHp = Math.max(0, s.bossHp - dmg); if(s.bossHp===0) s.feedback = 'Boss defeated!'; }
    } else { state.streak=0; s.feedback=`Not quite. ${q.a} × ${q.b} = ${q.product}.`; s.feedbackClass='bad'; if(s.mode==='boss' && state.classId==='knight' && !s.shieldUsed){ s.shieldUsed=true; s.feedback='Shield Block saved your HP. Check the next fact.'; s.feedbackClass='warn'; } else if(s.mode==='adventure' || s.mode==='boss'){ state.hp = Math.max(0, state.hp - 1); s.feedback += ' -1 HP.'; } }
    const sum=M.summary(state.mastery); state.records.bestAccuracy=Math.max(state.records.bestAccuracy||0,sum.accuracy); state.coach = correct ? 'Nice hit. Keep your focus.' : 'Check the product before choosing.';
    save(); render();
  }
  function nextQuestion(){
    const s=state.session; if(!s) return;
    if(s.mode==='boss' && s.bossHp<=0){ state.bosses[s.areaId]=true; state.coins += 50; state.coach = 'Boss defeated. New gear unlocked.'; state.session=null; state.areaId='town'; state.screen='town'; save(); showNotice('Boss Defeated',`You defeated the ${areaById(s.areaId).boss} and earned 50 coins.`); render(); return; }
    if(state.hp<=0 && (s.mode==='adventure'||s.mode==='boss')){ state.session=null; state.areaId='town'; state.screen='town'; state.coach='HP reached 0. Try again from Town.'; save(); showNotice('Try Again','Your HP reached 0. You returned to Town.'); render(); return; }
    s.index++;
    if(s.mode!=='boss' && s.index>=s.total){ if(s.mode==='training'){ incQuest('training'); state.coins += 15; state.coach='Training set complete.'; } if(s.mode==='adventure'){ const p=state.areaProgress[s.areaId]||{}; p.rounds=(p.rounds||0)+1; p.wins=(p.wins||0)+1; state.areaProgress[s.areaId]=p; state.coins += 20; state.coach='Adventure complete. Boss may be ready.'; } state.session=null; state.areaId='town'; state.screen='town'; save(); render(); return; }
    const q=makeQuestion(s.mode,s.areaId); Object.assign(s,{question:q,answers:q.answers,answered:false,feedback:'',feedbackClass:'',removed:[],focusUsed:false}); if(s.mode!=='boss') s.enemy = s.areaId ? pick(areaById(s.areaId).enemies) : null; save(); render();
  }
  function focusSpell(){ const s=state.session; if(!s||s.focusUsed||state.mana<1) return; state.mana--; s.focusUsed=true; s.removed = s.answers.filter(v=>v!==s.question.product).slice(0,2); state.coach='Two wrong choices removed.'; save(); render(); }
  function claimQuest(id){ const q=state.quests.list.find(q=>q.id===id); if(!q) return; if(questProgress(q)<q.target) return; if(q.claimed) return; q.claimed=true; state.coins += q.reward; state.coach=`Claimed ${q.reward} coins.`; maybeNewQuests(); save(); showNotice('Quest Reward',`You earned ${q.reward} coins for: ${q.label}.`); }
  function showNotice(title, body){ modal = `<div class="modal-backdrop" onclick="Game.closeModal(event)"><div class="modal" onclick="event.stopPropagation()"><h2>${esc(title)}</h2><p>${esc(body)}</p><div class="modal-actions"><button class="primary" onclick="Game.closeModal()">OK</button></div></div></div>`; render(); }
  function previewItem(id){ const it=itemById(id); if(!it) return; const owned=state.inventory.includes(id), locked=!isUnlocked(it), canAfford=state.coins>=it.cost; const ov={}; if(it.slot==='frame') ov.frame=it.id; if(it.slot==='aura') ov.aura=it.id; if(it.slot==='pet') ov.pet=it.id; if(it.slot==='trail') ov.trail=it.id;
    modal = `<div class="modal-backdrop" onclick="Game.closeModal(event)"><div class="modal" onclick="event.stopPropagation()"><h2>Preview Item</h2><div class="preview-layout"><div>${['frame','aura','pet','trail'].includes(it.slot)?portraitStack('big',ov):`<div class="item-icon" style="width:160px;height:160px">${cosmeticIcon(it)}</div>`}</div><div><h3>${esc(it.name)}</h3><p>${it.rarity} · ${it.cost} coins</p><p class="muted">${esc(it.desc)}</p><p>${locked?'Locked: '+D.unlockLabels[it.unlock]:(owned?'Owned':'Available')}</p></div></div><div class="modal-actions"><button onclick="Game.closeModal()">Close</button>${owned?`<button class="primary" onclick="Game.equip('${it.id}')">Equip</button>`:`<button class="primary" ${locked||!canAfford?'disabled':''} onclick="Game.buy('${it.id}')">Buy</button>`}</div></div></div>`; render(); }
  function buy(id){ const it=itemById(id); if(!it||state.inventory.includes(id)||!isUnlocked(it)||state.coins<it.cost) return; state.coins-=it.cost; state.inventory.push(id); state.coach=`Bought ${it.name}.`; save(); previewItem(id); }
  function equip(id){ const it=itemById(id); if(!it||!state.inventory.includes(id)) return; state.equipped[it.slot]=id; state.coach=`Equipped ${it.name}.`; state.hp = Math.min(state.hp, maxHp()); state.mana = Math.min(state.mana, maxMana()); modal=null; save(); render(); }
  function unequip(slot){ state.equipped[slot]=null; state.coach=`Unequipped ${cap(slot)}.`; save(); render(); }
  function resetModal(){ modal = `<div class="modal-backdrop" onclick="Game.closeModal(event)"><div class="modal" onclick="event.stopPropagation()"><h2>Reset Game</h2><p>This will erase all saved progress, gear, coins, mastery, and quests.</p><div class="modal-actions"><button onclick="Game.closeModal()">Cancel</button><button class="danger" onclick="Game.confirmReset()">Reset</button></div></div></div>`; render(); }

  function renderSelect(){
    const active = D.classes[selectedClass];
    app.innerHTML = `<div class="hero-select"><div class="select-card"><h1>Multiplication Adventure</h1><p class="muted">Step 1: choose your hero style. Step 2: choose your class.</p>
      <div class="start-row"><button class="primary start-game-btn" onclick="Game.startNew('${selectedClass}','${selectedGender}')">Start as ${esc(active.heroNames[selectedGender])}</button></div>
      <div class="avatar-picks">${['boy','girl'].map(g=>`<button class="choice-btn ${selectedGender===g?'active':''}" onclick="Game.pickGender('${g}')"><div class="portrait-stack small">${img(D.classes[selectedClass].portraits[g],'hero-img',g)}</div><b>${cap(g)} Hero</b></button>`).join('')}</div>
      <div class="class-choices">${Object.values(D.classes).map(k=>`<div class="class-choice ${selectedClass===k.id?'active':''}" onclick="Game.pickClass('${k.id}')"><div>${portraitStackSelect(k.id, selectedGender)}</div><h2>${k.name}</h2><div>${k.difficulty}</div><p><b>${k.ability}:</b> ${k.abilityText}</p><p class="muted">${k.heroNames[selectedGender]} · HP ${k.hp} · Mana ${k.mana}</p><button class="primary mini-start" onclick="event.stopPropagation();Game.startNew('${k.id}','${selectedGender}')">Choose ${esc(k.heroNames[selectedGender])}</button></div>`).join('')}</div>
    </div></div>`;
  }
  function portraitStackSelect(classId, gender){ const c=D.classes[classId]; return `<div class="portrait-stack medium">${img(c.portraits[gender],'hero-img',c.name)}</div>`; }
  function coach(){ if(state.session?.mode==='boss') return 'Correct answers damage the boss.'; if(state.session?.mode==='adventure') return `${areaById(state.session.areaId).name} tip: solve before choosing.`; if(state.session?.mode==='training') return 'Training has no HP loss.'; return 'Choose an activity to begin.'; }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function cap(s){ return String(s).charAt(0).toUpperCase()+String(s).slice(1).replace('_',' '); }

  window.Game = {
    pickGender:g=>{selectedGender=g;renderSelect();}, pickClass:c=>{selectedClass=c;renderSelect();}, startNew:(c,g)=>{state=freshState(c,g);save();render();},
    goTown:()=>setScreen('town'), goMap:()=>setScreen('map'), goShop:()=>setScreen('shop'), goInventory:()=>setScreen('inventory'), goMastery:()=>setScreen('mastery'), goRecords:()=>setScreen('records'), goSettings:()=>setScreen('settings'),
    setShopFilter:f=>{shopFilter=f;render();}, startTraining:()=>startSession('training'), startArea:id=>startSession('adventure',id), startBoss:id=>startSession('boss',id), answer:submitAnswer, nextQuestion, focusSpell, claimQuest,
    previewItem, buy, equip, unequip, resetModal, confirmReset:()=>{S.clear();state=null;modal=null;renderSelect();}, closeModal:(e)=>{ if(e && e.target!==e.currentTarget) return; modal=null;render(); }, noop:()=>{},
    _state:()=>state, _sceneBg:()=>centerBackground(), _sceneUrl:()=>sceneUrl()
  };
  render();
})();
