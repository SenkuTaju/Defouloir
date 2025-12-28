// Single-file clean app.js

// Helper to select element by id
const $ = id => document.getElementById(id);

// State
let characters = JSON.parse(localStorage.getItem('characters') || '{}');
let currentChar = null;
let items = JSON.parse(localStorage.getItem('items') || '[]');
// Migrate legacy array-of-strings format
if (Array.isArray(items) && items.length && typeof items[0] === 'string') {
  items = items.map(s => ({ name: s, qty: 1, weight: 1 }));
}

// ---------- Lock screen / PIN / Biometry ----------
function initLockScreen() {
  const lock = $('lock');
  if (!lock) return;
  if (!localStorage.getItem('pin')) {
    lock.innerHTML = `
      <h1>Grimoir et Pantoufles</h1>
      <p>Crée ton code secret pour commencer</p>
      <input type="password" id="newPin" placeholder="Nouveau PIN">
      <button id="createPinBtn">Créer le PIN</button>
    `;
    const btn = $('createPinBtn'); if (btn) btn.addEventListener('click', createPin);
  } else {
    lock.innerHTML = `
      <h1>Grimoir et Pantoufles</h1>
      <p>Accès sécurisé</p>
      <input type="password" id="pin" placeholder="Code secret">
      <button id="unlockBtn">Déverrouiller</button>
      <button id="bioBtn">👆 Empreinte</button>
    `;
    const u = $('unlockBtn'); if (u) u.addEventListener('click', unlock);
    const b = $('bioBtn'); if (b) b.addEventListener('click', bioAuth);
  }
}

function createPin() {
  const v = $('newPin') ? $('newPin').value : '';
  if (!v || v.length < 4) { alert('PIN trop court (min 4 chiffres)'); return; }
  localStorage.setItem('pin', v);
  alert('PIN créé ✔');
  initLockScreen();
}

function unlock() {
  const v = $('pin') ? $('pin').value : '';
  if (v === localStorage.getItem('pin')) openApp(); else alert('Code incorrect');
}

function openApp() {
  const l = $('lock'); if (l) l.classList.add('hidden');
  const a = $('app'); if (a) a.classList.remove('hidden');
}

async function bioAuth() {
  if (!window.PublicKeyCredential) { alert('Biométrie non supportée'); return; }
  try {
    await navigator.credentials.get({ publicKey: { challenge: new Uint8Array(32), timeout: 60000, userVerification: 'required' } });
    openApp();
  } catch(e) { alert('Authentification échouée'); }
}

function changePin() {
  const oldV = $('oldPin') ? $('oldPin').value : '';
  const newV = $('newPin') ? $('newPin').value : '';
  if (oldV !== localStorage.getItem('pin')) { alert('Ancien PIN incorrect'); return; }
  if (!newV || newV.length < 4) { alert('PIN trop court'); return; }
  localStorage.setItem('pin', newV);
  alert('PIN changé ✔');
}

// ---------- Panic (quick cover) ----------
function panic() { document.body.innerHTML = "<h1 style='color:white;text-align:center'>📱</h1>"; }

// ---------- Basic navigation helpers ----------
function showTab(tabId) { document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden')); const el = document.getElementById(tabId); if (el) el.classList.remove('hidden'); }
function gotoo(path) { window.location.href = path; }

// ---------- Journal ----------
function saveText() { const t = $('text'); if (t) localStorage.setItem('journal', t.value); }

// ---------- Inventory (qty & weight) ----------
function persistItems() {
  if (currentChar) {
    characters[currentChar] = characters[currentChar] || {};
    characters[currentChar].items = items;
    localStorage.setItem('characters', JSON.stringify(characters));
    localStorage.removeItem('items');
  } else {
    localStorage.setItem('items', JSON.stringify(items));
  }
}

function totalWeight() { return items.reduce((s, it) => s + (Number(it.qty) * Number(it.weight || 0)), 0); }

function getCapacity() {
  if (currentChar && characters[currentChar] && typeof characters[currentChar].carryCapacity !== 'undefined') return Number(characters[currentChar].carryCapacity) || 0;
  const el = $('carryCapacity'); if (el) return Number(el.value) || 0;
  return Number(localStorage.getItem('carryCapacity')) || 0;
}

function addItem() {
  const nameEl = $('item'); const qtyEl = $('itemQty'); const weightEl = $('itemWeight');
  if (!nameEl) return;
  const name = nameEl.value.trim();
  const qty = qtyEl ? Math.max(1, parseInt(qtyEl.value) || 1) : 1;
  const weight = weightEl ? Math.max(0, parseFloat(weightEl.value) || 0) : 0;
  if (!name) return;
  const idx = items.findIndex(it => it.name.toLowerCase() === name.toLowerCase());
  const cap = getCapacity() || Infinity;
  const current = totalWeight();
  const added = qty * weight;
  if (current + added > cap) { alert('Dépasse la capacité de charge'); return; }
  if (idx >= 0) items[idx].qty = Number(items[idx].qty) + qty; else items.push({ name, qty, weight });
  persistItems(); renderItems();
  nameEl.value = ''; if (qtyEl) qtyEl.value = 1; if (weightEl) weightEl.value = 1;
}

function changeQty(index, delta) {
  const it = items[index]; if (!it) return;
  const newQty = Number(it.qty) + Number(delta);
  if (newQty <= 0) { removeItem(index); return; }
  if (delta > 0) {
    const cap = getCapacity() || Infinity;
    if (totalWeight() + (delta * it.weight) > cap) { alert('Dépasse la capacité de charge'); return; }
  }
  items[index].qty = newQty; persistItems(); renderItems();
}

function removeItem(index) { items.splice(index, 1); persistItems(); renderItems(); }

function escapeHtml(str) { return String(str).replace(/[&<>"]'/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

function renderItems() {
  const ul = $('items'); if (!ul) return; ul.innerHTML = '';
  items.forEach((it, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `${escapeHtml(it.name)} × ${it.qty} — ${it.weight} each — total ${(it.qty*it.weight).toFixed(2)} kg ` +
      `<button onclick="changeQty(${idx},-1)">-</button> <button onclick="changeQty(${idx},1)">+</button> <button onclick="removeItem(${idx})">Suppr</button>`;
    ul.appendChild(li);
  });
  updateTotalWeight();
}

function updateTotalWeight() { const tw = $('totalWeight'); if (tw) tw.textContent = totalWeight().toFixed(2); }

// ---------- Characters & HP ----------
function renderCharacters() {
  const sel = $('characterSelect'); if (!sel) return; sel.innerHTML = '';
  Object.keys(characters).forEach(name => { const o = document.createElement('option'); o.value = name; o.textContent = name; sel.appendChild(o); });
  if (!currentChar && sel.options.length) { currentChar = sel.options[0].value; loadCharacter(); }
}

function saveCharacter() {
  const name = $('charName') ? $('charName').value.trim() : '';
  if (!name) return alert('Nom requis');
  characters[name] = characters[name] || {};
  const hpEl = $('hp'); const maxEl = $('maxHp'); const capEl = $('carryCapacity');
  if (hpEl) characters[name].hp = hpEl.value; if (maxEl) characters[name].maxHp = maxEl.value; if (capEl) characters[name].carryCapacity = capEl.value;
  characters[name].items = items;
  localStorage.setItem('characters', JSON.stringify(characters));
  currentChar = name; localStorage.removeItem('items'); renderCharacters();
}

function loadCharacter() {
  const sel = $('characterSelect'); if (!sel) return; const name = sel.value; currentChar = name;
  const nameEl = $('charName'); const hpEl = $('hp'); const maxEl = $('maxHp'); const capEl = $('carryCapacity');
  if (nameEl) nameEl.value = name;
  if (hpEl) hpEl.value = (characters[name] && characters[name].hp) || '';
  if (maxEl) maxEl.value = (characters[name] && characters[name].maxHp) || '';
  items = (characters[name] && Array.isArray(characters[name].items)) ? characters[name].items : [];
  if (capEl) capEl.value = (characters[name] && characters[name].carryCapacity) || capEl.value;
  renderItems();
}

function saveHP() {
  if (!currentChar) { alert('Aucun personnage sélectionné'); return; }
  characters[currentChar] = characters[currentChar] || {};
  const hpEl = $('hp'); const maxEl = $('maxHp');
  if (hpEl) characters[currentChar].hp = hpEl.value; if (maxEl) characters[currentChar].maxHp = maxEl.value;
  localStorage.setItem('characters', JSON.stringify(characters));
  alert('PV sauvegardés pour ' + currentChar);
}

// ---------- Init (DOM ready) ----------
window.addEventListener('DOMContentLoaded', () => {
  // lock screen
  initLockScreen();

  // journal
  const t = $('text'); if (t) t.value = localStorage.getItem('journal') || '';

  // character select change
  const sel = $('characterSelect'); if (sel) sel.addEventListener('change', loadCharacter);

  // carry capacity
  const capEl = $('carryCapacity');
  if (capEl) {
    const stored = localStorage.getItem('carryCapacity'); if (stored) capEl.value = stored;
    capEl.addEventListener('change', () => {
      if (currentChar) { characters[currentChar] = characters[currentChar] || {}; characters[currentChar].carryCapacity = capEl.value; localStorage.setItem('characters', JSON.stringify(characters)); }
      else { localStorage.setItem('carryCapacity', capEl.value); }
      renderItems();
    });
  }

  // wire buttons if present
  const addBtn = $('addItemBtn'); if (addBtn) addBtn.addEventListener('click', addItem);
  const saveCharBtn = $('saveCharacterBtn'); if (saveCharBtn) saveCharBtn.addEventListener('click', saveCharacter);
  const saveHpBtn = $('saveHpBtn'); if (saveHpBtn) saveHpBtn.addEventListener('click', saveHP);

  // initial renders
  renderCharacters(); renderItems();
});





