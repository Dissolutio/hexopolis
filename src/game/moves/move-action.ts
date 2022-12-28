import { Move } from 'boardgame.io'
import { hexUtilsDistance } from 'game/hex-utils'
import { uniq } from 'lodash'
import { encodeGameLogMessage } from '../gamelog'
import {
  selectGameCardByID,
  selectHexForUnit,
  selectRevealedGameCard,
} from '../selectors'
import {
  BoardHex,
  BoardHexes,
  GameState,
  GameUnit,
  GameUnits,
  HexCoordinates,
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
    const { unitID, movePoints } = unit
    const endHexID = endHex.id
    const startHex = selectHexForUnit(unitID, G.boardHexes)
    const unitGameCard = selectGameCardByID(G.gameArmyCards, unit.gameCardID)
    const startHexID = startHex?.id ?? ''
    const isEndHexOutOfRange = ![
      ...currentMoveRange.engage,
      ...currentMoveRange.safe,
    ].includes(endHexID)
    const moveCost = hexUtilsDistance(startHex as HexCoordinates, endHex)
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
    newBoardHexes[startHexID].occupyingUnitID = ''
    newBoardHexes[endHexID].occupyingUnitID = unitID
    // update unit move-points
    const newMovePoints = movePoints - moveCost
    newGameUnits[unitID].movePoints = newMovePoints

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
