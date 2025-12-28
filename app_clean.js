// Clean app for DnD page: per-character data, items with qty/weight, capacity and max HP
const $ = id => document.getElementById(id);

let characters = JSON.parse(localStorage.getItem("characters") || "{}");
let currentChar = null;
let items = JSON.parse(localStorage.getItem("items") || "[]");
if (Array.isArray(items) && items.length && typeof items[0] === 'string') items = items.map(s => ({ name: s, qty: 1, weight: 1 }));

function saveItems() { if (currentChar) { characters[currentChar] = characters[currentChar] || {}; characters[currentChar].items = items; localStorage.setItem('characters', JSON.stringify(characters)); localStorage.removeItem('items'); } else { localStorage.setItem('items', JSON.stringify(items)); } }
function totalWeight() { return items.reduce((sum, it) => sum + (Number(it.qty) * Number(it.weight || 0)), 0); }
function getCapacity() { if (currentChar && characters[currentChar] && typeof characters[currentChar].carryCapacity !== 'undefined') return Number(characters[currentChar].carryCapacity) || 0; const el = $('carryCapacity'); if (el) return Number(el.value) || 0; return Number(localStorage.getItem('carryCapacity')) || 0; }

function addItem() {
  const nameEl = $('item'); const qtyEl = $('itemQty'); const weightEl = $('itemWeight');
  if (!nameEl) return; const name = nameEl.value.trim(); const qty = qtyEl ? Math.max(1, parseInt(qtyEl.value) || 1) : 1; const weight = weightEl ? Math.max(0, parseFloat(weightEl.value) || 0) : 0; if (!name) return;
  const idx = items.findIndex(it => it.name.toLowerCase() === name.toLowerCase()); const capacity = getCapacity() || Infinity; const current = totalWeight(); const added = qty * weight; if (current + added > capacity) { alert('Dépasse la capacité de charge'); return; }
  if (idx >= 0) items[idx].qty = Number(items[idx].qty) + qty; else items.push({ name, qty, weight });
  saveItems(); renderItems(); nameEl.value = ''; if (qtyEl) qtyEl.value = 1; if (weightEl) weightEl.value = 1;
}
function changeQty(i, delta) { const it = items[i]; if (!it) return; const newQty = Number(it.qty) + Number(delta); if (newQty <= 0) { removeItem(i); return; } if (delta > 0) { const cap = getCapacity() || Infinity; if (totalWeight() + (delta * it.weight) > cap) { alert('Dépasse la capacité de charge'); return; } } items[i].qty = newQty; saveItems(); renderItems(); }
function removeItem(i) { items.splice(i,1); saveItems(); renderItems(); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function renderItems() { const ul = $('items'); if (!ul) return; ul.innerHTML=''; items.forEach((it, idx) => { const li = document.createElement('li'); li.innerHTML = `${escapeHtml(it.name)} × ${it.qty} — ${it.weight} each — ${(it.qty*it.weight).toFixed(2)} kg ` + `<button onclick="changeQty(${idx},-1)">-</button> <button onclick="changeQty(${idx},1)">+</button> <button onclick="removeItem(${idx})">Suppr</button>`; ul.appendChild(li); }); const el = $('totalWeight'); if (el) el.textContent = totalWeight().toFixed(2); }

function saveCharacter() { const nameEl = $('charName'); const hpEl = $('hp'); const maxEl = $('maxHp'); const capEl = $('carryCapacity'); const name = nameEl ? nameEl.value.trim() : ''; if (!name) return alert('Nom requis'); characters[name] = characters[name] || {}; if (hpEl) characters[name].hp = hpEl.value; if (maxEl) characters[name].maxHp = maxEl.value; if (capEl) characters[name].carryCapacity = capEl.value; characters[name].items = items; localStorage.setItem('characters', JSON.stringify(characters)); currentChar = name; localStorage.removeItem('items'); renderCharacters(); }
function renderCharacters() { const sel = $('characterSelect'); if (!sel) return; sel.innerHTML=''; Object.keys(characters).forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o); }); if (!currentChar && sel.options.length) { currentChar = sel.options[0].value; loadCharacter(); } }
function loadCharacter() { const sel = $('characterSelect'); if (!sel) return; const name = sel.value; currentChar = name; const nameEl = $('charName'); const hpEl = $('hp'); const maxEl = $('maxHp'); const capEl = $('carryCapacity'); if (nameEl) nameEl.value = name; if (hpEl) hpEl.value = (characters[name] && characters[name].hp) || ''; if (maxEl) maxEl.value = (characters[name] && characters[name].maxHp) || ''; items = (characters[name] && Array.isArray(characters[name].items)) ? characters[name].items : []; if (capEl) capEl.value = (characters[name] && characters[name].carryCapacity) || capEl.value; renderItems(); }
function saveHP() { const hpEl = $('hp'); const maxEl = $('maxHp'); if (!currentChar) { alert('Aucun personnage sélectionné'); return; } characters[currentChar] = characters[currentChar] || {}; if (hpEl) characters[currentChar].hp = hpEl.value; if (maxEl) characters[currentChar].maxHp = maxEl.value; localStorage.setItem('characters', JSON.stringify(characters)); alert('PV sauvegardés pour ' + currentChar); }

document.addEventListener('DOMContentLoaded', () => { renderCharacters(); const capEl = $('carryCapacity'); if (capEl) { const stored = localStorage.getItem('carryCapacity'); if (stored) capEl.value = stored; capEl.addEventListener('change', () => { if (currentChar) { characters[currentChar] = characters[currentChar] || {}; characters[currentChar].carryCapacity = capEl.value; localStorage.setItem('characters', JSON.stringify(characters)); } else { localStorage.setItem('carryCapacity', capEl.value); } renderItems(); }); } renderItems(); });