import { uniq } from 'lodash'
import {
  BoardHexes,
  BoardHex,
  GameArmyCard,
  GameUnits,
  GameUnit,
  OrderMarkers,
  OrderMarker,
  PlayerOrderMarkers,
  HexCoordinates,
  RangeScan,
} from './types'
import { generateHexID } from './constants'
import { hexUtilsDistance, hexUtilsNeighbors } from './hex-utils'
import {
  selectIfGameArmyCardHasDoubleAttack,
  selectIfGameArmyCardHasThorianSpeed,
  selectUnitRange,
} from './selector/card-selectors'

// returns the hex for 1-hex units, and the head-hex for multi-hex units
export function selectHexForUnit(unitID: string, boardHexes: BoardHexes) {
  return Object.values(boardHexes).find(
    (hex) => hex.occupyingUnitID === unitID && Boolean(hex.isUnitTail) === false
  )
}
export function selectTailHexForUnit(unitID: string, boardHexes: BoardHexes) {
  return Object.values(boardHexes).find(
    (hex) => hex.occupyingUnitID === unitID && Boolean(hex.isUnitTail) === true
  )
}
export function selectUnitForHex(
  hexID: string,
  gameUnits: GameUnits,
  boardHexes: BoardHexes
): GameUnit {
  const hex = boardHexes?.[hexID]
  const unitID = hex?.occupyingUnitID
  const unit = gameUnits?.[unitID]
  return unit
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
export function selectValidTailHexes(
  hexID: string,
  boardHexes: BoardHexes
): BoardHex[] {
  return selectHexNeighbors(hexID, boardHexes).filter(
    (bh) => bh.altitude === boardHexes[hexID].altitude
    /* 
      This allows 2-space figures to stop on 2 different levels of terrain if the lower one has water. I believe I confused this with the rule that they don't have to stop
      until they walk into 2 spaces of water. AKA, the rule below is NOT in the game.
      ||
      (boardHexes[hexID].terrain === 'water' &&
      bh.altitude === boardHexes[hexID].altitude + 1) ||
      (bh.terrain === 'water' && bh.altitude === boardHexes[hexID].altitude - 1)
      */
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
  // TODO: account for barriers between two hexes
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
  const attacksAllowedPerFigure = selectIfGameArmyCardHasDoubleAttack(
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
}: {
  attackingUnit: GameUnit
  defenderHex: BoardHex
  gameArmyCards: GameArmyCard[]
  boardHexes: BoardHexes
  gameUnits: GameUnits
}): RangeScan => {
  const { unitID } = attackingUnit
  const isUnit2Hex = attackingUnit.is2Hex
  const attackerGameCard = selectGameCardByID(
    gameArmyCards,
    attackingUnit.gameCardID
  )
  // const unitRange = attackerGameCard?.range ?? 0
  let unitRange = selectUnitRange({
    attackingUnit,
    gameArmyCards,
    boardHexes,
    gameUnits,
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
  // SHOULD HAVE DONE IT THIS WAY:
  const isInMeleeRange = selectEngagementsForHex({
    hexID: attackerHex.id,
    boardHexes,
    gameUnits,
    armyCards: gameArmyCards,
  }).includes(defenderHexUnitID)
  const isInTailRange =
    isUnit2Hex && attackerTailHex
      ? hexUtilsDistance(attackerTailHex as HexCoordinates, defenderHex) <=
        unitRange
      : false
  const isInHeadHexRange = attackerHex
    ? hexUtilsDistance(attackerHex as HexCoordinates, defenderHex) <= unitRange
    : false
  // This totally ignores line of sight
  const isInRangedRange = isInTailRange || isInHeadHexRange
  const isRangeOneWhichRequiresEngagement = unitRange === 1
  const isThorianSpeedDefender =
    selectIfGameArmyCardHasThorianSpeed(defenderGameCard)
  const isAttackerRequiredToBeEngagedToDefender =
    isRangeOneWhichRequiresEngagement || isThorianSpeedDefender
  const isInRange = isAttackerRequiredToBeEngagedToDefender
    ? isInMeleeRange
    : isInRangedRange
  return {
    isInRange,
    isMelee: isInMeleeRange,
    // a normal attack cannot be a ranged attack if the unit is engaged
    isRanged: isInRangedRange && !isInMeleeRange,
  }
}
// this function will lookup the unit on the hex, OR you can pass an override unit to place on the hex to predict engagements
export function selectEngagementsForHex({
  hexID,
  boardHexes,
  gameUnits,
  armyCards,
  override,
}: {
  hexID: string
  boardHexes: BoardHexes
  gameUnits: GameUnits
  armyCards: GameArmyCard[]
  override?: {
    overrideUnitID: string
    // probably a problem that this is optional
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
    : selectTailHexForUnit(unitOnHex.unitID, boardHexes)?.id ?? '' // we could auto select a tail spot too?
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
    ...selectHexNeighbors(hexID, boardHexes),
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
          // TODO: account for team play here, where adjacent units may be friendly
          gameUnits[h.occupyingUnitID].playerID !== playerID &&
          // filter for engaged units
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
      .map((h) => h.occupyingUnitID)
  )
  return engagedUnitIDs
}
// presumed start hex and end hex are adjacent, returns unit IDs that are disengaged
export function selectMoveDisengagedUnitIDs({
  unit,
  isFlying,
  startHexID,
  neighborHexID,
  boardHexes,
  gameUnits,
  armyCards,
}: {
  unit: GameUnit
  isFlying: boolean
  startHexID: string
  neighborHexID: string
  boardHexes: BoardHexes
  gameUnits: GameUnits
  armyCards: GameArmyCard[]
}) {
  const hexForUnit = selectHexForUnit(unit.unitID, boardHexes)
  const initialEngagements: string[] = selectEngagementsForHex({
    hexID: hexForUnit?.id ?? '',
    boardHexes,
    gameUnits,
    armyCards,
  })
  const engagementsForCurrentHex = selectEngagementsForHex({
    override: {
      overrideUnitID: unit.unitID,
      overrideTailHexID: startHexID,
    },
    hexID: neighborHexID,
    boardHexes,
    gameUnits,
    armyCards,
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
  neighborHexID,
  boardHexes,
  gameUnits,
  armyCards,
}: {
  unit: GameUnit
  startHexID: string
  neighborHexID: string
  boardHexes: BoardHexes
  gameUnits: GameUnits
  armyCards: GameArmyCard[]
}) {
  const hexForUnit = selectHexForUnit(unit.unitID, boardHexes)
  const initialEngagements: string[] = selectEngagementsForHex({
    hexID: hexForUnit?.id ?? '',
    boardHexes,
    gameUnits,
    armyCards,
  })
  const newEngagements = selectEngagementsForHex({
    override: {
      overrideUnitID: unit.unitID,
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
  endHex: BoardHex
) {
  const unitCard = selectGameCardByID(armyCards, unit.gameCardID)
  const unitHeight = unitCard?.height ?? 0
  const altitudeDelta = endHex.altitude - startHex.altitude
  return altitudeDelta < unitHeight
}
