(function () {
  'use strict';

  const DATA = window.MULTIPLICATION_ADVENTURE_DATA;
  const STORAGE = window.MA_STORAGE;
  const MASTERY = window.MA_MASTERY;
  const VERSION = 34;
  const AUTO_ADVANCE_MS = 1250;

  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');

  document.addEventListener('error', (event) => {
    const target = event.target;
    if (!target || target.tagName !== 'IMG') return;

    const fallbacks = (target.dataset.fallbacks || '')
      .split('|')
      .map(item => item.trim())
      .filter(Boolean);
    const currentIndex = Number(target.dataset.fallbackIndex || '0');
    const nextIndex = currentIndex + 1;

    if (fallbacks[nextIndex]) {
      target.dataset.fallbackIndex = String(nextIndex);
      target.src = fallbacks[nextIndex];
      return;
    }

    target.classList.add('broken-asset');
    target.alt = '';
    const holder = target.closest('.portrait-stage, .item-icon, .preview-icon, .preview-hero-stage, .battle-hero-wrap, .opponent-wrap');
    if (holder) {
      holder.classList.add('asset-missing');
      holder.dataset.missingLabel = target.dataset.missingLabel || 'Art missing';
    }
  }, true);

  let state = hydrateState();
  let modalTimer = null;

  function createDefaultState() {
    return {
      version: VERSION,
      screen: 'select',
      selectedClass: 'knight',
      selectedGender: 'boy',
      hero: null,
      areaId: 'meadow',
      shopCategory: 'weapon',
      coachKey: 'welcome',
      coins: 40,
      xp: 0,
      level: 1,
      hp: 5,
      mana: 2,
      inventory: {
        'hp-potion': 1,
        'mana-potion': 1
      },
      equipped: {
        weapon: null,
        head: null,
        body: null,
        legs: null,
        frame: null,
        aura: null,
        pet: null
      },
      defeatedBosses: [],
      mastery: MASTERY.createMastery(),
      stats: {
        factsAnswered: 0,
        correctAnswers: 0,
        bestStreak: 0
      },
      quests: DATA.QUESTS.map(quest => ({ id: quest.id, claimed: false })),
      currentRound: null,
      answerLock: false
    };
  }

  function hydrateState() {
    const defaults = createDefaultState();
    const saved = STORAGE.loadSave();
    if (!saved) return defaults;

    const merged = {
      ...defaults,
      ...saved,
      version: VERSION,
      selectedClass: saved.selectedClass || saved.hero?.classId || defaults.selectedClass,
      selectedGender: saved.selectedGender || saved.hero?.gender || defaults.selectedGender,
      inventory: { ...defaults.inventory, ...(saved.inventory || {}) },
      equipped: { ...defaults.equipped, ...(saved.equipped || {}) },
      stats: { ...defaults.stats, ...(saved.stats || {}) },
      mastery: MASTERY.normalizeMastery(saved.mastery),
      quests: DATA.QUESTS.map((quest) => {
        const existing = (saved.quests || []).find(item => item.id === quest.id);
        return { id: quest.id, claimed: Boolean(existing?.claimed) };
      }),
      currentRound: null,
      answerLock: false
    };

    if (!merged.hero) merged.screen = 'select';
    return merged;
  }

  function persist() {
    STORAGE.saveGame(state);
  }

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function escapeAttribute(value) {
    return escapeHTML(value).replace(/`/g, '&#96;');
  }

  function uniqueList(list) {
    return [...new Set(list.filter(Boolean))];
  }

  function withExtensionVariants(paths) {
    const output = [];
    paths.forEach((path) => {
      if (!path) return;
      output.push(path);
      const match = path.match(/^(.*)\.([A-Za-z0-9]+)$/);
      if (!match) return;
      const stem = match[1];
      ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'webp', 'WEBP'].forEach(ext => output.push(`${stem}.${ext}`));
    });
    return uniqueList(output);
  }

  function pathName(path) {
    return String(path || '').split('/').pop() || '';
  }

  function stemName(path) {
    return pathName(path).replace(/\.[^.]+$/, '');
  }

  function basePath(folder, baseNames) {
    return withExtensionVariants(baseNames.map(name => `${folder}/${name}.png`));
  }

  function pathVariants(path) {
    if (!path) return [];
    const folder = String(path).split('/').slice(0, -1).join('/');
    const stem = stemName(path);
    const variants = [stem, stem.replace(/-/g, '_'), stem.replace(/_/g, '-'), stem.toLowerCase(), stem.toUpperCase()];
    return basePath(folder, uniqueList(variants));
  }

  function heroBattleSources() {
    const key = heroKey();
    const [classId, gender] = key.split('-');
    const current = DATA.ASSETS.battle[key];
    const classAttack = {
      knight: gender === 'girl' ? 'knight_girl_sword' : 'knight_boy_sword',
      archer: gender === 'girl' ? 'archer_girl_arrow' : 'archer_boy_arrow',
      mage: gender === 'girl' ? 'mage_purple_spell' : 'mage_blue_spell'
    }[classId] || 'knight_boy_sword';
    return uniqueList([
      current,
      ...pathVariants(current),
      ...basePath('assets/heroes/battle', [
        `battle_${classAttack}`,
        `battle-${classAttack.replace(/_/g, '-')}`,
        `${classAttack}_battle`,
        `${classAttack.replace(/_/g, '-')}-battle`,
        `${classId}_${gender}`,
        `${classId}-${gender}`,
        `${classId}_${gender}_battle`,
        `${classId}-${gender}-battle`
      ])
    ]);
  }

  function heroPortraitSources() {
    const key = heroKey();
    const [classId, gender] = key.split('-');
    const current = DATA.ASSETS.portraits[key];
    return uniqueList([
      current,
      ...pathVariants(current),
      ...basePath('assets/heroes', [
        `${classId}-${gender}`,
        `${classId}_${gender}`
      ])
    ]);
  }

  function enemySources(area, primary) {
    if (!primary) return [];
    return uniqueList([primary, ...pathVariants(primary)]);
  }

  function bossSources(boss) {
    if (!boss?.asset) return [];
    return uniqueList([boss.asset, ...pathVariants(boss.asset)]);
  }

  function itemImageSources(item) {
    if (!item?.asset) return [];
    return uniqueList([item.asset, ...pathVariants(item.asset)]);
  }

  function imgTag(sources, className, alt, kind) {
    const list = Array.isArray(sources) ? uniqueList(sources) : uniqueList([sources]);
    if (!list.length) return '';
    const attrs = [
      `src="${escapeAttribute(list[0])}"`,
      `alt="${escapeAttribute(alt || kind || 'Game art')}"`,
      `data-fallbacks="${escapeAttribute(list.join('|'))}"`,
      'data-fallback-index="0"',
      `data-missing-label="${escapeAttribute(kind || 'Art')} missing"`
    ];
    if (className) attrs.push(`class="${escapeAttribute(className)}"`);
    return `<img ${attrs.join(' ')} />`;
  }


  function clamp(number, min, max) {
    return Math.max(min, Math.min(max, number));
  }

  function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(list) {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function heroClass() {
    return DATA.HERO_CLASSES[state.hero?.classId || state.selectedClass || 'knight'];
  }

  function heroKey() {
    const classId = state.hero?.classId || state.selectedClass || 'knight';
    const gender = state.hero?.gender || state.selectedGender || 'boy';
    return `${classId}-${gender}`;
  }

  function selectedDefaultName() {
    const cls = DATA.HERO_CLASSES[state.selectedClass];
    return cls.defaultNames[state.selectedGender];
  }

  function itemById(id) {
    return DATA.ITEMS.find(item => item.id === id) || null;
  }

  function areaById(id) {
    return DATA.AREAS.find(area => area.id === id) || DATA.AREAS[0];
  }

  function currentArea() {
    return areaById(state.areaId);
  }

  function getStats() {
    const cls = heroClass();
    const stats = {
      attack: cls.stats.attack,
      defense: cls.stats.defense,
      speed: cls.stats.speed,
      focus: cls.stats.focus,
      hp: cls.hp,
      mana: cls.mana
    };

    ['weapon', 'head', 'body', 'legs'].forEach((slot) => {
      const item = itemById(state.equipped[slot]);
      if (!item?.stats) return;
      Object.entries(item.stats).forEach(([key, value]) => {
        stats[key] = (stats[key] || 0) + value;
      });
    });
    return stats;
  }

  function maxHp() {
    return Math.max(1, getStats().hp);
  }

  function maxMana() {
    return Math.max(0, getStats().mana);
  }

  function isCombatScreen() {
    return state.screen === 'battle' || state.screen === 'boss';
  }

  function isRoundActive() {
    return Boolean(state.currentRound && (state.screen === 'battle' || state.screen === 'boss'));
  }

  function isAreaUnlocked(area) {
    if (!area.unlockBoss) return true;
    return state.defeatedBosses.includes(area.unlockBoss);
  }

  function isBossDefeated(area) {
    return state.defeatedBosses.includes(area.boss.id);
  }

  function nextLockedArea() {
    return DATA.AREAS.find(area => !isAreaUnlocked(area));
  }

  function awardXP(amount) {
    state.xp += amount;
    while (state.xp >= state.level * 60) {
      state.xp -= state.level * 60;
      state.level += 1;
      state.coachKey = 'levelUp';
    }
  }

  function screenTitle() {
    if (!state.hero) return 'Choose Hero';
    const labels = {
      town: 'Town',
      map: 'Map',
      shop: 'Shop',
      mastery: 'Mastery',
      settings: 'Settings',
      battle: currentArea().label,
      boss: `${currentArea().label} Boss`,
      summary: 'Round Summary'
    };
    return labels[state.screen] || 'Adventure';
  }

  function render() {
    const combat = isCombatScreen();
    document.body.classList.toggle('combat-body', combat);
    document.body.classList.toggle('scroll-body', !combat);

    if (!state.hero && state.screen === 'select') {
      app.innerHTML = renderSelectScreen();
      return;
    }

    app.innerHTML = `
      <div class="game-shell ${combat ? 'game-shell-combat' : 'game-shell-scroll'}">
        ${renderTopBar()}
        <main class="shell-main ${combat ? 'combat-main' : 'scroll-main'}">
          ${renderScreen()}
        </main>
        ${renderBottomBar()}
      </div>
    `;
  }

  function renderTopBar() {
    const area = currentArea();
    const areaLabel = state.screen === 'boss' ? `${area.label} Boss` : screenTitle();
    return `
      <header class="top-bar">
        <div class="brand-block">
          <div class="game-title">Multiplication Adventure</div>
          <div class="screen-label">${escapeHTML(areaLabel)} · v${VERSION}</div>
        </div>
        <nav class="top-actions" aria-label="Game navigation">
          <button class="small-btn" data-action="goto" data-screen="town">Back to Town</button>
          <button class="small-btn" data-action="goto" data-screen="map">Map</button>
          <button class="small-btn" data-action="goto" data-screen="shop">Shop</button>
          <button class="small-btn" data-action="goto" data-screen="mastery">Mastery</button>
          <button class="small-btn ghost" data-action="goto" data-screen="settings">Settings</button>
        </nav>
      </header>
    `;
  }

  function renderBottomBar() {
    const stats = getStats();
    const hpPercent = Math.round((state.hp / maxHp()) * 100);
    const manaPercent = maxMana() ? Math.round((state.mana / maxMana()) * 100) : 0;
    return `
      <footer class="status-bar">
        <div class="status-pill"><span>Coins</span><strong>${state.coins}</strong></div>
        <div class="status-pill"><span>Level</span><strong>${state.level}</strong></div>
        <div class="meter-wrap" aria-label="HP ${state.hp} of ${maxHp()}">
          <span>HP</span>
          <div class="meter"><div class="meter-fill hp-fill" style="width:${hpPercent}%"></div></div>
          <strong>${state.hp}/${maxHp()}</strong>
        </div>
        <div class="meter-wrap" aria-label="Mana ${state.mana} of ${maxMana()}">
          <span>Mana</span>
          <div class="meter"><div class="meter-fill mana-fill" style="width:${manaPercent}%"></div></div>
          <strong>${state.mana}/${maxMana()}</strong>
        </div>
        <div class="status-pill hide-small"><span>ATK</span><strong>${stats.attack}</strong></div>
        <div class="status-pill hide-small"><span>DEF</span><strong>${stats.defense}</strong></div>
      </footer>
    `;
  }

  function renderScreen() {
    const scrollClass = isCombatScreen() ? 'screen combat-screen' : 'screen scroll-screen';
    if (state.screen === 'town') return `<section class="${scrollClass}">${renderTown()}</section>`;
    if (state.screen === 'map') return `<section class="${scrollClass}">${renderMap()}</section>`;
    if (state.screen === 'shop') return `<section class="${scrollClass}">${renderShop()}</section>`;
    if (state.screen === 'mastery') return `<section class="${scrollClass}">${renderMastery()}</section>`;
    if (state.screen === 'settings') return `<section class="${scrollClass}">${renderSettings()}</section>`;
    if (state.screen === 'summary') return `<section class="${scrollClass}">${renderSummary()}</section>`;
    if (state.screen === 'battle' || state.screen === 'boss') return `<section class="${scrollClass}">${renderBattle()}</section>`;
    return `<section class="${scrollClass}">${renderTown()}</section>`;
  }

  function renderSelectScreen() {
    const cls = DATA.HERO_CLASSES[state.selectedClass];
    const heroPath = DATA.ASSETS.portraits[heroKey()];
    return `
      <div class="select-shell">
        <section class="select-card">
          <div class="select-copy">
            <p class="eyebrow">Multiplication Adventure · v${VERSION}</p>
            <h1>Choose your class quest hero.</h1>
            <p>Practice facts from 0 × 0 through 10 × 10, defeat bosses, unlock areas, and grow your mastery.</p>
            <div class="privacy-warning">Use a nickname or fantasy name. Do not type your real full name.</div>
          </div>

          <div class="hero-builder">
            <div class="portrait-stage select-portrait">
              ${imgTag(heroPortraitSources(), '', `Selected ${cls.label} portrait`, 'Portrait')}
              ${renderEquippedFramePreview()}
            </div>

            <label class="field-label" for="heroNameInput">Hero name</label>
            <div class="name-row">
              <input id="heroNameInput" value="${escapeHTML(selectedDefaultName())}" maxlength="24" autocomplete="off" />
              <button data-action="randomize-name">Randomize</button>
            </div>

            <div class="toggle-row" role="group" aria-label="Hero style">
              ${['boy', 'girl'].map(gender => `
                <button class="toggle-btn ${state.selectedGender === gender ? 'active' : ''}" data-action="select-gender" data-gender="${gender}">${gender === 'boy' ? 'Boy' : 'Girl'}</button>
              `).join('')}
            </div>
          </div>

          <div class="class-grid">
            ${Object.values(DATA.HERO_CLASSES).map(heroClassData => `
              <button class="class-card ${state.selectedClass === heroClassData.id ? 'selected' : ''}" data-action="select-class" data-class="${heroClassData.id}">
                <strong>${escapeHTML(heroClassData.label)}</strong>
                <span>${escapeHTML(heroClassData.ability.name)}</span>
                <small>${escapeHTML(heroClassData.description)}</small>
                <em>${heroClassData.difficulty}</em>
              </button>
            `).join('')}
          </div>

          <div class="select-summary">
            <strong>${escapeHTML(cls.label)}</strong>
            <span>HP ${cls.hp} · Mana ${cls.mana} · ${escapeHTML(cls.ability.summary)}</span>
            <button class="primary-btn" data-action="start-game">Start Adventure</button>
          </div>
        </section>
      </div>
    `;
  }

  function renderTown() {
    const area = currentArea();
    const nextArea = nextLockedArea();
    const defeatedHere = isBossDefeated(area);
    return `
      <div class="town-grid">
        <div class="left-stack">
          <section class="town-scene panel-card" style="background-image:linear-gradient(90deg, rgba(13,10,28,.94), rgba(13,10,28,.62), rgba(13,10,28,.25)), url('${DATA.ASSETS.backgrounds.town}')">
            <div class="town-scene-content">
              <span class="eyebrow">Town Center</span>
              <h2>Welcome back, ${escapeHTML(state.hero?.name || 'hero')}.</h2>
              <p>Rest, train, shop for gear, or open the map. Your next focus is ${escapeHTML(area.label)}: ${area.focusFacts.join(', ')} facts.</p>
              <div class="town-scene-actions">
                <button class="primary-btn" data-action="start-training">Training Area</button>
                <button data-action="start-area" data-area="${area.id}">Adventure in ${escapeHTML(area.label)}</button>
                <button data-action="goto" data-screen="map">World Map</button>
                <button data-action="goto" data-screen="shop">Shop</button>
              </div>
            </div>
          </section>
          ${renderHeroPanel()}
          <section class="panel-card town-actions-card">
            <div class="panel-heading">
              <h2>Quick Actions</h2>
              <span>${escapeHTML(defeatedHere ? 'Boss cleared' : 'Boss ready when practiced')}</span>
            </div>
            <div class="action-grid">
              <button data-action="rest">Rest for 10 coins</button>
              <button data-action="open-items">Use Items</button>
              <button data-action="open-inventory">Inventory</button>
              <button data-action="goto" data-screen="mastery">Mastery Board</button>
            </div>
          </section>
          <section class="panel-card compact-tip">
            <h2>Current Focus</h2>
            <p>${escapeHTML(area.label)} facts: ${area.focusFacts.join(', ')}.</p>
            <p>Missed facts will appear more often until they improve.${nextArea ? ` Defeat the ${escapeHTML(area.boss.label)} to move toward ${escapeHTML(nextArea.label)}.` : ''}</p>
          </section>
        </div>
        <aside class="right-stack">
          ${renderCoachPanel()}
          ${renderQuestPanel()}
        </aside>
      </div>
    `;
  }

  function renderHeroPanel() {
    const cls = heroClass();
    const portraitPath = DATA.ASSETS.portraits[heroKey()];
    const summary = MASTERY.getSummary(state.mastery);
    return `
      <section class="panel-card hero-panel">
        <div class="portrait-stage">
          ${imgTag(heroPortraitSources(), '', `${state.hero?.name || 'Hero'} portrait`, 'Portrait')}
          ${renderEquippedFramePreview()}
          ${renderEquippedPetPreview()}
        </div>
        <div class="hero-meta">
          <h2>${escapeHTML(state.hero?.name || selectedDefaultName())}</h2>
          <p>${escapeHTML(cls.label)} · ${escapeHTML(cls.ability.name)}</p>
          <div class="mini-stats">
            <span>Mastered ${summary.mastered}/121</span>
            <span>Accuracy ${summary.accuracy}%</span>
          </div>
          <div class="hero-buttons">
            <button data-action="open-inventory">Inventory</button>
            <button data-action="open-items">Items</button>
            <button data-action="open-ability">Ability</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderEquippedFramePreview() {
    const frame = itemById(state.equipped?.frame);
    return frame ? `${imgTag(itemImageSources(frame), 'portrait-frame', frame.label, 'Frame')}` : '';
  }

  function renderEquippedPetPreview() {
    const pet = itemById(state.equipped?.pet);
    return pet ? `${imgTag(itemImageSources(pet), 'portrait-pet', pet.label, 'Pet')}` : '';
  }

  function renderCoachPanel() {
    const message = coachMessage();
    return `
      <section class="panel-card coach-panel">
        <div class="panel-heading">
          <h2>Coach</h2>
          <span class="coach-badge">Guide</span>
        </div>
        <p>${escapeHTML(message.primary)}</p>
        <p class="coach-detail">${escapeHTML(message.detail)}</p>
      </section>
    `;
  }

  function coachMessage() {
    const summary = MASTERY.getSummary(state.mastery);
    const area = currentArea();
    const lowHp = state.hp <= Math.max(1, Math.ceil(maxHp() / 3));
    const lowMana = maxMana() > 0 && state.mana <= 1;
    if (state.coachKey === 'correct') return { primary: 'Correct! Great work.', detail: 'Get ready for the next fact. Your mastery grows when you keep a strong streak.' };
    if (state.coachKey === 'wrong') return { primary: 'Not quite. Study the correction before moving on.', detail: 'This fact may come back again because missed facts are added to extra practice.' };
    if (state.coachKey === 'bossReady') return { primary: 'You are ready for a boss challenge.', detail: 'Open the Map when you want to challenge the boss and unlock the next area.' };
    if (state.coachKey === 'shop') return { primary: 'Shop tip: gear changes stats.', detail: 'Frames and auras are visual upgrades. Auras animate in battle but use a static preview in the shop.' };
    if (state.coachKey === 'potionBlocked') return { primary: 'Potion buying is blocked during battle.', detail: 'You can use potions you already own, but new potions can only be bought in Town or Shop.' };
    if (state.coachKey === 'levelUp') return { primary: 'Level up! Your hero is growing.', detail: 'Keep practicing focus facts to unlock stronger mastery and boss progress.' };
    if (lowHp) return { primary: 'Your HP is low.', detail: 'Use an owned HP Potion or return to Town to rest before starting a harder challenge.' };
    if (lowMana) return { primary: 'Your mana is low.', detail: 'Save your ability for difficult questions or use a Mana Potion if you own one.' };
    if (summary.mastered < 5) return { primary: `Focus on ${area.label} facts.`, detail: `Practice ${area.focusFacts.join(', ')} facts until their cells get darker on the Mastery board.` };
    return { primary: 'Choose your next step.', detail: 'Train weak facts, enter the current area, or check the Map when you are ready to push forward.' };
  }

  function renderQuestPanel() {
    return `
      <section class="panel-card quest-panel">
        <div class="panel-heading">
          <h2>Quest Log</h2>
          <span>${completedQuestCount()}/${DATA.QUESTS.length}</span>
        </div>
        <div class="quest-list">
          ${DATA.QUESTS.map(renderQuestCard).join('')}
        </div>
      </section>
    `;
  }

  function completedQuestCount() {
    return state.quests.filter(quest => quest.claimed).length;
  }

  function questProgress(quest) {
    const summary = MASTERY.getSummary(state.mastery);
    const values = {
      factsAnswered: state.stats.factsAnswered,
      correctAnswers: state.stats.correctAnswers,
      masteredFacts: summary.raised
    };
    return Math.min(quest.target, values[quest.metric] || 0);
  }

  function renderQuestCard(quest) {
    const saved = state.quests.find(item => item.id === quest.id) || { claimed: false };
    const progress = questProgress(quest);
    const ready = progress >= quest.target && !saved.claimed;
    const rewardText = Object.entries(quest.reward).map(([key, value]) => `${value} ${key}`).join(', ');
    return `
      <div class="quest-row ${saved.claimed ? 'claimed' : ''}">
        <strong>${escapeHTML(quest.label)}</strong>
        <span>${progress}/${quest.target}</span>
        <small>Reward: ${escapeHTML(rewardText)}</small>
        <button ${ready ? '' : 'disabled'} data-action="claim-quest" data-quest="${quest.id}">${saved.claimed ? 'Claimed' : 'Claim'}</button>
      </div>
    `;
  }

  function renderMap() {
    return `
      <div class="wide-stack">
        <section class="panel-card">
          <h2>World Map</h2>
          <p>Adventure rounds build mastery. Boss battles unlock the next area.</p>
        </section>
        <div class="map-grid">
          ${DATA.AREAS.map((area) => {
            const unlocked = isAreaUnlocked(area);
            const defeated = isBossDefeated(area);
            return `
              <section class="area-card ${unlocked ? '' : 'locked'}">
                <div class="area-art" style="background-image:linear-gradient(rgba(7,18,38,.28), rgba(7,18,38,.7)), url('${area.background}')"></div>
                <div class="area-content">
                  <div class="panel-heading">
                    <h3>${escapeHTML(area.label)}</h3>
                    <span>${defeated ? 'Boss defeated' : unlocked ? 'Unlocked' : 'Locked'}</span>
                  </div>
                  <p>${escapeHTML(area.subtitle)} · Focus: ${area.focusFacts.join(', ')}</p>
                  <p>Boss: ${escapeHTML(area.boss.label)} · HP ${area.boss.hp}</p>
                  <div class="area-actions">
                    <button ${unlocked ? '' : 'disabled'} data-action="start-area" data-area="${area.id}">Adventure</button>
                    <button ${unlocked ? '' : 'disabled'} data-action="start-boss" data-area="${area.id}">${defeated ? 'Replay Boss' : 'Boss'}</button>
                  </div>
                </div>
              </section>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderShop() {
    const category = state.shopCategory || 'weapon';
    const items = DATA.ITEMS.filter(item => item.category === category && canShowItem(item));
    return `
      <div class="shop-screen">
        <section class="panel-card shop-header">
          <div>
            <h2>Shop</h2>
            <p>Buy class gear, potions, frames, and auras. Trail and Cosmetic tabs are intentionally hidden.</p>
          </div>
          <div class="coin-chip">${state.coins} coins</div>
        </section>
        <div class="shop-tabs" role="tablist" aria-label="Shop categories">
          ${DATA.SHOP_CATEGORIES.map(categoryItem => `
            <button class="shop-tab ${category === categoryItem.id ? 'active' : ''}" data-action="shop-category" data-category="${categoryItem.id}">${escapeHTML(categoryItem.label)}</button>
          `).join('')}
        </div>
        <div class="shop-grid">
          ${items.length ? items.map(renderShopItem).join('') : '<section class="panel-card"><p>No items available for this class in this category.</p></section>'}
        </div>
      </div>
    `;
  }

  function canShowItem(item) {
    if (!state.hero) return true;
    return item.cls.includes('all') || item.cls.includes(state.hero.classId);
  }

  function renderShopItem(item) {
    const ownedCount = state.inventory[item.id] || 0;
    const owned = ownedCount > 0;
    const equipped = state.equipped[item.slot] === item.id;
    const statsText = itemStatsText(item);
    return `
      <section class="shop-card" data-action="preview-item" data-item="${item.id}" tabindex="0" role="button" aria-label="Preview ${escapeHTML(item.label)}">
        ${renderItemIcon(item)}
        <div class="shop-item-body">
          <h3>${escapeHTML(item.label)}</h3>
          <p>${escapeHTML(statsText)}</p>
          <div class="shop-meta">
            <span>${item.cost} coins</span>
            <span>${owned ? `Owned${ownedCount > 1 ? ` ×${ownedCount}` : ''}` : 'Not owned'}</span>
          </div>
          <div class="shop-buttons">
            <button data-action="preview-item" data-item="${item.id}">Preview</button>
            <button data-action="buy-item" data-item="${item.id}" ${state.coins >= item.cost ? '' : 'disabled'}>Buy</button>
            ${item.slot !== 'item' ? `<button data-action="toggle-equip" data-item="${item.id}" ${owned ? '' : 'disabled'}>${equipped ? 'Unequip' : 'Equip'}</button>` : ''}
          </div>
        </div>
      </section>
    `;
  }

  function itemStatsText(item) {
    if (item.stats) return Object.entries(item.stats).map(([key, value]) => `+${value} ${key.toUpperCase()}`).join(' · ');
    if (item.effect) return Object.entries(item.effect).map(([key, value]) => `Restores ${value} ${key.toUpperCase()}`).join(' · ');
    return item.description || 'Visual upgrade';
  }

  function itemDescription(item) {
    if (item.description) return item.description;
    if (item.category === 'frame') return 'Visual portrait frame. Preview shows how it appears around the hero portrait.';
    if (item.category === 'aura') return 'Visual battle aura. Preview shows one hero battle pose with the aura behind the hero.';
    if (item.stats) return 'Gear upgrade that changes hero stats after it is equipped.';
    return 'Shop item.';
  }

  function renderItemIcon(item) {
    if (item.assetType === 'aura') {
      const path = DATA.auraSheetPath(item, heroKey());
      return `<div class="item-icon aura-static-sheet" style="background-image:url('${path}')" role="img" aria-label="${escapeHTML(item.label)} preview"></div>`;
    }
    return `<div class="item-icon">${imgTag(itemImageSources(item), '', item.label, 'Item icon')}</div>`;
  }

  function renderPreviewVisual(item) {
    if (item.category === 'aura') {
      const path = DATA.auraSheetPath(item, heroKey());
      return `
        <div class="preview-battle-card">
          <div class="preview-hero-stage">
            <div class="battle-aura-viewport" aria-hidden="true"><div class="battle-aura-sheet" style="background-image:url('${path}')"></div></div>
            ${imgTag(heroBattleSources(), 'preview-battle-hero', `${state.hero?.name || 'Hero'} battle preview`, 'Hero art')}
          </div>
          <small>Aura preview behind hero</small>
        </div>
      `;
    }

    if (item.category === 'frame') {
      return `
        <div class="preview-portrait-card">
          <div class="portrait-stage preview-portrait-stage">
            ${imgTag(heroPortraitSources(), '', `${state.hero?.name || 'Hero'} portrait preview`, 'Portrait')}
            ${imgTag(itemImageSources(item), 'portrait-frame', item.label, 'Frame')}
          </div>
          <small>Frame preview</small>
        </div>
      `;
    }

    return `<div class="preview-icon">${renderItemIcon(item)}</div>`;
  }

  function previewItem(itemId) {
    const item = itemById(itemId);
    if (!item) return;
    const ownedCount = state.inventory[item.id] || 0;
    const owned = ownedCount > 0;
    const equipped = state.equipped[item.slot] === item.id;
    const canBuyNow = !isRoundActive() && state.coins >= item.cost;
    const status = item.slot === 'item'
      ? `${owned ? `Owned ×${ownedCount}` : 'Not owned'}`
      : `${owned ? `Owned${equipped ? ' · Equipped' : ''}` : 'Not owned'}`;
    const equipButton = item.slot !== 'item'
      ? [{ label: equipped ? 'Unequip' : 'Equip', action: 'preview-toggle-equip', item: item.id, primary: owned, disabled: !owned }]
      : [];
    const buttons = [
      { label: 'Close', action: 'close-modal' },
      { label: 'Buy', action: 'preview-buy-item', item: item.id, primary: !owned, disabled: !canBuyNow },
      ...equipButton
    ];

    const body = `
      <div class="preview-grid">
        <div class="preview-visual">${renderPreviewVisual(item)}</div>
        <div class="preview-copy">
          <p class="preview-status">${escapeHTML(status)}</p>
          <div class="preview-price"><strong>${item.cost}</strong><span>coins</span></div>
          <p>${escapeHTML(itemDescription(item))}</p>
          <div class="preview-detail-row"><strong>Category</strong><span>${escapeHTML(item.category)}</span></div>
          <div class="preview-detail-row"><strong>Effect</strong><span>${escapeHTML(itemStatsText(item))}</span></div>
          ${item.slot !== 'item' ? '<p class="preview-note">Buying does not auto-equip. Use Equip after purchase.</p>' : '<p class="preview-note">Potions can be used from Items when owned.</p>'}
        </div>
      </div>
    `;
    showModal({ title: item.label, body, buttons, extraClass: 'preview-modal', blocking: true });
  }

  function renderMastery() {
    const summary = MASTERY.getSummary(state.mastery);
    return `
      <div class="wide-stack mastery-screen">
        <section class="panel-card mastery-summary">
          <div><strong>Mastered facts</strong><span>${summary.mastered}/121</span></div>
          <div><strong>Accuracy</strong><span>${summary.accuracy}%</span></div>
          <div><strong>Facts practiced</strong><span>${summary.practiced}</span></div>
          <div><strong>Current focus</strong><span>${currentArea().focusFacts.join(', ')}</span></div>
        </section>
        <section class="panel-card">
          <h2>Mastery Board</h2>
          <p>Cells show the product. Darker cells mean higher mastery.</p>
          <div class="mastery-table-wrap">
            <table class="mastery-table">
              <thead>
                <tr><th>×</th>${range(0, 10).map(num => `<th>${num}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${range(0, 10).map(a => `
                  <tr>
                    <th>${a}</th>
                    ${range(0, 10).map(b => renderMasteryCell(a, b)).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  function range(start, end) {
    const output = [];
    for (let value = start; value <= end; value += 1) output.push(value);
    return output;
  }

  function renderMasteryCell(a, b) {
    const fact = state.mastery[MASTERY.keyFor(a, b)];
    const level = fact?.level || 0;
    return `<td class="level-${level}" title="${a} × ${b}: mastery ${level}/10">${a * b}</td>`;
  }

  function renderSettings() {
    return `
      <div class="wide-stack">
        <section class="panel-card">
          <h2>Settings</h2>
          <p>Progress is saved only on this browser/device with localStorage.</p>
          <div class="settings-actions">
            <button data-action="save-now">Save Now</button>
            <button class="danger-btn" data-action="confirm-reset">Reset Game</button>
          </div>
        </section>
        <section class="panel-card">
          <h2>Build Notes</h2>
          <p>Version ${VERSION}: corrected the code asset manifest to the provided assets.zip tree, restoring hero portraits, battle poses, enemies, bosses, frames, item icons, and aura paths while keeping the dark RPG shell and answer popups.</p>
        </section>
      </div>
    `;
  }

  function renderBattle() {
    const round = state.currentRound;
    if (!round || !round.question) return '<section class="panel-card"><p>No round is active.</p></section>';
    const area = round.mode === 'training' ? { label: 'Training Area', background: DATA.ASSETS.backgrounds.training, enemies: [] } : areaById(round.areaId);
    const q = round.question;
    const progressLabel = round.mode === 'boss'
      ? `${round.boss.label}: ${Math.max(0, round.boss.hp)}/${round.boss.maxHp} HP`
      : `Question ${round.index + 1}/${round.total}`;

    return `
      <div class="combat-grid">
        <div class="battle-layout">
          <div class="battle-scene" style="background-image:linear-gradient(180deg, rgba(9,20,42,.15), rgba(9,20,42,.72)), url('${area.background}')">
          <div class="battle-hud top-left">${escapeHTML(area.label)}</div>
          <div class="battle-hud top-right">${escapeHTML(progressLabel)}</div>
          <div class="battle-hero-wrap">
            ${renderBattleAura()}
            ${imgTag(heroBattleSources(), 'battle-hero', `${state.hero.name} battle pose`, 'Hero art')}
          </div>
          ${renderOpponent(round, area)}
          </div>
          <div class="question-panel">
          <div class="question-header">
            <div>
              <span class="eyebrow">${escapeHTML(round.mode === 'boss' ? 'Boss battle' : round.mode === 'training' ? 'Training' : 'Adventure')}</span>
              <h2>${q.a} × ${q.b} = ?</h2>
            </div>
            <div class="round-stats">
              <span>Correct ${round.correct}</span>
              <span>Streak ${round.streak}</span>
            </div>
          </div>
          <div class="choice-grid">
            ${q.choices.map((choice, index) => `
              <button class="choice-btn ${q.hiddenChoices.includes(index) ? 'choice-hidden' : ''}" data-action="answer" data-index="${index}" ${state.answerLock || q.hiddenChoices.includes(index) ? 'disabled' : ''}>${choice}</button>
            `).join('')}
          </div>
          <div class="question-tools">
            <button data-action="use-ability" ${canUseAbility() ? '' : 'disabled'}>${escapeHTML(heroClass().ability.name)}</button>
            <button data-action="open-items">Use Items</button>
          </div>
        </div>
      </div>
      <aside class="combat-side" aria-label="Hero guidance and quests">
        ${renderHeroPanel()}
        ${renderCoachPanel()}
        ${renderQuestPanel()}
      </aside>
    </div>
    `;
  }

  function renderBattleAura() {
    const aura = itemById(state.equipped.aura);
    if (!aura) return '';
    const path = DATA.auraSheetPath(aura, heroKey());
    return `
      <div class="battle-aura-viewport" aria-hidden="true">
        <div class="battle-aura-sheet" style="background-image:url('${path}')"></div>
      </div>
    `;
  }

  function renderOpponent(round, area) {
    if (round.mode === 'boss') {
      const pct = Math.max(0, Math.round((round.boss.hp / round.boss.maxHp) * 100));
      return `
        <div class="opponent-wrap boss-wrap">
          <div class="opponent-hp"><span>${escapeHTML(round.boss.label)}</span><div><b style="width:${pct}%"></b></div></div>
          ${imgTag(bossSources(round.boss), 'opponent-img', round.boss.label, 'Boss art')}
        </div>
      `;
    }

    const enemy = round.enemy || randomFrom(area.enemies || []);
    return enemy ? `
      <div class="opponent-wrap">
        ${imgTag(enemySources(area, enemy), 'opponent-img', `${area.label} enemy`, 'Enemy art')}
      </div>
    ` : `<div class="training-orb">×</div>`;
  }

  function canUseAbility() {
    if (!state.currentRound?.question || state.answerLock) return false;
    if (state.hero.classId === 'mage') return state.mana > 0 && state.currentRound.question.hiddenChoices.length === 0;
    return false;
  }

  function renderSummary() {
    const summary = state.lastSummary || { title: 'Round Complete', correct: 0, total: 0, coins: 0, xp: 0, accuracy: 0 };
    return `
      <div class="summary-wrap">
        <section class="panel-card summary-card">
          <h2>${escapeHTML(summary.title)}</h2>
          <p>${escapeHTML(summary.message || 'Great effort. Keep practicing to grow your mastery.')}</p>
          <div class="summary-grid">
            <div><strong>${summary.correct}/${summary.total}</strong><span>Correct</span></div>
            <div><strong>${summary.accuracy}%</strong><span>Accuracy</span></div>
            <div><strong>${summary.coins}</strong><span>Coins</span></div>
            <div><strong>${summary.xp}</strong><span>XP</span></div>
          </div>
          <div class="summary-actions">
            <button class="primary-btn" data-action="goto" data-screen="town">Return to Town</button>
            <button data-action="goto" data-screen="map">Open Map</button>
            <button data-action="goto" data-screen="mastery">Check Mastery</button>
          </div>
        </section>
      </div>
    `;
  }

  function startGame() {
    const input = document.getElementById('heroNameInput');
    const cleanName = (input?.value || selectedDefaultName()).trim().slice(0, 24) || selectedDefaultName();
    const cls = DATA.HERO_CLASSES[state.selectedClass];
    state.hero = {
      name: cleanName,
      classId: state.selectedClass,
      gender: state.selectedGender
    };
    state.hp = cls.hp;
    state.mana = cls.mana;
    state.screen = 'town';
    state.coachKey = 'welcome';
    persist();
    render();
  }

  function gotoScreen(screen) {
    if (isRoundActive() && ['shop', 'map', 'mastery', 'settings', 'town'].includes(screen)) {
      showModal({
        title: 'Leave this round?',
        body: '<p>Your current round will end if you leave the battle screen.</p>',
        buttons: [
          { label: 'Stay', action: 'close-modal' },
          { label: 'Leave Round', action: 'leave-round', extraClass: 'danger-btn', screen }
        ]
      });
      return;
    }
    state.screen = screen;
    if (screen === 'shop') state.coachKey = 'shop';
    persist();
    render();
  }

  function leaveRound(screen) {
    closeModal();
    state.currentRound = null;
    state.answerLock = false;
    state.screen = screen || 'town';
    persist();
    render();
  }

  function beginRound(mode, areaId) {
    const area = areaId ? areaById(areaId) : currentArea();
    if (area && !isAreaUnlocked(area)) {
      showModal({ title: 'Area locked', body: '<p>Defeat the previous boss to unlock this area.</p>', buttons: [{ label: 'OK', action: 'close-modal' }] });
      return;
    }

    state.areaId = area?.id || 'meadow';
    state.answerLock = false;

    if (mode === 'boss') {
      state.currentRound = {
        mode: 'boss',
        areaId: area.id,
        index: 0,
        total: 99,
        correct: 0,
        wrong: 0,
        streak: 0,
        coins: 0,
        xp: 0,
        shieldAvailable: state.hero.classId === 'knight',
        lastFactKey: null,
        boss: {
          id: area.boss.id,
          label: area.boss.label,
          hp: area.boss.hp,
          maxHp: area.boss.hp,
          asset: area.boss.asset
        }
      };
      state.screen = 'boss';
    } else {
      state.currentRound = {
        mode,
        areaId: mode === 'training' ? null : area.id,
        index: 0,
        total: 10,
        correct: 0,
        wrong: 0,
        streak: 0,
        coins: 0,
        xp: 0,
        enemy: mode === 'training' ? null : randomFrom(area.enemies),
        lastFactKey: null
      };
      state.screen = 'battle';
    }

    state.currentRound.question = makeQuestion();
    persist();
    render();
  }

  function makeQuestion() {
    const round = state.currentRound;
    const focusFacts = round.mode === 'training' ? range(0, 10) : areaById(round.areaId).focusFacts;
    const weak = MASTERY.weakFacts(state.mastery, focusFacts).slice(0, 18);
    let a;
    let b;

    if (weak.length && Math.random() < 0.55) {
      const picked = randomFrom(weak);
      a = picked.a;
      b = picked.b;
    } else if (Math.random() < 0.5) {
      a = randomFrom(focusFacts);
      b = Math.floor(Math.random() * 11);
    } else {
      a = Math.floor(Math.random() * 11);
      b = randomFrom(focusFacts);
    }

    if (`${a}-${b}` === round.lastFactKey && focusFacts.length > 1) {
      b = (b + 1 + Math.floor(Math.random() * 9)) % 11;
    }

    round.lastFactKey = `${a}-${b}`;
    const correct = a * b;
    const choices = buildChoices(correct);
    return { a, b, correct, choices, hiddenChoices: [] };
  }

  function buildChoices(correct) {
    const choices = new Set([correct]);
    const offsets = [-12, -10, -8, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 8, 10, 12];
    while (choices.size < 4) {
      const candidate = correct + randomFrom(offsets);
      if (candidate >= 0 && candidate <= 120) choices.add(candidate);
      if (choices.size < 4) choices.add(Math.floor(Math.random() * 121));
    }
    return shuffle([...choices]);
  }

  function handleAnswer(choiceIndex) {
    if (state.answerLock || !state.currentRound?.question) return;
    const round = state.currentRound;
    const q = round.question;
    const chosen = q.choices[choiceIndex];
    const isCorrect = chosen === q.correct;

    state.answerLock = true;
    state.stats.factsAnswered += 1;
    if (isCorrect) state.stats.correctAnswers += 1;
    MASTERY.recordFact(state.mastery, q.a, q.b, isCorrect);

    if (isCorrect) {
      round.correct += 1;
      round.streak += 1;
      state.stats.bestStreak = Math.max(state.stats.bestStreak, round.streak);
      const streakBonus = state.hero.classId === 'archer' && round.streak % 3 === 0 ? 2 : 0;
      const coins = 2 + streakBonus;
      const xp = 3;
      round.coins += coins;
      round.xp += xp;
      state.coins += coins;
      awardXP(xp);
      if (round.mode === 'boss') round.boss.hp -= Math.max(1, getStats().attack);
      state.coachKey = 'correct';
      persist();
      render();
      showCorrectPopup(q, round.mode === 'boss' && round.boss.hp <= 0);
      return;
    }

    round.wrong += 1;
    round.streak = 0;
    state.coachKey = 'wrong';
    applyWrongDamage(round);
    persist();
    render();
    showWrongPopup(q);
  }

  function applyWrongDamage(round) {
    if (round.mode === 'boss' && round.shieldAvailable) {
      round.shieldAvailable = false;
      state.coachKey = 'shieldBlock';
      return;
    }
    state.hp = Math.max(0, state.hp - 1);
  }

  function showCorrectPopup(question, bossDefeated) {
    clearTimeout(modalTimer);
    const message = bossDefeated
      ? 'Correct! Great work — that hit defeated the boss.'
      : 'Correct! Great work. Get ready for the next fact.';

    modalRoot.innerHTML = `
      <div class="modal-backdrop blocking answer-result-modal correct-modal" role="dialog" aria-modal="true" aria-label="Correct answer">
        <div class="modal-card correct-card">
          <div class="success-mark">✓</div>
          <h2>Correct!</h2>
          <p>${escapeHTML(message)}</p>
          <div class="equation-chip">${question.a} × ${question.b} = ${question.correct}</div>
        </div>
      </div>
    `;

    modalTimer = setTimeout(() => {
      modalRoot.innerHTML = '';
      continueAfterCorrect();
    }, AUTO_ADVANCE_MS);
  }

  function showWrongPopup(question) {
    const defeated = state.hp <= 0;
    const body = `
      <p>Not quite. Study the correct answer before the next question.</p>
      <div class="correction-box">${question.a} × ${question.b} = <strong>${question.correct}</strong></div>
      ${defeated ? '<p>Your HP reached 0. You will return to Town after this correction.</p>' : ''}
    `;
    showModal({
      title: 'Not quite',
      body,
      extraClass: 'wrong-card',
      buttons: [{ label: defeated ? 'Return to Town' : 'Next Question', action: 'continue-wrong', primary: true }],
      blocking: true
    });
  }

  function continueAfterCorrect() {
    if (!state.currentRound) return;
    state.answerLock = false;
    advanceQuestion();
  }

  function continueAfterWrong() {
    closeModal();
    if (!state.currentRound) return;
    state.answerLock = false;
    if (state.hp <= 0) {
      finishRound('defeat');
      return;
    }
    advanceQuestion();
  }

  function advanceQuestion() {
    const round = state.currentRound;
    if (!round) return;

    if (round.mode === 'boss' && round.boss.hp <= 0) {
      finishRound('bossVictory');
      return;
    }

    if (round.mode !== 'boss' && round.index + 1 >= round.total) {
      finishRound('complete');
      return;
    }

    round.index += 1;
    round.question = makeQuestion();
    persist();
    render();
  }

  function finishRound(kind) {
    const round = state.currentRound;
    if (!round) return;
    const total = Math.max(1, round.correct + round.wrong);
    const accuracy = Math.round((round.correct / total) * 100);
    let title = 'Round Complete';
    let message = 'Great effort. Check your mastery board to see what improved.';

    if (kind === 'bossVictory') {
      const area = areaById(round.areaId);
      if (!state.defeatedBosses.includes(area.boss.id)) state.defeatedBosses.push(area.boss.id);
      state.hp = maxHp();
      state.coins += area.reward.coins;
      awardXP(area.reward.xp);
      round.coins += area.reward.coins;
      round.xp += area.reward.xp;
      title = `${area.boss.label} Defeated!`;
      message = 'Boss defeated. HP restored. The next area is unlocked if one remains.';
      state.coachKey = 'bossReady';
    } else if (kind === 'defeat') {
      title = 'Return to Town';
      message = 'Your HP reached 0. Rest in Town or use potions before the next challenge.';
      state.coachKey = 'lowHp';
    } else {
      state.coachKey = 'mastery';
    }

    state.lastSummary = {
      title,
      message,
      correct: round.correct,
      total,
      accuracy,
      coins: round.coins,
      xp: round.xp
    };
    state.currentRound = null;
    state.answerLock = false;
    state.screen = 'summary';
    persist();
    render();
  }

  function showModal({ title, body, buttons = [], extraClass = '', blocking = true }) {
    clearTimeout(modalTimer);
    const renderedButtons = buttons.map((button) => {
      const dataAttrs = Object.entries(button)
        .filter(([key]) => !['label', 'primary', 'extraClass', 'disabled'].includes(key))
        .map(([key, value]) => `data-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}="${escapeHTML(value)}"`)
        .join(' ');
      const classes = `${button.primary ? 'primary-btn' : ''} ${button.extraClass || ''}`.trim();
      return `<button class="${classes}" ${dataAttrs} ${button.disabled ? 'disabled' : ''}>${escapeHTML(button.label)}</button>`;
    }).join('');

    modalRoot.innerHTML = `
      <div class="modal-backdrop ${blocking ? 'blocking' : ''}" role="dialog" aria-modal="true">
        <div class="modal-card ${extraClass}">
          <h2>${escapeHTML(title)}</h2>
          <div class="modal-body">${body}</div>
          <div class="modal-actions">${renderedButtons || '<button data-action="close-modal">Close</button>'}</div>
        </div>
      </div>
    `;
  }

  function closeModal() {
    clearTimeout(modalTimer);
    modalRoot.innerHTML = '';
  }

  function useAbility() {
    if (!canUseAbility()) return;
    const q = state.currentRound.question;
    const wrongIndexes = q.choices
      .map((choice, index) => ({ choice, index }))
      .filter(item => item.choice !== q.correct)
      .map(item => item.index);
    q.hiddenChoices = shuffle(wrongIndexes).slice(0, 2);
    state.mana = Math.max(0, state.mana - 1);
    persist();
    render();
  }

  function buyItem(itemId) {
    const item = itemById(itemId);
    if (!item) return;
    if (isRoundActive()) {
      state.coachKey = 'potionBlocked';
      showModal({ title: 'Buying blocked', body: '<p>Items can only be bought in Town or Shop. You can still use potions you already own.</p>', buttons: [{ label: 'OK', action: 'close-modal' }] });
      persist();
      render();
      return;
    }
    if (state.coins < item.cost) return;
    state.coins -= item.cost;
    state.inventory[item.id] = (state.inventory[item.id] || 0) + 1;
    state.coachKey = 'shop';
    persist();
    render();
  }

  function toggleEquip(itemId) {
    const item = itemById(itemId);
    if (!item || !state.inventory[item.id]) return;
    if (state.equipped[item.slot] === item.id) {
      state.equipped[item.slot] = null;
    } else {
      state.equipped[item.slot] = item.id;
    }
    state.hp = clamp(state.hp, 0, maxHp());
    state.mana = clamp(state.mana, 0, maxMana());
    persist();
    render();
  }

  function rest() {
    if (state.coins < 10) {
      showModal({ title: 'Not enough coins', body: '<p>Rest costs 10 coins.</p>', buttons: [{ label: 'OK', action: 'close-modal' }] });
      return;
    }
    state.coins -= 10;
    state.hp = maxHp();
    state.mana = maxMana();
    state.coachKey = 'welcome';
    persist();
    render();
  }

  function claimQuest(questId) {
    const quest = DATA.QUESTS.find(item => item.id === questId);
    const saved = state.quests.find(item => item.id === questId);
    if (!quest || !saved || saved.claimed || questProgress(quest) < quest.target) return;
    saved.claimed = true;
    if (quest.reward.coins) state.coins += quest.reward.coins;
    if (quest.reward.xp) awardXP(quest.reward.xp);
    persist();
    render();
  }

  function openInventory() {
    const equipmentRows = ['weapon', 'head', 'body', 'legs', 'frame', 'aura'].map((slot) => {
      const item = itemById(state.equipped[slot]);
      return `<div class="inventory-row"><strong>${slot.toUpperCase()}</strong><span>${item ? escapeHTML(item.label) : 'Empty'}</span></div>`;
    }).join('');
    const ownedRows = Object.entries(state.inventory)
      .filter(([, count]) => count > 0)
      .map(([itemId, count]) => {
        const item = itemById(itemId);
        if (!item) return '';
        return `<div class="inventory-row"><strong>${escapeHTML(item.label)}</strong><span>×${count}</span></div>`;
      }).join('') || '<p>No owned items yet.</p>';
    showModal({
      title: 'Inventory',
      body: `<div class="inventory-list"><h3>Equipped</h3>${equipmentRows}<h3>Owned</h3>${ownedRows}</div>`,
      buttons: [{ label: 'Close', action: 'close-modal', primary: true }]
    });
  }

  function openItems() {
    const potionRows = ['hp-potion', 'mana-potion'].map((id) => {
      const item = itemById(id);
      const count = state.inventory[id] || 0;
      return `
        <div class="inventory-row item-use-row">
          <strong>${escapeHTML(item.label)}</strong>
          <span>Owned ×${count}</span>
          <button data-action="use-potion" data-item="${id}" ${count > 0 ? '' : 'disabled'}>Use</button>
        </div>
      `;
    }).join('');
    showModal({
      title: 'Items',
      body: `<p>Owned potions can be used during battle. Buying is only available in Town/Shop.</p><div class="inventory-list">${potionRows}</div>`,
      buttons: [{ label: 'Close', action: 'close-modal', primary: true }]
    });
  }

  function usePotion(itemId) {
    const item = itemById(itemId);
    if (!item || !state.inventory[itemId]) return;
    let used = false;
    if (item.effect?.hp && state.hp < maxHp()) {
      state.hp = Math.min(maxHp(), state.hp + item.effect.hp);
      used = true;
    }
    if (item.effect?.mana && state.mana < maxMana()) {
      state.mana = Math.min(maxMana(), state.mana + item.effect.mana);
      used = true;
    }
    if (!used) {
      showModal({ title: 'Item not needed', body: '<p>Your hero is already full for this item.</p>', buttons: [{ label: 'OK', action: 'open-items', primary: true }] });
      return;
    }
    state.inventory[itemId] -= 1;
    closeModal();
    persist();
    render();
  }

  function openAbility() {
    const cls = heroClass();
    showModal({
      title: cls.ability.name,
      body: `<p>${escapeHTML(cls.ability.summary)}</p><p>Stats: Attack ${getStats().attack}, Defense ${getStats().defense}, Speed ${getStats().speed}, Focus ${getStats().focus}</p>`,
      buttons: [{ label: 'Close', action: 'close-modal', primary: true }]
    });
  }

  function resetGame() {
    STORAGE.clearSave();
    state = createDefaultState();
    closeModal();
    render();
  }

  function confirmReset() {
    showModal({
      title: 'Reset game?',
      body: '<p>This clears saved progress on this device/browser.</p>',
      buttons: [
        { label: 'Cancel', action: 'close-modal' },
        { label: 'Reset', action: 'reset-game', extraClass: 'danger-btn' }
      ]
    });
  }

  function handleClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;

    if (state.answerLock && !['continue-wrong', 'close-modal'].includes(action)) return;

    if (action === 'select-class') {
      state.selectedClass = button.dataset.class;
      render();
    } else if (action === 'select-gender') {
      state.selectedGender = button.dataset.gender;
      render();
    } else if (action === 'randomize-name') {
      const input = document.getElementById('heroNameInput');
      if (input) input.value = selectedDefaultName();
    } else if (action === 'start-game') {
      startGame();
    } else if (action === 'goto') {
      gotoScreen(button.dataset.screen);
    } else if (action === 'leave-round') {
      leaveRound(button.dataset.screen);
    } else if (action === 'start-area') {
      beginRound('adventure', button.dataset.area);
    } else if (action === 'start-boss') {
      beginRound('boss', button.dataset.area);
    } else if (action === 'start-training') {
      beginRound('training', state.areaId);
    } else if (action === 'answer') {
      handleAnswer(Number(button.dataset.index));
    } else if (action === 'continue-wrong') {
      continueAfterWrong();
    } else if (action === 'use-ability') {
      useAbility();
    } else if (action === 'shop-category') {
      state.shopCategory = button.dataset.category;
      state.coachKey = 'shop';
      persist();
      render();
    } else if (action === 'preview-item') {
      previewItem(button.dataset.item);
    } else if (action === 'preview-buy-item') {
      buyItem(button.dataset.item);
      if (!isRoundActive()) previewItem(button.dataset.item);
    } else if (action === 'preview-toggle-equip') {
      toggleEquip(button.dataset.item);
      previewItem(button.dataset.item);
    } else if (action === 'buy-item') {
      buyItem(button.dataset.item);
    } else if (action === 'toggle-equip') {
      toggleEquip(button.dataset.item);
    } else if (action === 'rest') {
      rest();
    } else if (action === 'claim-quest') {
      claimQuest(button.dataset.quest);
    } else if (action === 'open-inventory') {
      openInventory();
    } else if (action === 'open-items') {
      openItems();
    } else if (action === 'open-ability') {
      openAbility();
    } else if (action === 'use-potion') {
      usePotion(button.dataset.item);
    } else if (action === 'save-now') {
      persist();
      showModal({ title: 'Saved', body: '<p>Your progress was saved on this browser/device.</p>', buttons: [{ label: 'OK', action: 'close-modal', primary: true }] });
    } else if (action === 'confirm-reset') {
      confirmReset();
    } else if (action === 'reset-game') {
      resetGame();
    } else if (action === 'close-modal') {
      closeModal();
    }
  }

  document.addEventListener('click', handleClick);
  window.addEventListener('beforeunload', persist);

  if (!state.hero) state.screen = 'select';
  state.hp = clamp(state.hp, 0, maxHp());
  state.mana = clamp(state.mana, 0, maxMana());
  render();
}());
