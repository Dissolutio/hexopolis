import type { Move } from 'boardgame.io'
import { groupBy } from 'lodash'

import { selectGameCardByID } from '../selectors'
import { GameState, GameUnit, DefendersToDisengage } from '../types'
import { stageNames } from '../constants'

export const attemptDisengage: Move<GameState> = {
  undoable: false,
  move: (
    { G, events },
    {
      unit,
      defendersToDisengage,
      startHexID,
      endHexID,
    }: {
      unit: GameUnit
      defendersToDisengage: DefendersToDisengage[]
      startHexID?: string
      endHexID?: string
    }
  ) => {
    // const { unitID } = unit
    // const unitName = unitGameCard?.name ?? ''
    // const unitGameCard = selectGameCardByID(G.gameArmyCards, unit.gameCardID)
    const disengagedUnitsGroupedByPlayerID = groupBy(
      defendersToDisengage,
      'playerID'
    )
    const playersWithRelevantUnitsToStageMap = Object.keys(
      disengagedUnitsGroupedByPlayerID
    ).reduce((prev, curr) => {
      return {
        ...prev,
        [curr]: stageNames.disengagementSwipe,
      }
    }, {})
    console.log(
      '🚀 ~ file: attempt-disengage.ts:39 ~ playersWithRelevantUnitsToStageMap',
      playersWithRelevantUnitsToStageMap
    )

    events.setActivePlayers({
      currentPlayer: stageNames.waitingForDisengageSwipe,
      value: playersWithRelevantUnitsToStageMap,
    })
  },
}
