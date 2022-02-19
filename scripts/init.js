// Set up socket listener to listen for gm_skillset macro

Hooks.once("ready", () => {
  console.log("PF2e RSC | hooked in");
  game.socket.on("module.pf2e-rsc", (data) => {
    if (data.operation === "playerSkillChallenge") {
      if (data.actor.permission[game.user.data._id] >= 3) {
        skillChallenge(
          data.neededSuccesses,
          data.DC,
          data.actor,
          data.mod,
          data.skillLabel,
          data.abort,
          data.tokenID
        );
      }
    }
  });
});
import { skillChallenge } from "./scripts.js";
