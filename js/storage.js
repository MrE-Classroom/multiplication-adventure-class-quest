(function () {
  'use strict';

  const SAVE_KEY = 'multiplication-adventure-class-quest-save-v34';
  const LEGACY_KEYS = [
    'multiplication-adventure-class-quest-save-v33',
    'multiplication-adventure-class-quest-save-v32',
    'multiplication-adventure-class-quest-save-v31',
    'multiplication-adventure-class-quest-save-v30',
    'multiplication-adventure-class-quest-save',
    'multiplicationAdventureSave'
  ];

  function safeParse(raw) {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Save data could not be parsed.', error);
      return null;
    }
  }

  function loadSave() {
    const current = safeParse(localStorage.getItem(SAVE_KEY));
    if (current) return current;

    for (const key of LEGACY_KEYS) {
      const legacy = safeParse(localStorage.getItem(key));
      if (legacy) return legacy;
    }
    return null;
  }

  function saveGame(state) {
    const copy = JSON.parse(JSON.stringify(state));
    delete copy.currentRound;
    delete copy.answerLock;
    delete copy.modal;
    localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
  }

  function clearSave() {
    localStorage.removeItem(SAVE_KEY);
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  }

  window.MA_STORAGE = {
    SAVE_KEY,
    loadSave,
    saveGame,
    clearSave
  };
}());
