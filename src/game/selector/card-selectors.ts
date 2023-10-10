import {
  BoardHexes,
  GameArmyCard,
  GameUnits,
  GameUnit,
  BoardHex,
  ArmyCard,
  Glyphs,
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
import { finnID, grimnakID, raelinOneID, thorgrimID } from '../setup/unit-gen'
import { glyphIDs } from '../glyphs'

// range abilities:
// 1 D-9000's Range Enhancement
// 2 Laglor's Vydar’s Range Enhancement Aura
export const selectUnitRange = ({
  attackingUnit,
  gameArmyCards,
  boardHexes,
  gameUnits,
  glyphs,
}: {
  attackingUnit: GameUnit
  gameArmyCards: GameArmyCard[]
  boardHexes: BoardHexes
  gameUnits: GameUnits
  glyphs: Glyphs
}): number => {
  const attackerGameCard = selectGameCardByID(
    gameArmyCards,
    attackingUnit.gameCardID
  )
  const attackerHex = selectHexForUnit(attackingUnit.unitID, boardHexes)
  const attackerTailHex = selectTailHexForUnit(attackingUnit.unitID, boardHexes)
  const is2Hex = attackingUnit.is2Hex && attackerTailHex

  // 1. early out: necessary ingredients missing
  if (!attackerGameCard || !attackerHex || (!attackerTailHex && is2Hex)) {
    return 0
  }
  // 2. a unit who is engaged can only attack the units it is engaged with
  const unitEngagements = selectEngagementsForHex({
    hexID: attackerHex.id,
    boardHexes,
    gameUnits,
    armyCards: gameArmyCards,
  })
  if (unitEngagements.length > 0) {
    return 1
  }

  // 3. calculate final range value
  const baseRange = attackerGameCard.range
  const glyphBonus = () => {
    const glyph = Object.values(glyphs).find(
      (g) => g.glyphID === glyphIDs.range
    )
    if (!glyph) {
      return 0
    }
    const allAttackerUnitIDs = Object.values(gameUnits)
      .filter((u) => u.playerID === attackerGameCard.playerID)
      .map((u) => u.unitID)
    const allHexIDsAttackerOccupies = Object.values(boardHexes)
      .filter(
        (h) =>
          h.occupyingUnitID && allAttackerUnitIDs.includes(h.occupyingUnitID)
      )
      .map((h) => h.id)
    const isMyGlyph = allHexIDsAttackerOccupies.includes(glyph.hexID)
    const isMyRangeEligibleForGlyph = baseRange >= 4
    const bonus = 4
    return isMyGlyph && isMyRangeEligibleForGlyph ? bonus : 0
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
        (neighborUnitCard?.playerID ?? '') === attackingUnit.playerID &&
        selectIfGameArmyCardHasAbility('Range Enhancement', neighborUnitCard) &&
        selectAreTwoAdjacentUnitsEngaged({
          aHeight: attackerGameCard.height,
          aAltitude: attackerHex.altitude,
          bHeight: neighborUnitCard.height,
          bAltitude: hex.altitude,
        })
      )
    })
  const unitRange = baseRange + glyphBonus() + (isD9000RangeEnhancement ? 2 : 0)
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
    ? gameArmyCard.abilities.some((a) => a.name === 'Phantom Walk')
    : false
  const hasDisengage = gameArmyCard
    ? gameArmyCard.abilities.some(
        (a) => a.name === 'Disengage' || a.name === 'Phantom Walk'
      )
    : false
  return { hasDisengage, hasGhostWalk }
}
// abilities:
export function selectIfGameArmyCardHasAbility(
  abilityName: string,
  gameArmyCard?: GameArmyCard | ArmyCard
): boolean {
  return gameArmyCard
    ? gameArmyCard.abilities.some((a) => a.name === abilityName)
    : false
}
export const selectHasSpecialAttack = (gameArmyCard?: GameArmyCard) => {
  return {
    hasFireLine: gameArmyCard
      ? selectIfGameArmyCardHasAbility('Fire Line Special Attack', gameArmyCard)
      : false,
    hasExplosion: gameArmyCard
      ? selectIfGameArmyCardHasAbility('Explosion Special Attack', gameArmyCard)
      : false,
    hasGrenade:
      gameArmyCard && !gameArmyCard.hasThrownGrenade
        ? selectIfGameArmyCardHasAbility('Grenade Special Attack', gameArmyCard)
        : false,
  }
}

// ATTACK DICE FOR SPECIFIC ATTACK:
// attackerHex and defenderHex can be head or tail here, does not matter, they only have same altitude for head/tail, and also yield same engagements
export const selectUnitAttackDiceForAttack = ({
  // since attackerHex can only have same altitude for head/tail, and also yields same engagements as tail hex, we can use either
  attackerHex,
  // since defenderHex can only have same altitude for head/tail, and also yields same engagements as tail hex, we can use either
  defenderHex,
  defender,
  attackerArmyCard,
  defenderArmyCard,
  isMelee,
  boardHexes,
  glyphs,
  gameArmyCards,
  gameUnits,
  unitsAttacked,
}: {
  attackerHex: BoardHex
  defenderHex: BoardHex
  defender: GameUnit
  attackerArmyCard: GameArmyCard
  defenderArmyCard: GameArmyCard
  isMelee: boolean
  boardHexes: BoardHexes
  glyphs: Glyphs
  gameArmyCards: GameArmyCard[]
  gameUnits: GameUnits
  unitsAttacked: Record<string, string[]>
}): number => {
  let dice = attackerArmyCard.attack
  const heightBonus = attackerHex.altitude > defenderHex.altitude ? 1 : 0
  const glyphBonus = () => {
    const glyph = Object.values(glyphs).find(
      (g) => g.glyphID === glyphIDs.attack
    )
    if (!glyph) {
      return 0
    }
    const allAttackerUnitIDs = Object.values(gameUnits)
      .filter((u) => u.playerID === attackerArmyCard.playerID)
      .map((u) => u.unitID)
    const allHexIDsAttackerOccupies = Object.values(boardHexes)
      .filter(
        (h) =>
          h.occupyingUnitID && allAttackerUnitIDs.includes(h.occupyingUnitID)
      )
      .map((h) => h.id)
    const isMyGlyph = allHexIDsAttackerOccupies.includes(glyph.hexID)
    return isMyGlyph ? 1 : 0
  }
  const zettianTargetingBonus =
    selectIfGameArmyCardHasAbility('Zettian Targeting', attackerArmyCard) &&
    // if second zettian attacks same unit as first, +1
    Object.values(unitsAttacked).flat().includes(defender.unitID)
      ? 1
      : 0
  const swordOfReckoningBonus =
    isMelee &&
    selectIfGameArmyCardHasAbility('Sword of Reckoning', attackerArmyCard)
      ? 4
      : 0
  const finnsAttackAura = () => {
    const finnCard = gameArmyCards.filter(
      (c) => c.playerID === attackerArmyCard.playerID && c.armyCardID === finnID
    )?.[0]
    if (
      !finnCard ||
      !selectIfGameArmyCardHasAbility('Attack Aura 1', finnCard)
    ) {
      return 0
    }
    const finnUnit = selectUnitsForCard(finnCard.gameCardID, gameUnits)?.[0]
    if (!finnUnit) {
      return 0
    }
    return attackerArmyCard.range === 1 &&
      selectEngagementsForHex({
        hexID: attackerHex.id,
        boardHexes,
        gameUnits,
        armyCards: gameArmyCards,
        friendly: true,
      }).includes(finnUnit.unitID)
      ? 1
      : 0
  }
  const grimnaksOrcEnhancement = () => {
    const grimnakCard = gameArmyCards.filter(
      (c) =>
        c.playerID === attackerArmyCard.playerID && c.armyCardID === grimnakID
    )?.[0]
    if (
      !grimnakCard ||
      !selectIfGameArmyCardHasAbility('Orc Warrior Enhancement', grimnakCard)
    ) {
      return 0
    }
    const grimnakUnit = selectUnitsForCard(
      grimnakCard.gameCardID,
      gameUnits
    )?.[0]
    if (!grimnakUnit) {
      return 0
    }
    return attackerArmyCard.race === 'orc' &&
      attackerArmyCard.cardClass === 'warriors' &&
      selectEngagementsForHex({
        hexID: attackerHex.id,
        boardHexes,
        gameUnits,
        armyCards: gameArmyCards,
        friendly: true,
      }).includes(grimnakUnit.unitID)
      ? 1
      : 0
  }
  return (
    dice +
    heightBonus +
    glyphBonus() +
    zettianTargetingBonus +
    swordOfReckoningBonus +
    finnsAttackAura() +
    grimnaksOrcEnhancement()
  )
}
// DEFENSE DICE FOR SPECIFIC ATTACK:
// attackerHex and defenderHex can be head or tail here, does not matter, they only have same altitude for head/tail, and also yield same engagements
export const selectUnitDefenseDiceForAttack = ({
  defenderArmyCard,
  defenderUnit,
  attackerHex,
  defenderHex,
  boardHexes,
  gameArmyCards,
  gameUnits,
  glyphs,
}: {
  defenderArmyCard: GameArmyCard
  defenderUnit: GameUnit
  // head or tail, same results
  attackerHex: BoardHex
  // head or tail, same results
  defenderHex: BoardHex
  boardHexes: BoardHexes
  gameArmyCards: GameArmyCard[]
  gameUnits: GameUnits
  glyphs: Glyphs
}): number => {
  let dice = defenderArmyCard.defense
  const heightBonus = defenderHex.altitude > attackerHex.altitude ? 1 : 0
  const glyphBonus = () => {
    const glyph = Object.values(glyphs).find(
      (g) => g.glyphID === glyphIDs.defense
    )
    if (!glyph) {
      return 0
    }
    const allDefenderUnitIDs = Object.values(gameUnits)
      .filter((u) => u.playerID === defenderArmyCard.playerID)
      .map((u) => u.unitID)
    const allHexIDsDefenderOccupies = Object.values(boardHexes)
      .filter(
        (h) =>
          h.occupyingUnitID && allDefenderUnitIDs.includes(h.occupyingUnitID)
      )
      .map((h) => h.id)
    const isMyGlyph = allHexIDsDefenderOccupies.includes(glyph.hexID)
    return isMyGlyph ? 1 : 0
  }
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
    // raelin does NOT benefit from her own defensive aura
    return theirRaelinUnit.unitID !== defenderUnit.unitID &&
      selectIsUnitWithinNHexesOfUnit({
        startUnitID: theirRaelinUnit.unitID,
        endUnitID: defenderUnit.unitID,
        boardHexes,
        n: 4,
      })
      ? 2
      : 0
  }
  const thorgrimDefensiveAura = () => {
    const thorgrimCard = gameArmyCards.filter(
      (c) =>
        c.playerID === defenderArmyCard.playerID && c.armyCardID === thorgrimID
    )?.[0]
    if (
      !thorgrimCard ||
      !selectIfGameArmyCardHasAbility('Defensive Aura 1', thorgrimCard)
    ) {
      return 0
    }
    const thorgrimUnit = selectUnitsForCard(
      thorgrimCard.gameCardID,
      gameUnits
    )?.[0]
    if (!thorgrimUnit) {
      return 0
    }
    return selectEngagementsForHex({
      hexID: defenderHex.id,
      boardHexes,
      gameUnits,
      armyCards: gameArmyCards,
      friendly: true,
    }).includes(thorgrimUnit.unitID)
      ? 1
      : 0
  }
  const grimnaksOrcEnhancement = () => {
    const grimnakCard = gameArmyCards.filter(
      (c) =>
        c.playerID === defenderArmyCard.playerID && c.armyCardID === grimnakID
    )?.[0]
    if (
      !grimnakCard ||
      !selectIfGameArmyCardHasAbility('Orc Warrior Enhancement', grimnakCard)
    ) {
      return 0
    }
    const grimnakUnit = selectUnitsForCard(
      grimnakCard.gameCardID,
      gameUnits
    )?.[0]
    if (!grimnakUnit) {
      return 0
    }
    return defenderArmyCard.race === 'orc' &&
      defenderArmyCard.cardClass === 'warriors' &&
      selectEngagementsForHex({
        hexID: defenderHex.id,
        boardHexes,
        gameUnits,
        armyCards: gameArmyCards,
        friendly: true,
      }).includes(grimnakUnit.unitID)
      ? 1
      : 0
  }
  return (
    dice +
    heightBonus +
    glyphBonus() +
    raelinDefensiveAura() +
    thorgrimDefensiveAura() +
    grimnaksOrcEnhancement()
  )
}

// MOVE POINTS FOR UNIT:
export const selectUnitMoveValue = ({
  unitID,
  gameArmyCard,
  boardHexes,
  gameUnits,
  glyphs,
}: {
  unitID: string
  gameArmyCard: GameArmyCard
  boardHexes: BoardHexes
  gameUnits: GameUnits
  glyphs: Glyphs
}): number => {
  let movePoints = gameArmyCard.move
  const glyphBonus = () => {
    const moveGlyph = Object.values(glyphs).find(
      (g) => g.glyphID === glyphIDs.move
    )
    if (!moveGlyph) {
      return 0
    }
    const unitIdOnMoveGlyph =
      Object.values(boardHexes).find((h) => h.id === moveGlyph.hexID)
        ?.occupyingUnitID ?? ''
    const unitOnGlyph = gameUnits?.[unitIdOnMoveGlyph]
    const isMyGlyph = unitOnGlyph?.playerID === gameArmyCard.playerID
    if (!unitOnGlyph || !isMyGlyph) {
      return 0
    }
    const isNotUnitOnMoveGlyph = unitID !== unitIdOnMoveGlyph
    return isMyGlyph && isNotUnitOnMoveGlyph ? 2 : 0
  }

  return movePoints + glyphBonus()
}

// attacks allowed
export const selectGameArmyCardAttacksAllowed = (
  gameArmyCard?: GameArmyCard
) => {
  if (!gameArmyCard)
    return {
      numberOfAttackingFigures: 0,
      attacksAllowedPerFigure: 0,
      totalNumberOfAttacksAllowed: 0,
    }
  const numberOfAttackingFigures = gameArmyCard.figures
  const attacksAllowedPerFigure = selectIfGameArmyCardHasAbility(
    'Double Attack',
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
