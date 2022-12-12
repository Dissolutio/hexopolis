import { Move } from 'boardgame.io'
import { uniq } from 'lodash'
import { Hex, HexUtils } from 'react-hexgrid'
import { calcUnitMoveRange } from './calcUnitMoveRange'
import { encodeGameLogMessage } from './gamelog'
import {
  selectGameCardByID,
  selectHexForUnit,
  selectRevealedGameCard,
  selectUnitsForCard,
  selectUnrevealedGameCard,
} from './selectors'
import { BoardHex, BoardHexes, GameState, GameUnit, GameUnits } from './types'

export const moveAction: Move<GameState> = {
  move: ({ G, ctx }, unit: GameUnit, endHex: BoardHex) => {
    const { unitID, movePoints } = unit
    const playersOrderMarkers = G.players[ctx.currentPlayer].orderMarkers
    const endHexID = endHex.id
    const startHex = selectHexForUnit(unitID, G.boardHexes)
    const unitGameCard = selectGameCardByID(G.gameArmyCards, unit.gameCardID)
    const startHexID = startHex?.id ?? ''
    const currentMoveRange = G.gameUnits[unitID].moveRange
    const isEndHexInMoveRange = [
      ...currentMoveRange.disengage,
      ...currentMoveRange.engage,
      ...currentMoveRange.safe,
    ].includes(endHexID)
    const moveCost = HexUtils.distance(startHex as Hex, endHex)
    const revealedGameCard = selectRevealedGameCard(
      G.orderMarkers,
      G.gameArmyCards,
      G.currentOrderMarker,
      ctx.currentPlayer
    ) // revealedGameCard is a proxy object
    const movedUnitsCount = uniq(G.unitsMoved).length
    const allowedMoveCount = revealedGameCard?.figures ?? 0

    const isAvailableMoveToBeUsed = movedUnitsCount < allowedMoveCount
    const isUnitMoved = G.unitsMoved.includes(unitID)
    const isDisallowedBecauseMaxUnitsMoved =
      !isAvailableMoveToBeUsed && !isUnitMoved
    //! EARLY OUTS
    // DISALLOW - move not in move range
    if (!isEndHexInMoveRange) {
      console.error(
        `Move action denied:The end hex is not in the unit's move range`
      )
      return
    }
    // DISALLOW - max units moved, cannot move any NEW units, and this unit would be a newly moved unit
    if (isDisallowedBecauseMaxUnitsMoved) {
      console.error(
        `Move action denied:no new units can move, max units have been moved`
      )
      return
    }

    // ALLOW
    // make copies
    const newBoardHexes: BoardHexes = { ...G.boardHexes }
    const newGameUnits: GameUnits = { ...G.gameUnits }
    // while making copies, update moved units counter
    const newUnitsMoved = [...G.unitsMoved, unitID]

    // update unit position
    newBoardHexes[startHexID].occupyingUnitID = ''
    newBoardHexes[endHexID].occupyingUnitID = unitID
    // update unit move-points
    const newMovePoints = movePoints - moveCost
    newGameUnits[unitID].movePoints = newMovePoints
    // update move-ranges for this turn's units
    const unrevealedGameCard = selectUnrevealedGameCard(
      playersOrderMarkers,
      G.gameArmyCards,
      G.currentOrderMarker
    )
    const currentTurnUnits = selectUnitsForCard(
      unrevealedGameCard?.gameCardID ?? '',
      G.gameUnits
    )
    currentTurnUnits.forEach((unit: GameUnit) => {
      const { unitID } = unit
      const moveRange = calcUnitMoveRange(
        unit,
        newBoardHexes,
        newGameUnits,
        G.gameArmyCards
      )
      newGameUnits[unitID].moveRange = moveRange
    })
    const indexOfThisMove = G.unitsMoved.length
    const moveId = `r${G.currentRound}:om${G.currentOrderMarker}:${unitID}:m${indexOfThisMove}`
    const gameLogForThisMove = encodeGameLogMessage({
      type: 'move',
      id: moveId,
      unitID: unitID,
      unitSingleName: unitGameCard?.singleName ?? '',
      startHexID,
      endHexID,
    })
    G.gameLog.push(gameLogForThisMove)
    // update G
    G.boardHexes = { ...newBoardHexes }
    G.gameUnits = { ...newGameUnits }
    G.unitsMoved = newUnitsMoved
    return G
  },
}
