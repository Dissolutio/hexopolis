import { uniq } from 'lodash'
import {
  BoardHexes,
  BoardHex,
  EditingBoardHexes,
  GameArmyCard,
  GameUnits,
  GameUnit,
  OrderMarkers,
  OrderMarker,
  PlayerOrderMarkers,
  HexCoordinates,
  RangeScan,
  HexTerrain,
  Glyphs,
  Glyph,
} from './types'
import {
  MAJOR_FALL_DAMAGE,
  MINOR_FALL_DAMAGE,
  generateHexID,
} from './constants'
import {
  hexUtilsDistance,
  hexUtilsNeighbor,
  hexUtilsNeighbors,
  hexUtilsNeighborsWithDirections,
} from './hex-utils'
import {
  selectIfGameArmyCardHasAbility,
  selectIfGameArmyCardHasFlying,
  selectUnitRange,
} from './selector/card-selectors'

// returns the hex for 1-hex units, and the head-hex for multi-hex units
export function selectHexForUnit(unitID: string, boardHexes: BoardHexes) {
  return Object.values(boardHexes).find(
    (hex) => hex.occupyingUnitID === unitID && Boolean(hex.isUnitTail) === false
  )
}
export function selectEditingHexForUnit(
  unitID: string,
  boardHexes: EditingBoardHexes
) {
  return Object.values(boardHexes).find(
    (hex) => hex.occupyingUnitID === unitID && Boolean(hex.isUnitTail) === false
  )
}
export function selectTailHexForUnit(
  unitID: string,
  boardHexes: BoardHexes | EditingBoardHexes
) {
  return Object.values(boardHexes).find(
    (hex) => hex.occupyingUnitID === unitID && Boolean(hex.isUnitTail) === true
  ) as BoardHex // WARNING, hacking around editingBoardHexes not being full boardHexes
}
export function selectUnitForHex(
  hexID: string,
  boardHexes: BoardHexes,
  gameUnits: GameUnits
): GameUnit {
  const hex = boardHexes?.[hexID]
  const unitID = hex?.occupyingUnitID
  const unit = gameUnits?.[unitID]
  return unit
}
export function selectGlyphForHex({
  hexID,
  glyphs,
}: {
  hexID: string
  glyphs: Glyphs
}): Glyph | undefined {
  const glyph = Object.values(glyphs).find((g) => g.hexID === hexID)
  return glyph
}
export function selectUnitGameCardForHex(
  hexID: string,
  boardHexes: BoardHexes,
  gameArmyCards: GameArmyCard[],
  gameUnits: GameUnits
): GameArmyCard | undefined {
  const hex = boardHexes?.[hexID]
  const unitID = hex?.occupyingUnitID
  const unit = gameUnits?.[unitID]
  const card = selectGameCardByID(gameArmyCards, unit?.gameCardID ?? '')
  return card
}
export function selectGameCardByID(
  gameArmyCards: GameArmyCard[],
  gameCardID: string
): GameArmyCard | undefined {
  return gameArmyCards.find(
    (card: GameArmyCard) => card.gameCardID === gameCardID
  )
}
export function selectUnitsForCard(
  gameCardID: string,
  gameUnits: GameUnits
): GameUnit[] {
  return (
    Object.values(gameUnits)
      .filter((u) => u.gameCardID === gameCardID)
      // deproxy array
      .map((u) => ({ ...u }))
  )
}
export function selectRevealedGameCard(
  orderMarkers: OrderMarkers,
  armyCards: GameArmyCard[],
  currentOrderMarker: number,
  currentPlayer: string
) {
  const orderMarker = orderMarkers[currentPlayer].find(
    (om: OrderMarker) => om.order === currentOrderMarker.toString()
  )
  const gameCardID = orderMarker?.gameCardID ?? ''
  return selectGameCardByID(armyCards, gameCardID)
}
export function selectUnrevealedGameCard(
  playerOrderMarkers: PlayerOrderMarkers,
  armyCards: GameArmyCard[],
  currentOrderMarker: number
) {
  const id = playerOrderMarkers[currentOrderMarker.toString()]
  return selectGameCardByID(armyCards, id)
}
export function selectHexNeighbors(
  startHexID: string,
  boardHexes: BoardHexes
): BoardHex[] {
  const startHex = boardHexes?.[startHexID]
  if (!startHex) return []
  return hexUtilsNeighbors(startHex)
    .map((hex) => {
      const id = generateHexID(hex)
      const exists = Object.keys(boardHexes).includes(id)
      return exists ? { ...boardHexes[generateHexID(hex)] } : null
    })
    .filter((item) => Boolean(item)) as BoardHex[]
}

export function selectHexNeighborsWithDirections(
  // this fn actually returns an array of arrays, [string, number] where the string is the hexID and the number is the direction
  // the any[] is to get around a Typescript error I don't understand
  startHexID: string,
  boardHexes: BoardHexes
): any[] {
  const startHex = boardHexes?.[startHexID]
  if (!startHex) return []
  const neighborsWithDirections = hexUtilsNeighborsWithDirections(startHex)
  const initialThing = Object.entries(neighborsWithDirections)
  const result: any[] = initialThing.reduce((acc: any[], entry) => {
    const isExistingBoardHex = Object.keys(boardHexes).includes(entry[0])
    const newEntry = [entry[0], entry[1]]
    return isExistingBoardHex ? [...acc, newEntry] : acc
  }, [])
  return result
}
export function selectHexesInLineFromHex(
  // this fn actually returns an array of arrays, [string, number] where the string is the hexID and the number is the direction
  // the any[] is to get around a Typescript error I don't understand
  startHexID: string,
  direction: number, // 0-5 NE-E-SE-SW-E-NW
  n: number, // the number of hexes in a line
  boardHexes: BoardHexes
): BoardHex[] {
  const startHex = boardHexes?.[startHexID]
  if (!startHex) return []
  const startCoord: HexCoordinates = {
    q: startHex.q,
    r: startHex.r,
    s: startHex.s,
  }
  if (n <= 1) {
    return [startHex]
  }
  let theoreticalHexes: string[] = [startHex.id]
  let lastHex = startCoord
  for (let index = 0; index < n; index++) {
    const nextHex = hexUtilsNeighbor(lastHex, direction)
    const element = generateHexID(nextHex)
    theoreticalHexes.push(element)
    lastHex = nextHex
  }
  const firstOneThatsNotARealHex = theoreticalHexes.findIndex(
    (hexID) => !boardHexes[hexID]
  )
  theoreticalHexes = theoreticalHexes.slice(0, firstOneThatsNotARealHex)
  return theoreticalHexes.map((hexID) => boardHexes[hexID])
}
export function selectIsUnitWithinNHexesOfUnit({
  startUnitID,
  endUnitID,
  boardHexes,
  n,
}: {
  startUnitID: string
  endUnitID: string
  boardHexes: BoardHexes
  n: number
}): boolean {
  const startHex = selectHexForUnit(startUnitID, boardHexes)
  const startTailHex = selectTailHexForUnit(startUnitID, boardHexes)
  const endHex = selectHexForUnit(endUnitID, boardHexes)
  const endTailHex = selectTailHexForUnit(endUnitID, boardHexes)
  if (!startHex || !endHex) return false
  const distanceHeadToHead = hexUtilsDistance(startHex, endHex)
  let distanceStartTailToEndHead = Infinity
  let distanceTailToEndTail = Infinity
  let distanceStartHeadToEndTail = Infinity
  if (startTailHex) {
    distanceStartTailToEndHead = hexUtilsDistance(startTailHex, endHex)
  }
  if (endTailHex) {
    distanceStartHeadToEndTail = hexUtilsDistance(startHex, endTailHex)
  }
  if (startTailHex && endTailHex) {
    distanceTailToEndTail = hexUtilsDistance(startTailHex, endTailHex)
  }
  // TODO: RUINS: account for barriers between two hexes
  return (
    distanceHeadToHead <= n ||
    distanceStartTailToEndHead <= n ||
    distanceStartHeadToEndTail <= n ||
    distanceTailToEndTail <= n
  )
}
export function selectValidTailHexes(
  hexID: string,
  boardHexes: BoardHexes
): BoardHex[] {
  return selectHexNeighbors(hexID, boardHexes).filter(
    (bh) => bh.altitude === boardHexes[hexID].altitude
  )
}
export function selectMoveCostBetweenNeighbors(
  startHex: BoardHex,
  endHex: BoardHex
): number {
  const altitudeDelta = endHex.altitude - startHex.altitude
  const heightCost = Math.max(altitudeDelta, 0)
  const distanceCost = 1
  const totalCost = heightCost + distanceCost
  return totalCost
}
export function selectAreTwoAdjacentUnitsEngaged({
  aHeight,
  aAltitude,
  bHeight,
  bAltitude,
}: {
  aHeight: number
  aAltitude: number
  bHeight: number
  bAltitude: number
}) {
  // this just checks if the top of one unit is above the bottom of the other
  // TODO: RUINS: account for barriers between two hexes
  return bAltitude < aAltitude + aHeight && bAltitude > aAltitude - bHeight
}
export const selectAttackerHasAttacksAllowed = ({
  attackingUnit,
  gameArmyCards,
  unitsAttacked,
  unitsMoved,
}: {
  attackingUnit: GameUnit
  gameArmyCards: GameArmyCard[]
  unitsAttacked: Record<string, string[]>
  unitsMoved: string[]
}) => {
  const { unitID: attackerUnitID } = attackingUnit
  const attackerGameCard = selectGameCardByID(
    gameArmyCards,
    attackingUnit.gameCardID
  )
  const numberOfAttackingFigures = attackerGameCard?.figures ?? 0
  const attacksAllowedPerFigure = selectIfGameArmyCardHasAbility(
    'Double Attack',
    attackerGameCard
  )
    ? 2
    : 1
  const totalNumberOfAttacksAllowed =
    numberOfAttackingFigures * attacksAllowedPerFigure
  const attacksUsed = Object.values(unitsAttacked).flat().length
  const attacksUsedByThisFigure = unitsAttacked?.[attackerUnitID]?.length ?? 0
  const attacksLeftFromTotal = totalNumberOfAttacksAllowed - attacksUsed
  const isNoAttacksLeftFromTotal = attacksLeftFromTotal <= 0
  const isUnitHasNoAttacksLeft =
    attacksAllowedPerFigure - attacksUsedByThisFigure <= 0
  const isMovedUnitAttacking = unitsMoved.includes(attackerUnitID)
  const isAttackAvailableForUnmovedUnitToUse =
    attacksLeftFromTotal >
    unitsMoved.filter((id) => !Object.keys(unitsAttacked).includes(id)).length
  const isUnmovedUnitUsableAttack =
    isMovedUnitAttacking || isAttackAvailableForUnmovedUnitToUse
  return {
    isNoAttacksLeftFromTotal,
    isUnitHasNoAttacksLeft,
    attacksUsed,
    attacksUsedByThisFigure,
    attacksLeftFromTotal,
    isMovedUnitAttacking,
    isAttackAvailableForUnmovedUnitToUse,
    isUnmovedUnitUsableAttack,
  }
}

// MAIN RANGE FN
export const selectIsInRangeOfAttack = ({
  attackingUnit,
  defenderHex,
  gameArmyCards,
  boardHexes,
  gameUnits,
  glyphs,
  isSpecialAttack,
  overrideUnitRange,
}: {
  attackingUnit: GameUnit
  defenderHex: BoardHex
  gameArmyCards: GameArmyCard[]
  boardHexes: BoardHexes
  gameUnits: GameUnits
  glyphs: Glyphs
  isSpecialAttack?: boolean
  overrideUnitRange?: number
}): RangeScan => {
  const { unitID } = attackingUnit
  const isUnit2Hex = attackingUnit.is2Hex
  const attackerGameCard = selectGameCardByID(
    gameArmyCards,
    attackingUnit.gameCardID
  )
  // const unitRange = attackerGameCard?.range ?? 0
  let unitRange = overrideUnitRange
    ? overrideUnitRange
    : selectUnitRange({
        attackingUnit,
        gameArmyCards,
        boardHexes,
        gameUnits,
        glyphs,
      })
  const attackerHex = selectHexForUnit(unitID, boardHexes)
  const attackerTailHex = selectTailHexForUnit(unitID, boardHexes)
  const { occupyingUnitID: defenderHexUnitID } = defenderHex

  const defenderGameUnit = gameUnits[defenderHexUnitID]
  const defenderGameCard = selectGameCardByID(
    gameArmyCards,
    defenderGameUnit?.gameCardID ?? ''
  )
  if (!attackerHex || !attackerGameCard || !defenderGameCard) {
    console.error(
      "Something went wrong in the 'selectIsInRangeOfAttack' selector, necessary ingredients are missing."
    )
    return {
      isInRange: false,
      isMelee: false,
      isRanged: false,
    }
  }
  const attackersEngagemedUnitIDs = selectEngagementsForHex({
    hexID: attackerHex.id,
    boardHexes,
    gameUnits,
    armyCards: gameArmyCards,
  })
  const isAttackerEngaged = attackersEngagemedUnitIDs.length > 0
  // if two units are engaged, they are in melee range
  const isInMeleeRange = attackersEngagemedUnitIDs.includes(defenderHexUnitID)
  // TODO: LOS / RUINS / BARRIERS
  const isInTailRange =
    isUnit2Hex && attackerTailHex
      ? hexUtilsDistance(attackerTailHex as HexCoordinates, defenderHex) <=
        unitRange
      : false
  const isInHeadHexRange = attackerHex
    ? hexUtilsDistance(attackerHex as HexCoordinates, defenderHex) <= unitRange
    : false
  const isInRangedRange =
    // a normal attack cannot be a ranged attack if the attacker is engaged
    // a ranged special attack, unless otherwise specific, can be used against adjacent
    !(isAttackerEngaged && !isSpecialAttack) &&
    // an attack must be within the determined range
    (isInTailRange || isInHeadHexRange)
  const isAttackerRangeOneWhichRequiresEngagement = unitRange === 1
  const isThorianSpeedDefender = selectIfGameArmyCardHasAbility(
    // thorian speed means cannot be targeted by a normal ranged attack
    'Thorian Speed',
    defenderGameCard
    )
    const isUnableToShootBecauseOfThorianSpeed = (!isSpecialAttack && isThorianSpeedDefender)
  const isAttackerRequiredToBeEngagedToDefender =
    isAttackerRangeOneWhichRequiresEngagement ||
    isUnableToShootBecauseOfThorianSpeed
  const isInRange = isAttackerRequiredToBeEngagedToDefender
    ? isInMeleeRange
    : isInRangedRange
  return {
    isInRange,
    isMelee: isInMeleeRange,
    isRanged: isInRangedRange,
  }
}
// this function will lookup the unit on the hex, OR you can pass an override unit to place on the hex to predict engagements
export function selectEngagementsForHex({
  hexID,
  boardHexes,
  gameUnits,
  armyCards,
  friendly,
  all,
  override,
}: {
  hexID: string
  boardHexes: BoardHexes
  gameUnits: GameUnits
  armyCards: GameArmyCard[]
  friendly?: boolean // if true, then only return friendly units
  all?: boolean // if true, then return all units, regardless of friendly or not
  override?: {
    overrideUnitID: string
    overrideTailHexID?: string
  }
}) {
  const overrideUnitID = override?.overrideUnitID ?? ''
  const overrideTailHexID = override?.overrideTailHexID ?? ''
  const hex = boardHexes[hexID]
  // either use hex unit, or override unit
  const unitOnHex = overrideUnitID
    ? gameUnits?.[overrideUnitID]
    : gameUnits?.[hex?.occupyingUnitID]
  // if no unit, then no engagements
  if (!unitOnHex) {
    return []
  }
  const tailHexID = overrideUnitID
    ? overrideTailHexID || ''
    : selectTailHexForUnit(unitOnHex.unitID, boardHexes)?.id ?? ''
  // refetch the head in case we had the tail to start with
  const headHexID = overrideUnitID
    ? hexID
    : selectHexForUnit(unitOnHex.unitID, boardHexes)?.id ?? ''
  const isUnit2Hex = unitOnHex.is2Hex
  // mutate/expand tailNeighbors if unit is 2 hex
  let tailNeighbors: BoardHex[] = []
  if (isUnit2Hex && tailHexID) {
    tailNeighbors = selectHexNeighbors(tailHexID, boardHexes)
  }
  const playerID = unitOnHex?.playerID
  const armyCardForUnitOnHex = selectGameCardByID(
    armyCards,
    unitOnHex?.gameCardID
  )
  const allNeighborsToUnitOnHex = [
    ...selectHexNeighbors(headHexID, boardHexes),
    ...tailNeighbors,
  ]
  const engagedUnitIDs = uniq(
    allNeighborsToUnitOnHex
      .filter(
        (h) =>
          // filter for hexes with units, but not our override unit
          h.occupyingUnitID &&
          h.occupyingUnitID !== overrideUnitID &&
          // filter for enemy units
          // TODO: TEAMPLAY: account for team play here, where adjacent units may be friendly
          (all
            ? true
            : friendly
            ? gameUnits?.[h.occupyingUnitID]?.playerID === playerID
            : gameUnits?.[h.occupyingUnitID]?.playerID !== playerID) &&
          // filter for engaged units
          Boolean(
            selectAreTwoAdjacentUnitsEngaged({
              aHeight: armyCardForUnitOnHex?.height ?? 0,
              aAltitude: hex?.altitude ?? 0,
              bHeight:
                selectGameCardByID(
                  armyCards,
                  gameUnits[h.occupyingUnitID]?.gameCardID
                )?.height ?? 0,
              bAltitude: h?.altitude ?? 0,
            })
          )
      )
      .map((h) => h.occupyingUnitID)
  )
  return engagedUnitIDs
}
// presumed start hex and end hex are adjacent, returns unit IDs that are disengaged
export function selectMoveDisengagedUnitIDs({
  unit,
  isFlying,
  startHexID,
  startTailHexID,
  neighborHexID,
  boardHexes,
  gameUnits,
  armyCards,
}: {
  unit: GameUnit
  isFlying: boolean
  startHexID: string
  startTailHexID?: string
  neighborHexID: string
  boardHexes: BoardHexes
  gameUnits: GameUnits
  armyCards: GameArmyCard[]
}) {
  const initialEngagements: string[] = selectEngagementsForHex({
    hexID: startHexID,
    boardHexes,
    gameUnits,
    armyCards,
    override: {
      overrideUnitID: unit.unitID,
      overrideTailHexID: startTailHexID,
    },
  })
  const engagementsForCurrentHex = selectEngagementsForHex({
    hexID: neighborHexID,
    boardHexes,
    gameUnits,
    armyCards,
    override: {
      overrideUnitID: unit.unitID,
      overrideTailHexID: startHexID,
    },
  })
  const defendersToDisengage = initialEngagements
    // flyers disengage everybody once they start flying, but walkers might stay engaged to some units
    .filter((id) => (isFlying ? true : !engagementsForCurrentHex.includes(id)))
  return defendersToDisengage
}
// presumed start hex and end hex are adjacent, this determines if engagements will be entered
export function selectMoveEngagedUnitIDs({
  unit,
  startHexID,
  startTailHexID,
  neighborHexID,
  boardHexes,
  gameUnits,
  armyCards,
}: {
  unit: GameUnit
  startHexID: string
  startTailHexID?: string
  neighborHexID: string
  boardHexes: BoardHexes
  gameUnits: GameUnits
  armyCards: GameArmyCard[]
}) {
  const initialEngagements: string[] = selectEngagementsForHex({
    hexID: startHexID,
    boardHexes,
    gameUnits,
    armyCards,
    override: {
      overrideUnitID: unit.unitID,
      overrideTailHexID: startTailHexID,
    },
  })
  const newEngagements = selectEngagementsForHex({
    override: {
      overrideUnitID: unit.unitID,
      overrideTailHexID: startHexID,
    },
    hexID: neighborHexID,
    boardHexes,
    gameUnits,
    armyCards,
  })
  return newEngagements.filter((id) => !initialEngagements.includes(id))
}

export function selectIsClimbable(
  unit: GameUnit,
  armyCards: GameArmyCard[],
  startHex: BoardHex,
  endHex: BoardHex,
  // this is for grapple gun
  overrideDelta?: number
) {
  const unitCard = selectGameCardByID(armyCards, unit.gameCardID)
  const unitHeight = unitCard?.height ?? 0
  const altitudeDelta = endHex.altitude - startHex.altitude
  return (
    altitudeDelta < (overrideDelta !== undefined ? overrideDelta : unitHeight)
  )
}
export function selectIsFallDamage(
  unit: GameUnit,
  armyCards: GameArmyCard[],
  startHex: BoardHex,
  endHex: BoardHex
): number {
  const unitCard = selectGameCardByID(armyCards, unit.gameCardID)
  const { hasFlying } = selectIfGameArmyCardHasFlying(unitCard)
  // flying figures don't take fall damage, and you can fall into water without taking damage, also
  if (hasFlying || endHex.terrain === HexTerrain.water) return 0
  const unitHeight = unitCard?.height ?? 0
  const altitudeDelta = startHex.altitude - endHex.altitude
  const isMinorFall = altitudeDelta >= unitHeight
  const isMajorFall = altitudeDelta >= unitHeight + 10
  return isMajorFall ? MAJOR_FALL_DAMAGE : isMinorFall ? MINOR_FALL_DAMAGE : 0
}
