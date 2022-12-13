import type { Move } from 'boardgame.io'

import { GameState } from '../types'

export const takeDisengagementSwipe: Move<GameState> = {
  undoable: false,
  move: ({ G }, {playerID, isTaking }: {playerID: string, isTaking: boolean }) => {
    const currentAttempts = { ...G.disengagesAttempting }
    const unitAttempting = currentAttempts?.unit
    const defendersToDisengage = currentAttempts?.defendersToDisengage ?? []
    const myFiguresThatGetASwipe = defendersToDisengage.filter(
      (u) => u.playerID === playerID
    )

    // update: G.disengagedUnitIds, G.gameLog,
    if(isTaking) {

    } else {

    }
  },
}
