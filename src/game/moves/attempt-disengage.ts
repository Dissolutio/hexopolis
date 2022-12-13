import type { Move } from 'boardgame.io'
import { GameState, GameUnit } from '../types'
import { stageNames } from '../constants'
import { selectGameCardByID } from 'game/selectors'

export const attemptDisengage: Move<GameState> = {
  undoable: false,
  move: (
    { G, events },
    {
      unit,
      endHexID,
      defendersToDisengage,
    }: {
      unit: GameUnit
      endHexID: string
      defendersToDisengage: GameUnit[]
    }
  ) => {
    const { unitID } = unit
    const unitGameCard = selectGameCardByID(G.gameArmyCards, unit.gameCardID)
    const unitName = unitGameCard?.name ?? ''

    // format for activePlayers -- we are just putting the relevant players in the disengagement swipe stage
    const playersWithRelevantUnitsToStageMap = defendersToDisengage.reduce(
      (prev, curr) => {
        return {
          ...prev,
          [curr.playerID]: stageNames.disengagementSwipe,
        }
      },
      {}
    )
    // pass the relevant data to the disengagement swipe stage
    G.disengagesAttempting = {
      unit,
      endHexID,
      defendersToDisengage,
    }
    events.setActivePlayers({
      currentPlayer: stageNames.waitingForDisengageSwipe,
      value: playersWithRelevantUnitsToStageMap,
    })
  },
}
