window.UI = (() => {
  const app = () => document.getElementById('app');
  const el = (tag, cls='', html='') => { const e=document.createElement(tag); if(cls) e.className=cls; if(html) e.innerHTML=html; return e; };
  const esc = (s='') => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let pendingAvatar = 'boy';

  function render(){ const s = Game.load(); if(!s.selectedClass) return renderClassSelect(); renderGame(); }
  function refresh(){ if(!Game.getState()?.selectedClass) return renderClassSelect(); renderGame(); }

  function image(src, cls='', alt=''){
    const i = el('img', cls); i.src = src; i.alt = alt; i.loading = 'lazy';
    i.onerror = () => i.remove();
    return i;
  }
  function icon(src, cls='ui-icon', alt=''){
    if(!src) return document.createTextNode('');
    return image(src, cls, alt);
  }
  function figure(src, cls='', fallback=''){
    const box = el('div', cls);
    if(src){
      const img = image(src, 'asset-img', fallback);
      img.onerror = () => { img.remove(); if(fallback) box.appendChild(el('span','asset-fallback', fallback)); };
      box.appendChild(img);
    } else if(fallback) {
      box.appendChild(el('span','asset-fallback', fallback));
    }
    return box;
  }
  function heroFigure(baseCls){
    const s=Game.getState(); const c=Game.cls();
    const frame = Game.getItem(s?.equipped?.frame);
    const aura = Game.getItem(s?.equipped?.aura);
    const trail = Game.getItem(s?.equipped?.cosmetic);
    const auraClass = aura ? ` aura-${aura.id}` : '';
    const frameClass = frame ? ` frame-${frame.id}` : '';
    const trailClass = trail?.type === 'trail' ? ` trail-${trail.id}` : '';
    const box = el('div', `${baseCls || ''} hero-cosmetic-wrap ${frame ? 'has-frame' : ''} ${aura ? 'has-aura' : ''}${auraClass}${frameClass}${trailClass}`.trim());

    // Aura is rendered as a CSS glow layer, not a square image layer. This prevents
    // non-transparent aura files from covering the hero while still giving a clear glow.
    if(aura) box.setAttribute('data-aura', aura.name);

    const heroImg = image(Game.heroImage(), 'asset-img hero-main-img', c.icon);
    heroImg.onerror = () => { heroImg.remove(); box.appendChild(el('span','asset-fallback hero-main-img', c.icon)); };
    box.appendChild(heroImg);

    // Frame stays above the hero image. It should be a transparent PNG overlay.
    if(frame?.image){
      const frameImg = image(frame.image, 'cosmetic-frame-img', frame.name);
      frameImg.onerror = () => frameImg.remove();
      box.appendChild(frameImg);
    }
    return box;
  }
  function petFigure(){ const s=Game.getState(); return s?.equipped?.pet==='tiny_dragon' ? figure(Game.getItem('tiny_dragon')?.image,'pet-companion','🐉') : null; }
  function renderClassSelect(){
    app().innerHTML='';
    const wrap=el('div','class-select');
    const card=el('div','class-card-wrap');
    card.innerHTML='<h1>Multiplication Adventure</h1><p class="muted">Choose a hero style, then pick the class you want to play.</p>';

    const avatarBox = el('div','avatar-choice');
    [['boy','Boy Hero','assets/heroes/knight-boy.png'], ['girl','Girl Hero','assets/heroes/knight-girl.png']].forEach(([id,label,path])=>{
      const choice=el('button', pendingAvatar===id?'avatar-button active':'avatar-button');
      choice.appendChild(figure(path,'avatar-preview',id==='boy'?'🧒':'👧'));
      choice.appendChild(el('span','',label));
      choice.onclick=()=>{ pendingAvatar=id; renderClassSelect(); };
      avatarBox.appendChild(choice);
    });
    card.appendChild(avatarBox);

    const grid=el('div','class-grid');
    Object.entries(GameData.classes).forEach(([id,c])=>{
      const box=el('div','class-card');
      box.appendChild(figure(c.portraits?.[pendingAvatar], 'class-portrait-card', c.icon));
      box.insertAdjacentHTML('beforeend', `<h2>${c.name}</h2><div>${c.difficulty}</div><p><b>${c.ability}</b>: ${c.abilityText}</p><p class="muted">HP ${c.hp} · Mana ${c.mana}</p>`);
      const b=el('button','',`Choose ${pendingAvatar==='girl'?'Girl':'Boy'} ${c.name}`);
      b.onclick=()=>{Game.selectClass(id, pendingAvatar);refresh();};
      box.appendChild(b); grid.appendChild(box);
    });
    card.appendChild(grid); wrap.appendChild(card); app().appendChild(wrap);
  }

  function renderGame(){
    const s=Game.getState(); app().innerHTML='';
    const shell=el('div',`game mode-${s.mode}`);
    const bg = currentBackground();
    if(bg) shell.style.setProperty('--scene-bg', `url("${bg}")`);
    shell.appendChild(topBar());
    const grid=el('div','main-grid');
    grid.appendChild(leftPanel());
    const center=el('section','panel center-panel');
    center.appendChild(el('div','panel-head','<span id="centerTitle"></span>'));
    center.appendChild(el('div','panel-body',''));
    grid.appendChild(center);
    grid.appendChild(rightPanel());
    shell.appendChild(grid);
    shell.appendChild(bottomBar());
    app().appendChild(shell);
    renderCenter();
  }

  function currentBackground(){
    const s=Game.getState();
    if(s.mode==='training') return GameData.trainingBackground;
    if(s.mode==='town' || s.mode==='results') return GameData.townBackground;
    if(s.currentArea) return Game.areaById(s.currentArea)?.background || GameData.townBackground;
    return GameData.townBackground;
  }

  function topBar(){
    const s=Game.getState(); const c=Game.cls(); const top=el('header','topbar');
    const status=el('div','status-items');
    status.append(pill(c.icon+' '+c.name), pillWithIcon(GameData.ui.map, 'Area: '+s.area), pillWithIcon(GameData.ui.coin, String(s.coins)), pillWithIcon(GameData.ui.key, bossKeyText().replace('Boss Key: ','')));
    const nav=el('div','nav-items');
    const town=btn('Town','secondary',()=>{const r=Game.goTown(); if(!r.ok) showModal('Locked',r.msg); refresh();}); town.disabled=s.inBoss;
    nav.append(town,btn('Map','secondary',()=>showMap()),btn('Mastery','secondary',()=>showMastery()));
    top.append(status,nav); return top;
  }
  function pill(text){ return el('span','pill',esc(text)); }
  function pillWithIcon(src, text){ const p=el('span','pill icon-pill'); p.appendChild(icon(src)); p.appendChild(document.createTextNode(text)); return p; }

  function bottomBar(){
    const s=Game.getState(); const sm=Mastery.summary(s.mastery); const bar=el('footer','bottombar'); const items=el('div','bottom-items');
    items.append(pillWithIcon(GameData.ui.heart, 'HP '+Math.max(0,s.hp)), pillWithIcon(GameData.ui.mana, 'Mana '+Math.max(0,s.mana)), pillWithIcon(GameData.ui.star, 'Level '+s.level), pill('XP '+s.xp+'/100'), pill('Streak '+(s.session?.streak||0)), pill('Accuracy '+(s.session?.roundAccuracy||sm.accuracy)+'%'), pillWithIcon(GameData.ui.mastery, 'Mastered '+sm.mastered+'/121'));
    bar.appendChild(items); return bar;
  }

  function leftPanel(){
    const s=Game.getState(); const c=Game.cls(); const p=el('aside','panel left-panel'); p.appendChild(el('div','panel-head','Hero'));
    const body=el('div','panel-body'); const st=Game.stats();
    const compact = ['battle','boss','training'].includes(s.mode);
    body.appendChild(heroFigure('hero-portrait image-portrait'));
    body.insertAdjacentHTML('beforeend', `<h3 class="hero-name ${s.equipped.frame?'framed-name':''}">${c.name} ${c.difficulty}</h3><p><b>${c.ability}</b><br><span class="muted">${c.abilityText}</span></p>`);
    const pet = petFigure(); if(pet) body.appendChild(pet);
    if(compact){
      const gearSummary = ['weapon','head','body'].map(slot=>Game.getItem(s.equipped[slot])?.name).filter(Boolean).join(' • ') || 'No gear equipped yet';
      body.insertAdjacentHTML('beforeend', `<h4>Combat</h4><p class="muted">${gearSummary}</p><p><b>ATK</b> ${st.attack||0} · <b>DEF</b> ${st.defense||0} · <b>SPD</b> ${st.speed||0} · <b>FOC</b> ${st.focus||0}</p>`);
    } else {
      body.insertAdjacentHTML('beforeend','<h4>Gear</h4>');
      const gear=el('div','gear-list'); ['weapon','head','body','legs','pet','aura','frame','cosmetic'].forEach(slot=>{const item=Game.getItem(s.equipped[slot]); gear.appendChild(row(slot, item?item.name:'None', item?.image));}); body.appendChild(gear);
      body.appendChild(el('h4','','Stats')); const stats=el('div','stat-list'); Object.entries(st).forEach(([k,v])=>stats.appendChild(row(k,v))); body.appendChild(stats);
      body.append(btn('Inventory','secondary',()=>showInventory()), btn('Change Class','secondary',()=>showClassChange()), btn('Profile','secondary',()=>showProfile()));
    }
    p.appendChild(body); return p;
  }

  function rightPanel(){
    const s=Game.getState(); const p=el('aside','panel right-panel'); p.appendChild(el('div','panel-head','Quests + Coach'));
    const body=el('div','panel-body'); body.innerHTML='<h4>Quest Log</h4>'; const ql=el('div','quest-list');
    Game.activeQuests().forEach(q=>{const prog=s.quests.progress[q.id]||0; const done=prog>=q.target; const claimed=s.quests.claimed[q.id]; const item=el('div','town-card'); item.innerHTML=`<b>${q.title}</b><span>${prog}/${q.target}</span><span class="muted">Reward: ${q.reward} coins</span>`; if(done&&!claimed)item.appendChild(btn('Claim','',()=>{const r=Game.claimQuest(q.id); showToast(r.msg); refresh();})); if(claimed)item.appendChild(el('span','good','Claimed')); ql.appendChild(item);}); body.appendChild(ql);
    body.appendChild(el('h4','','Coach')); const coach=el('div','town-card',coachText()); body.appendChild(coach); p.appendChild(body); return p;
  }

  function row(k,v,imgSrc=''){
    const r=el('div','small-row');
    const left=el('span','row-left'); if(imgSrc) left.appendChild(icon(imgSrc,'tiny-icon')); left.appendChild(document.createTextNode(title(k)));
    r.append(left, el('b','',esc(v))); return r;
  }
  function btn(text, cls='', fn=null){ const b=el('button',cls,text); if(fn)b.onclick=fn; return b; }
  function title(t){return String(t).replace(/([A-Z])/g,' $1').replace(/[_-]/g,' ').replace(/^./,m=>m.toUpperCase());}
  function center(titleText){ document.getElementById('centerTitle').textContent=titleText; const b=document.querySelector('.center-panel .panel-body'); b.innerHTML=''; b.className='panel-body'; return b; }
  function renderCenter(){ const s=Game.getState(); if(s.mode==='town') return showTown(); if(s.mode==='battle'||s.mode==='training'||s.mode==='boss') return showQuestion(); if(s.mode==='results') return showResults(); return showTown(); }

  function refreshChrome(){
    const oldLeft=document.querySelector('.left-panel'); if(oldLeft) oldLeft.replaceWith(leftPanel());
    const oldRight=document.querySelector('.right-panel'); if(oldRight) oldRight.replaceWith(rightPanel());
    const oldBottom=document.querySelector('.bottombar'); if(oldBottom) oldBottom.replaceWith(bottomBar());
    const oldTop=document.querySelector('.topbar'); if(oldTop) oldTop.replaceWith(topBar());
  }

  function showTown(){
    const b=center('Town'); b.innerHTML='<p class="muted">Choose what to do next.</p>'; const grid=el('div','town-grid');
    const cards=[
      ['Training Area','Practice weak facts anytime.',GameData.trainingBackground,()=>{Game.startTraining();refresh();}],
      ['Adventure Map','Choose an area or boss.',GameData.ui.map,()=>showMap()],
      ['Class Shop','Buy class gear and cosmetics.',GameData.ui.shop,()=>showShop()],
      ['Inventory','Manage gear and cosmetics.',GameData.ui.backpack,()=>showInventory()],
      ['Quest Board','View active quests. New quests appear after all active rewards are claimed.',GameData.ui.badge,()=>showQuests()],
      ['Current Mastery','View the 0–10 mastery table.',GameData.ui.mastery,()=>showMastery()],
      ['Personal Records','See your best records.',GameData.ui.star,()=>showRecords()],
      ['Settings / Reset','Reset the game with confirmation.',GameData.ui.lock,()=>showReset()]
    ];
    cards.forEach(([h,p,src,fn])=>{const c=el('div','town-card menu-card'); c.appendChild(figure(src,'menu-art','')); c.insertAdjacentHTML('beforeend',`<h3>${h}</h3><p class="muted">${p}</p>`); c.appendChild(btn('Open','',fn)); grid.appendChild(c);}); b.appendChild(grid);
  }

  function showQuestion(){
    const s=Game.getState(), q=s.session.question; const c=Game.cls(); const area = s.currentArea ? Game.areaById(s.currentArea) : null;
    const isBoss = s.mode==='boss';
    const b=center(s.mode==='training'?'Training Area':isBoss?'Boss Battle':'Adventure');
    b.classList.add('battle-bg-panel');
    const scene=el('div', isBoss?'battle-scene epic-boss-scene':'battle-scene');
    const opponentSrc = isBoss ? area?.bossImage : (area?.enemies?.[s.session.total % (area.enemies.length || 1)] || '');
    const heroSide=el('div','combat-side hero-side');
    heroSide.appendChild(heroFigure('combat-portrait hero-combat'));
    const pet=petFigure(); if(pet) heroSide.appendChild(pet);
    heroSide.appendChild(el('span','combat-label',`${s.avatarModel==='girl'?'Girl':'Boy'} ${c.name}`));
    scene.appendChild(heroSide);
    scene.appendChild(el('div','versus',isBoss?'VS':'×'));
    const enemySide=el('div','combat-side enemy-side');
    if(opponentSrc) enemySide.appendChild(figure(opponentSrc, isBoss?'combat-portrait enemy-combat boss-combat':'combat-portrait enemy-combat',''));
    if(isBoss){
      const maxHp=5, hp=Math.max(0,s.session.bossHp);
      enemySide.appendChild(el('div','boss-name', area?.boss || 'Boss'));
      enemySide.appendChild(el('div','boss-health',`<span style="width:${Math.max(0,Math.min(100,(hp/maxHp)*100))}%"></span>`));
      enemySide.appendChild(el('span','combat-label',`Boss HP ${hp}/${maxHp}`));
    }
    scene.appendChild(enemySide);
    b.appendChild(scene);
    const box=el('div', isBoss?'question-box boss-question-box':'question-box');
    box.innerHTML=`<div class="pill">Question ${s.session.total+1}/${s.session.target}${isBoss?` · Damage the boss with correct answers`:''}</div><div class="question">${q.a} × ${q.b} = ?</div>`;
    const ability=el('div','ability-strip');
    if(s.selectedClass==='mage'){ const use=btn(`Use ${c.ability} (Cost: 1 mana)`,'secondary',()=>{const r=Game.useAbility(); if(!r.ok) showModal('Ability',r.msg); refresh();}); use.disabled=s.session.abilityUsed || s.session.answered || s.mana<1; ability.appendChild(use); ability.appendChild(el('span','muted', s.session.abilityUsed?'Focus Spell used.':`Removes two wrong choices. Mana left: ${s.mana}.`)); }
    if(s.selectedClass==='knight') ability.innerHTML=`<span class="pill">Shield Block: ${s.session.shieldUsed?'Used':'Ready in boss'}</span>`;
    if(s.selectedClass==='archer') ability.innerHTML='<span class="pill">Streak Shot: +2 coins every 3-correct streak</span>';
    box.appendChild(ability);
    const answers=el('div','answers'); s.session.choices.forEach(v=>{const removed=s.session.hiddenChoices?.includes(v); const ab=btn(removed?'✦':String(v), removed?'secondary removed-choice':'',()=>manualAnswer(v)); if(s.session.answered || removed) ab.disabled=true; answers.appendChild(ab);}); box.appendChild(answers);
    if(s.session.answered){ const fb=el('div','feedback '+(s.session.lastCorrect?'good':'bad'), s.session.lastCorrect?(isBoss?'Critical hit!':'Correct!'):'Not yet. Correct answer: '+q.product); box.appendChild(fb); box.appendChild(btn(Game.getState().session.total>=Game.getState().session.target || (s.mode==='boss'&&(s.session.bossHp<=0||s.hp<=0))?'Finish':'Next Question','',()=>{Game.continueAfterAnswer();refresh();})); }
    b.appendChild(box); if(isBoss) b.appendChild(el('p','muted boss-note','Class changes and Town travel are locked during boss battles.'));
  }
  function manualAnswer(v){ Game.submitAnswer(v); refresh(); }

  function showResults(){
    const s=Game.getState(), r=s.session.result; const b=center('Results'); const box=el('div','question-box');
    box.innerHTML=`<h2>${r.msg}</h2><p>Correct: <b>${r.correct}/${r.total}</b></p><p>Accuracy: <b>${r.accuracy}%</b></p><p>Coins earned: <b>${r.coins}</b></p><p>Facts improved: <b>${r.improved}</b></p>`;
    box.append(btn('Back to Town','',()=>{Game.goTown();refresh();}), btn('Train Weak Facts','secondary',()=>{Game.startTraining();refresh();})); b.appendChild(box);
  }

  function showMap(){
    const b=center('Adventure Map'); const grid=el('div','area-grid');
    GameData.areas.forEach(area=>{ const p=Game.getState().progress[area.id]; const card=el('div','area-card area-art-card'); card.appendChild(figure(area.background,'area-thumb','')); card.innerHTML += `<h3>${area.name}</h3><p>Focus: ${area.focus.join(', ')}</p><p>${p.unlocked?'Unlocked':'Locked'}</p><p>Rounds: ${p.rounds}/${area.requiredRounds} · Best: ${p.bestAccuracy}%/${area.requiredAccuracy}%</p><p>Boss Key: ${p.key?'Ready':'Not ready'} · Boss: ${p.bossDefeated?'Defeated':'Waiting'}</p>`; const start=btn('Start Area','',()=>{const r=Game.startArea(area.id); if(!r.ok) showModal('Area Locked',r.msg); refresh();}); start.disabled=!p.unlocked; const boss=btn('Fight Boss','secondary',()=>{const r=Game.startBoss(area.id); if(!r.ok) showModal('Boss Locked',r.msg); refresh();}); boss.disabled=!p.unlocked || !p.key; card.append(start,boss); grid.appendChild(card); }); b.appendChild(grid);
  }

  function showShop(){
    const b=center('Class Shop');
    const tabs=el('div','tabs');
    ['all','weapon','head','body','legs','pet','aura','frame','cosmetic'].forEach(t=>tabs.appendChild(btn(title(t),'secondary',()=>draw(t))));
    b.appendChild(tabs);
    const list=el('div','item-grid');
    b.append(list,btn('Back to Town','secondary',()=>showTown()));
    function draw(type='all'){
      list.innerHTML='';
      Game.shopItems().filter(i=>type==='all'||i.slot===type||i.type===type).forEach(item=>{
        const unlocked=Game.itemUnlocked(item);
        const c=el('div','item-card '+(unlocked?'':'locked-item'));
        c.appendChild(figure(item.image,'item-icon-large',''));
        c.insertAdjacentHTML('beforeend',`<b>${item.name}</b><span>Tier ${item.tier||1} · ${item.rarity} · ${item.cost} coins</span><span class="muted">${item.desc}</span><span>${Game.owned(item.id)?'Owned':unlocked?'Available':'Locked: '+Game.itemUnlockText(item)}</span>`);
        c.appendChild(btn('Preview','',()=>select(item,type)));
        list.appendChild(c);
      });
    }
    function select(item,currentType='all'){
      const unlocked=Game.itemUnlocked(item);
      const content=el('div','item-modal-content');
      content.appendChild(figure(item.image,'item-preview-img',''));
      content.insertAdjacentHTML('beforeend',`<h3>${item.name}</h3><p>${item.desc}</p><p>Class: ${item.cls.join(', ')}</p><p>Unlock: <b>${Game.itemUnlockText(item)}</b></p><p>Stats: ${Object.entries(item.stats||{}).map(([k,v])=>`${k}+${v}`).join(', ')||'Cosmetic only'}</p>`);
      const actions=[['Close',closeModal,'secondary']];
      if(!Game.owned(item.id) && unlocked){
        actions.unshift(['Buy',()=>{const r=Game.buyItem(item.id); if(r.ok) askEquip(item); else showModal('Shop',r.msg); draw(currentType);},'']);
      } else if(Game.owned(item.id)) {
        actions.unshift(['Owned',()=>{},'secondary disabled-action']);
      } else {
        actions.unshift(['Locked',()=>{},'secondary disabled-action']);
      }
      showModalNode('Preview Item', content, actions);
      document.querySelectorAll('.disabled-action').forEach(x=>x.disabled=true);
    }
    draw('all');
  }
  function askEquip(item){ showModal('Item Bought',`${item.name} was added to your inventory. Equip it now?`, [ ['Equip',()=>{Game.equipItem(item.id); closeModal(); refresh();}], ['Later',()=>{closeModal(); refresh();}, 'secondary'] ]); }

  function showInventory(){
    const b=center('Inventory'); const s=Game.getState(); b.innerHTML='<p class="muted">Equip and unequip owned items. Wrong-class items stay locked.</p><h3>Equipped</h3>'; const eq=el('div','inventory-grid');
    Object.keys(s.equipped).forEach(slot=>{const item=Game.getItem(s.equipped[slot]); const c=el('div','item-card'); if(item) c.appendChild(figure(item.image,'item-icon-large','')); c.insertAdjacentHTML('beforeend',`<b>${title(slot)}</b><span>${item?item.name:'Empty'}</span>`); const u=btn('Unequip','secondary',()=>{Game.unequip(slot); refreshChrome(); showInventory();}); u.disabled=!item; c.appendChild(u); eq.appendChild(c);}); b.appendChild(eq); b.appendChild(el('h3','','Owned Items'));
    const grid=el('div','inventory-grid'); if(!s.inventory.length) grid.innerHTML='<p>No items yet. Visit the shop.</p>'; s.inventory.forEach(id=>{ const item=Game.getItem(id); const classLocked=!Game.allowed(item); const progressLocked=!Game.itemUnlocked(item); const locked=classLocked||progressLocked; const equipped=Object.values(s.equipped).includes(id); const c=el('div','item-card'); c.appendChild(figure(item.image,'item-icon-large','')); c.insertAdjacentHTML('beforeend',`<b>${item.name}</b><span>${item.slot}</span><span class="muted">${item.desc}</span><span>${classLocked?'Locked for current class':progressLocked?'Locked: '+Game.itemUnlockText(item):equipped?'Equipped':'Ready'}</span>`); const e=btn('Equip','',()=>{const r=Game.equipItem(id); if(!r.ok) showModal('Locked',r.msg); refreshChrome(); showInventory();}); e.disabled=locked||equipped; c.appendChild(e); grid.appendChild(c);}); b.appendChild(grid); b.appendChild(btn('Back to Town','secondary',()=>showTown()));
  }

  function showMastery(){
    const s=Game.getState(); const sum=Mastery.summary(s.mastery); const b=center('Current Mastery'); b.classList.add('scroll-all'); const wrap=el('div','mastery-wrap'); const summary=el('div','mastery-summary'); [['Attempts',sum.attempts],['Correct',sum.correct],['Accuracy',sum.accuracy+'%'],['Mastered',sum.mastered+'/121'],['Strong',sum.strong],['Needs Practice',sum.needs],['Practiced',sum.practiced]].forEach(([k,v])=>summary.appendChild(el('div','stat-card',`<b>${v}</b><br><span>${k}</span>`))); wrap.appendChild(summary); wrap.appendChild(el('div','legend','<span class="m0">New</span><span class="m1">Needs Practice</span><span class="m2">Getting Better</span><span class="m3">Strong</span><span class="m4">Mastered</span>'));
    const table=el('table','mastery-table'); let html='<tr><th>×</th>'; for(let i=0;i<=10;i++) html+=`<th>${i}</th>`; html+='</tr>'; for(let a=0;a<=10;a++){ html+=`<tr><th>${a}</th>`; for(let b2=0;b2<=10;b2++){const f=s.mastery[Mastery.key(a,b2)]; html+=`<td class="m${f.level}" title="${a}×${b2}: ${Mastery.levels[f.level]}">${a*b2}</td>`;} html+='</tr>'; } table.innerHTML=html; wrap.appendChild(table); wrap.append(btn('Train Weak Facts','',()=>{Game.startTraining();refresh();}), btn('Back to Town','secondary',()=>showTown())); b.appendChild(wrap);
  }
  function showQuests(){ const b=center('Quest Board'); b.innerHTML='<p class="muted">There are 4 active quests at a time. A new set appears after all active quest rewards are claimed.</p>'; const list=el('div','quest-list'); const s=Game.getState(); Game.activeQuests().forEach(q=>{ const prog=s.quests.progress[q.id]||0; const done=prog>=q.target; const claimed=s.quests.claimed[q.id]; const card=el('div','town-card'); card.innerHTML=`<h3>${q.title}</h3><p>Progress: ${prog}/${q.target}</p><p class="muted">Reward: ${q.reward} coins</p>`; if(done&&!claimed) card.appendChild(btn('Claim Reward','',()=>{ const r=Game.claimQuest(q.id); showModal('Quest',r.msg); refresh(); })); else if(claimed) card.appendChild(el('span','good','Claimed')); else card.appendChild(el('span','warn','Not complete yet')); list.appendChild(card); }); b.appendChild(list); b.appendChild(btn('Back to Town','secondary',()=>showTown())); }
  function showProfile(){ const b=center('Hero Profile'); const s=Game.getState(), c=Game.cls(), sm=Mastery.summary(s.mastery); const card=el('div','question-box'); card.appendChild(heroFigure('profile-portrait')); const pet=petFigure(); if(pet) card.appendChild(pet); card.insertAdjacentHTML('beforeend',`<h2>${s.avatarModel==='girl'?'Girl':'Boy'} ${c.name}</h2><p>${c.difficulty}</p><p>Level ${s.level} · Coins ${s.coins}</p><p>Mastered facts: ${sm.mastered}/121</p><p>Bosses defeated: ${s.records.bossesDefeated}</p>`); b.appendChild(card); b.append(btn('Inventory','',()=>showInventory()),btn('Current Mastery','secondary',()=>showMastery()),btn('Settings / Reset','danger',()=>showReset())); }
  function showRecords(){ const b=center('Personal Records'); const r=Game.getState().records; const grid=el('div','mastery-summary'); Object.entries(r).forEach(([k,v])=>grid.appendChild(el('div','stat-card',`<b>${v}</b><br><span>${title(k)}</span>`))); b.appendChild(grid); b.appendChild(btn('Back to Town','secondary',()=>showTown())); }
  function showClassChange(){ const b=center('Change Class'); if(!Game.canChangeClass()) {b.innerHTML='<p>Class changes are only available in Town.</p>'; return;} const s=Game.getState(); b.innerHTML=`<p>${s.freeClassChange?'Your next class change is free.':'Class change fee: 25 coins.'}</p><p class="muted">Your selected hero style stays the same.</p>`; const grid=el('div','class-grid'); Object.entries(GameData.classes).forEach(([id,c])=>{const card=el('div','class-card'); card.appendChild(figure(c.portraits?.[s.avatarModel || 'boy'],'class-portrait-card',c.icon)); card.insertAdjacentHTML('beforeend',`<h3>${c.name}</h3><p>${c.difficulty}</p><p>${c.ability}</p>`); const bb=btn('Change to '+c.name,'',()=>{const r=Game.changeClass(id); showModal('Class Change',r.msg||'Class changed.'); refresh();}); bb.disabled=id===s.selectedClass; card.appendChild(bb); grid.appendChild(card);}); b.appendChild(grid); }
  function showReset(){ showModal('Reset Game','This will erase hero choice, class selection, coins, gear, quests, boss keys, records, and mastery progress. This cannot be undone.', [['Cancel',closeModal,'secondary'],['Reset Everything',()=>{Game.reset();closeModal();refresh();},'danger']]); }
  function bossKeyText(){ const s=Game.getState(); if(s.currentArea){ const p=s.progress[s.currentArea]; return `Boss Key: ${p.key?'Ready':'Not Ready'}`;} return 'Boss Key: —'; }
  function coachText(){
    const s=Game.getState(); const q=s.session?.question; const weak=Mastery.weakFacts(s.mastery,1)[0];
    const area = s.currentArea ? Game.areaById(s.currentArea) : null;
    if(q && s.session?.answered){
      if(s.session.lastCorrect) return s.mode==='boss' ? 'Nice hit. Keep your focus.' : 'Correct. Check the next fact carefully.';
      return factTip(q.a, q.b);
    }
    if(q){
      const f=s.mastery?.[Mastery.key(q.a,q.b)];
      if(f?.recentMisses>=2) return factTip(q.a,q.b);
      if(s.mode==='boss') return `${area?.boss || 'Boss'}: one fact at a time.`;
      if(s.mode==='training') return `Practice focus: ${q.a} × ${q.b}.`;
      return `${area?.name || 'Area'} tip: solve before choosing.`;
    }
    if(weak) return `Try training ${weak.a} × ${weak.b}.`;
    return 'Choose an area or quest to begin.';
  }
  function factTip(a,b){
    if(a===0 || b===0) return 'Zero fact: any number times 0 is 0.';
    if(a===1 || b===1) return 'One fact: the answer is the other number.';
    if(a===2 || b===2) return 'Two fact: double the other number.';
    if(a===5 || b===5) return 'Five fact: count by 5s.';
    if(a===10 || b===10) return 'Ten fact: add a zero to the other number.';
    if(a===9 || b===9) return 'Nine fact: use 10 groups, then subtract one group.';
    const small=Math.min(a,b), big=Math.max(a,b);
    return `Helper fact: ${small} × ${big-1}, then add ${small}.`;
  }
  function modalBase(title, actions=null){
    closeModal();
    const back=el('div','modal-backdrop'); back.id='modal';
    const m=el('div','modal');
    m.appendChild(el('h2','',esc(title)));
    const a=el('div','modal-actions');
    (actions||[['OK',closeModal,'']]).forEach(([t,fn,cls])=>a.appendChild(btn(t,cls||'',fn)));
    back.appendChild(m); document.body.appendChild(back);
    return {back,m,a};
  }
  function showModal(title,msg,actions=null){ const {m,a}=modalBase(title,actions); m.insertBefore(el('p','',esc(msg)),a); m.appendChild(a); }
  function showModalNode(title,node,actions=null){ const {m,a}=modalBase(title,actions); m.insertBefore(node,a); m.appendChild(a); }
  function closeModal(){ const m=document.getElementById('modal'); if(m)m.remove(); }
  function showToast(msg){ showModal('Notice',msg); }
  return { render, refresh };
})();
document.addEventListener('DOMContentLoaded', UI.render);
