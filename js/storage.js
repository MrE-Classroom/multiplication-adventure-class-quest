window.GameStorage = (() => {
  const KEY = 'multiplicationAdventureClassQuestRepoV9Fixed';
  function load(){ try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch(e){ return null; } }
  function save(state){ try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch(e){ return false; } }
  function clear(){ try { localStorage.removeItem(KEY); } catch(e){} }
  return { load, save, clear, KEY };
})();
