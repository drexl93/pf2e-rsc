import { skillChallenge } from './scripts.js'

// Set up socket listener to listen for gm_skillset macro
Hooks.once('ready', () => {
  console.log('PF2e RSC | hooked in')
  game.socket.on('module.pf2e-rsc', (data) => {
    if (data.operation === 'playerSkillChallenge') {
      if (data.actor.ownership[game.user.id] >= 3) {
        skillChallenge(
          data.neededSuccesses,
          data.DC,
          data.skillLabel,
          data.abort,
          data.tokenID,
          data.actor,
        )
      }
    }
  })
})
