import { Move } from 'boardgame.io'
import { transformMoveRangeToArraysOfIds } from '../constants'
import { uniq } from 'lodash'
import { encodeGameLogMessage } from '../gamelog'
import {
  selectGameCardByID,
  selectHexForUnit,
  selectRevealedGameCard,
  selectTailHexForUnit,
} from '../selectors'
import {
  BoardHex,
  BoardHexes,
  GameState,
  GameUnit,
  GameUnits,
  MoveRange,
} from '../types'

export const moveAction: Move<GameState> = {
  undoable: ({ G, ctx }) => true,
  move: (
    { G, ctx },
    unit: GameUnit,
    endHex: BoardHex,
    currentMoveRange: MoveRange
  ) => {
    const { unitID } = unit
    const endHexID = endHex.id
    const endTailHexID = currentMoveRange[endHexID].fromHexID
    const startHex = selectHexForUnit(unitID, G.boardHexes)
    const startTailHex = selectTailHexForUnit(unitID, G.boardHexes)
    const unitGameCard = selectGameCardByID(G.gameArmyCards, unit.gameCardID)
    const startHexID = startHex?.id ?? ''
    const startTailHexID = startTailHex?.id ?? ''
    const { safeMoves, engageMoves, disengageMoves } =
      transformMoveRangeToArraysOfIds(currentMoveRange)
    const isEndHexOutOfRange = ![...safeMoves, ...engageMoves].includes(
      endHexID
    )
    // TODO: MoveRange Move Cost
    const movePointsLeft = currentMoveRange[endHexID].movePointsLeft
    const revealedGameCard = selectRevealedGameCard(
      G.orderMarkers,
      G.gameArmyCards,
      G.currentOrderMarker,
      ctx.currentPlayer
    )
    const movedUnitsCount = uniq(G.unitsMoved).length
    const allowedMoveCount = revealedGameCard?.figures ?? 0

    const isAvailableMoveToBeUsed = movedUnitsCount < allowedMoveCount
    const isUnitMoved = G.unitsMoved.includes(unitID)
    const isDisallowedBecauseMaxUnitsMoved =
      !isAvailableMoveToBeUsed && !isUnitMoved
    //! EARLY OUTS
    // DISALLOW - move not in move range
    if (isEndHexOutOfRange) {
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
    if (unit.is2Hex && startTailHexID) {
      // remove from old
      newBoardHexes[startHexID].occupyingUnitID = ''
      newBoardHexes[startTailHexID].occupyingUnitID = ''
      newBoardHexes[startTailHexID].isUnitTail = false
      // add to new
      newBoardHexes[endHexID].occupyingUnitID = unitID
      newBoardHexes[endTailHexID].occupyingUnitID = unitID
      newBoardHexes[endTailHexID].isUnitTail = true
    } else {
      // remove from old
      newBoardHexes[startHexID].occupyingUnitID = ''
      // add to new
      newBoardHexes[endHexID].occupyingUnitID = unitID
    }
    // update unit move-points
    newGameUnits[unitID].movePoints = movePointsLeft

    // update game log
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
