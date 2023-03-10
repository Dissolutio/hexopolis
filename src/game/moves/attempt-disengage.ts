import type { Move } from 'boardgame.io'
import { DisengageAttempt, GameState } from '../types'
import { stageNames } from '../constants'
import { selectGameCardByID } from '../selectors'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'

export const attemptDisengage: Move<GameState> = {
  undoable: false,
  move: (
    { G, events },
    {
      unit,
      endHexID,
      defendersToDisengage,
      endFromHexID,
      movePointsLeft,
      fallDamage,
    }: DisengageAttempt
  ) => {
    const { unitID } = unit
    const unitGameCard = selectGameCardByID(G.gameArmyCards, unit.gameCardID)
    const unitIdsToAttemptToDisengage = defendersToDisengage.map(
      (d) => d.unitID
    )
    // DISALLOWED
    if (!unitID || !unitGameCard || !defendersToDisengage) {
      console.error(
        `Disengagement swipe action denied, no unit attempting, or no card for unit attempting, or no .disengagesAttempting in G`
      )
      return
    }

    const singleName = unitGameCard.singleName
    // ALLOWED
    // store these attempts in G
    G.disengagesAttempting = {
      unit,
      endHexID,
      endFromHexID,
      defendersToDisengage,
      movePointsLeft,
      fallDamage,
    }
    // update game log
    const indexOfThisMove = G.unitsMoved.length
    const id = `r${G.currentRound}:om${G.currentOrderMarker}:${unitID}:disengage${indexOfThisMove}`
    const gameLogForThisMove = encodeGameLogMessage({
      type: gameLogTypes.disengageAttempt,
      id,
      playerID: unit.playerID,
      unitID,
      unitSingleName: singleName,
      endHexID,
      unitIdsToAttemptToDisengage,
    })
    G.gameLog.push(gameLogForThisMove)
    // put the relevant players in the disengagement swipe stage (formatting step)
    const playersWithSwipingUnitsToStageMap = defendersToDisengage.reduce(
      (prev, curr) => {
        return {
          ...prev,
          [curr.playerID]: stageNames.disengagementSwipe,
        }
      },
      {}
    )
    events.setActivePlayers({
      currentPlayer: stageNames.waitingForDisengageSwipe,
      value: playersWithSwipingUnitsToStageMap,
    })
  },
}
