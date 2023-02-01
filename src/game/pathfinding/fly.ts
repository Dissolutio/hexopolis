import {
  BoardHexes,
  BoardHex,
  GameUnits,
  GameUnit,
  MoveRange,
  GameArmyCard,
} from '../types'
import {
  selectEngagementsForHex,
  selectHexNeighbors,
  selectIsMoveCausingEngagements,
} from '../selectors'

export function computeFlyMoveRange({
  unmutatedContext,
  startHex,
  movePoints,
  initialMoveRange,
}: {
  unmutatedContext: {
    playerID: string
    unit: GameUnit
    isUnitEngaged: boolean
    hasStealth: boolean
    boardHexes: BoardHexes
    armyCards: GameArmyCard[]
    gameUnits: GameUnits
  }
  // !! these inputs below get mutated in the recursion
  startHex: BoardHex
  movePoints: number
  initialMoveRange: MoveRange
}): MoveRange {
  const { unit, isUnitEngaged, hasStealth, boardHexes, gameUnits, armyCards } =
    unmutatedContext
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
      // FLY DIFFERENCE: 1 move point per hex
      const fromCost = 1
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
      // FLY DIFFERENCE: as soon as you start flying, you take disengagements from all engaged figures, unless you have stealth flying
      const isCausingDisengagement = isUnitEngaged && !hasStealth
      const isMovePointsLeftAfterMove = movePointsLeft > 0
      const isEndHexUnoccupied = !Boolean(endHexUnitID) // (or, i.e. if we are a squad and hex has a treasure glyph, then we cannot stop there)
      const isTooCostly = movePointsLeft < 0

      const isUnpassable = isTooCostly
      const moveRangeData = {
        fromHexID: startHex.id,
        fromCost,
        movePointsLeft,
      }
      // 1. The hex is unpassable
      if (isUnpassable) {
        return result
      }
      // 2. Passable: We can move through this space, and perhaps stop here, and it might cause engagements/disengagements, we can only stop there if it's not occupied
      // order matters for if/else here, disengagement overrides engagement, not the other way around
      if (isCausingDisengagement) {
        if (isEndHexUnoccupied) {
          result[endHexID] = {
            ...moveRangeData,
            isDisengage: true,
          }
        }
      } else if (isCausingEngagement) {
        if (isEndHexUnoccupied) {
          result[endHexID] = {
            ...moveRangeData,
            isEngage: true,
          }
        }
      }
      // isSafe
      else {
        if (isEndHexUnoccupied) {
          result[endHexID] = {
            ...moveRangeData,
            isSafe: true,
          }
        }
      }
      // 3. only continue to neighbors if we have move points left, and we haven't already visited the neighbor before with more move points than we have now
      if (isMovePointsLeftAfterMove && !isVisitedAlready) {
        const recursiveMoveRange = computeFlyMoveRange({
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
    },
    // accumulator for reduce fn
    initialMoveRange
  )
  const result = nextResults
  return result
}
