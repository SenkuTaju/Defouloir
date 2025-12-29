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
  const name = document.getElementById("charName").value.trim();
  if (!name) return alert("Nom requis");

  const character = {
    name,
    isNPC: document.getElementById("isNPC").checked,

    stats: {
      force: + fo.value,
      dexterite: +dex.value,
      constitution: +con.value,
      intelligence: +int.value,
      sagesse: +sag.value,
      charisme: +cha.value
    },

    saves: getChecked("saves"),
    skills: getChecked("skills"),

    proficiencyBonus: +prof.value,
    armorClass: +ca.value,
    speed: +speed.value,
    hitDice: hitDice.value,
    passivePerception: +ppassive.value,

    money: {
      pc: +pc.value,
      pa: +pa.value,
      po: +po.value,
      pe: +pe.value,
      pp: +pp.value
    },

    spells: [],
    items: []
  };

  const characters = JSON.parse(localStorage.getItem("characters") || "{}");
  characters[name] = character;
  localStorage.setItem("characters", JSON.stringify(characters));

  alert("Personnage créé !");
  window.location.href = "index.html";
}
