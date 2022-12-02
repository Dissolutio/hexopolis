import { Move } from 'boardgame.io'
import { Hex, HexUtils } from 'react-hexgrid'
import {
  calcUnitMoveRange,
  selectHexForUnit,
  selectUnitsForCard,
  selectUnrevealedGameCard,
} from './selectors'
import { BoardHex, BoardHexes, GameState, GameUnit, GameUnits } from './types'

export const moveAction: Move<GameState> = (
  { G, ctx },
  unit: GameUnit,
  endHex: BoardHex
) => {
  const { unitID, movePoints } = unit
  const playersOrderMarkers = G.players[ctx.currentPlayer].orderMarkers
  const endHexID = endHex.id
  const startHex = selectHexForUnit(unitID, G.boardHexes)
  const startHexID = startHex?.id ?? ''
  const currentMoveRange = G.gameUnits[unitID].moveRange
  const isInSafeMoveRange = currentMoveRange.safe.includes(endHexID)
  const moveCost = HexUtils.distance(startHex as Hex, endHex)
  // clone G
  const newBoardHexes: BoardHexes = { ...G.boardHexes }
  const newGameUnits: GameUnits = { ...G.gameUnits }
  // update moved units counter
  const unitsMoved = [...G.unitsMoved]
  if (!unitsMoved.includes(unitID)) {
    unitsMoved.push(unitID)
    G.unitsMoved = unitsMoved
  }
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
  const timeA = performance.now()

  currentTurnUnits.forEach((unit: GameUnit) => {
    const { unitID } = unit
    const moveRange = calcUnitMoveRange(unit, newBoardHexes, newGameUnits)
    newGameUnits[unitID].moveRange = moveRange
  })
  const timeB = performance.now()
  console.log(`currentTurnUnits.forEach TOOK: ${timeA - timeB} ms`)
  // Make the move
  if (isInSafeMoveRange) {
    G.boardHexes = { ...newBoardHexes }
    G.gameUnits = { ...newGameUnits }
  }
  return G
}
