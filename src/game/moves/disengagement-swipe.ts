import type { Move } from 'boardgame.io'
import { selectIfGameArmyCardHasAbility } from '../selector/card-selectors'
import { stageNames } from '../constants'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import {
  selectGameCardByID,
  selectHexForUnit,
  selectTailHexForUnit,
} from '../selectors'
import { BoardHexes, GameState, GameUnits } from '../types'
import { rollHeroscapeDice } from './attack-action'
import { killUnit_G, moveUnit_G } from './G-mutators'

// 5 possible paths:
// 1. (3 paths) Accept: Fatal or non-fatal, if non-fatal then after last swipe move unit
// 2. (2 paths) Deny: Not last swipe, or is last swipe + move unit

export const takeDisengagementSwipe: Move<GameState> = {
  undoable: false,
  move: (
    { G, events, random },
    { unitID, isTaking }: { unitID: string; isTaking: boolean }
  ) => {
    const disengagesAttempting = G.disengagesAttempting
    const unitAttemptingToDisengage = disengagesAttempting?.unit
    const unitAttemptingToDisengageHex = selectHexForUnit(
      unitAttemptingToDisengage?.unitID ?? '',
      G.boardHexes
    )
    const unitAttemptingToDisengageTailHex = selectTailHexForUnit(
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

    // DISALLOWED
    // state is wrong
    if (
      !disengagesAttempting ||
      !unitAttemptingToDisengage ||
      !unitAttemptingToDisengageHex ||
      !unitAttemptingCard ||
      !unitSwiping ||
      !unitSwipingCard
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
    const endTailHexID = disengagesAttempting.endFromHexID
    const isAllEngagementsSettled =
      G.disengagedUnitIds.length ===
      disengagesAttempting.defendersToDisengage.length - 1
    const disengagementDiceRolled = 1
    const isAHit = rollHeroscapeDice(disengagementDiceRolled, random)
    const initialLife = unitAttemptingCard.life
    const numberOfWounds = isAHit.skulls >= 1 ? 1 : 0
    const isFatal =
      unitAttemptingToDisengage.wounds + numberOfWounds >= initialLife
    const isWarriorSpirit =
      isFatal &&
      selectIfGameArmyCardHasAbility(
        "Warrior's Attack Spirit 1",
        unitAttemptingCard
      )
    const isArmorSpirit =
      isFatal &&
      selectIfGameArmyCardHasAbility(
        "Warrior's Armor Spirit 1",
        unitAttemptingCard
      )
    const newBoardHexes: BoardHexes = { ...G.boardHexes }
    const newGameUnits: GameUnits = { ...G.gameUnits }
    const newUnitsMoved = [...G.unitsMoved]

    // ALLOWED
    if (isTaking) {
      if (isFatal) {
        killUnit_G({
          boardHexes: newBoardHexes,
          gameArmyCards: G.gameArmyCards,
          killedArmyCards: G.killedArmyCards,
          unitsKilled: G.unitsKilled,
          killedUnits: G.killedUnits,
          gameUnits: G.gameUnits,
          unitToKillID: unitAttemptingToDisengage.unitID,
          killerUnitID: unitID,
          defenderHexID: unitAttemptingToDisengageHex.id,
          defenderTailHexID: unitAttemptingToDisengageTailHex?.id,
        })

        // and reset disengagement state
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
          playerID: unitSwipingCard.playerID,
          unitName: unitSwipingCard.name,
          defenderUnitName: unitAttemptingCard.name,
          defenderPlayerID: unitAttemptingCard.playerID,
        })
        G.gameLog.push(gameLogForThisMove)
        if (isWarriorSpirit) {
          // TODO: Multiplayer, set stages for all other players to idle
          events.setActivePlayers({
            value: {
              [unitAttemptingToDisengage.playerID]:
                stageNames.placingAttackSpirit,
              [unitSwiping.playerID]: stageNames.idlePlacingAttackSpirit,
            },
          })
        } else if (isArmorSpirit) {
          // TODO: Multiplayer, set stages for all other players to idle
          events.setActivePlayers({
            value: {
              [unitAttemptingToDisengage.playerID]:
                stageNames.placingArmorSpirit,
              [unitSwiping.playerID]: stageNames.idlePlacingArmorSpirit,
            },
          })
        } else {
          events.setActivePlayers({
            currentPlayer: stageNames.movement,
          })
          events.endStage()
        }
      } else if (!isFatal) {
        // assign wounds
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
          playerID: unitSwipingCard.playerID,
          unitName: unitSwipingCard.name,
          defenderUnitName: unitAttemptingCard.name,
          defenderPlayerID: unitAttemptingCard.playerID,
          wounds: numberOfWounds,
        })
        G.gameLog.push(gameLogForThisMove)
        // if this is the last disengagement, actually move the unit
        if (isAllEngagementsSettled) {
          /* START MOVE */
          // TODO: Glyph move
          moveUnit_G({
            unitID: unitAttemptingToDisengage.unitID,
            startHexID: unitAttemptingToDisengageHex.id,
            endHexID,
            boardHexes: newBoardHexes,
            startTailHexID: unitAttemptingToDisengageTailHex?.id,
            endTailHexID,
          })
          newUnitsMoved.push(unitAttemptingToDisengage.unitID)
          // if (is2Hex) {
          //   // remove from old
          //   newBoardHexes[unitAttemptingToDisengageHex.id].occupyingUnitID = ''
          //   newBoardHexes[unitAttemptingToDisengageTailHex.id].occupyingUnitID =
          //     ''
          //   newBoardHexes[unitAttemptingToDisengageTailHex.id].isUnitTail =
          //     false
          //   // add to new
          //   newBoardHexes[endHexID].occupyingUnitID =
          //     unitAttemptingToDisengage.unitID
          //   newBoardHexes[endTailHexID].occupyingUnitID =
          //     unitAttemptingToDisengage.unitID
          //   newBoardHexes[endTailHexID].isUnitTail = true
          // update unit move-points from move-range
          newGameUnits[unitAttemptingToDisengage.unitID].movePoints =
            disengagesAttempting.movePointsLeft

          G.boardHexes = { ...newBoardHexes }
          G.gameUnits = { ...newGameUnits }
          G.unitsMoved = newUnitsMoved
          /* END MOVE */

          // clear disengagement state
          G.disengagesAttempting = undefined
          G.disengagedUnitIds = []
          // send players back to movement/idle stages
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
        playerID: unitSwiping.playerID,
        defenderPlayerID: unitAttemptingToDisengage.playerID,
      })
      G.gameLog.push(gameLogForThisMove)
      if (isAllEngagementsSettled) {
        /* START MOVE */
        moveUnit_G({
          unitID: unitAttemptingToDisengage.unitID,
          startHexID: unitAttemptingToDisengageHex.id,
          endHexID,
          boardHexes: newBoardHexes,
          startTailHexID: unitAttemptingToDisengageTailHex?.id,
          endTailHexID,
        })
        newUnitsMoved.push(unitAttemptingToDisengage.unitID)
        /* END MOVE */

        // update unit move-points from move-range
        newGameUnits[unitAttemptingToDisengage.unitID].movePoints =
          disengagesAttempting.movePointsLeft
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
