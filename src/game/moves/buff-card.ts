import type { Move } from 'boardgame.io'
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
  events.setActivePlayers({ revert: true })
}
