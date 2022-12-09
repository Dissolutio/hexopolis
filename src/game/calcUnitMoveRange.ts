import {
  BoardHexes,
  BoardHex,
  GameUnits,
  GameUnit,
  MoveRange,
  GameArmyCard,
} from './types'
import { generateBlankMoveRange } from './constants'
import { uniq } from 'lodash'
import {
  calcMoveCostBetweenNeighbors,
  selectEngagementsForHex,
  selectEngagementsForUnit,
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
  gameUnits: GameUnits,
  armyCards: GameArmyCard[]
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
  const initialEngagements: string[] = selectEngagementsForUnit({
    unitID: unit?.unitID ?? '',
    boardHexes,
    gameUnits,
    armyCards,
  })
  // 2. recursively add hexes to move-range
  const moveRange = computeWalkMoveRange({
    startHex: startHex as BoardHex,
    movePoints: initialMovePoints,
    boardHexes,
    gameUnits,
    armyCards,
    initialMoveRange,
    initialEngagements,
    playerID,
    hexesVisited: {},
  })

  return moveRange
}

function computeWalkMoveRange({
  startHex,
  movePoints,
  boardHexes,
  gameUnits,
  armyCards,
  initialMoveRange,
  initialEngagements,
  playerID,
  hexesVisited,
}: {
  startHex: BoardHex
  movePoints: number
  playerID: string
  initialMoveRange: MoveRange
  initialEngagements: string[]
  hexesVisited: { [hexID: string]: number }
  boardHexes: BoardHexes
  gameUnits: GameUnits
  armyCards: GameArmyCard[]
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
      const engagementsForCurrentHex = selectEngagementsForHex({
        hexID: end.id,
        playerID,
        boardHexes,
        gameUnits,
        armyCards,
        overrideUnitID: end.occupyingUnitID,
      })
      const isCausingEngagement = engagementsForCurrentHex.some(
        (currentEngagement) => !initialEngagements.includes(currentEngagement)
      )
      const endHexUnit = { ...gameUnits[endHexUnitID] }
      const endHexUnitPlayerID = endHexUnit.playerID
      const moveCost = calcMoveCostBetweenNeighbors(startHex, end)
      const movePointsLeftAfterMove = movePoints - moveCost
      const isEndHexOccupied = Boolean(endHexUnitID)
      const isTooCostly = movePointsLeftAfterMove < 0
      const isEndHexEnemyOccupied =
        isEndHexOccupied && endHexUnitPlayerID !== playerID
      const isUnpassable = isTooCostly || isEndHexEnemyOccupied
      // if it's not unpassable, we can move there, but we only continue the recursion if it's a SAFE
      if (!isUnpassable) {
        result.safe.push(endHexID)
        const recursiveMoveRange = computeWalkMoveRange({
          startHex: end,
          movePoints: movePointsLeftAfterMove,
          boardHexes,
          initialMoveRange: result,
          initialEngagements,
          gameUnits,
          playerID,
          hexesVisited: hexesVisitedCopy,
          armyCards,
        })
        return {
          ...result,
          ...recursiveMoveRange,
        }
      } else {
        return result
      }
    },
    // accumulator for reduce fn
    initialMoveRange
  )
  return deduplicateMoveRange(nextResults)
}
