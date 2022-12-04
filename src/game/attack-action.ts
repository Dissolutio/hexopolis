import type { Move } from 'boardgame.io'
import { Hex, HexUtils } from 'react-hexgrid'

import { selectHexForUnit, selectGameCardByID } from './selectors'
import { GameState, BoardHex, GameUnit } from './types'

// TODO: shall we mark this attack as unique, so react does not run it twice?
export const attackAction: Move<GameState> = (
  { G, random },
  unit: GameUnit,
  defenderHex: BoardHex
) => {
  const { unitID } = unit
  const unitGameCard = selectGameCardByID(G.armyCards, unit.gameCardID)
  const unitName = unitGameCard?.name ?? ''
  const unitRange = unitGameCard?.range ?? 0
  const unitsMoved = [...G.unitsMoved]
  const unitsAttacked = [...G.unitsAttacked]
  // attacksAllowed is where we might account for Double Attack, etc.
  const attacksAllowed = unitGameCard?.figures ?? 0
  const attacksLeft = attacksAllowed - unitsAttacked.length
  const attackerHex = selectHexForUnit(unitID, G.boardHexes)

  //! EARLY OUTS
  // DISALLOW - no target
  if (!defenderHex.occupyingUnitID) {
    console.error(`Attack action denied:no target`)
    return
  }
  // DISALLOW - all attacks used
  const isNoAttacksLeft = attacksLeft <= 0
  if (isNoAttacksLeft) {
    console.error(`Attack action denied:all attacks used`)
    return
  }
  // DISALLOW - unit already attacked
  const isUnitHasNoAttacksLeft = unitsAttacked.includes(unitID)
  if (isUnitHasNoAttacksLeft) {
    console.error(`Attack action denied:unit already attacked`)
    return
  }
  // DISALLOW - attack must be used by a moved unit
  const isMovedUnitAttacking = unitsMoved.includes(unitID)
  const isAttackAvailableForUnmovedUnitToUse =
    attacksLeft > unitsMoved.filter((id) => !unitsAttacked.includes(id)).length
  const isUsableAttack =
    isMovedUnitAttacking || isAttackAvailableForUnmovedUnitToUse
  if (!isUsableAttack) {
    console.error(`Attack action denied:attack must be used by a moved unit`)
    return
  }
  // DISALLOW - defender is out of range
  const isInRange =
    HexUtils.distance(attackerHex as Hex, defenderHex) <= unitRange
  if (!isInRange) {
    console.error(`Attack action denied:defender is out of range`)
    return
  }

  // ALLOW
  const attack = unitGameCard?.attack ?? 0
  const defenderGameUnit = G.gameUnits[defenderHex.occupyingUnitID]
  const defenderGameCard = selectGameCardByID(
    G.armyCards,
    defenderGameUnit.gameCardID
  )
  const defenderName = defenderGameCard?.name ?? ''
  const defense = defenderGameCard?.defense ?? 0
  const defenderLife = defenderGameCard?.life ?? 0
  const attackRoll = random?.Die(6, attack) ?? []
  const skulls = attackRoll.filter((n) => n <= 3).length
  const defenseRoll = random?.Die(6, defense) ?? []
  const shields = defenseRoll.filter((n) => n === 4 || n === 5).length
  const wounds = Math.max(skulls - shields, 0)
  const isHit = wounds > 0
  const isFatal = wounds >= defenderLife
  const gameLogMessage = `${unitName} attacked ${defenderName} for ${wounds} wounds (${skulls} skulls, ${shields} shields)`

  // deal damage
  if (isHit && !isFatal) {
    const gameCardIndex = G.armyCards.findIndex(
      (card) => card?.gameCardID === defenderGameUnit.gameCardID
    )
    G.armyCards[gameCardIndex].life = defenderLife - wounds
  }
  // kill unit, clear hex
  if (isFatal) {
    delete G.gameUnits[defenderGameUnit.unitID]
    G.boardHexes[defenderHex.id].occupyingUnitID = ''
  }
  // update units attacked
  unitsAttacked.push(unitID)
  G.unitsAttacked = unitsAttacked
  // update game log
  G.gameLog = [...G.gameLog, gameLogMessage]
}
