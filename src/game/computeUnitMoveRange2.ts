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
  const mergedMoveRange: MoveRange = { ...a }
  for (const key in b) {
    // TODO: MOVERANGE: measure disengaged IDs before movePoints (maybe soon have a custom move mode? Or a toggle for risky-VS-safe moves?)
    if (b[key].movePointsLeft > (a?.[key]?.movePointsLeft ?? -1)) {
      mergedMoveRange[key] = b[key]
    }
  }
  return mergedMoveRange
}

/* 
    This function splits on flying/walking/ghostwalking/disengage/stealth-flying
    Possible outcomes:
    A. 2-hex unit: calculate starting from head, then tail, then merge
    B. 1-hex unit: calculate starting from head
 */
export function computeUnitMoveRange2({
  unit,
  isFlying,
  isGrappleGun,
  hasMoved,
  boardHexes,
  gameUnits,
  armyCards,
  glyphs,
}: {
  unit: GameUnit
  isFlying: boolean
  isGrappleGun: boolean
  hasMoved: boolean
  boardHexes: BoardHexes
  gameUnits: GameUnits
  armyCards: GameArmyCard[]
  glyphs: Glyphs
}): MoveRange {
  // TODO: GRAPPLE-GUN-HACK :: hasMoved is used to hack the move-range/move-points for the grapple gun (which can only move 1 hex, so lends itself to a boolean parameter)
  const movePointsForGrappleGun = hasMoved ? 0 : 1
  // 1. return blank move-range if we can't find the unit, its move points, or its start hex
  const blankMoveRange = {}
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
  const isTwoSpace = unit?.is2Hex ?? false
  const tailHex = selectTailHexForUnit(unitUid, boardHexes)
  //*early out
  if (!unit || !startHex || !initialMovePoints || (isTwoSpace && !tailHex)) {
    return blankMoveRange
  }
  const initialMoveRange = blankMoveRange
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
        initialMovePoints,
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
      // prevHexesEngagedUnitIDs: initialEngagements,
      prevHexFallDamage: 0,
      movePoints: initialMovePoints,
      initialMoveRange,
    }
    moveRange = mergeTwoMoveRanges(
      computeMovesForStartHex({
        ...sharedParamsForHeadAndTail,
        startHex: startHex,
        startTailHex: tailHex,
      }),
      computeMovesForStartHex({
        ...sharedParamsForHeadAndTail,
        startHex: tailHex,
        startTailHex: startHex,
      })
    )
  } else {
    moveRange = computeMovesForStartHex({
      unmutatedContext: {
        playerID,
        unit,
        initialMovePoints,
        initialEngagements,
        isFlying,
        // TODO: GRAPPLE-GUN-HACK :: only passing isGrappleGun to one spacers because Sgt. Drake is a 1-space unit
        isGrappleGun,
        hasStealth,
        hasDisengage,
        hasGhostWalk,
        boardHexes,
        armyCards,
        gameUnits,
        glyphs,
      },
      startHex: startHex,
      prevHexFallDamage: 0,
      // TODO: GRAPPLE-GUN-HACK :: grapple gun is not a normal move, we treat it like flying so we make up the notion of a move point for it, and give Drake 1 move point
      movePoints: isGrappleGun ? movePointsForGrappleGun : initialMovePoints,
      initialMoveRange,
    })
  }
  return moveRange
}

type ToBeChecked = {
  id: string
  fromHexID: string
  fromTailHexID?: string
  movePoints: number
  disenagedUnitIDs: string[]
}

function computeMovesForStartHex({
  unmutatedContext,
  prevHexesDisengagedUnitIDs,
  prevHexFallDamage,
  startHex,
  startTailHex,
  movePoints,
  initialMoveRange,
}: {
  unmutatedContext: {
    playerID: string
    unit: GameUnit
    initialMovePoints: number
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
  prevHexFallDamage: number
  // !! these inputs below get mutated in the recursion
  startHex: BoardHex
  startTailHex?: BoardHex
  movePoints: number
  initialMoveRange: MoveRange
}): MoveRange {
  const {
    playerID,
    unit,
    initialMovePoints,
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
  /* 
   The Big Idea:
   0. We have a start hex, maybe a tail hex
   1. We put the neighbors as our first "to be checked" hexes
   2. For each neighbor, we are looking at if we can get there, if we can stop there, and if we can move on from there (adding the neighbors of that neighbor to the "to be checked" list)
   3. We keep doing this until we run out of "to be checked" hexes
   */
  const finalMoveRange = { ...initialMoveRange }
  const startHexID = startHex.id
  const neighbors = selectHexNeighbors(startHexID, boardHexes)
  const initialToBeChecked = [
    ...neighbors.map((neighbor) => ({
      id: neighbor.id,
      fromHexID: startHexID,
      movePoints: movePoints,
      disenagedUnitIDs: prevHexesDisengagedUnitIDs ?? [],
    })),
  ]
  const toBeChecked: ToBeChecked[] = [...initialToBeChecked]
  // early out if no move points!
  if (movePoints <= 0) {
    return initialMoveRange
  }
  const isUnit2Hex = unit?.is2Hex
  const isUnitInitiallyEngaged = initialEngagements.length > 0
  const isVisitedAlready = false

  // BEGIN WHILE LOOP
  while (toBeChecked.length > 0) {
    const next = toBeChecked.shift()
    if (!next) {
      break
    }
    const toHexID = next.id
    const toHex = boardHexes[toHexID]
    const unitIDOnToHex = toHex.occupyingUnitID
    const endHexUnit = gameUnits[unitIDOnToHex]
    const movePointsToBeChecked = next.movePoints
    const fromHex = boardHexes[next.fromHexID]
    const fromTailHex = boardHexes?.[next?.fromTailHexID ?? '']
    const fromHexDisengagedUnitIDs = next.disenagedUnitIDs
    // const isVisitedAlready = finalMoveRange[neighborID].movePointsLeft === movePointsLeft
    const preVisitedEntry = finalMoveRange[toHexID]
    const isFromOccupied =
      fromHex.occupyingUnitID && fromHex.occupyingUnitID !== unit.unitID
    const validTailSpotsForNeighbor = selectValidTailHexes(
      toHexID,
      boardHexes
    ).map((hex) => hex.id)
    const isStartHexWater = fromHex.terrain === HexTerrain.water
    const isNeighborHexWater = toHex.terrain === HexTerrain.water
    // TODO: GLYPH SPECIAL: squad units cannot step on healer glyphs
    const isGlyphStoppage = !!glyphs[toHexID]
    const isGlyphRevealed = !!glyphs[toHexID]?.isRevealed
    //     // TODO: GLYPH SPECIAL: isActionGlyph: Also if it's a special stage glyph (healer, summoner, curse)
    const isActionGlyph = isGlyphStoppage && !isGlyphRevealed
    const isWaterStoppage =
      (isUnit2Hex && isStartHexWater && isNeighborHexWater) ||
      (!isUnit2Hex && isNeighborHexWater)
    const walkCost = selectMoveCostBetweenNeighbors(fromHex, toHex)
    //     // fromCost is where we consider non-flyers and the water or glyphs they might walk onto
    const fromCost =
      // when a unit enters water, or a 2-spacer enters its second space of water, or a unit steps on a glyph with its leading hex (AKA stepping ONTO glyphs) it causes their movement to end (we charge all of their move points)
      isWaterStoppage || isGlyphStoppage
        ? Math.max(movePointsToBeChecked, walkCost)
        : // flying is just one point to go hex-to-hex, so is grapple-gun (up to 25-height) (furthermore, because of how we coded grapple-gun, a grapple-gun-using-unit only has one move point)
        isFlying || isGrappleGun
        ? 1
        : walkCost
    const movePointsLeft = movePointsToBeChecked - fromCost
    const disengagedUnitIDs = selectMoveDisengagedUnitIDs({
      unit,
      isFlying,
      startHexID: toHexID,
      startTailHexID: fromTailHex?.id,
      neighborHexID: toHexID,
      boardHexes,
      gameUnits,
      armyCards,
    })
    //     // if we had same move points left, tie breaker is less-disengaged-units, otherwise, more move points left
    const isVisitedAlready =
      preVisitedEntry?.movePointsLeft === movePointsToBeChecked
        ? preVisitedEntry?.movePointsLeft > movePointsToBeChecked
        : preVisitedEntry?.disengagedUnitIDs?.length <=
          fromHexDisengagedUnitIDs.length
    if (isVisitedAlready) {
      // TODO: Handle this
      break
    }
    // if we can get there
    // if we can stop there
    // if we can move on from there (adding the neighbors of that neighbor to the "to be checked" list)

    // if we can get there
    const totalDisengagedIDsSoFar = uniq([
      ...(prevHexesDisengagedUnitIDs ?? []),
      ...disengagedUnitIDs,
    ])
    const latestEngagedUnitIDs = selectMoveEngagedUnitIDs({
      unit,
      startHexID,
      startTailHexID: startTailHex?.id,
      neighborHexID: toHexID,
      boardHexes,
      gameUnits,
      armyCards,
    })
    const neighborHexEngagements = selectEngagementsForHex({
      hexID: toHexID,
      boardHexes,
      gameUnits,
      armyCards,
      override: {
        overrideUnitID: unit.unitID,
        overrideTailHexID: fromTailHex?.id,
      },
    })
    const isCausingEngagement =
      latestEngagedUnitIDs.length > 0 ||
      // the idea is if you engaged new units IDs from your start spot, you are causing an engagement, even if you didn't engage any new units IDs from your neighbor spot
      neighborHexEngagements.some((id) => !initialEngagements.includes(id))
    // as soon as you start flying, you take disengagements from all engaged figures, unless you have stealth flying
    const isCausingDisengagementIfFlying = isUnitInitiallyEngaged && !hasStealth
    const isCausingDisengagementIfWalking = hasDisengage
      ? false
      : totalDisengagedIDsSoFar.length > 0
    const isCausingDisengagement = isFlying
      ? isCausingDisengagementIfFlying
      : isCausingDisengagementIfWalking
    const endHexUnitPlayerID = endHexUnit?.playerID
    const isMovePointsLeftAfterMove = movePointsLeft > 0
    const isEndHexUnoccupied = !Boolean(unitIDOnToHex)
    const isTooCostly = movePointsLeft < 0
    // TODO: teams :: isEndHexEnemyOccupied :: a unit that is not yours is not necessarily an enemy
    const isEndHexEnemyOccupied =
      !isEndHexUnoccupied && endHexUnitPlayerID !== playerID
    const isEndHexUnitEngaged =
      selectEngagementsForHex({
        hexID: toHexID,
        boardHexes,
        gameUnits,
        armyCards,
      }).length > 0
    const isTooTallOfClimb = !selectIsClimbable(
      unit,
      armyCards,
      fromHex,
      toHex,
      // overrideDelta: grapple gun allows you to go up 25 levels higher than where you are
      isGrappleGun ? 26 : undefined
    )
    const newFallDamage =
      prevHexFallDamage + selectIsFallDamage(unit, armyCards, fromHex, toHex)
    const isFallDamage = newFallDamage > 0
    const isUnpassable = isFlying
      ? isTooCostly
      : isTooCostly ||
        // ghost walk can move through enemy occupied hexes, or hexes with engaged units
        (hasGhostWalk ? false : isEndHexEnemyOccupied) ||
        (hasGhostWalk ? false : isEndHexUnitEngaged) ||
        isTooTallOfClimb
    // 1. unpassable
    if (isUnpassable) {
      break
    }
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

    // NEIGHBORS prepare the neighbors to be added to to-be-checked
    const nextNeighbors = selectHexNeighbors(startHexID, boardHexes)
    const nextToBeChecked = [
      ...nextNeighbors.map((neighbor) => ({
        id: neighbor.id,
        fromHexID: startHexID,
        movePoints: movePointsLeft,
        disenagedUnitIDs: prevHexesDisengagedUnitIDs ?? [],
      })),
    ]

    // 2. passable: we can get here, maybe stop, maybe pass thru
    // order matters for if/else-if here, dangerous-hexes should return before engagement-hexes, and safe-hexes last
    if (isDangerousHex) {
      // for dangerous hexes:
      /* 
      1. if we can stop there, then update the move range for that hex, and...
      2. if there is fall damage, we can exit the while loop without adding any neighbors because we don't want to consider the order in which fall/disengagement damage is applied (so we only add neighbors for one of them)
      3. 
      */
      if (canStopHere) {
        // we can disengage or fall to this space, update result
        finalMoveRange[toHexID] = {
          ...moveRangeData,
          isDisengage: isCausingDisengagement,
          isGrappleGun,
          fallDamage: newFallDamage,
          isFallDamage,
          isActionGlyph,
        }
      }
      if (isFallDamage) {
        /* 
          for falling damage, we will not explore further, but we will for disengaging,
          because I don't want to deal with applying disengage/fall damage 
          in a certain order (current impl: you will receive all disengagement swipes, and THEN fall)
        */
        break
      }
      /* 
        // TODO: how to add neighbors into the new loop, for the disengage hexes
      */
    } else if (isCausingEngagement) {
      // we can stop there
      if (canStopHere) {
        finalMoveRange[toHexID] = {
          ...moveRangeData,
          isEngage: true,
          isGrappleGun,
        }
      }
      // TODO: how to add neighbors into the new loop, for engagement hexes
      // return isMovePointsLeftAfterMove
      //   ? {
      //       ...acc,
      //       ...recurseThroughMoves({
      //         unmutatedContext,
      //         prevHexesDisengagedUnitIDs: disengagedUnitIDs, // this should be 0 here, as the hex would be a dangerous hex ^^
      //         prevHexesEngagedUnitIDs: latestEngagedUnitIDs,
      //         prevHexFallDamage: newFallDamage, // this should be 0 here, as the hex would be a dangerous hex ^^
      //         prevHex: neighbor,
      //         startTailHex: isUnit2Hex ? prevHex : undefined,
      //         movePoints: movePointsLeft,
      //         initialMoveRange: acc,
      //       }),
      //     }
      //   : acc
    }
    // safe hexes
    else {
      // we can stop there if it's not occupied
      if (canStopHere) {
        finalMoveRange[toHexID] = {
          ...moveRangeData,
          isSafe: true,
          isGrappleGun,
        }
      }
      // TODO: how to add neighbors into the new loop, for safe hexes
      // return isMovePointsLeftAfterMove
      //   ? {
      //       ...acc,
      //       ...recurseThroughMoves({
      //         unmutatedContext,
      //         prevHexesDisengagedUnitIDs: disengagedUnitIDs, // this should be 0 here, as the hex would be a dangerous hex ^^
      //         prevHexesEngagedUnitIDs: latestEngagedUnitIDs, // this should be 0 here, as the hex would be an engagement-hex ^^
      //         prevHexFallDamage: newFallDamage, // this should be 0 here, as the hex would be a dangerous hex ^^
      //         prevHex: neighbor,
      //         startTailHex: isUnit2Hex ? prevHex : undefined,
      //         movePoints: movePointsLeft,
      //         initialMoveRange: acc,
      //       }),
      //     }
      //   : acc
    }
  }
  return finalMoveRange
}
