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
  selectIsMoveCausingDisengagements,
  selectHexNeighbors,
  selectIsMoveCausingEngagements,
  selectIsClimbable,
  selectValidTailHexes,
} from '../selectors'

export function computeWalkMoveRange({
  unmutatedContext,
  startHex,
  movePoints,
  initialMoveRange,
}: {
  unmutatedContext: {
    playerID: string
    unit: GameUnit
    isUnitEngaged: boolean
    isFlying: boolean
    hasDisengage: boolean
    hasGhostWalk: boolean
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
  const {
    playerID,
    unit,
    isUnitEngaged,
    isFlying,
    hasDisengage,
    hasGhostWalk,
    hasStealth,
    boardHexes,
    gameUnits,
    armyCards,
  } = unmutatedContext
  const isUnit2Hex = unit?.is2Hex
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
      const fromCost = isFlying
        ? 1
        : calcMoveCostBetweenNeighbors(startHex, neighbor)
      const isFromOccupied = Boolean(startHex.occupyingUnitID)
      const validTailSpotsForNeighbor = selectValidTailHexes(
        neighbor.id,
        boardHexes
      )
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
      // as soon as you start flying, you take disengagements from all engaged figures, unless you have stealth flying
      const isCausingDisengagementIfFlying = isUnitEngaged && !hasStealth
      const isCausingDisengagementIfWalking = hasDisengage
        ? false
        : selectIsMoveCausingDisengagements({
            unit,
            endHexID,
            boardHexes,
            gameUnits,
            armyCards,
          })
      const isCausingDisengagement = isFlying
        ? isCausingDisengagementIfFlying
        : isCausingDisengagementIfWalking
      const endHexUnit = { ...gameUnits[endHexUnitID] }
      const endHexUnitPlayerID = endHexUnit.playerID
      const isMovePointsLeftAfterMove = movePointsLeft > 0
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
      const isUnpassable = isFlying
        ? isTooCostly
        : isTooCostly ||
          // ghost walk can move through enemy occupied hexes, or hexes with engaged units
          (hasGhostWalk ? false : isEndHexEnemyOccupied) ||
          (hasGhostWalk ? false : isEndHexUnitEngaged) ||
          isTooTallOfClimb
      const can1HexUnitStopHere = isEndHexUnoccupied
      const can2HexUnitStopHere =
        isEndHexUnoccupied &&
        !isFromOccupied &&
        validTailSpotsForNeighbor.map((h) => h.id).includes(startHex.id)
      const canStopHere = isUnit2Hex ? can2HexUnitStopHere : can1HexUnitStopHere
      const moveRangeData = {
        fromHexID: startHex.id,
        fromCost,
        isFromOccupied,
        movePointsLeft,
      }
      // 1. unpassable
      if (isUnpassable) {
        return result
      }
      // 2. passable: we can get here, maybe stop, maybe pass thru
      // order matters for if/else-if here, disengagement overrides engagement
      if (isCausingDisengagement) {
        if (canStopHere) {
          result[endHexID] = {
            ...moveRangeData,
            isDisengage: true,
          }
        }
        // walking does not recurse past disengagement hexes
        return isFlying
          ? {
              ...result,
              ...computeWalkMoveRange({
                unmutatedContext,
                startHex: neighbor,
                movePoints: movePointsLeft,
                initialMoveRange: result,
              }),
            }
          : result
      } else if (isCausingEngagement) {
        // we can stop there
        if (canStopHere) {
          result[endHexID] = {
            ...moveRangeData,
            isEngage: true,
          }
        }
        // walking does not recurse past engagement hexes
        return isFlying
          ? {
              ...result,
              ...computeWalkMoveRange({
                unmutatedContext,
                startHex: neighbor,
                movePoints: movePointsLeft,
                initialMoveRange: result,
              }),
            }
          : result
      }
      // safe hexes
      else {
        // we can stop there if it's not occupied
        if (canStopHere) {
          result[endHexID] = {
            ...moveRangeData,
            isSafe: true,
          }
        }
        // walking and flying both recurse past safe hexes
        return isMovePointsLeftAfterMove
          ? {
              ...result,
              ...computeWalkMoveRange({
                unmutatedContext,
                startHex: neighbor,
                movePoints: movePointsLeft,
                initialMoveRange: result,
              }),
            }
          : result
      }
    },
    // accumulator for reduce fn
    initialMoveRange
  )
  const result = nextResults
  return result
}
