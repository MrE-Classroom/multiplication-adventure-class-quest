window.Game = (() => {
  const slots = ['weapon','head','body','legs','pet','aura','frame','cosmetic'];
  function freshState(){
    const progress = {};
    GameData.areas.forEach((a,i)=> progress[a.id] = {unlocked:i===0, rounds:0, bestAccuracy:0, key:false, bossDefeated:false});
    const questProgress = {}; GameData.quests.forEach(q=>questProgress[q.id]=0);
    const activeIds = GameData.quests.slice(0, GameData.activeQuestCount || 4).map(q=>q.id);
    return {
      version:13, selectedClass:null, avatarModel:null, freeClassChange:true, coins:50, level:1, xp:0, hp:0, mana:0,
      area:'town', mode:'classSelect', currentArea:null, inBoss:false,
      inventory:[], equipped:Object.fromEntries(slots.map(s=>[s,null])), mastery:Mastery.init(), progress,
      quests:{claimed:{}, progress:questProgress, activeIds, cycleIndex:0},
      records:{bestAccuracy:0,longestStreak:0,coinsRound:0,bossesDefeated:0,trainingSets:0,answers:0,correct:0},
      session:{question:null, choices:[], hiddenChoices:[], recent:[], total:0, correct:0, streak:0, target:10, answered:false, mode:null, areaId:null, bossHp:0, abilityUsed:false, shieldUsed:false, improvedFacts:0, rewardCoins:0, lastCorrect:null, roundAccuracy:0}
    };
  }
  let state = null;
  const getState = () => state;
  function load(){ state = GameStorage.load() || freshState(); normalize(); return state; }
  function reset(){ GameStorage.clear(); state = freshState(); save(); return state; }
  function save(){ GameStorage.save(state); }
  function normalize(){
    const fresh=freshState();
    if(!state.mastery) state.mastery = Mastery.init();
    if(typeof state.avatarModel === 'undefined') state.avatarModel = state.selectedClass ? 'boy' : null;
    if(!state.progress) state.progress=fresh.progress;
    // add new areas/progress keys if loading old save
    Object.entries(fresh.progress).forEach(([k,v])=>{ if(!state.progress[k]) state.progress[k]=v; });
    if(!state.session) state.session=fresh.session;
    if(!state.session.hiddenChoices) state.session.hiddenChoices=[];
    if(typeof state.session.shieldUsed==='undefined') state.session.shieldUsed=false;
    if(!state.equipped) state.equipped=fresh.equipped;
    slots.forEach(s=>{ if(!(s in state.equipped)) state.equipped[s]=null; });
    if(!state.inventory) state.inventory=[];
    if(!state.quests) state.quests=fresh.quests;
    if(!state.quests.progress) state.quests.progress={};
    if(!state.quests.claimed) state.quests.claimed={};
    GameData.quests.forEach(q=>{ if(typeof state.quests.progress[q.id]==='undefined') state.quests.progress[q.id]=0; });
    if(!Array.isArray(state.quests.activeIds) || !state.quests.activeIds.length) state.quests.activeIds=fresh.quests.activeIds;
    if(typeof state.quests.cycleIndex==='undefined') state.quests.cycleIndex=0;
    if(!state.records) state.records=fresh.records;
    ['bestAccuracy','longestStreak','coinsRound','bossesDefeated','trainingSets','answers','correct'].forEach(k=>{ if(typeof state.records[k]==='undefined') state.records[k]=fresh.records[k]; });
  }
  function cls(){ return GameData.classes[state.selectedClass]; }
  function heroImage(){ return cls()?.portraits?.[state.avatarModel || 'boy'] || ''; }
  function selectClass(id, avatarModel='boy'){ if(!GameData.classes[id]) return {ok:false,msg:'Choose a class.'}; state.avatarModel = (avatarModel === 'girl') ? 'girl' : 'boy'; state.selectedClass=id; state.mode='town'; state.area='Town'; state.hp=cls().hp; state.mana=cls().mana; save(); return {ok:true}; }
  function canChangeClass(){ return state.mode==='town' && !state.inBoss; }
  function changeClass(id){
    if(!canChangeClass()) return {ok:false,msg:'Class changes are only available in Town.'};
    if(id===state.selectedClass) return {ok:false,msg:'You are already that class.'};
    const fee = state.freeClassChange ? 0 : 25;
    if(state.coins < fee) return {ok:false,msg:`You need ${fee} coins to change class.`};
    state.coins -= fee; state.freeClassChange=false; state.selectedClass=id;
    for(const s of Object.keys(state.equipped)){ const item = getItem(state.equipped[s]); if(item && !allowed(item)) state.equipped[s]=null; }
    state.hp=cls().hp; state.mana=cls().mana; save(); return {ok:true,msg:`Class changed to ${cls().name}.`};
  }
  function areaById(id){ return GameData.areas.find(a=>a.id===id); }
  function getItem(id){ return GameData.items.find(i=>i.id===id); }
  function allowed(item){ return item && (item.cls.includes('all') || item.cls.includes(state.selectedClass)); }
  function itemUnlocked(item){
    if(!item) return false;
    if(!item.unlock || item.unlock==='start') return true;
    return !!state.progress[item.unlock]?.bossDefeated;
  }
  function itemUnlockText(item){ return itemUnlocked(item) ? 'Unlocked' : (GameData.unlockLabels[item.unlock] || 'Locked'); }
  function shopItems(){ return GameData.items.filter(allowed); }
  function owned(id){ return state.inventory.includes(id); }
  function buyItem(id){
    const item=getItem(id); if(!item) return {ok:false,msg:'Item not found.'};
    if(!allowed(item)) return {ok:false,msg:'This item is not for your class.'};
    if(!itemUnlocked(item)) return {ok:false,msg:`Locked: ${itemUnlockText(item)}.`};
    if(owned(id)) return {ok:false,msg:'You already own this item.'};
    if(state.coins < item.cost) return {ok:false,msg:'Not enough coins.'};
    state.coins -= item.cost; state.inventory.push(id); save(); return {ok:true,msg:`Bought ${item.name}. It was added to your inventory.`, item};
  }
  function equipItem(id){
    const item=getItem(id); if(!item || !owned(id)) return {ok:false,msg:'You do not own this item.'};
    if(!allowed(item)) return {ok:false,msg:`${item.name} is locked for your current class.`};
    if(!itemUnlocked(item)) return {ok:false,msg:`${item.name} is still locked.`};
    state.equipped[item.slot || 'cosmetic'] = id; save(); return {ok:true,msg:`Equipped ${item.name}.`};
  }
  function unequip(slot){ if(!(slot in state.equipped)) return {ok:false,msg:'Slot not found.'}; state.equipped[slot]=null; save(); return {ok:true}; }
  function stats(){
    const base = cls()?.stats || {attack:0,defense:0,speed:0,focus:0}; const out={...base};
    Object.values(state.equipped).forEach(id=>{const item=getItem(id); if(item && allowed(item) && itemUnlocked(item)) Object.entries(item.stats||{}).forEach(([k,v])=>out[k]=(out[k]||0)+v);});
    return out;
  }
  function isAreaUnlocked(id){ return !!state.progress[id]?.unlocked; }
  function unlockNext(areaId){ const idx=GameData.areas.findIndex(a=>a.id===areaId); const next=GameData.areas[idx+1]; if(next) state.progress[next.id].unlocked=true; }
  function canEarnBossKey(areaId){ const area=areaById(areaId), p=state.progress[areaId]; return p.rounds>=area.requiredRounds && p.bestAccuracy>=area.requiredAccuracy; }
  function updateBossKey(areaId){ const p=state.progress[areaId]; if(!p.key && canEarnBossKey(areaId)) p.key=true; }
  function startArea(areaId){
    const area=areaById(areaId); if(!area) return {ok:false,msg:'Area not found.'};
    if(!isAreaUnlocked(areaId)) return {ok:false,msg:'Locked. Defeat the previous boss to unlock this area.'};
    state.mode='battle'; state.area=area.name; state.currentArea=areaId; state.inBoss=false;
    startRound('area', areaId, 10); save(); return {ok:true};
  }
  function startTraining(){ state.mode='training'; state.area='Training Area'; state.currentArea=null; state.inBoss=false; startRound('training', null, 10); save(); return {ok:true}; }
  function startBoss(areaId){
    const area=areaById(areaId), p=state.progress[areaId];
    if(!area) return {ok:false,msg:'Boss not found.'};
    if(!p.unlocked) return {ok:false,msg:'This area is locked.'};
    if(!p.key) return {ok:false,msg:'Boss locked. Earn the boss key first.'};
    state.mode='boss'; state.area=`${area.name} Boss`; state.currentArea=areaId; state.inBoss=true; startRound('boss', areaId, 8); state.session.bossHp=5; state.hp=cls().hp; state.mana=cls().mana; state.session.abilityUsed=false; state.session.shieldUsed=false; save(); return {ok:true};
  }
  function startRound(mode, areaId, target){
    state.session={question:null,choices:[],hiddenChoices:[],recent:[],total:0,correct:0,streak:0,target,answered:false,mode,areaId,bossHp:mode==='boss'?5:0,abilityUsed:false,shieldUsed:false,improvedFacts:0,rewardCoins:0,lastCorrect:null,roundAccuracy:0};
    nextQuestion();
  }
  function nextQuestion(){
    const area = state.session.areaId ? areaById(state.session.areaId) : null;
    const fact = Mastery.chooseFact(state.mastery, area?.focus || [], state.session.mode, state.session.recent);
    const choices = buildChoices(fact.product);
    state.session.question=fact; state.session.choices=choices; state.session.hiddenChoices=[]; state.session.answered=false;
    state.session.recent.push(Mastery.key(fact.a,fact.b)); if(state.session.recent.length>5) state.session.recent.shift();
  }
  function buildChoices(answer){
    const set = new Set([answer]); const offsets=[-12,-10,-8,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,8,10,12];
    while(set.size<4){ const v=Math.max(0, answer + offsets[Math.floor(Math.random()*offsets.length)]); set.add(v); }
    return Array.from(set).sort(()=>Math.random()-.5);
  }
  function useAbility(){
    if(!state.session.question || state.session.answered) return {ok:false,msg:'Use abilities before answering.'};
    if(state.selectedClass==='mage'){
      if(state.session.abilityUsed) return {ok:false,msg:'Focus Spell was already used this round.'};
      if(state.mana<1) return {ok:false,msg:'Not enough mana.'};
      const q=state.session.question;
      const wrong=state.session.choices.filter(v=>v!==q.product && !state.session.hiddenChoices.includes(v));
      const remove=wrong.sort(()=>Math.random()-.5).slice(0,2);
      if(!remove.length) return {ok:false,msg:'No wrong choices to remove.'};
      state.session.hiddenChoices.push(...remove); state.session.abilityUsed=true; state.mana--; save();
      return {ok:true,msg:'Focus Spell removed two wrong choices.'};
    }
    if(state.selectedClass==='knight') return {ok:false,msg:'Shield Block is automatic during boss battles.'};
    if(state.selectedClass==='archer') return {ok:false,msg:'Streak Shot is automatic after every 3 correct answers.'};
    return {ok:false,msg:'No ability available.'};
  }
  function submitAnswer(value){
    if(!state.session.question || state.session.answered) return {ok:false,msg:'No active question.'};
    if(state.session.hiddenChoices.includes(Number(value))) return {ok:false,msg:'That choice was removed by Focus Spell.'};
    const q=state.session.question; const correct = Number(value) === q.product;
    state.session.answered=true; state.session.total++; state.records.answers++;
    const rec = Mastery.record(state.mastery, q.a,q.b, correct);
    if(rec.improved) state.session.improvedFacts++;
    if(correct){
      state.session.correct++; state.records.correct++; state.session.streak++; state.records.longestStreak=Math.max(state.records.longestStreak,state.session.streak); state.session.rewardCoins += state.session.mode==='training'?1:2;
      updateQuestProgress('correctAnswers',1);
      if(state.session.streak===3) updateQuestProgress('streak3',1);
      if(state.selectedClass==='archer' && state.session.streak>0 && state.session.streak%3===0) state.session.rewardCoins += 2;
      if(state.session.mode==='boss') state.session.bossHp--;
    } else {
      state.session.streak=0;
      if(state.session.mode==='boss'){
        if(state.selectedClass==='knight' && !state.session.shieldUsed){ state.session.shieldUsed=true; }
        else state.hp=Math.max(0,state.hp-1);
      }
    }
    state.session.lastCorrect=correct; state.session.roundAccuracy=Math.round((state.session.correct/state.session.total)*100);
    updateQuestProgress('answers',1); if(rec.improved) updateQuestProgress('improvedFacts',1);
    save(); return {ok:true,correct,answer:q.product, done:isRoundDone()};
  }
  function continueAfterAnswer(){
    if(!state.session.answered) return {ok:false,msg:'Answer the question first.'};
    if(isRoundDone()) return finishRound();
    nextQuestion(); save(); return {ok:true};
  }
  function isRoundDone(){ return (state.hp<=0 && state.session.mode==='boss') || state.session.total >= state.session.target || (state.session.mode==='boss' && state.session.bossHp<=0); }
  function finishRound(){
    const s=state.session; const acc=s.total?Math.round((s.correct/s.total)*100):0; let msg='Round complete.';
    state.coins += s.rewardCoins; state.records.coinsRound=Math.max(state.records.coinsRound,s.rewardCoins); state.records.bestAccuracy=Math.max(state.records.bestAccuracy,acc); state.xp += s.correct*5; while(state.xp>=100){state.xp-=100; state.level++;}
    if(s.mode==='training'){ state.records.trainingSets++; updateQuestProgress('trainingSets',1); msg='Training set complete.'; }
    if(s.total>0 && s.correct===s.total) updateQuestProgress('perfectRounds',1);
    if(s.mode==='area'){
      const p=state.progress[s.areaId]; p.rounds++; p.bestAccuracy=Math.max(p.bestAccuracy,acc); updateQuestProgress('areaRounds',1); updateBossKey(s.areaId); msg = p.key ? 'Area round complete. Boss key ready!' : 'Area round complete.';
    }
    if(s.mode==='boss'){
      if(s.bossHp<=0){ const p=state.progress[s.areaId]; p.bossDefeated=true; p.key=false; unlockNext(s.areaId); state.records.bossesDefeated++; updateQuestProgress('bossesDefeated',1); msg='Boss defeated! New area and gear tier unlocked.'; }
      else msg='Boss attempt ended. Train and try again.';
      state.inBoss=false; state.hp=cls().hp; state.mana=cls().mana;
    }
    state.mode='results'; state.area='Results'; state.session.result={msg,accuracy:acc,coins:s.rewardCoins,correct:s.correct,total:s.total,improved:s.improvedFacts,mode:s.mode,areaId:s.areaId}; save(); return {ok:true,result:state.session.result};
  }
  function activeQuests(){ return (state.quests.activeIds||[]).map(id=>GameData.quests.find(q=>q.id===id)).filter(Boolean); }
  function rotateQuestsIfReady(){
    const active = activeQuests();
    if(!active.length || !active.every(q=>state.quests.claimed[q.id])) return false;
    const count = GameData.activeQuestCount || 4;
    const total = GameData.quests.length;
    state.quests.cycleIndex = ((state.quests.cycleIndex||0) + count) % total;
    state.quests.activeIds = Array.from({length:count}, (_,i)=>GameData.quests[(state.quests.cycleIndex+i)%total].id);
    state.quests.activeIds.forEach(id=>{ state.quests.progress[id]=0; state.quests.claimed[id]=false; });
    return true;
  }
  function updateQuestProgress(metric,n){ activeQuests().forEach(q=>{ if(q.metric===metric && !state.quests.claimed[q.id]) state.quests.progress[q.id]=Math.min(q.target,(state.quests.progress[q.id]||0)+n); }); }
  function claimQuest(id){ const q=GameData.quests.find(x=>x.id===id); if(!q) return {ok:false,msg:'Quest not found.'}; if(!(state.quests.activeIds||[]).includes(id)) return {ok:false,msg:'Quest is not active.'}; if(state.quests.claimed[id]) return {ok:false,msg:'Already claimed.'}; if((state.quests.progress[id]||0)<q.target) return {ok:false,msg:'Quest not complete.'}; state.quests.claimed[id]=true; state.coins+=q.reward; const rotated=rotateQuestsIfReady(); save(); return {ok:true,msg:rotated?`Quest complete! +${q.reward} coins. New quests are ready!`:`Quest complete! +${q.reward} coins.`}; }
  function goTown(){ if(state.inBoss) return {ok:false,msg:'Finish the boss attempt first.'}; state.mode='town'; state.area='Town'; state.currentArea=null; save(); return {ok:true}; }
  return { load, reset, getState, save, selectClass, changeClass, canChangeClass, cls, heroImage, stats, shopItems, buyItem, equipItem, unequip, owned, getItem, allowed, itemUnlocked, itemUnlockText, useAbility, startArea, startTraining, startBoss, submitAnswer, continueAfterAnswer, finishRound, goTown, isAreaUnlocked, areaById, claimQuest, activeQuests };
})();
