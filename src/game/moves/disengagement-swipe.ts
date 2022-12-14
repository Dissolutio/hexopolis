import type { Move } from 'boardgame.io'
import { HexUtils } from 'react-hexgrid'
import { stageNames } from '../constants'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import {
  selectGameCardByID,
  selectHexForUnit,
  selectRevealedGameCard,
} from '../selectors'
import { BoardHexes, GameState, GameUnits } from '../types'
import { rollHeroscapeDice } from './attack-action'

// This move is either fatal, not fatal, or denied

export const takeDisengagementSwipe: Move<GameState> = {
  undoable: false,
  move: (
    { G, ctx, events, random },
    { unitID, isTaking }: { unitID: string; isTaking: boolean }
  ) => {
    const disengagesAttempting = G.disengagesAttempting
    const unitAttemptingToDisengage = disengagesAttempting?.unit
    const unitAttemptingToDisengageHex = selectHexForUnit(
      unitAttemptingToDisengage?.unitID ?? '',
      G.boardHexes
    )
    const unitAttemptingCard = selectGameCardByID(
      G.gameArmyCards,
      unitAttemptingToDisengage?.gameCardID ?? ''
    )
    const unitSwiping = G.gameUnits[unitID]

    const unitSwipingCard = selectGameCardByID(
      G.gameArmyCards,
      unitSwiping?.gameCardID ?? ''
    )
    const unitSwipingHex = selectHexForUnit(unitSwiping.unitID, G.boardHexes)

    // DISALLOWED
    // state is wrong
    if (
      !disengagesAttempting ||
      !unitAttemptingToDisengage ||
      !unitAttemptingToDisengageHex ||
      !unitAttemptingCard ||
      !unitSwiping ||
      !unitSwipingCard ||
      !unitSwipingHex
    ) {
      events.setActivePlayers({
        currentPlayer: stageNames.movement,
      })
      G.disengagesAttempting = undefined
      G.disengagedUnitIds = []
      console.error(
        `Disengagement swipe action denied, no unit attempting, or no card for unit attempting, or no .disengagesAttempting in G`
      )
      return
    }
    if (G.disengagedUnitIds.includes(unitID)) {
      console.error(
        `Disengagement swipe action denied, this unit has already been disengaged`
      )
      return
    }

    const endHexID = disengagesAttempting.endHexID
    const endHex = G.boardHexes[disengagesAttempting.endHexID]
    const isAllEngagementsSettled =
      G.disengagedUnitIds.length ===
      disengagesAttempting.defendersToDisengage.length - 1
    const disengagementDiceRolled = 1
    const isAHit = rollHeroscapeDice(disengagementDiceRolled, random)
    const initialLife = unitAttemptingCard.life
    const numberOfWounds = isAHit.skulls >= 1 ? 1 : 0
    const isFatal =
      unitAttemptingToDisengage.wounds + numberOfWounds >= initialLife
    const revealedGameCard = selectRevealedGameCard(
      G.orderMarkers,
      G.gameArmyCards,
      G.currentOrderMarker,
      ctx.currentPlayer
    )
    const newBoardHexes: BoardHexes = { ...G.boardHexes }
    const newGameUnits: GameUnits = { ...G.gameUnits }
    const newUnitsMoved = [...G.unitsMoved]

    // ALLOWED
    if (isTaking) {
      // if fatal...
      if (isFatal) {
        // ...kill unit, clear hex
        delete newGameUnits[unitAttemptingToDisengage.unitID]
        newBoardHexes[unitAttemptingToDisengageHex.id].occupyingUnitID = ''
        G.unitsKilled = {
          ...G.unitsKilled,
          [unitID]: [
            ...(G.unitsKilled?.[unitID] ?? []),
            unitAttemptingToDisengage.unitID,
          ],
        }
        // ...and reset disengagement state and...
        G.disengagesAttempting = undefined
        G.disengagedUnitIds = []
        // update G
        G.boardHexes = { ...newBoardHexes }
        G.gameUnits = { ...newGameUnits }
        // update game log for fatal disengagement
        const indexOfThisDisengage = G.disengagedUnitIds.length
        const id = `r${G.currentRound}:om${G.currentOrderMarker}:${unitID}:d-fatal-${indexOfThisDisengage}`
        const gameLogForThisMove = encodeGameLogMessage({
          type: gameLogTypes.disengageSwipeFatal,
          id,
        })
        G.gameLog.push(gameLogForThisMove)
        // end disengagement swipe stage
        events.setActivePlayers({
          currentPlayer: stageNames.movement,
        })
        events.endStage()
      } else if (!isFatal) {
        newGameUnits[unitAttemptingToDisengage.unitID].wounds += numberOfWounds
        // update game log for non-fatal disengagement
        const indexOfThisDisengage = G.disengagedUnitIds.length
        const logShortTerm = numberOfWounds > 0 ? 'nonfatal' : 'miss'
        const id = `r${G.currentRound}:om${G.currentOrderMarker}:${unitID}:d-${logShortTerm}-${indexOfThisDisengage}`
        const type =
          numberOfWounds > 0
            ? gameLogTypes.disengageSwipeNonFatal
            : gameLogTypes.disengageSwipeMiss
        const gameLogForThisMove = encodeGameLogMessage({
          type,
          id,
        })
        G.gameLog.push(gameLogForThisMove)
        // move the unit if all disengagements are settled
        if (isAllEngagementsSettled) {
          /* START MOVE */
          newUnitsMoved.push(unitAttemptingToDisengage.unitID)
          // update unit position
          newBoardHexes[unitAttemptingToDisengageHex.id].occupyingUnitID = ''
          newBoardHexes[endHexID].occupyingUnitID =
            unitAttemptingToDisengage.unitID
          // update unit move-points
          const moveCost = HexUtils.distance(
            {
              q: unitAttemptingToDisengageHex.q,
              r: unitAttemptingToDisengageHex.r,
              s: unitAttemptingToDisengageHex.s,
            },
            {
              q: endHex.q,
              r: endHex.r,
              s: endHex.s,
            }
          )
          const newMovePoints = unitAttemptingToDisengage.movePoints - moveCost
          newGameUnits[unitAttemptingToDisengage.unitID].movePoints =
            newMovePoints

          G.boardHexes = { ...newBoardHexes }
          G.gameUnits = { ...newGameUnits }
          G.unitsMoved = newUnitsMoved
          /* END MOVE */
          G.disengagesAttempting = undefined
          G.disengagedUnitIds = []

          events.setActivePlayers({
            currentPlayer: stageNames.movement,
          })
          events.endStage()
        } else {
          // add to G.disengagedUnitIds
          G.disengagedUnitIds.push(unitSwiping.unitID)
        }
      }
    }
    if (!isTaking) {
      G.disengagedUnitIds.push(unitSwiping.unitID)
      // update game log for non-fatal disengagement
      const indexOfThisDisengage = G.disengagedUnitIds.length
      const id = `r${G.currentRound}:om${G.currentOrderMarker}:${unitID}:d-deny-${indexOfThisDisengage}`
      const gameLogForThisMove = encodeGameLogMessage({
        type: gameLogTypes.disengageSwipeDenied,
        id,
      })
      G.gameLog.push(gameLogForThisMove)
      if (isAllEngagementsSettled) {
        /* START MOVE */
        newUnitsMoved.push(unitAttemptingToDisengage.unitID)
        // update unit position
        newBoardHexes[unitAttemptingToDisengageHex.id].occupyingUnitID = ''
        newBoardHexes[endHexID].occupyingUnitID =
          unitAttemptingToDisengage.unitID
        // update unit move-points
        const moveCost = HexUtils.distance(
          {
            q: unitAttemptingToDisengageHex.q,
            r: unitAttemptingToDisengageHex.r,
            s: unitAttemptingToDisengageHex.s,
          },
          {
            q: endHex.q,
            r: endHex.r,
            s: endHex.s,
          }
        )
        const newMovePoints = unitAttemptingToDisengage.movePoints - moveCost
        newGameUnits[unitAttemptingToDisengage.unitID].movePoints =
          newMovePoints
        G.boardHexes = { ...newBoardHexes }
        G.gameUnits = { ...newGameUnits }
        G.unitsMoved = newUnitsMoved
        /* END MOVE */

        events.setActivePlayers({
          currentPlayer: stageNames.movement,
        })
        G.disengagesAttempting = undefined
        G.disengagedUnitIds = []
      }
    }
  },
}
