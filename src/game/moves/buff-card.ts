import type { Move } from 'boardgame.io'
import { stageNames } from 'game/constants'
import { GameState } from '../types'

export const placeAttackSpirit: Move<GameState> = (
  { G, events },
  { gameCardID }
) => {
  const indexToUpdate = G.gameArmyCards.findIndex(
    (gc) => gc.gameCardID === gameCardID
  )
  if (indexToUpdate < 0) {
    throw new Error(
      'Placing attack spirit denied: gameCardID chosen not found in gameArmyCards'
    )
  }
  G.gameArmyCards[indexToUpdate].attack++
  const wasCurrentPlayerAttacking =
    G.isCurrentPlayerAttacking === true ? true : false
  // clear isCurrentPlayerAttacking state after we use it
  G.isCurrentPlayerAttacking = false
  if (wasCurrentPlayerAttacking) {
    events.setActivePlayers({ currentPlayer: stageNames.attacking })
  } else {
    // we died from disengagement, can't move a dead man, and should end turn
    events.endTurn()
  }
}
export const placeArmorSpirit: Move<GameState> = (
  { G, events },
  { gameCardID }
) => {
  const indexToUpdate = G.gameArmyCards.findIndex(
    (gc) => gc.gameCardID === gameCardID
  )
  if (indexToUpdate < 0) {
    throw new Error(
      'Placing armor spirit denied: gameCardID chosen not found in gameArmyCards'
    )
  }
  G.gameArmyCards[indexToUpdate].defense++
  const wasCurrentPlayerAttacking =
    G.isCurrentPlayerAttacking === true ? true : false
  // clear isCurrentPlayerAttacking state after we use it
  G.isCurrentPlayerAttacking = false
  if (wasCurrentPlayerAttacking) {
    events.setActivePlayers({ currentPlayer: stageNames.attacking })
  } else {
    // we died from disengagement, can't move a dead man, and should end turn
    events.endTurn()
  }
}
