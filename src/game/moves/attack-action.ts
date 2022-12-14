import type { Move } from 'boardgame.io'
import { Hex, HexUtils } from 'react-hexgrid'

import { selectHexForUnit, selectGameCardByID } from '../selectors'
import { GameState, BoardHex, GameUnit } from '../types'
import { encodeGameLogMessage } from '../gamelog'
import { RandomAPI } from 'boardgame.io/dist/types/src/plugins/random/random'

type HeroscapeDieRoll = {
  skulls: number
  shields: number
  blanks: number
}

export const rollHeroscapeDice = (
  count: number,
  random: RandomAPI
): HeroscapeDieRoll => {
  const dice = []
  for (let i = 0; i < count; i++) {
    dice.push(random.Die(6))
  }
  return dice.reduce(
    (result, die) => {
      if (die === 1 || die === 2 || die === 3) {
        return { ...result, skulls: result.skulls + 1 }
      } else if (die === 4 || die === 5) {
        return { ...result, shields: result.skulls + 1 }
      } else if (die === 6) {
        return { ...result, blanks: result.skulls + 1 }
      } else {
        return result
      }
    },
    { skulls: 0, shields: 0, blanks: 0 }
  )
}

export const attackAction: Move<GameState> = {
  undoable: false,
  move: ({ G, random }, unit: GameUnit, defenderHex: BoardHex) => {
    const { unitID } = unit
    const unitGameCard = selectGameCardByID(G.gameArmyCards, unit.gameCardID)
    const { currentRound, currentOrderMarker } = G
    const unitName = unitGameCard?.name ?? ''
    const unitRange = unitGameCard?.range ?? 0
    const unitsMoved = [...G.unitsMoved]
    const unitsAttacked = [...G.unitsAttacked]
    // attacksAllowed is where we might account for Double Attack, etc.
    const attacksAllowed = unitGameCard?.figures ?? 0
    const attacksLeft = attacksAllowed - unitsAttacked.length
    const attackerHex = selectHexForUnit(unitID, G.boardHexes)
    const { id: defenderHexID, occupyingUnitID: defenderHexUnitID } =
      defenderHex
    //! EARLY OUTS
    // DISALLOW - no target
    if (!defenderHexUnitID) {
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
      attacksLeft >
      unitsMoved.filter((id) => !unitsAttacked.includes(id)).length
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
    const attackRolled = unitGameCard?.attack ?? 0
    const defenderGameUnit = G.gameUnits[defenderHexUnitID]
    const defenderGameCard = selectGameCardByID(
      G.gameArmyCards,
      defenderGameUnit.gameCardID
    )
    const defenseRolled = defenderGameCard?.defense ?? 0
    const defenderInitialLife = defenderGameCard?.life ?? 0
    // const attackRoll = random?.Die(6, attackRolled) ?? []
    const attackRoll = rollHeroscapeDice(attackRolled, random)
    const skulls = attackRoll.skulls
    // const defenseRoll = random?.Die(6, defenseRolled) ?? []
    const defenseRoll = rollHeroscapeDice(defenseRolled, random)
    const shields = defenseRoll.shields
    const woundsDealt = Math.max(skulls - shields, 0)
    const isHit = woundsDealt > 0
    const isFatal = woundsDealt >= defenderInitialLife - defenderGameUnit.wounds
    const defenderUnitName = defenderGameCard?.name ?? ''
    const indexOfThisAttack = unitsAttacked.length
    const attackId = `r${currentRound}:om${currentOrderMarker}:${unitID}:a${indexOfThisAttack}`
    // const gameLogHumanFriendly = `${unitName} attacked ${defenderUnitName} for ${wounds} wounds (${skulls} skulls, ${shields} shields)`
    const gameLogForThisAttack = encodeGameLogMessage({
      type: 'attack',
      id: attackId,
      unitID: unitID,
      unitName,
      targetHexID: defenderHexID,
      defenderUnitName,
      attackRolled,
      defenseRolled,
      skulls,
      shields,
      wounds: woundsDealt,
      isFatal,
    })

    // deal damage
    if (isHit) {
      G.gameUnits[defenderHexUnitID].wounds += woundsDealt
    }
    // kill unit, clear hex
    if (isFatal) {
      G.unitsKilled = {
        ...G.unitsKilled,
        [unitID]: [...(G.unitsKilled?.[unitID] ?? []), defenderGameUnit.unitID],
      }
      delete G.gameUnits[defenderGameUnit.unitID]
      G.boardHexes[defenderHexID].occupyingUnitID = ''
    }
    // update units attacked
    unitsAttacked.push(unitID)
    G.unitsAttacked = unitsAttacked
    // update game log
    G.gameLog = [...G.gameLog, gameLogForThisAttack]
  },
}
