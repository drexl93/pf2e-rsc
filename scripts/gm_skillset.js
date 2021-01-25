// Macro for the GM to run to set the DC and number of successes for the skill challenge
// Can pick from a set of published combos (based off Locks) or create a custom one

if (!token) {
  ui.notifications.error("Please select a token.")
  return;
}

if (canvas.tokens.controlled.length > 1) {
  ui.notifications.error("Please select only one token.")
  return;
}

let presets = {
  poor: {DC: 15, successes: 2},
  simple: {DC: 20, successes: 3},
  average: {DC: 25, successes: 4},
  good: {DC: 30, successes: 5},
  superior: {DC: 40, successes: 6}
}

let skillRefs = {
  Acrobatics: "acr",
  Arcana: "arc",
  Athletics: "ath",
  Crafting: "cra",
  Deception: "dec",
  Diplomacy: "dip",
  Intimidation: "itm",
  Medicine: "med",
  Nature: "nat",
  Occultism: "occ",
  Performance: "prf",
  Religion: "rel",
  Society: "soc",
  Stealth: "ste",
  Survival: "sur",
  Thievery: "thi",
};

let content = "";
let content2 = "";
let skill;

content += `<div id="pf2e-rsc-preset"><label for="preset">Pick a preset: </label>
<select name="preset" id="preset">
  <option value="custom">Custom</option>
  <option value="poor">DC 15/2 successes</option>
  <option value="simple">DC 20/3 successes</option>
  <option value="average">DC 25/4 successes</option>
  <option value="good">DC 30/5 successes</option>
  <option value="superior">DC 40/6 successes</option>
</select></div>
<div id="pf2e-rsc-chooseskill"><label for="skill">Choose a skill: </label>
<select name="skill" id="skill">`
  for (let i = 0; i < Object.keys(skillRefs).length; i++) {
    content += `<option value="${skillRefs[Object.keys(skillRefs)[i]]}">${Object.keys(skillRefs)[i]}</option>`
  }
content += `</select></div>`

content2 += `<form id="pf2e-rsc-gm_skillset-content2"><p><label for="pf2e-rsc-customDC">DC: </label>
<input type="text" id="pf2e-rsc-customDC" name="pf2e-rsc-customDC"></p>

<p><label for="successes">Required Successes: </label>
<input type="text" id="successes" name="successes"></p></form>`

let dialog = new Dialog({
  title: "Skill Challenge",
  content: content,
  buttons: {
    pick: {
      icon: "<i class='fas fa-check'></i>",
      label: "Select",
      callback: (html) => {
        skill = (html.find('#skill')[0].value)
        let preset = (html.find('#preset')[0].value)
          if (preset === "custom") {
              custom.options.width = 125
              custom.position.width = 125
              custom.render(true);
          } else {
              game.socket.emit('module.pf2e-rsc', {
                  operation: 'playerSkillChallenge',
                  actor,
                  neededSuccesses: presets[preset].successes,
                  DC: presets[preset].DC, 
                  mod: actor.data.data.skills[skill].value
              });
          }
      }
    },
  }
})
dialog.options.width = 125
dialog.position.width = 125
dialog.render(true);

let custom = new Dialog({
  title: "Custom Challenge",
  content: content2,
  buttons: {
    select: {
      icon: "<i class='fas fa-check'></i>",
      label: "Select",
      callback: (html) => {
          let neededSuccesses = parseInt(html.find('#successes')[0].value)
          let DC = parseInt(html.find('#pf2e-rsc-customDC')[0].value)
          game.socket.emit('module.pf2e-rsc', {
              operation: 'playerSkillChallenge',
              actor,
              neededSuccesses,
              DC,
              mod: actor.data.data.skills[skill].value
          });
      }
    },
  }
})