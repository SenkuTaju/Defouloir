// app.js — version fusionnée

const $ = id => document.getElementById(id);

/* =========================
   STATE
========================= */
let characters = JSON.parse(localStorage.getItem('characters') || '{}');
let currentChar = null;
let items = [];

/* =========================
   LOCK / PIN
========================= */
function initLockScreen() {
  const lock = $('lock');
  if (!lock) return;

  if (!localStorage.getItem('pin')) {
    lock.innerHTML = `
      <h1>Grimoire & Pantoufles</h1>
      <p>Crée ton code secret</p>
      <input type="password" id="newPin" placeholder="Nouveau PIN">
      <button onclick="createPin()">Créer</button>
    `;
  } else {
    lock.innerHTML = `
      <h1>Grimoire & Pantoufles</h1>
      <p>Accès sécurisé</p>
      <input type="password" id="pin" placeholder="Code secret">
      <button onclick="unlock()">Déverrouiller</button>
    `;
  }
}

function createPin() {
  const pin = $('newPin').value;
  if (!pin || pin.length < 4) return alert('PIN min. 4 chiffres');
  localStorage.setItem('pin', pin);
  location.reload();
}

function unlock() {
  if ($('pin').value === localStorage.getItem('pin')) openApp();
  else alert('Code incorrect');
}

function openApp() {
  $('lock')?.classList.add('hidden');
  $('app')?.classList.remove('hidden');
}

/* =========================
   NAV
========================= */
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
  $(id)?.classList.remove('hidden');
}
function gotoo(path) { window.location.href = path; }

/* =========================
   JOURNAL
========================= */
function saveText() {
  const t = $('text');
  if (t) localStorage.setItem('journal', t.value);
}

/* =========================
   CHARACTER CREATION
========================= */
function toggleNPC() {
  const isNPC = $('isNPC')?.checked;
  document.querySelectorAll("#saves input, #skills input")
    .forEach(i => i.disabled = isNPC);
}

function getChecked(containerId) {
  return [...document.querySelectorAll(`#${containerId} input:checked`)]
    .map(i => i.value);
}

function createCharacter() {
  const name = $('charName')?.value.trim();
  if (!name) return alert("Nom requis");

  const stats = {
    force: +$('for').value,
    dexterite: +$('dex').value,
    constitution: +$('con').value,
    intelligence: +$('int').value,
    sagesse: +$('sag').value,
    charisme: +$('cha').value
  };

  const character = {
    name,
    isNPC: $('isNPC')?.checked || false,
    stats,
    saves: getChecked("saves"),
    skills: getChecked("skills"),
    proficiencyBonus: +$('prof')?.value || 2,
    armorClass: +$('ca')?.value || 10,
    speed: +$('speed')?.value || 9,
    hitDice: $('hitDice')?.value || "1d8",
    passivePerception: +$('ppassive')?.value || 0,
    money: {
      pc: +$('pc')?.value || 0,
      pa: +$('pa')?.value || 0,
      po: +$('po')?.value || 0,
      pe: +$('pe')?.value || 0,
      pp: +$('pp')?.value || 0
    },
    items: [],
    spells: []
  };

  characters[name] = character;
  localStorage.setItem("characters", JSON.stringify(characters));

  alert("Personnage créé !");
  window.location.href = "dnd.html";
}

/* =========================
   CHARACTERS MANAGEMENT
========================= */
function getCurrentCharacter() {
  if (!currentChar) return null;
  characters[currentChar] = characters[currentChar] || { items: [] };
  return characters[currentChar];
}

function renderCharacters() {
  const sel = $('characterSelect');
  if (!sel) return;

  sel.innerHTML = '';
  Object.keys(characters).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });

  if (!currentChar && sel.options.length) currentChar = sel.options[0]?.value;
  sel.value = currentChar || '';
  loadCharacter();
}

function saveCharacter() {
  if (!currentChar) return;
  const c = getCurrentCharacter();
  c.hp = $('hp')?.value || '';
  c.maxHp = $('maxHp')?.value || '';
  c.carryCapacity = $('carryCapacity')?.value || '';
  c.items = items;
  localStorage.setItem('characters', JSON.stringify(characters));
  renderCharacters();
}

function loadCharacter() {
  const sel = $('characterSelect');
  if (!sel || !sel.value) return;

  currentChar = sel.value;
  const c = getCurrentCharacter();

  $('charName').value = currentChar;
  $('hp').value = c.hp || '';
  $('maxHp').value = c.maxHp || '';
  $('carryCapacity').value = c.carryCapacity || 100;

  items = Array.isArray(c.items) ? c.items : [];
  renderItems();
  renderMoney();
}

/* =========================
   INVENTORY
========================= */
function totalWeight() { return items.reduce((s,it)=>s+it.qty*it.weight,0); }

function addItem() {
  const name = $('item')?.value.trim();
  const qty = Number($('itemQty')?.value || 1);
  const weight = Number($('itemWeight')?.value || 0);
  if (!name) return;

  const cap = Number($('carryCapacity')?.value || Infinity);
  if (totalWeight() + qty*weight > cap) return alert('Charge max dépassée');

  const existing = items.find(i => i.name.toLowerCase() === name.toLowerCase());
  if (existing) existing.qty += qty;
  else items.push({name, qty, weight});

  saveItems();
  renderItems();
  $('item').value = '';
  $('itemQty') && ($('itemQty').value = 1);
  $('itemWeight') && ($('itemWeight').value = 1);
}

function changeQty(i,d) {
  const it = items[i];
  if (!it) return;
  if (d>0 && totalWeight() + it.weight > Number($('carryCapacity')?.value || Infinity)) return alert('Charge max dépassée');
  it.qty += d;
  if(it.qty<=0) items.splice(i,1);
  saveItems();
  renderItems();
}

function removeItem(i){ items.splice(i,1); saveItems(); renderItems(); }
function saveItems(){ const c = getCurrentCharacter(); if(!c) return; c.items=items; localStorage.setItem('characters',JSON.stringify(characters)); }
function renderItems(){ const ul=$('items'); if(!ul) return; ul.innerHTML=''; items.forEach((it,i)=>{ const li=document.createElement('li'); li.innerHTML = `${it.name} × ${it.qty} (${it.weight}kg) <button onclick="changeQty(${i},-1)">-</button> <button onclick="changeQty(${i},1)">+</button> <button onclick="removeItem(${i})">✖</button>`; ul.appendChild(li); }); $('totalWeight') && ($('totalWeight').textContent = totalWeight().toFixed(2)); }

/* =========================
   MONEY
========================= */
function renderMoney() {
  const c = getCurrentCharacter();
  if(!c) return;
  c.money = c.money || {pc:0,pa:0,po:0,pe:0,pp:0};
  ['pc','pa','po','pe','pp'].forEach(k=>{
    const el = $(k+'Val');
    if(el) el.textContent = c.money[k] || 0;
  });
}

function changeMoney(type,delta){
  const c = getCurrentCharacter();
  if(!c) return;
  c.money = c.money || {pc:0,pa:0,po:0,pe:0,pp:0};
  c.money[type] = Math.max(0,(c.money[type]||0)+delta);
  localStorage.setItem('characters',JSON.stringify(characters));
  renderMoney();
}

/* =========================
   INIT
========================= */
window.addEventListener('DOMContentLoaded',()=>{
  initLockScreen();
  const t = $('text'); if(t) t.value = localStorage.getItem('journal')||'';
  renderCharacters();
  renderItems();
  renderMoney();
});
