window.Mastery = (() => {
  const MAX = 10;
  const key = (a,b) => `${a}x${b}`;
  const labels = ['New','Practice','Growing','Strong','Mastered'];
  function init(){
    const facts = {};
    for(let a=0;a<=MAX;a++) for(let b=0;b<=MAX;b++) facts[key(a,b)] = {a,b,attempts:0,correct:0,streak:0,misses:0,level:0,last:0};
    return facts;
  }
  function accuracy(f){ return f.attempts ? Math.round((f.correct / f.attempts) * 100) : 0; }
  function recalc(f){
    const acc = accuracy(f);
    let level = 0;
    if(f.attempts > 0) level = 1;
    if(f.attempts >= 3 && acc >= 60 && f.misses < 3) level = 2;
    if(f.attempts >= 5 && acc >= 75 && f.streak >= 2) level = 3;
    if(f.attempts >= 6 && acc >= 85 && f.streak >= 3 && f.misses === 0) level = 4;
    if(f.misses >= 2 && level > 1) level -= 1;
    f.level = Math.max(0, Math.min(4, level));
    return f;
  }
  function record(facts,a,b,correct){
    const k = key(a,b);
    const f = facts[k] || {a,b,attempts:0,correct:0,streak:0,misses:0,level:0,last:0};
    const before = f.level;
    f.attempts += 1;
    if(correct){ f.correct += 1; f.streak += 1; f.misses = Math.max(0, f.misses - 1); }
    else { f.streak = 0; f.misses += 1; }
    f.last = Date.now();
    recalc(f); facts[k] = f;
    return { fact:f, improved:f.level > before, before, after:f.level };
  }
  function summary(facts){
    const vals = Object.values(facts);
    const attempts = vals.reduce((s,f)=>s+f.attempts,0);
    const correct = vals.reduce((s,f)=>s+f.correct,0);
    return { totalFacts:121, attempts, correct, accuracy: attempts ? Math.round(correct/attempts*100) : 0, mastered: vals.filter(f=>f.level===4).length, strong: vals.filter(f=>f.level===3).length, practiced: vals.filter(f=>f.attempts>0).length, needs: vals.filter(f=>f.level<=1 && f.attempts>0).length };
  }
  function weakFacts(facts, limit=20){
    return Object.values(facts).sort((a,b)=>(a.level-b.level)||(b.misses-a.misses)||(a.attempts-b.attempts)).slice(0,limit);
  }
  function chooseFact(facts, focus=[], mode='adventure', recent=[]){
    let pool = Object.values(facts);
    if(focus && focus.length) pool = pool.filter(f => focus.includes(f.a) || focus.includes(f.b));
    if(mode === 'training') pool = weakFacts(facts, 70);
    const recentSet = new Set(recent || []);
    let filtered = pool.filter(f => !recentSet.has(key(f.a,f.b)));
    if(!filtered.length) filtered = pool;
    filtered = filtered.sort((a,b)=>(a.level-b.level)||(b.misses-a.misses)||(Math.random()-.5));
    const pickPool = filtered.slice(0, Math.min(12, filtered.length));
    const f = pickPool[Math.floor(Math.random()*pickPool.length)] || filtered[0] || {a:0,b:0};
    return { a:f.a, b:f.b, product:f.a * f.b };
  }
  return { MAX, key, labels, init, record, summary, weakFacts, chooseFact, accuracy };
})();
