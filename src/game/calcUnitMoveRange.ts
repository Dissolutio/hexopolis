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
  selectIsMoveCausingDisengagements,
  selectHexForUnit,
  selectHexNeighbors,
  selectIsMoveCausingEngagements,
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
    unit,
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
  unit,
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
  unit: GameUnit
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
      const isCausingEngagement = selectIsMoveCausingEngagements({
        unit,
        endHexID,
        boardHexes,
        gameUnits,
        armyCards,
      })
      const isCausingDisengagement = selectIsMoveCausingDisengagements({
        unit,
        endHexID,
        boardHexes,
        gameUnits,
        armyCards,
      })
      const endHexUnit = { ...gameUnits[endHexUnitID] }
      const endHexUnitPlayerID = endHexUnit.playerID
      const moveCost = calcMoveCostBetweenNeighbors(startHex, end)
      const movePointsLeftAfterMove = movePoints - moveCost
      const isEndHexUnoccupied = !Boolean(endHexUnitID)
      const isTooCostly = movePointsLeftAfterMove < 0
      const isEndHexEnemyOccupied =
        !isEndHexUnoccupied && endHexUnitPlayerID !== playerID
      // TODO: Ability: isEndHexUnitEngaged : ghost walk, or phantom walk
      const isEndHexUnitEngaged =
        selectEngagementsForHex({
          hexID: end.id,
          playerID,
          boardHexes,
          gameUnits,
          armyCards,
        }).length > 0
      // Boolean(
      //   endHexUnitID && endHexUnitPlayerID === playerID
      // )
      const isUnpassable =
        isTooCostly || isEndHexEnemyOccupied || isEndHexUnitEngaged
      if (isUnpassable) {
        return result
      }
      // Last Block: Passable: We can move there, but we only continue the recursion if it's a SAFE
      // order matters for if/else here, disengagement overrides engagement, not the other way around
      if (isCausingDisengagement) {
        // the space causes disengagements, so no recursion, and we can only stop there if it's not occupied
        if (isEndHexUnoccupied) {
          result.disengage.push(endHexID)
        }
        // we do not continue recursion past disengagement hexes
        return { ...result }
      } else if (isCausingEngagement) {
        // the space causes engagements, so no recursion, and we can only stop there if it's not occupied
        if (isEndHexUnoccupied) {
          result.engage.push(endHexID)
        }
        // we do not continue recursion past engagement hexes
        return { ...result }
      } else {
        // the space is safe to pass thru, continue to neighbors but we can only stop there if it's not occupied (or, i.e. if we are a squad and hex has a treasure glyph, then we cannot stop there)
        if (isEndHexUnoccupied) {
          result.safe.push(endHexID)
        }
        const recursiveMoveRange = computeWalkMoveRange({
          startHex: end,
          movePoints: movePointsLeftAfterMove,
          unit,
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
      }
    },
    // accumulator for reduce fn
    initialMoveRange
  )
  return deduplicateMoveRange(nextResults)
}
