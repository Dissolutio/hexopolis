import type { Move } from 'boardgame.io'
import { encodeGameLogMessage } from '../gamelog'
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
  const initialAttack = G.gameArmyCards[indexToUpdate].attack
  const newAttack = initialAttack + 1
  const cardToPlaceSpiritOn = G.gameArmyCards[indexToUpdate]
  const unitName = cardToPlaceSpiritOn.name
  const id = `r${G.currentRound}:om${G.currentOrderMarker}:finnspirit:${gameCardID}`
  const gamelog = encodeGameLogMessage({
    type: 'placeAttackSpirit',
    id,
    playerID: cardToPlaceSpiritOn.playerID,
    unitName,
    initialValue: initialAttack,
    newValue: newAttack,
  })
  G.gameLog = [...G.gameLog, gamelog]
  // Apply attack spirit to chosen card
  G.gameArmyCards[indexToUpdate].attack++
  // Next stage
  const nextStage = newStageQueue.shift()
  G.stageQueue = newStageQueue
  if (nextStage?.stage === stageNames.placingAttackSpirit) {
    const activePlayers = getActivePlayersIdleStage({
      gamePlayerIDs: Object.keys(G.players),
      activePlayerID: nextStage.playerID,
      activeStage: stageNames.placingAttackSpirit,
      idleStage: stageNames.idlePlacingAttackSpirit,
    })
    events.setActivePlayers({
      value: activePlayers,
    })
  } else if (nextStage?.stage === stageNames.placingArmorSpirit) {
    const activePlayers = getActivePlayersIdleStage({
      gamePlayerIDs: Object.keys(G.players),
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
  // we died from disengagement
  else {
    events.endTurn()
  }
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
  const initialDefense = G.gameArmyCards[indexToUpdate].defense
  const newDefense = initialDefense + 1
  const cardToPlaceSpiritOn = G.gameArmyCards[indexToUpdate]
  const unitName = cardToPlaceSpiritOn.name
  const id = `r${G.currentRound}:om${G.currentOrderMarker}:thorgrimspirit:${gameCardID}`
  const gamelog = encodeGameLogMessage({
    type: 'placeArmorSpirit',
    id,
    playerID: cardToPlaceSpiritOn.playerID,
    unitName,
    initialValue: initialDefense,
    newValue: newDefense,
  })
  G.gameLog = [...G.gameLog, gamelog]
  // Apply armor spirit to chosen card
  G.gameArmyCards[indexToUpdate].defense++

  // Next stage
  const nextStage = newStageQueue.shift()
  G.stageQueue = newStageQueue
  if (nextStage?.stage === stageNames.placingAttackSpirit) {
    const activePlayers = getActivePlayersIdleStage({
      gamePlayerIDs: Object.keys(G.players),
      activePlayerID: nextStage.playerID,
      activeStage: stageNames.placingAttackSpirit,
      idleStage: stageNames.idlePlacingAttackSpirit,
    })
    events.setActivePlayers({
      value: activePlayers,
    })
  } else if (nextStage?.stage === stageNames.placingArmorSpirit) {
    const activePlayers = getActivePlayersIdleStage({
      gamePlayerIDs: Object.keys(G.players),
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
  // this should not happen, disengage will add a movement-stage to the queue
  else {
    events.endTurn()
  }
}
