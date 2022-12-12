import type { Move } from 'boardgame.io'
import { DefenderToDisengage } from './attempt-disengage'

import { selectGameCardByID } from './selectors'
import { GameState, GameUnit } from './types'

export const takeDisengagementSwipe: Move<GameState> = {
  undoable: false,
  move: (
    { G },
    disengagingUnit: GameUnit,
    defendersToDisengage: DefenderToDisengage[]
  ) => {
    /* 
    WIP
    1. 
    2. put defending players into stage to disengage swipe (they can take it or not)
    3. put moving player in a waiting stage
     */

    const { unitID } = disengagingUnit
    const unitGameCard = selectGameCardByID(
      G.gameArmyCards,
      disengagingUnit.gameCardID
    )
    const unitHex = selectGameCardByID(
      G.gameArmyCards,
      disengagingUnit.gameCardID
    )
    const unitName = unitGameCard?.name ?? ''
  },
}
