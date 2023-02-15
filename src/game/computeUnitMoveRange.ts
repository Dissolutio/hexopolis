import {
  BoardHexes,
  GameUnits,
  MoveRange,
  GameArmyCard,
  GameUnit,
  BoardHex,
} from './types'
import { generateBlankMoveRange } from './constants'
import {
  selectHexForUnit,
  selectEngagementsForHex,
  selectHexNeighbors,
  selectMoveCostBetweenNeighbors,
  selectValidTailHexes,
  selectMoveEngagedUnitIDs,
  selectMoveDisengagedUnitIDs,
  selectIsClimbable,
  selectTailHexForUnit,
} from './selectors'
import {
  selectIfGameArmyCardHasDisengage,
  selectIfGameArmyCardHasFlying,
} from './selector/card-selectors'
import { uniq } from 'lodash'

const mergeTwoMoveRanges = (a: MoveRange, b: MoveRange): MoveRange => {
  // returns a new object with the highest movePointsLeft for each hex
  const mergedMoveRange: MoveRange = { ...a }
  for (const key in b) {
    if (b[key].movePointsLeft > (a?.[key]?.movePointsLeft ?? -1)) {
      mergedMoveRange[key] = b[key]
    }
  }
  return mergedMoveRange
}

// This function splits on flying/walking/ghostwalking/disengage/stealth-flying
export function computeUnitMoveRange(
  unit: GameUnit,
  isFlying: boolean,
  isGrappleGun: boolean,
  hasMoved: boolean,
  boardHexes: BoardHexes,
  gameUnits: GameUnits,
  armyCards: GameArmyCard[]
): MoveRange {
  // 1. return blank move-range if we can't find the unit, its move points, or its start hex
  const initialMoveRange = generateBlankMoveRange()
  const unitUid = unit.unitID
  const unitGameCard = armyCards.find(
    (card) => card.gameCardID === unit?.gameCardID
  )
  const { hasStealth } = selectIfGameArmyCardHasFlying(unitGameCard)
  const { hasDisengage, hasGhostWalk } =
    selectIfGameArmyCardHasDisengage(unitGameCard)
  const playerID = unit?.playerID
  const initialMovePoints = unit?.movePoints ?? 0
  const startHex = selectHexForUnit(unit?.unitID ?? '', boardHexes)
  // mutate tailHex if unit is 2-space
  let tailHex
  const isTwoSpace = unit.is2Hex
  if (isTwoSpace) {
    tailHex = selectTailHexForUnit(unitUid, boardHexes)
  }
  const initialEngagements: string[] = selectEngagementsForHex({
    hexID: startHex?.id ?? '',
    boardHexes,
    gameUnits,
    armyCards,
  })
  //*early out
  if (!unit || !startHex || !initialMovePoints || (isTwoSpace && !tailHex)) {
    return initialMoveRange
  }
  let moveRange: MoveRange = {}
  if (isTwoSpace && tailHex) {
    const sharedParamsForHeadAndTail = {
      unmutatedContext: {
        playerID,
        unit,
        initialEngagements,
        isFlying,
        hasStealth,
        hasDisengage,
        hasGhostWalk,
        boardHexes,
        armyCards,
        gameUnits,
      },
      prevEngagements: initialEngagements,
      movePoints: initialMovePoints,
      initialMoveRange,
    }
    moveRange = mergeTwoMoveRanges(
      recurseThroughMoves({
        ...sharedParamsForHeadAndTail,
        startHex: startHex,
        startTailHex: tailHex,
      }),
      recurseThroughMoves({
        ...sharedParamsForHeadAndTail,
        startHex: tailHex,
        startTailHex: startHex,
      })
    )
  } else {
    moveRange = recurseThroughMoves({
      unmutatedContext: {
        playerID,
        unit,
        initialEngagements,
        isFlying,
        // only passing isGrappleGun to one spacers because Sgt. Drake is a 1-space unit
        isGrappleGun,
        hasStealth,
        hasDisengage,
        hasGhostWalk,
        boardHexes,
        armyCards,
        gameUnits,
      },
      startHex: startHex,
      prevEngagements: initialEngagements,
      // grapple gun is not a normal move, we treat it like flying so we make up the notion of a move point for it, and give Drake 1 move point
      movePoints: isGrappleGun ? (hasMoved ? 0 : 1) : initialMovePoints,
      initialMoveRange,
    })
  }
  return moveRange
}

function recurseThroughMoves({
  unmutatedContext,
  prevHexesDisengagedUnitIDs,
  startHex,
  startTailHex,
  movePoints,
  initialMoveRange,
}: {
  unmutatedContext: {
    playerID: string
    unit: GameUnit
    initialEngagements: string[]
    isFlying: boolean
    isGrappleGun?: boolean
    hasDisengage: boolean
    hasGhostWalk: boolean
    hasStealth: boolean
    boardHexes: BoardHexes
    armyCards: GameArmyCard[]
    gameUnits: GameUnits
  }
  prevHexesDisengagedUnitIDs?: string[]
  prevEngagements: string[]
  // !! these inputs below get mutated in the recursion
  startHex: BoardHex
  startTailHex?: BoardHex
  movePoints: number
  initialMoveRange: MoveRange
}): MoveRange {
  const {
    playerID,
    unit,
    initialEngagements,
    isFlying,
    isGrappleGun,
    hasDisengage,
    hasGhostWalk,
    hasStealth,
    boardHexes,
    gameUnits,
    armyCards,
  } = unmutatedContext
  const startHexID = startHex.id
  const isVisitedAlready =
    (initialMoveRange?.[startHexID]?.movePointsLeft ?? 0) > movePoints
  const isUnitInitiallyEngaged = initialEngagements.length > 0
  //*early out
  if (movePoints <= 0 || isVisitedAlready) {
    return initialMoveRange
  }
  const isUnit2Hex = unit?.is2Hex
  const neighbors = selectHexNeighbors(startHexID, boardHexes)
  // Neighbors are either passable or unpassable
  let nextResults = neighbors.reduce(
    (acc: MoveRange, neighbor: BoardHex): MoveRange => {
      const isFromOccupied =
        startHex.occupyingUnitID && startHex.occupyingUnitID !== unit.unitID
      const validTailSpotsForNeighbor = selectValidTailHexes(
        neighbor.id,
        boardHexes
      ).map((hex) => hex.id)
      const isStartHexWater = startHex.terrain === 'water'
      const isNeighborHexWater = neighbor.terrain === 'water'
      const isWaterStoppage =
        (isUnit2Hex && isStartHexWater && isNeighborHexWater) ||
        (!isUnit2Hex && isNeighborHexWater)
      const fromCost =
        isFlying || isGrappleGun
          ? // flying is just one point to go anywhere, so is grapple-gun up to 25-height
            1
          : // when a unit enters water, or a 2-spacer enters its second space of water, it causes their movement to end (we charge all their move points)
          isWaterStoppage
          ? movePoints
          : selectMoveCostBetweenNeighbors(startHex, neighbor)
      const movePointsLeft = movePoints - fromCost
      const isVisitedAlready =
        initialMoveRange?.[neighbor.id]?.movePointsLeft >= movePointsLeft
      if (isVisitedAlready) {
        return acc
      }
      const { id: neighborHexID, occupyingUnitID: neighborUnitID } = neighbor
      // selectIsMoveCausingEngagements should return the unitID of the unit that is being engaged
      const disengagedUnitIDs = selectMoveDisengagedUnitIDs({
        unit,
        isFlying,
        startHexID: startHexID,
        startTailHexID: startTailHex?.id,
        neighborHexID,
        boardHexes,
        gameUnits,
        armyCards,
      })
      const totalDisengagedIDsSoFar = uniq([
        ...(prevHexesDisengagedUnitIDs ?? []),
        ...disengagedUnitIDs,
      ])
      const engagedUnitIDs = selectMoveEngagedUnitIDs({
        unit,
        startHexID,
        neighborHexID,
        boardHexes,
        gameUnits,
        armyCards,
      })
      const isCausingEngagement = engagedUnitIDs.length > 0
      // as soon as you start flying, you take disengagements from all engaged figures, unless you have stealth flying
      const isCausingDisengagementIfFlying =
        isUnitInitiallyEngaged && !hasStealth
      const isCausingDisengagementIfWalking = hasDisengage
        ? false
        : totalDisengagedIDsSoFar.length > 0
      const isCausingDisengagement = isFlying
        ? isCausingDisengagementIfFlying
        : isCausingDisengagementIfWalking
      const endHexUnit = { ...gameUnits[neighborUnitID] }
      const endHexUnitPlayerID = endHexUnit.playerID
      const isMovePointsLeftAfterMove = movePointsLeft > 0
      const isEndHexUnoccupied = !Boolean(neighborUnitID)
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
        neighbor,
        // overrideDelta: grapple gun allows you to go up 25 levels higher than where you are
        isGrappleGun ? 26 : undefined
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
        validTailSpotsForNeighbor?.includes(startHexID)
      const canStopHere = isUnit2Hex ? can2HexUnitStopHere : can1HexUnitStopHere
      const moveRangeData = {
        fromHexID: startHexID,
        fromCost,
        isFromOccupied,
        movePointsLeft,
        disengagedUnitIDs: totalDisengagedIDsSoFar,
        engagedUnitIDs,
      }
      // 1. unpassable
      if (isUnpassable) {
        return acc
      }
      // 2. passable: we can get here, maybe stop, maybe pass thru
      // order matters for if/else-if here, disengagement overrides engagement
      if (isCausingDisengagement) {
        if (canStopHere) {
          acc[neighborHexID] = {
            ...moveRangeData,
            isDisengage: true,
            isGrappleGun,
          }
        }
        return {
          ...acc,
          ...recurseThroughMoves({
            unmutatedContext,
            prevHexesDisengagedUnitIDs: totalDisengagedIDsSoFar,
            prevEngagements: engagedUnitIDs,
            startHex: neighbor,
            movePoints: movePointsLeft,
            initialMoveRange: acc,
          }),
        }
      } else if (isCausingEngagement) {
        // we can stop there
        if (canStopHere) {
          acc[neighborHexID] = {
            ...moveRangeData,
            isEngage: true,
            isGrappleGun,
          }
        }
        // walking does not recurse past engagement hexes
        return {
          ...acc,
          ...recurseThroughMoves({
            unmutatedContext,
            prevHexesDisengagedUnitIDs: disengagedUnitIDs,
            prevEngagements: engagedUnitIDs,
            startHex: neighbor,
            startTailHex: isUnit2Hex ? startHex : undefined,
            movePoints: movePointsLeft,
            initialMoveRange: acc,
          }),
        }
      }
      // safe hexes
      else {
        // we can stop there if it's not occupied
        if (canStopHere) {
          acc[neighborHexID] = {
            ...moveRangeData,
            isSafe: true,
            isGrappleGun,
          }
        }
        // walking and flying both recurse past safe hexes
        return isMovePointsLeftAfterMove
          ? {
              ...acc,
              ...recurseThroughMoves({
                unmutatedContext,
                prevHexesDisengagedUnitIDs: disengagedUnitIDs,
                prevEngagements: engagedUnitIDs,
                startHex: neighbor,
                startTailHex: isUnit2Hex ? startHex : undefined,
                movePoints: movePointsLeft,
                initialMoveRange: acc,
              }),
            }
          : acc
      }
    },
    // accumulator for reduce fn
    initialMoveRange
  )
  const result = nextResults
  return result
}
