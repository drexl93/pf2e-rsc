// This function is run on the player's end, by the owner(s) of the token selected by the
// GM when the gm_skillset macro was run.
//
// You can roll each attempt one-by-one, or you can select "Autoroll" to have the script
// loop until you either achieve the required number of successes, or you critically fail
// 
// You can also combine these i.e. do a few attempts and then decide to "Autoroll" until
// completion.
//
// The 'specific bonuses' are for skill modifiers that apply only to that specific check e.g. the
// lockpicking bonus from Infiltrator Thieves' Tools. These will be persistent across attempts, 
// and for all 'Autoroll' attempts.
//
// You can hover over the result rolled to see what the modifiers were.

export function skillChallenge(targetSuccesses, targetDC, actor, mod) {
    let successes = 0;
    let attempts = 0;
    let critfail = false;

    let results = "";
    let content = "";
    
    contentUpdate(0);
    runDialog();

    // if autopick is checked, keep going until success or critical failure
    async function fastMode(targetSuccesses, targetDC, actor, mod, bonuses) {
        let rollResArr = []
        while (successes < targetSuccesses) {
            attempts++
            let rollRes = new Roll("1d20 + @mod + @bonuses", {mod, bonuses} ).roll()
            let resultString = "";
            for (let i=0; i<rollRes.results.length ; i++) {
                resultString += `${rollRes.results[i]}`
            }
            if (rollRes._total >= targetDC + 10) {
                successes = successes + 2
                rollResArr.push(` 
                <div class="pf2e-rsc-tooltip">
                    <span class="pf2e-rsc-scripts-numbercritsuccess">${rollRes._total}
                        <span class="pf2e-rsc-tooltiptext" style="border-color: green">${resultString}
                        </span>
                    </span>
                </div>`)
            } else if (rollRes._total >= targetDC) {
                successes++
                rollResArr.push(` 
                <div class="pf2e-rsc-tooltip">
                    <span class="pf2e-rsc-scripts-numbersuccess">${rollRes._total}
                        <span class="pf2e-rsc-tooltiptext" style="border-color: green">${resultString}
                        </span>
                    </span>
                </div>`)
            } else if (rollRes._total <= targetDC - 10) {
                results += `<span class="pf2e-rsc-scripts-wordcritfail">Critical Failure!
                </span><br/>
                 The tools break.<br/>`
                rollResArr.push(`
                <div class="pf2e-rsc-tooltip">
                    <span class="pf2e-rsc-scripts-numbercritfail">${rollRes._total}
                        <span class="pf2e-rsc-tooltiptext" style="border-color: red">${resultString}
                        </span>
                    </span>
                </div>`)
                break;
            } else {
                rollResArr.push(` 
                <div class="pf2e-rsc-tooltip">
                    ${rollRes._total}
                    <span class="pf2e-rsc-tooltiptext" style="border-color: black">${resultString}
                    </span>
                </div>`
                )
            }
        }
        if (successes >= targetSuccesses) results += `<span class="pf2e-rsc-scripts-wordsuccess">Success!</span><br/> The challenge is successful!<br/>`
        if (rollResArr.length > 1) results += ` Your roll results were: ${rollResArr.toString()}.`
        else results += ` Your roll result was: ${rollResArr.toString()}.`
        results += ` The attempt took ${attempts*6} seconds in total.`
        generateChat(actor, results)
    }

    // if autopick is not checked, go one roll at a time
    async function normalMode(targetSuccesses, targetDC, actor, mod, bonuses) {
        attempts++
        let rollRes = new Roll("1d20 + @mod + @bonuses", {mod, bonuses} ).roll()
        let resultString = "";
        for (let i=0; i<rollRes.results.length ; i++) {
            resultString += `${rollRes.results[i]}`
        }
        if (rollRes._total >= targetDC) {
            successes++
            if (rollRes._total >= targetDC + 10) {
                successes++
                results += `<div><span class="pf2e-rsc-scripts-wordcritsuccess">Critical Success!</span><br/>`
                results += ` Your result was
                <div class="pf2e-rsc-tooltip">
                    <span class="pf2e-rsc-scripts-numbercritsuccess">${rollRes._total}.
                        <span class="pf2e-rsc-tooltiptext" style="border-color: green">${resultString}
                        </span>
                    </span>
                </div>`
            } else { 
                results += `<div><span class="pf2e-rsc-scripts-wordsuccess">Success!</span><br/>`
                results += ` Your result was
                <div class="pf2e-rsc-tooltip">
                    <span class="pf2e-rsc-scripts-numbersuccess">${rollRes._total}.
                        <span class="pf2e-rsc-tooltiptext" style="border-color: green">${resultString}
                        </span>
                    </span>
                </div>`
            }
        } else if (rollRes._total < targetDC && rollRes._total > targetDC - 10) {
            results += `<div><span class="pf2e-rsc-scripts-wordfail">Failure.</span><br/>`
            results += ` Your result was
            <div class="pf2e-rsc-tooltip">
                ${rollRes._total}.
                <span class="pf2e-rsc-tooltiptext" style="border-color: black">${resultString}
                </span>
            </div>`
        } else {
            results += `<div><span class="pf2e-rsc-scripts-wordcritfail">Critical Failure!</span><br/>`
            results += ` Your result was
            <div class="pf2e-rsc-tooltip">
                <span class="pf2e-rsc-scripts-numbercritfail">${rollRes._total}.
                    <span class="pf2e-rsc-tooltiptext" style="border-color: red">${resultString}
                    </span>
                </span>
            </div>`
            critfail = true;
        }
        if (successes < targetSuccesses && !critfail) {
            results += ` You have attempted this skill challenge for ${attempts*6} seconds.</div>`
            contentUpdate(bonuses);
            runDialog();
        } else {
            if (successes >= targetSuccesses) results += ` The skill check is successful!`
            results += ` Your attempt lasted ${attempts*6} seconds.</div>`
        }
        generateChat(actor, results)
        results = ``
    }

    // used to create the chat messages
    async function generateChat(actor, output) {
        let chatData = { 
            user: game.user._id, 
            speaker: {
                alias: actor.name
            },
            content: output, 
        }; 
        await ChatMessage.create(chatData, {}); 
    } 

    // need to regenerate the dialog each time to keep bonuses persistent
    function runDialog() {
        let d = new Dialog({
            title: "Skill Challenge",
            content,
            buttons: {
              select: {
                icon: "<i class='fas fa-dice-d20'></i>",
                label: "Roll",
                callback: (html) => {
                    let bonuses = parseInt(html.find("#bonuses")[0].value)
                    if (html.find("#fastmode")[0].checked) {
                        fastMode(targetSuccesses, targetDC, actor, mod, bonuses)
                    } else {
                        normalMode(targetSuccesses, targetDC, actor, mod, bonuses)
                    }   
                }
              },
              cancel: {
                icon: "<i class='fas fa-lock-times'></i>",  
                label: "Cancel",
                callback: () => {
                    if (attempts > 0) {
                        if (successes === 1) results += `Skill challenge interrupted after ${successes} success.`
                        else results = `Skill challenge interrupted after ${successes} successes.`
                        generateChat(actor, results)
                    }
                }
              }
            },
              
        })
        d.options.width = 250;
        d.position.width = 250;
        d.render(true);
    }
    
    // used to keep any entered bonuses peristent between re-renderings
    async function contentUpdate(bonuses) { 
        content = `<div id="pf2e-rsc-scripts-content">
        <label for="bonuses">Specific bonuses: </label>
        <input type="text" id="bonuses" name="bonuses" value="${bonuses}"></br>
        <label for="fastmode" style="display: inline-block; vertical-align: middle; position:relative">Autoroll?</label>
        <input type="checkbox" name="fastmode" id="fastmode" style="position: relative; vertical-align:middle">
        </br>
        </div>`
    }    
}