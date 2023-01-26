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
} from './selectors'

// This function splits on flying/walking/ghostwalking/disengage/stealth-flying
export function calcUnitMoveRange(
  unitID: string,
  boardHexes: BoardHexes,
  gameUnits: GameUnits,
  armyCards: GameArmyCard[]
): MoveRange {
  // 1. return blank move-range if we can't find the unit, its move points, or its start hex
  const initialMoveRange = generateBlankMoveRange()
  const unit = gameUnits[unitID]
  const playerID = unit?.playerID
  const initialMovePoints = unit?.movePoints ?? 0
  const startHex = selectHexForUnit(unit?.unitID ?? '', boardHexes)
  //*early out
  if (!unit || !startHex || !initialMovePoints) {
    return initialMoveRange
  }
  // ?? 1.5. 2-spacer or 1? => Walking, flying, ghost/disengage, stealth-flying, water-tunneling, glacier traverse, etc

  // 2. recursively add hexes to move-range
  const moveRange = computeWalkMoveRange({
    unmutatedContext: {
      playerID,
      unit,
      boardHexes,
      armyCards,
      gameUnits,
    },
    startHex: startHex,
    movePoints: initialMovePoints,
    initialMoveRange,
    hexesVisited: {},
  })
  return moveRange
}

function computeWalkMoveRange({
  unmutatedContext,
  startHex,
  movePoints,
  hexesVisited,
  initialMoveRange,
}: {
  unmutatedContext: {
    playerID: string
    unit: GameUnit
    boardHexes: BoardHexes
    armyCards: GameArmyCard[]
    gameUnits: GameUnits
  }
  // !! these inputs below get mutated in the recursion
  startHex: BoardHex
  movePoints: number
  hexesVisited: { [hexID: string]: number }
  initialMoveRange: MoveRange
}): MoveRange {
  const { playerID, unit, boardHexes, gameUnits, armyCards } = unmutatedContext
  const neighbors = selectHexNeighbors(startHex.id, boardHexes)
  const isVisitedAlready = hexesVisited?.[startHex.id] >= movePoints
  //*early out
  if (movePoints <= 0 || isVisitedAlready) {
    return initialMoveRange
  }
  // mark this hex as visited
  hexesVisited[startHex.id] = movePoints
  // Neighbors are either passable or unpassable
  let nextResults = neighbors.reduce(
    (result: MoveRange, neighbor: BoardHex): MoveRange => {
      if (hexesVisited[neighbor.id] >= movePoints) {
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
      const isCausingDisengagement = selectIsMoveCausingDisengagements({
        unit,
        endHexID,
        boardHexes,
        gameUnits,
        armyCards,
      })
      const endHexUnit = { ...gameUnits[endHexUnitID] }
      const endHexUnitPlayerID = endHexUnit.playerID
      const fromCost = calcMoveCostBetweenNeighbors(startHex, neighbor)
      const movePointsLeft = movePoints - fromCost
      const isMovePointsLeftAfterMove = movePointsLeft > 0
      const isEndHexUnoccupied = !Boolean(endHexUnitID)
      const isTooCostly = movePointsLeft < 0
      const isNotAlreadyVisited =
        !hexesVisited[endHexID] || hexesVisited[endHexID] < movePointsLeft

      const isEndHexEnemyOccupied =
        !isEndHexUnoccupied && endHexUnitPlayerID !== playerID
      // TODO: Ability: isEndHexUnitEngaged : ghost walk, or phantom walk
      const isEndHexUnitEngaged =
        selectEngagementsForHex({
          hexID: neighbor.id,
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
        if (isMovePointsLeftAfterMove && isNotAlreadyVisited) {
          // this console.count will show you the number of times we visit a hex
          // console.count(endHexID)
          const recursiveMoveRange = computeWalkMoveRange({
            unmutatedContext,
            startHex: neighbor,
            movePoints: movePointsLeft,
            initialMoveRange: result,
            hexesVisited,
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
