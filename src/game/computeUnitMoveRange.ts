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
    if (b[key].movePointsLeft > (a?.[key]?.movePointsLeft ?? -1)) {
      mergedMoveRange[key] = b[key]
    }
  }
  return mergedMoveRange
}

/* 
    Possible outcomes:
    A. 2-hex unit: calculate starting from head, then tail, then merge
    B. 1-hex unit: calculate starting from head
 */
export function computeUnitMoveRange({
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
  if (
    !unit ||
    !unit.gameCardID ||
    !startHex ||
    !initialMovePoints ||
    (isTwoSpace && !tailHex)
  ) {
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
  prevDisengagedUnitIDs: string[]
  prevFallDamage: number
}

/*
 * this function follows the breadth first search concept
 * https://www.redblobgames.com/pathfinding/a-star/introduction.html#breadth-first-search
 */
function computeMovesForStartHex({
  unmutatedContext,
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
    glyphs: Glyphs
  }
  startHex: BoardHex
  movePoints: number
  initialMoveRange: MoveRange
  startTailHex?: BoardHex
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
  /* 
   The Big Idea:
   0. We have a start hex, maybe a tail hex
   1. We put the neighbors as our first "to be checked" hexes
   2. For each neighbor, we are looking at if we can get there, if we can stop there, and if we can move on from there (adding the neighbors of that neighbor to the "to be checked" list)
   3. We keep doing this until we run out of "to be checked" hexes
   */
  const finalMoveRange = { ...initialMoveRange }
  const startHexID = startHex.id
  const startTailHexID = startTailHex?.id ?? ''
  const neighbors = selectHexNeighbors(startHexID, boardHexes)
  const initialToBeChecked: ToBeChecked[] = [
    ...neighbors.map((neighbor) => ({
      id: neighbor.id,
      fromHexID: startHexID,
      fromTailHexID: startTailHexID,
      movePoints: movePoints,
      prevDisengagedUnitIDs: [],
      prevFallDamage: 0,
    })),
  ]
  if (movePoints <= 0) {
    return initialMoveRange
  }
  let toBeChecked = [...initialToBeChecked]
  // early out if no move points!
  const isUnit2Hex = unit?.is2Hex
  const isUnitInitiallyEngaged = initialEngagements.length > 0

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
    const fromHexID = next.fromHexID
    const fromTailHexID = next?.fromTailHexID ?? ''
    const fromHex = boardHexes[fromHexID]
    const fromTailHex = boardHexes?.[fromTailHexID]
    const fromHexDisengagedUnitIDs = next.prevDisengagedUnitIDs
    const prevFallDamage = next.prevFallDamage
    const preVisitedEntry = finalMoveRange[toHexID]
    // const fromHexOccupyingUnitID = fromHex.occupyingUnitID
    // const fromHexUnit = gameUnits[fromHexOccupyingUnitID]
    const isFromOccupied =
      fromHex.occupyingUnitID && fromHex.occupyingUnitID !== unit.unitID
    // TODO: Team play
    // const isFromEnemyOccupied =
    //   fromHexUnit && fromHexUnit.playerID !== unit.playerID
    const validTailSpotsForNeighbor = selectValidTailHexes(
      toHexID,
      boardHexes
    ).map((hex) => hex.id)
    const isStartHexWater = fromHex.terrain === HexTerrain.water
    const isNeighborHexWater = toHex.terrain === HexTerrain.water
    // TODO: GLYPH SPECIAL: squad units cannot step on healer glyphs
    const isGlyphStoppage = !!glyphs[toHexID]
    const isGlyphRevealed = !!glyphs[toHexID]?.isRevealed
    // TODO: GLYPH SPECIAL: isActionGlyph: Also if it's a special stage glyph (healer, summoner, curse)
    const isActionGlyph = isGlyphStoppage && !isGlyphRevealed
    const isWaterStoppage =
      (isUnit2Hex && isStartHexWater && isNeighborHexWater) ||
      (!isUnit2Hex && isNeighborHexWater)
    const walkCost = selectMoveCostBetweenNeighbors(fromHex, toHex)
    // fromCost is where we consider non-flyers and the water or glyphs they might walk onto
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
      startHexID: fromHexID,
      startTailHexID: fromTailHex?.id,
      neighborHexID: toHexID,
      boardHexes,
      gameUnits,
      armyCards,
    })
    const totalDisengagedIDsSoFar = uniq([
      ...(fromHexDisengagedUnitIDs ?? []),
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
    const isCausingDisengagementIfFlying =
      isUnitInitiallyEngaged && !hasStealth
    const isCausingDisengagementIfWalking = hasDisengage
      ? false
      : totalDisengagedIDsSoFar.length > 0
      const isCausingDisengagement = isFlying
      ? isCausingDisengagementIfFlying
      : isCausingDisengagementIfWalking
    const endHexUnitPlayerID = endHexUnit?.playerID
    const isMovePointsLeftAfterMove = isFlying
      ? movePointsToBeChecked - 1 > 0
      : movePointsLeft > 0
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
      prevFallDamage + selectIsFallDamage(unit, armyCards, fromHex, toHex)
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
        validTailSpotsForNeighbor?.includes(fromHexID)
      const canStopHere =
        !isTooCostly && (isUnit2Hex ? can2HexUnitStopHere : isEndHexUnoccupied)
      const isDangerousHex =
        isCausingDisengagement || isFallDamage || isActionGlyph
      const moveRangeData = {
        fromHexID: fromHexID,
        fromCost,
        movePointsLeft,
        isGrappleGun,
        disengagedUnitIDs: totalDisengagedIDsSoFar,
        engagedUnitIDs: latestEngagedUnitIDs,
      }
  
      // NEIGHBORS prepare the neighbors to be added to to-be-checked
      const nextNeighbors = selectHexNeighbors(toHexID, boardHexes)
      // .filter(
      // // no need to add our current hex as a neighbor of the next hex
      // (n) => !(n.id === fromHexID)
      // )
      const nextToBeChecked: ToBeChecked[] = [
        ...nextNeighbors
          .map((neighbor) => ({
            id: neighbor.id,
            fromHexID: toHexID,
            fromTailHexID: fromHexID,
            // TODO: move points for next to-check: Slither, Water Suits, Lava Resistant, Snow and Ice Enhanced Movement, Ice Cold, Amphibious
            movePoints: isFlying ? movePointsToBeChecked - 1 : movePointsLeft, // here is where we account for flyers able to fly over glyphs
            prevDisengagedUnitIDs: totalDisengagedIDsSoFar,
            prevFallDamage: newFallDamage,
          }))
          .filter(() => {
            return hasGhostWalk || isFlying
              ? true
              : !isEndHexEnemyOccupied && !isEndHexUnitEngaged
          }),
      ]
      const getIsVisitedAlready = () => {
      // if previous entry was safe and current is dangerous or engaging 
      // if (preVisitedEntry?.isSafe && (isCausingEngagement || isCausingDisengagement )) {
      //   return true
      // }
      if (preVisitedEntry?.movePointsLeft > movePointsToBeChecked) {
        return true
      }
      // if we had same move points left as our starting move points, tie breaker is less-disengaged-units
      if (preVisitedEntry?.movePointsLeft === movePointsToBeChecked) {
        return (
          preVisitedEntry?.disengagedUnitIDs?.length <=
          fromHexDisengagedUnitIDs.length
        )
      }
      // ?? if we had same move points left as our ending move points, tie breaker is whichever had cheapest from cost
      if (preVisitedEntry?.movePointsLeft === movePointsLeft) {
        return preVisitedEntry?.fromCost >= fromCost
      }
      return false
    }
    const isVisitedAlready = getIsVisitedAlready()

    // BEGIN isVisitedAlready else block
    if (isVisitedAlready) {
      // TODO: Handle this
      console.log("🚀 ~ isVisitedAlready-- previsited:", preVisitedEntry )
    } else {
      // BREAK IF UNPASSABLE
      if (isUnpassable) {
        // break
      }
      // 2. passable: we can get here, maybe stop, maybe pass thru
      // order matters for if/else-if here, dangerous-hexes should return before engagement-hexes, and safe-hexes last
      if (isDangerousHex) {
        // for dangerous hexes:
        /* 
      1. UPDATE MOVE RANGE: if we can stop there, then update the move range for that hex
      2. NEXT NEIGHBORS FOR DISENGAGE: we continue the path-finding beyond disengage hexes
      3. NO NEXT NEIGHBORS FOR FALL: if there is fall damage, we can exit the while loop without adding any neighbors because we don't want to consider the order in which fall/disengagement damage is applied (so we only add neighbors for one of them)
      */
        if (canStopHere) {
          // we can disengage or fall to this space, update result
          finalMoveRange[toHexID] = {
            ...moveRangeData,
            isDisengage: isCausingDisengagement,
            fallDamage: newFallDamage,
            isFallDamage,
            isActionGlyph,
          }
        }
        // fall damage does not get next-neighbors added, but disengage moves DO
        // if (!isFallDamage || (!canStopHere && isUnit2Hex && isFallDamage)) {
        // if (!isFallDamage) {
        if (isMovePointsLeftAfterMove) {
          for (const hexToCheck of nextToBeChecked) {
            toBeChecked.push(hexToCheck)
          }
          // }
        }
      } else if (isCausingEngagement) {
        if (canStopHere) {
          finalMoveRange[toHexID] = {
            ...moveRangeData,
            isEngage: true,
          }
        }
        // toBeChecked = [...toBeChecked, ...nextToBeChecked]
        if (isMovePointsLeftAfterMove) {
          for (const hexToCheck of nextToBeChecked) {
            toBeChecked.push(hexToCheck)
          }
        }
      }
      // safe hexes
      else {
        // we can stop there if it's not occupied
        if (canStopHere) {
          finalMoveRange[toHexID] = {
            ...moveRangeData,
            isSafe: true,
          }
        }
        // toBeChecked = [...toBeChecked, ...nextToBeChecked]
        if (isMovePointsLeftAfterMove) {
          for (const hexToCheck of nextToBeChecked) {
            toBeChecked.push(hexToCheck)
          }
        }
      }
      // END isVisitedAlready else block
    }
    // END WHILE LOOP
  }
  return finalMoveRange
}
