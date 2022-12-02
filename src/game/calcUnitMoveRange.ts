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
  const moveRange = deduplicateMoveRange(
    moveRangeReduce({
      startHex: startHex as BoardHex,
      movePoints: initialMovePoints,
      boardHexes,
      initialMoveRange,
      gameUnits,
      playerID,
    })
  )

  return moveRange

  //* recursive reduce
}
function moveRangeReduce(params: {
  startHex: BoardHex
  movePoints: number
  boardHexes: BoardHexes
  initialMoveRange: MoveRange
  gameUnits: GameUnits
  playerID: string
}): MoveRange {
  // if we have been to this hex, we mark the move points available, so next time we can skip it if we've arrived with fewer move points
  const hexesVisited: { [hexID: string]: number } = {}
  function recursiveMoveRangeReduce({
    startHex,
    movePoints,
    boardHexes,
    initialMoveRange,
    gameUnits,
    playerID,
  }: {
    startHex: BoardHex
    movePoints: number
    boardHexes: BoardHexes
    initialMoveRange: MoveRange
    gameUnits: GameUnits
    playerID: string
  }): MoveRange {
    const neighbors = selectHexNeighbors(startHex.id, boardHexes)
    const isVisitedAlready = hexesVisited?.[startHex.id] >= movePoints
    //*early out
    if (movePoints <= 0 || isVisitedAlready) {
      return initialMoveRange
    }
    console.count()
    // mark this hex as visited
    hexesVisited[startHex.id] = movePoints
    let nextResults = neighbors.reduce(
      (result: MoveRange, end: BoardHex): MoveRange => {
        const endHexID = end.id
        const endHexUnitID = end.occupyingUnitID
        const endHexUnit = { ...gameUnits[endHexUnitID] }
        const endHexUnitPlayerID = endHexUnit.playerID
        const moveCost = calcMoveCostBetweenNeighbors(startHex, end)
        const movePointsLeftAfterMove = movePoints - moveCost
        const isEndHexOccupied = Boolean(endHexUnitID)
        const isTooCostly = movePointsLeftAfterMove < 0
        const isEndHexEnemyOccupied =
          isEndHexOccupied && endHexUnitPlayerID !== playerID
        const isEndHexFriendlyOccupied = Boolean(
          endHexUnitID && endHexUnitPlayerID === playerID
        )
        const isUnpassable = isTooCostly || isEndHexEnemyOccupied
        if (isUnpassable || isEndHexFriendlyOccupied) {
          result.denied.push(endHexID)
        } else {
          // Not unpassable or occupied, then can be moved to
          result.safe.push(endHexID)
        }

        if (!isUnpassable) {
          const recursiveMoveRange = recursiveMoveRangeReduce({
            startHex: end,
            movePoints: movePointsLeftAfterMove,
            boardHexes,
            initialMoveRange: result,
            gameUnits,
            playerID,
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
    return nextResults
  }
  const finalAnswer = recursiveMoveRangeReduce(params)
  return finalAnswer
}
