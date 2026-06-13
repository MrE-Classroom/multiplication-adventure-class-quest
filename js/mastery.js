(function () {
  'use strict';

  function keyFor(a, b) {
    return `${a}-${b}`;
  }

  function createMastery() {
    const facts = {};
    for (let a = 0; a <= 10; a += 1) {
      for (let b = 0; b <= 10; b += 1) {
        facts[keyFor(a, b)] = {
          a,
          b,
          attempts: 0,
          correct: 0,
          streak: 0,
          level: 0,
          lastMissed: false
        };
      }
    }
    return facts;
  }

  function normalizeMastery(existing) {
    const mastery = createMastery();
    if (!existing || typeof existing !== 'object') return mastery;

    Object.keys(mastery).forEach((key) => {
      const incoming = existing[key];
      if (!incoming) return;
      mastery[key] = {
        ...mastery[key],
        attempts: Number(incoming.attempts || 0),
        correct: Number(incoming.correct || 0),
        streak: Number(incoming.streak || 0),
        level: Math.max(0, Math.min(10, Number(incoming.level || 0))),
        lastMissed: Boolean(incoming.lastMissed)
      };
    });
    return mastery;
  }

  function recordFact(mastery, a, b, isCorrect) {
    const key = keyFor(a, b);
    if (!mastery[key]) mastery[key] = { a, b, attempts: 0, correct: 0, streak: 0, level: 0, lastMissed: false };
    const fact = mastery[key];
    fact.attempts += 1;
    fact.lastMissed = !isCorrect;

    if (isCorrect) {
      fact.correct += 1;
      fact.streak += 1;
      const gain = fact.streak >= 3 ? 2 : 1;
      fact.level = Math.min(10, fact.level + gain);
    } else {
      fact.streak = 0;
      fact.level = Math.max(0, fact.level - 1);
    }
    return fact;
  }

  function getSummary(mastery) {
    const values = Object.values(mastery || {});
    const attempts = values.reduce((sum, fact) => sum + Number(fact.attempts || 0), 0);
    const correct = values.reduce((sum, fact) => sum + Number(fact.correct || 0), 0);
    const practiced = values.filter(fact => Number(fact.attempts || 0) > 0).length;
    const mastered = values.filter(fact => Number(fact.level || 0) >= 10).length;
    const raised = values.filter(fact => Number(fact.level || 0) > 0).length;
    const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;
    return { attempts, correct, practiced, mastered, raised, accuracy, total: 121 };
  }

  function weakFacts(mastery, focusFacts) {
    const values = Object.values(mastery || {});
    return values
      .filter(fact => !focusFacts || focusFacts.includes(fact.a) || focusFacts.includes(fact.b))
      .sort((left, right) => {
        if (left.lastMissed !== right.lastMissed) return left.lastMissed ? -1 : 1;
        if (left.level !== right.level) return left.level - right.level;
        return left.attempts - right.attempts;
      });
  }

  window.MA_MASTERY = {
    keyFor,
    createMastery,
    normalizeMastery,
    recordFact,
    getSummary,
    weakFacts
  };
}());
