import { BoardHexes, BoardHex, GameUnits, GameUnit, MoveRange } from './types'
import { generateBlankMoveRange } from './constants'
import { uniq } from 'lodash'
import {
  calcMoveCostBetweenNeighbors,
  selectHexForUnit,
  selectHexNeighbors,
} from './selectors'

const deduplicateMoveRange = (result: MoveRange): MoveRange => {
  return {
    safe: uniq(result.safe),
    engage: uniq(result.engage),
    disengage: uniq(result.disengage),
    denied: uniq(result.denied),
  }
}
export function calcUnitMoveRange(
  unit: GameUnit,
  boardHexes: BoardHexes,
  gameUnits: GameUnits
): MoveRange {
  // 1. return blank move-range if no necessary ingredients
  const initialMoveRange = generateBlankMoveRange()
  //*early out
  if (!unit) {
    return initialMoveRange
  }
  const playerID = unit?.playerID
  const initialMovePoints = unit?.movePoints ?? 0
  const startHex = selectHexForUnit(unit?.unitID ?? '', boardHexes)
  //*early out again?
  if (!startHex || !initialMovePoints) {
    return initialMoveRange
  }

  // 2. deny they start hex as an end hex
  initialMoveRange.denied.push(`${startHex.id}`)

  // 3. recursively add hexes to move-range
  const moveRange = computeWalkMoveRange({
    startHex: startHex as BoardHex,
    movePoints: initialMovePoints,
    boardHexes,
    initialMoveRange,
    gameUnits,
    playerID,
    hexesVisited: {},
  })

  return moveRange
}

function computeWalkMoveRange({
  startHex,
  movePoints,
  boardHexes,
  initialMoveRange,
  gameUnits,
  playerID,
  hexesVisited,
}: {
  startHex: BoardHex
  movePoints: number
  boardHexes: BoardHexes
  initialMoveRange: MoveRange
  gameUnits: GameUnits
  playerID: string
  hexesVisited: { [hexID: string]: number }
}): MoveRange {
  const neighbors = selectHexNeighbors(startHex.id, boardHexes)
  const isVisitedAlready = hexesVisited?.[startHex.id] >= movePoints
  const hexesVisitedCopy = { ...hexesVisited }
  //*early out
  if (movePoints <= 0 || isVisitedAlready) {
    return initialMoveRange
  }
  // mark this hex as visited
  hexesVisitedCopy[startHex.id] = movePoints

  // recursive reduce over neighbors
  let nextResults = neighbors.reduce(
    (result: MoveRange, end: BoardHex): MoveRange => {
      const { id: endHexID, occupyingUnitID: endHexUnitID } = end
      const endHexUnit = { ...gameUnits[endHexUnitID] }
      const endHexUnitPlayerID = endHexUnit.playerID
      const moveCost = calcMoveCostBetweenNeighbors(startHex, end)
      const movePointsLeftAfterMove = movePoints - moveCost
      const isEndHexOccupied = Boolean(endHexUnitID)
      const isTooCostly = movePointsLeftAfterMove < 0
      const isEndHexEnemyOccupied =
        isEndHexOccupied && endHexUnitPlayerID !== playerID
      const isUnpassable = isTooCostly || isEndHexEnemyOccupied
      if (!isUnpassable) {
        result.safe.push(endHexID)
        const recursiveMoveRange = computeWalkMoveRange({
          startHex: end,
          movePoints: movePointsLeftAfterMove,
          boardHexes,
          initialMoveRange: result,
          gameUnits,
          playerID,
          hexesVisited: hexesVisitedCopy,
        })
        return {
          ...result,
          ...recursiveMoveRange,
        }
      }
      return result
    },
    // accumulator for reduce fn
    initialMoveRange
  )
  return deduplicateMoveRange(nextResults)
}
