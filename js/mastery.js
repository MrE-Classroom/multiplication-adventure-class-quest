window.Mastery = (() => {
  const MAX = 10;
  const levels = ['New','Needs Practice','Getting Better','Strong','Mastered'];
  const key = (a,b) => `${a}x${b}`;
  function init(){
    const facts = {};
    for(let a=0;a<=MAX;a++) for(let b=0;b<=MAX;b++) facts[key(a,b)] = {a,b,attempts:0,correct:0,streak:0,recentMisses:0,level:0,last:null};
    return facts;
  }
  function accuracy(f){ return f.attempts ? Math.round((f.correct / f.attempts) * 100) : 0; }
  function recalc(f){
    const acc = accuracy(f);
    let level = 0;
    if(f.attempts === 0) level = 0;
    else if(acc < 60 || f.recentMisses >= 2) level = 1;
    else if(f.attempts >= 3 && acc >= 60) level = 2;
    if(f.attempts >= 5 && acc >= 75 && f.streak >= 2) level = 3;
    if(f.attempts >= 6 && acc >= 85 && f.streak >= 3 && f.recentMisses === 0) level = 4;
    f.level = level; return f;
  }
  function record(facts,a,b,isCorrect){
    const k = key(a,b);
    const f = facts[k] || {a,b,attempts:0,correct:0,streak:0,recentMisses:0,level:0,last:null};
    const before = f.level;
    f.attempts++;
    if(isCorrect){ f.correct++; f.streak++; f.recentMisses = Math.max(0, f.recentMisses - 1); }
    else { f.streak = 0; f.recentMisses++; }
    f.last = Date.now(); recalc(f); facts[k] = f;
    return { fact:f, improved:f.level > before, before, after:f.level };
  }
  function summary(facts){
    const vals = Object.values(facts);
    const attempts = vals.reduce((s,f)=>s+f.attempts,0);
    const correct = vals.reduce((s,f)=>s+f.correct,0);
    return {
      totalFacts:121, attempts, correct,
      accuracy: attempts ? Math.round((correct/attempts)*100) : 0,
      mastered: vals.filter(f=>f.level===4).length,
      strong: vals.filter(f=>f.level===3).length,
      better: vals.filter(f=>f.level===2).length,
      needs: vals.filter(f=>f.level===1).length,
      practiced: vals.filter(f=>f.attempts>0).length
    };
  }
  function weakFacts(facts, limit=8){
    return Object.values(facts).filter(f=>f.level<3).sort((a,b)=>(a.level-b.level)||(b.recentMisses-a.recentMisses)||(a.attempts-b.attempts)).slice(0,limit);
  }
  function chooseFact(facts, focus=[], mode='area', recent=[]){
    let pool = Object.values(facts);
    if(focus.length) pool = pool.filter(f => focus.includes(f.a) || focus.includes(f.b));
    if(mode === 'training'){
      const r = Math.random();
      if(r < .6) pool = weakFacts(facts,50);
      else if(r < .9) pool = Object.values(facts).filter(f=>f.level>=2 && f.level<4);
      else pool = Object.values(facts).filter(f=>f.level<=1);
    }
    pool = pool.filter(f => !recent.includes(key(f.a,f.b)));
    if(!pool.length) pool = Object.values(facts);
    pool = pool.slice().sort((a,b)=>(a.level-b.level) || (Math.random()-.5));
    const f = pool[Math.floor(Math.random() * Math.min(pool.length, 12))] || pool[0];
    return { a:f.a, b:f.b, product:f.a * f.b };
  }
  return { MAX, levels, key, init, record, summary, weakFacts, chooseFact, accuracy };
})();
