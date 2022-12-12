import type { Move } from 'boardgame.io'

import { selectGameCardByID } from './selectors'
import { GameState, GameUnit } from './types'

export type DefenderToDisengage = {
  unitID: string
  playerID: string
  hexID: string
}
export const attemptDisengage: Move<GameState> = {
  undoable: false,
  move: (
    { G },
    unit: GameUnit,
    defendersToDisengage: DefenderToDisengage[]
  ) => {
    /* 
    WIP
    1. save the defenders to G
    2. put defending players into stage to disengage swipe (they can take it or not)
    3. put moving player in a waiting stage
     */

    const { unitID } = unit
    const unitGameCard = selectGameCardByID(G.gameArmyCards, unit.gameCardID)
    const unitName = unitGameCard?.name ?? ''
  },
}
