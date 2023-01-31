import {
  BoardHexes,
  BoardHex,
  GameUnits,
  GameUnit,
  MoveRange,
  GameArmyCard,
} from './types'
import { generateBlankMoveRange } from './constants'
import {
  calcMoveCostBetweenNeighbors,
  selectEngagementsForHex,
  selectIsMoveCausingDisengagements,
  selectHexForUnit,
  selectHexNeighbors,
  selectIsMoveCausingEngagements,
  selectIfGameArmyCardHasFlying,
  selectIsClimbable,
  selectIfGameArmyCardHasDisengage,
} from './selectors'

// This function splits on flying/walking/ghostwalking/disengage/stealth-flying
export function calcUnitMoveRange(
  unitID: string,
  isWalkingFlyer: boolean,
  boardHexes: BoardHexes,
  gameUnits: GameUnits,
  armyCards: GameArmyCard[]
): MoveRange {
  // 1. return blank move-range if we can't find the unit, its move points, or its start hex
  const initialMoveRange = generateBlankMoveRange()
  const unit = gameUnits[unitID]
  const unitGameCard = armyCards.find(
    (card) => card.gameCardID === unit?.gameCardID
  )
  const { hasFlying, hasStealth } = selectIfGameArmyCardHasFlying(unitGameCard)
  const { hasDisengage, hasGhostWalk } =
    selectIfGameArmyCardHasDisengage(unitGameCard)
  const isFlying = isWalkingFlyer ? false : hasFlying
  const playerID = unit?.playerID
  const initialMovePoints = unit?.movePoints ?? 0
  const startHex = selectHexForUnit(unit?.unitID ?? '', boardHexes)
  //*early out
  if (!unit || !startHex || !initialMovePoints) {
    return initialMoveRange
  }

  // 2. recursively add hexes to move-range: 2-spacer or 1? => Walking, flying, ghost/disengage, stealth-flying, water-tunneling, glacier traverse, etc
  const moveRange = isFlying
    ? computeFlyMoveRange({
        unmutatedContext: {
          playerID,
          unit,
          hasStealth,
          boardHexes,
          armyCards,
          gameUnits,
        },
        startHex: startHex,
        movePoints: initialMovePoints,
        initialMoveRange,
      })
    : computeWalkMoveRange({
        unmutatedContext: {
          playerID,
          unit,
          hasDisengage,
          hasGhostWalk,
          boardHexes,
          armyCards,
          gameUnits,
        },
        startHex: startHex,
        movePoints: initialMovePoints,
        initialMoveRange,
      })
  return moveRange
}

function computeWalkMoveRange({
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
          /*  DEV LOGGING
          // this console.count will show you the number of times we visit a hex
          // console.count(endHexID)
          // console.count('total')
          */
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

function computeFlyMoveRange({
  unmutatedContext,
  startHex,
  movePoints,
  initialMoveRange,
}: {
  unmutatedContext: {
    playerID: string
    unit: GameUnit
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
  const { unit, hasStealth, boardHexes, gameUnits, armyCards } =
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
      const initialEngagements: string[] = selectEngagementsForHex({
        hexID: startHex.id,
        overrideUnitID: unit.unitID,
        boardHexes,
        gameUnits,
        armyCards,
      })
      const isCausingDisengagement =
        initialEngagements.length > 0 && !hasStealth
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
