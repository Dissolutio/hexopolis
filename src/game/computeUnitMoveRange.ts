import {
  BoardHexes,
  GameUnits,
  MoveRange,
  GameArmyCard,
  GameUnit,
  BoardHex,
  HexTerrain,
  Glyphs,
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
  selectIsFallDamage,
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
  armyCards: GameArmyCard[],
  glyphs: Glyphs
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
  //*early out
  if (!unit || !startHex || !initialMovePoints || (isTwoSpace && !tailHex)) {
    return initialMoveRange
  }
  const initialEngagements: string[] = selectEngagementsForHex({
    hexID: startHex.id,
    boardHexes,
    gameUnits,
    armyCards,
  })
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
        glyphs,
      },
      prevHexesEngagedUnitIDs: initialEngagements,
      prevHexFallDamage: 0,
      movePoints: initialMovePoints,
      initialMoveRange,
    }
    moveRange = mergeTwoMoveRanges(
      recurseThroughMoves({
        ...sharedParamsForHeadAndTail,
        prevHex: startHex,
        startTailHex: tailHex,
      }),
      recurseThroughMoves({
        ...sharedParamsForHeadAndTail,
        prevHex: tailHex,
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
        glyphs,
      },
      prevHex: startHex,
      prevHexesEngagedUnitIDs: initialEngagements,
      prevHexFallDamage: 0,
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
  prevHexesEngagedUnitIDs,
  prevHexFallDamage,
  prevHex,
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
    glyphs: Glyphs
  }
  prevHexesDisengagedUnitIDs?: string[]
  prevHexesEngagedUnitIDs: string[]
  prevHexFallDamage: number
  // !! these inputs below get mutated in the recursion
  prevHex: BoardHex
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
    glyphs,
  } = unmutatedContext
  const startHexID = prevHex.id
  const isVisitedAlready =
    (initialMoveRange?.[startHexID]?.movePointsLeft ?? 0) > movePoints
  const isUnitInitiallyEngaged = initialEngagements.length > 0
  //*early out (WARNING: This isVisitedAlready check seems redundant, but actually the stack will blow up without it AKA it needs something to tell the recursion monster to stop)
  if (movePoints <= 0 || isVisitedAlready) {
    return initialMoveRange
  }
  const isUnit2Hex = unit?.is2Hex
  const neighbors = selectHexNeighbors(startHexID, boardHexes)
  // Neighbors are either passable or unpassable
  let nextResults = neighbors.reduce(
    (acc: MoveRange, neighbor: BoardHex): MoveRange => {
      const isFromOccupied =
        prevHex.occupyingUnitID && prevHex.occupyingUnitID !== unit.unitID
      const validTailSpotsForNeighbor = selectValidTailHexes(
        neighbor.id,
        boardHexes
      ).map((hex) => hex.id)
      const isStartHexWater = prevHex.terrain === HexTerrain.water
      const isNeighborHexWater = neighbor.terrain === HexTerrain.water
      // TODO: GLYPH SPECIAL: squad units cannot step on healer glyphs
      const isGlyphStoppage = !!glyphs[neighbor.id]
      const isGlyphRevealed = !!glyphs[neighbor.id]?.isRevealed
      // TODO: GLYPH SPECIAL: isActionGlyph: Also if it's a special stage glyph (healer, summoner, curse)
      const isActionGlyph = isGlyphStoppage && !isGlyphRevealed
      const isWaterStoppage =
        (isUnit2Hex && isStartHexWater && isNeighborHexWater) ||
        (!isUnit2Hex && isNeighborHexWater)
      // fromCost is where we consider non-flyers and the water or glyphs they might walk onto
      const walkCost = selectMoveCostBetweenNeighbors(prevHex, neighbor)
      const fromCost =
        // when a unit enters water, or a 2-spacer enters its second space of water, or a unit steps on a glyph with its leading hex (AKA stepping ONTO glyphs) it causes their movement to end (we charge all their move points)
        isWaterStoppage || isGlyphStoppage
          ? Math.max(movePoints, walkCost)
          : // flying is just one point to go hex-to-hex, so is grapple-gun (up to 25-height)
          isFlying || isGrappleGun
          ? 1
          : walkCost
      const movePointsLeft = movePoints - fromCost
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
      // if we had same move points left, tie breaker is less-disengaged-units, otherwise, more move points left
      const isVisitedAlready =
        initialMoveRange?.[neighbor.id]?.movePointsLeft === movePointsLeft
          ? initialMoveRange?.[neighbor.id]?.disengagedUnitIDs <=
            disengagedUnitIDs
          : initialMoveRange?.[neighbor.id]?.movePointsLeft > movePointsLeft
      if (isVisitedAlready) {
        return acc
      }
      const totalDisengagedIDsSoFar = uniq([
        ...(prevHexesDisengagedUnitIDs ?? []),
        ...disengagedUnitIDs,
      ])
      const latestEngagedUnitIDs = selectMoveEngagedUnitIDs({
        unit,
        startHexID,
        neighborHexID,
        boardHexes,
        gameUnits,
        armyCards,
      })
      const neighborHexEngagements = selectEngagementsForHex({
        hexID: neighbor.id,
        boardHexes,
        gameUnits,
        armyCards,
        override: {
          overrideUnitID: unit.unitID,
          overrideTailHexID: prevHex.id,
        },
      })
      const isCausingEngagement =
        latestEngagedUnitIDs.length > 0 ||
        // the idea is if you engaged new units IDs from your start spot, you are causing an engagement, even if you didn't engage any new units IDs from your neighbor spot
        neighborHexEngagements.some((id) => !initialEngagements.includes(id))
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
        prevHex,
        neighbor,
        // overrideDelta: grapple gun allows you to go up 25 levels higher than where you are
        isGrappleGun ? 26 : undefined
      )
      const newFallDamage =
        prevHexFallDamage +
        selectIsFallDamage(unit, armyCards, prevHex, neighbor)
      const isFallDamage = newFallDamage > 0
      const isUnpassable = isFlying
        ? isTooCostly
        : isTooCostly ||
          // ghost walk can move through enemy occupied hexes, or hexes with engaged units
          (hasGhostWalk ? false : isEndHexEnemyOccupied) ||
          (hasGhostWalk ? false : isEndHexUnitEngaged) ||
          isTooTallOfClimb
      const can2HexUnitStopHere =
        isEndHexUnoccupied &&
        !isFromOccupied &&
        validTailSpotsForNeighbor?.includes(startHexID)
      const canStopHere = isUnit2Hex ? can2HexUnitStopHere : isEndHexUnoccupied
      const isDangerousHex =
        isCausingDisengagement || isFallDamage || isActionGlyph
      const moveRangeData = {
        fromHexID: startHexID,
        fromCost,
        isFromOccupied,
        movePointsLeft,
        disengagedUnitIDs: totalDisengagedIDsSoFar,
        engagedUnitIDs: latestEngagedUnitIDs,
      }
      // 1. unpassable
      if (isUnpassable) {
        return acc
      }
      // 2. passable: we can get here, maybe stop, maybe pass thru
      // order matters for if/else-if here, dangerous-hexes should return before engagement-hexes, and safe-hexes last
      if (isDangerousHex) {
        if (canStopHere) {
          acc[neighborHexID] = {
            ...moveRangeData,
            isDisengage: isCausingDisengagement,
            isGrappleGun,
            fallDamage: newFallDamage,
            isActionGlyph,
          }
        }
        // ONLY for falling damage hexes will be not recurse, because I don't want to deal with applying disengage/fall damage in the right order (you will take all disengagement swipes, and THEN fall)
        if (isFallDamage) {
          return acc
        }
        return {
          ...acc,
          ...recurseThroughMoves({
            unmutatedContext,
            prevHexesDisengagedUnitIDs: totalDisengagedIDsSoFar,
            prevHexesEngagedUnitIDs: latestEngagedUnitIDs,
            prevHexFallDamage: newFallDamage,
            prevHex: neighbor,
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
        return {
          ...acc,
          ...recurseThroughMoves({
            unmutatedContext,
            prevHexesDisengagedUnitIDs: disengagedUnitIDs, // this should be 0 here, as the hex would be a dangerous hex ^^
            prevHexesEngagedUnitIDs: latestEngagedUnitIDs,
            prevHexFallDamage: newFallDamage, // this should be 0 here, as the hex would be a dangerous hex ^^
            prevHex: neighbor,
            startTailHex: isUnit2Hex ? prevHex : undefined,
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
        return isMovePointsLeftAfterMove
          ? {
              ...acc,
              ...recurseThroughMoves({
                unmutatedContext,
                prevHexesDisengagedUnitIDs: disengagedUnitIDs, // this should be 0 here, as the hex would be a dangerous hex ^^
                prevHexesEngagedUnitIDs: latestEngagedUnitIDs, // this should be 0 here, as the hex would be an engagement-hex ^^
                prevHexFallDamage: newFallDamage, // this should be 0 here, as the hex would be a dangerous hex ^^
                prevHex: neighbor,
                startTailHex: isUnit2Hex ? prevHex : undefined,
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
