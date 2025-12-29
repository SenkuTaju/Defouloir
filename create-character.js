function toggleNPC() {
  const isNPC = document.getElementById("isNPC").checked;
  document.querySelectorAll("#saves input, #skills input")
    .forEach(i => i.disabled = isNPC);
}

function getChecked(containerId) {
  return [...document.querySelectorAll(`#${containerId} input:checked`)]
    .map(i => i.value);
}

function createCharacter() {
  const charNameEl = document.getElementById("charName");
  if (!charNameEl) return alert("Impossible de trouver le champ Nom");

  const name = charNameEl.value.trim();
  if (!name) return alert("Nom requis");

  const forEl = document.getElementById("for");
  const dexEl = document.getElementById("dex");
  const conEl = document.getElementById("con");
  const intEl = document.getElementById("int");
  const sagEl = document.getElementById("sag");
  const chaEl = document.getElementById("cha");

  if (!forEl || !dexEl || !conEl || !intEl || !sagEl || !chaEl) {
    return alert("Impossible de trouver les champs de caractéristiques");
  }

  const character = {
    name,
    isNPC: document.getElementById("isNPC").checked,

    stats: {
      force: +forEl.value,
      dexterite: +dexEl.value,
      constitution: +conEl.value,
      intelligence: +intEl.value,
      sagesse: +sagEl.value,
      charisme: +chaEl.value
    },

    saves: getChecked("saves"),
    skills: getChecked("skills"),

    proficiencyBonus: +document.getElementById("prof").value,
    armorClass: +document.getElementById("ca").value,
    speed: +document.getElementById("speed").value,
    hitDice: document.getElementById("hitDice").value,
    passivePerception: +document.getElementById("ppassive").value,

    money: {
      pc: +document.getElementById("pc").value || 0,
      pa: +document.getElementById("pa").value || 0,
      po: +document.getElementById("po").value || 0,
      pe: +document.getElementById("pe").value || 0,
      pp: +document.getElementById("pp").value || 0
    },

    spells: [],
    items: []
  };

  const characters = JSON.parse(localStorage.getItem("characters") || "{}");
  characters[name] = character;
  localStorage.setItem("characters", JSON.stringify(characters));

  alert("Personnage créé !");
  window.location.href = "dnd.html";
}

