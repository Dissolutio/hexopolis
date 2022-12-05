import { Move } from 'boardgame.io'
import { Hex, HexUtils } from 'react-hexgrid'
import { calcUnitMoveRange } from './calcUnitMoveRange'
import {
  selectHexForUnit,
  selectRevealedGameCard,
  selectUnitsForCard,
  selectUnrevealedGameCard,
} from './selectors'
import { BoardHex, BoardHexes, GameState, GameUnit, GameUnits } from './types'

export const moveAction: Move<GameState> = {
  undoable: ({ G, ctx }) => {
    // TODO: only can undo if no disengagements / special stuff happened
    return true
  },
  move: ({ G, ctx }, unit: GameUnit, endHex: BoardHex) => {
    const { unitID, movePoints } = unit
    const playersOrderMarkers = G.players[ctx.currentPlayer].orderMarkers
    const endHexID = endHex.id
    const startHex = selectHexForUnit(unitID, G.boardHexes)
    const startHexID = startHex?.id ?? ''
    const currentMoveRange = G.gameUnits[unitID].moveRange
    const isInSafeMoveRange = currentMoveRange.safe.includes(endHexID)
    const moveCost = HexUtils.distance(startHex as Hex, endHex)
    const revealedGameCard = selectRevealedGameCard(
      G.orderMarkers,
      G.armyCards,
      G.currentOrderMarker,
      ctx.currentPlayer
    ) // revealedGameCard is a proxy object
    const movedUnitsCount = G.unitsMoved.length
    const allowedMoveCount = revealedGameCard?.figures ?? 0

    const isAvailableMoveToBeUsed = movedUnitsCount < allowedMoveCount
    const isUnitMoved = G.unitsMoved.includes(unitID)
    const isDisallowedBecauseMaxUnitsMoved =
      !isAvailableMoveToBeUsed && !isUnitMoved
    //! EARLY OUTS
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
      G.armyCards,
      G.currentOrderMarker
    )

    const currentTurnUnits = selectUnitsForCard(
      unrevealedGameCard?.gameCardID ?? '',
      G.gameUnits
    )

    currentTurnUnits.forEach((unit: GameUnit) => {
      const { unitID } = unit
      const moveRange = calcUnitMoveRange(unit, newBoardHexes, newGameUnits)
      newGameUnits[unitID].moveRange = moveRange
    })
    // update G
    if (isInSafeMoveRange) {
      G.boardHexes = { ...newBoardHexes }
      G.gameUnits = { ...newGameUnits }
      G.unitsMoved = newUnitsMoved
    }
    return G
  },
}
