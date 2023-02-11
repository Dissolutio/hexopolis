import type { Move } from 'boardgame.io'
import { getActivePlayersIdleStage, stageNames } from '../constants'
import { GameState } from '../types'

export const placeAttackSpirit: Move<GameState> = (
  { G, events },
  { gameCardID }
) => {
  // this stage may have been entered in a long line of similar stages
  let newStageQueue = [...G.stageQueue]
  const indexToUpdate = G.gameArmyCards.findIndex(
    (gc) => gc.gameCardID === gameCardID
  )
  if (indexToUpdate < 0) {
    throw new Error(
      'Placing attack spirit denied: gameCardID chosen not found in gameArmyCards'
    )
  }
  G.gameArmyCards[indexToUpdate].attack++
  // Next stage
  const nextStage = newStageQueue.shift()
  G.stageQueue = newStageQueue
  if (nextStage?.stage === stageNames.placingAttackSpirit) {
    const activePlayers = getActivePlayersIdleStage({
      activePlayerID: nextStage.playerID,
      activeStage: stageNames.placingAttackSpirit,
      idleStage: stageNames.idlePlacingAttackSpirit,
    })
    events.setActivePlayers({
      value: activePlayers,
    })
  } else if (nextStage?.stage === stageNames.placingArmorSpirit) {
    const activePlayers = getActivePlayersIdleStage({
      activePlayerID: nextStage.playerID,
      activeStage: stageNames.placingArmorSpirit,
      idleStage: stageNames.idlePlacingArmorSpirit,
    })
    events.setActivePlayers({
      value: activePlayers,
    })
  } else if (nextStage?.stage === stageNames.attacking) {
    events.setActivePlayers({ currentPlayer: stageNames.attacking })
  } else if (nextStage?.stage === stageNames.movement) {
    events.setActivePlayers({
      value: { [nextStage?.playerID]: stageNames.movement },
    })
  }
  // Disabling this for now, because it's causing a bug where the no-units-end-turn is being unnecessarily triggered
  // Either we died from disengagement, or we died in fire line attack (because normal attack reverts back to attacker)
  // else {
  //   events.endTurn()
  // }
}
export const placeArmorSpirit: Move<GameState> = (
  { G, events },
  { gameCardID }
) => {
  // this stage may have been entered in a long line of similar stages
  let newStageQueue = [...G.stageQueue]
  const indexToUpdate = G.gameArmyCards.findIndex(
    (gc) => gc.gameCardID === gameCardID
  )
  if (indexToUpdate < 0) {
    throw new Error(
      'Placing armor spirit denied: gameCardID chosen not found in gameArmyCards'
    )
  }
  // Apply armor spirit to chosen card
  G.gameArmyCards[indexToUpdate].defense++

  // Next stage
  const nextStage = newStageQueue.shift()
  G.stageQueue = newStageQueue
  if (nextStage?.stage === stageNames.placingAttackSpirit) {
    const activePlayers = getActivePlayersIdleStage({
      activePlayerID: nextStage.playerID,
      activeStage: stageNames.placingAttackSpirit,
      idleStage: stageNames.idlePlacingAttackSpirit,
    })
    events.setActivePlayers({
      value: activePlayers,
    })
  } else if (nextStage?.stage === stageNames.placingArmorSpirit) {
    const activePlayers = getActivePlayersIdleStage({
      activePlayerID: nextStage.playerID,
      activeStage: stageNames.placingArmorSpirit,
      idleStage: stageNames.idlePlacingArmorSpirit,
    })
    events.setActivePlayers({
      value: activePlayers,
    })
  } else if (nextStage?.stage === stageNames.attacking) {
    events.setActivePlayers({ currentPlayer: stageNames.attacking })
  } else if (nextStage?.stage === stageNames.movement) {
    events.setActivePlayers({ currentPlayer: stageNames.movement })
  }
  // Either we died from disengagement, or we died in fire line attack (because normal attack reverts back to attacker)
  else {
    events.endTurn()
  }
}
