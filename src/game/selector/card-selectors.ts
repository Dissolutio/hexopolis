import {
  BoardHexes,
  GameArmyCard,
  GameUnits,
  GameUnit,
  BoardHex,
} from '../types'
import {
  selectAreTwoAdjacentUnitsEngaged,
  selectEngagementsForHex,
  selectGameCardByID,
  selectHexForUnit,
  selectHexNeighbors,
  selectIsUnitWithinNHexesOfUnit,
  selectTailHexForUnit,
  selectUnitsForCard,
} from '../selectors'
import { raelinOneID } from 'game/setup/unitGen'

// range abilities:
// 1 D-9000's Range Enhancement
// 2 Laglor's Vydar’s Range Enhancement Aura
export const selectUnitRange = ({
  attackingUnit,
  gameArmyCards,
  boardHexes,
  gameUnits,
}: {
  attackingUnit: GameUnit
  gameArmyCards: GameArmyCard[]
  boardHexes: BoardHexes
  gameUnits: GameUnits
}): number => {
  const attackerGameCard = selectGameCardByID(
    gameArmyCards,
    attackingUnit.gameCardID
  )
  const attackerHex = selectHexForUnit(attackingUnit.unitID, boardHexes)
  const attackerTailHex = selectTailHexForUnit(attackingUnit.unitID, boardHexes)
  const is2Hex = attackingUnit.is2Hex && attackerTailHex

  // early out: necessary ingredients missing
  if (!attackerGameCard || !attackerHex || (!attackerTailHex && is2Hex)) {
    return 0
  }
  const unitEngagements = selectEngagementsForHex({
    hexID: attackerHex.id,
    boardHexes,
    gameUnits,
    armyCards: gameArmyCards,
  })
  // a unit who is engaged can only attack the units it is engaged with
  if (unitEngagements.length > 0) {
    return 1
  }
  const isAttackerSoulbourg = attackerGameCard.race === 'soulborg'
  const isD9000RangeEnhancement =
    isAttackerSoulbourg &&
    [
      ...selectHexNeighbors(attackerHex.id, boardHexes),
      ...selectHexNeighbors(attackerTailHex?.id ?? '', boardHexes),
    ].some((hex) => {
      const neighborUnitCard = selectGameCardByID(
        gameArmyCards,
        gameUnits[hex.occupyingUnitID]?.gameCardID
      )
      return (
        hex.occupyingUnitID &&
        neighborUnitCard &&
        neighborUnitCard.playerID === attackingUnit.playerID &&
        selectIfGameArmyCardHasSoulBorgRangeEnhancement(neighborUnitCard) &&
        selectAreTwoAdjacentUnitsEngaged({
          aHeight: attackerGameCard.height,
          aAltitude: attackerHex.altitude,
          bHeight: neighborUnitCard.height,
          bAltitude: hex.altitude,
        })
      )
    })
  const unitRange = attackerGameCard.range + (isD9000RangeEnhancement ? 2 : 0)
  return unitRange
}
// FLYING
type HasFlyingReport = {
  hasFlying: boolean
  hasStealth: boolean
}
export function selectIfGameArmyCardHasFlying(
  gameArmyCard?: GameArmyCard
): HasFlyingReport {
  const hasFlying = gameArmyCard
    ? gameArmyCard.abilities.some(
        (a) => a.name === 'Flying' || a.name === 'Stealth Flying'
      )
    : false
  const hasStealth = gameArmyCard
    ? gameArmyCard.abilities.some((a) => a.name === 'Stealth Flying')
    : false
  return { hasFlying, hasStealth }
}
type HasStealthReport = {
  hasDisengage: boolean
  hasGhostWalk: boolean
}
export function selectIfGameArmyCardHasDisengage(
  gameArmyCard?: GameArmyCard
): HasStealthReport {
  const hasGhostWalk = gameArmyCard
    ? gameArmyCard.abilities.some(
        (a) => a.name === 'Ghost Walk' || a.name === 'Phantom Walk'
      )
    : false
  const hasDisengage = gameArmyCard
    ? gameArmyCard.abilities.some(
        (a) => a.name === 'Disengage' || a.name === 'Phantom Walk'
      )
    : false
  return { hasDisengage, hasGhostWalk }
}
// abilities:
export function selectIfGameArmyCardHasCounterStrike(
  gameArmyCard?: GameArmyCard
): boolean {
  return gameArmyCard
    ? gameArmyCard.abilities.some((a) => a.name === 'Counter Strike')
    : false
}
export function selectIfGameArmyCardHasThorianSpeed(
  gameArmyCard?: GameArmyCard
): boolean {
  return gameArmyCard
    ? gameArmyCard.abilities.some((a) => a.name === 'Thorian Speed')
    : false
}
export function selectIfGameArmyCardHasZettianTargeting(
  gameArmyCard?: GameArmyCard
): boolean {
  return gameArmyCard
    ? gameArmyCard.abilities.some((a) => a.name === 'Zettian Targeting')
    : false
}
export function selectIfGameArmyCardHasSwordOfReckoning(
  gameArmyCard?: GameArmyCard
): boolean {
  return gameArmyCard
    ? gameArmyCard.abilities.some((a) => a.name === 'Sword of Reckoning')
    : false
}
export function selectIfGameArmyCardHasAbility(
  abilityName: string,
  gameArmyCard?: GameArmyCard
): boolean {
  return gameArmyCard
    ? gameArmyCard.abilities.some((a) => a.name === abilityName)
    : false
}
export function selectIfGameArmyCardHasDoubleAttack(
  gameArmyCard?: GameArmyCard
): boolean {
  return gameArmyCard
    ? gameArmyCard.abilities.some((a) => a.name === 'Double Attack')
    : false
}
export function selectIfGameArmyCardHasSoulBorgRangeEnhancement(
  gameArmyCard?: GameArmyCard
): boolean {
  return gameArmyCard
    ? gameArmyCard.abilities.some((a) => a.name === 'Range Enhancement')
    : false
}

// ATTACK DICE FOR SPECIFIC ATTACK:
export const selectUnitAttackDiceForAttack = ({
  attackerHex,
  defenderHex,
  attackerArmyCard,
  defender,
  unitsAttacked,
  isMelee,
}: {
  attackerHex: BoardHex
  defenderHex: BoardHex
  defender: GameUnit
  attackerArmyCard: GameArmyCard
  unitsAttacked: Record<string, string[]>
  isMelee: boolean
}): number => {
  let dice = attackerArmyCard.attack
  const heightBonus = attackerHex.altitude > defenderHex.altitude ? 1 : 0
  const zettianTargetingBonus =
    selectIfGameArmyCardHasZettianTargeting(attackerArmyCard) &&
    // if second zettian attacks same unit as first, +1
    Object.values(unitsAttacked).flat().includes(defender.unitID)
      ? 1
      : 0
  const swordOfReckoningBonus =
    isMelee && selectIfGameArmyCardHasSwordOfReckoning(attackerArmyCard) ? 4 : 0
  return dice + heightBonus + zettianTargetingBonus + swordOfReckoningBonus
}
// DEFENSE DICE FOR SPECIFIC ATTACK:
export const selectUnitDefenseDiceForAttack = ({
  defenderArmyCard,
  defenderUnit,
  attackerHex,
  defenderHex,
  boardHexes,
  gameArmyCards,
  gameUnits,
}: {
  defenderArmyCard: GameArmyCard
  defenderUnit: GameUnit
  attackerHex: BoardHex
  defenderHex: BoardHex
  boardHexes: BoardHexes
  gameArmyCards: GameArmyCard[]
  gameUnits: GameUnits
}): number => {
  let dice = defenderArmyCard.defense
  const heightBonus = defenderHex.altitude > attackerHex.altitude ? 1 : 0
  const raelinDefensiveAura = () => {
    const theirRaelinCard = gameArmyCards.filter(
      (c) =>
        c.playerID === defenderArmyCard.playerID && c.armyCardID === raelinOneID
    )?.[0]
    if (!theirRaelinCard) {
      return 0
    }
    const theirRaelinUnit = selectUnitsForCard(
      theirRaelinCard.gameCardID,
      gameUnits
    )?.[0]
    if (!theirRaelinUnit) {
      return 0
    }
    return selectIsUnitWithinNHexesOfUnit({
      startUnitID: theirRaelinUnit.unitID,
      endUnitID: defenderUnit.unitID,
      boardHexes,
      n: 4,
    })
      ? 2
      : 0
  }
  return dice + heightBonus + raelinDefensiveAura()
}

// attacks allowed
export const selectGameArmyCardAttacksAllowed = (
  gameArmyCard: GameArmyCard
) => {
  const numberOfAttackingFigures = gameArmyCard.figures
  const attacksAllowedPerFigure = selectIfGameArmyCardHasDoubleAttack(
    gameArmyCard
  )
    ? 2
    : 1
  const totalNumberOfAttacksAllowed =
    numberOfAttackingFigures * attacksAllowedPerFigure
  return {
    numberOfAttackingFigures,
    attacksAllowedPerFigure,
    totalNumberOfAttacksAllowed,
  }
}
