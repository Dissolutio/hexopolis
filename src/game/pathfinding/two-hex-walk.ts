import {
  BoardHexes,
  BoardHex,
  GameUnits,
  GameUnit,
  MoveRange,
  GameArmyCard,
} from '../types'
import {
  calcMoveCostBetweenNeighbors,
  selectEngagementsForHex,
  selectHexNeighbors,
  selectIsClimbable,
  selectIsMoveCausingDisengagements,
  selectIsMoveCausingEngagements,
} from '../selectors'
import { computeWalkMoveRange } from './walk'

export function compute2HexWalkMoveRange({
  unmutatedContext,
  startHex,
  movePoints,
  initialMoveRange,
}: {
  unmutatedContext: {
    playerID: string
    unit: GameUnit
    hasDisengage: boolean
    hasGhostWalk: boolean
    boardHexes: BoardHexes
    armyCards: GameArmyCard[]
    gameUnits: GameUnits
  }
  // !! these inputs below get mutated in the recursion
  startHex: BoardHex
  movePoints: number
  initialMoveRange: MoveRange
}): MoveRange {
  const {
    playerID,
    unit,
    hasDisengage,
    hasGhostWalk,
    boardHexes,
    gameUnits,
    armyCards,
  } = unmutatedContext
  const neighbors = selectHexNeighbors(startHex.id, boardHexes)
  const isVisitedAlready =
    (initialMoveRange?.[startHex.id]?.movePointsLeft ?? 0) > movePoints

  //*early out
  if (movePoints <= 0 || isVisitedAlready) {
    return initialMoveRange
  }
  // Neighbors are either passable or unpassable
  let nextResults = neighbors.reduce(
    (result: MoveRange, neighbor: BoardHex): MoveRange => {
      const fromCost = calcMoveCostBetweenNeighbors(startHex, neighbor)
      const movePointsLeft = movePoints - fromCost
      const isVisitedAlready =
        initialMoveRange?.[neighbor.id]?.movePointsLeft >= movePointsLeft
      if (isVisitedAlready) {
        return result
      }
      const { id: endHexID, occupyingUnitID: endHexUnitID } = neighbor
      const isCausingEngagement = selectIsMoveCausingEngagements({
        unit,
        endHexID,
        boardHexes,
        gameUnits,
        armyCards,
      })
      const isCausingDisengagement = hasDisengage
        ? false
        : selectIsMoveCausingDisengagements({
            unit,
            endHexID,
            boardHexes,
            gameUnits,
            armyCards,
          })
      const endHexUnit = { ...gameUnits[endHexUnitID] }
      const endHexUnitPlayerID = endHexUnit.playerID
      const isEndHexUnoccupied = !Boolean(endHexUnitID)
      const isTooCostly = movePointsLeft < 0

      const isEndHexEnemyOccupied =
        !isEndHexUnoccupied && endHexUnitPlayerID !== playerID
      const isEndHexUnitEngaged =
        selectEngagementsForHex({
          hexID: neighbor.id,
          boardHexes,
          gameUnits,
          armyCards,
        }).length > 0
      const isTooTallOfClimb = !selectIsClimbable(
        unit,
        armyCards,
        startHex,
        neighbor
      )
      const isUnpassable =
        isTooCostly ||
        // ghost walk can move through enemy occupied hexes, or hexes with engaged units
        (hasGhostWalk ? false : isEndHexEnemyOccupied) ||
        (hasGhostWalk ? false : isEndHexUnitEngaged) ||
        isTooTallOfClimb
      const moveRangeData = {
        fromHexID: startHex.id,
        fromCost,
        movePointsLeft,
      }
      const isMovePointsLeftAfterMove = movePointsLeft > 0
      // 1. The hex is unpassable
      if (isUnpassable) {
        return result
      }
      // 2. Passable: We can move there, but we only continue the recursion if it's a SAFE
      // order matters for if/else here, disengagement overrides engagement, not the other way around
      if (isCausingDisengagement) {
        // the space causes disengagements, so no recursion, and we can only stop there if it's not occupied
        if (isEndHexUnoccupied) {
          result[endHexID] = {
            ...moveRangeData,
            isDisengage: true,
          }
        }
        // we do not continue recursion past disengagement hexes
        // TODO:  Is the object spread below necessary?
        return { ...result }
      } else if (isCausingEngagement) {
        // the space causes engagements, so no recursion, and we can only stop there if it's not occupied
        if (isEndHexUnoccupied) {
          result[endHexID] = {
            ...moveRangeData,
            isEngage: true,
          }
        }
        // we do not continue recursion past engagement hexes
        return { ...result }
      }
      // else: the space is safe, so maybe we can stop here, and maybe we can continue looking at neighbors from here
      else {
        // IF: we can only stop there if it's not occupied
        // (or, i.e. if we are a squad and hex has a treasure glyph, then we cannot stop there)
        if (isEndHexUnoccupied) {
          result[endHexID] = {
            ...moveRangeData,
            isSafe: true,
          }
        }
        // only continue to neighbors if we have move points left and we haven't visited this hex before with more move points
        if (isMovePointsLeftAfterMove && !isVisitedAlready) {
          const recursiveMoveRange = computeWalkMoveRange({
            unmutatedContext,
            startHex: neighbor,
            movePoints: movePointsLeft,
            initialMoveRange: result,
          })
          return {
            ...result,
            ...recursiveMoveRange,
          }
        } else {
          return result
        }
      }
    },
    // accumulator for reduce fn
    initialMoveRange
  )
  const result = nextResults
  return result
}
