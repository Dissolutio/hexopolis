import type { Move } from 'boardgame.io'

import {
  selectGameCardByID,
  selectIsInRangeOfAttack,
  selectIfGameArmyCardHasCounterStrike,
  selectHexForUnit,
  selectTailHexForUnit,
} from '../selectors'
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
  move: ({ G, random }, attackingUnit: GameUnit, defenderHex: BoardHex) => {
    const { unitID: attackerUnitID } = attackingUnit
    const attackerGameCard = selectGameCardByID(
      G.gameArmyCards,
      attackingUnit.gameCardID
    )
    const attackingUnitHex = selectHexForUnit(
      attackingUnit.unitID,
      G.boardHexes
    )
    const attackingUnitTailHex = selectTailHexForUnit(
      attackingUnit.unitID,
      G.boardHexes
    )
    const { currentRound, currentOrderMarker } = G
    const unitName = attackerGameCard?.name ?? ''
    const unitsMoved = [...G.unitsMoved]
    const unitsAttacked = [...G.unitsAttacked]
    // attacksAllowed is where we might account for Double Attack, etc.
    const attacksAllowed = attackerGameCard?.figures ?? 0
    const attacksLeft = attacksAllowed - unitsAttacked.length
    const { id: defenderHexID, occupyingUnitID: defenderHexUnitID } =
      defenderHex
    const defenderGameUnit = G.gameUnits[defenderHexUnitID]
    const defenderTailHex = selectTailHexForUnit(
      defenderGameUnit.unitID,
      G.boardHexes
    )
    const defenderGameCard = selectGameCardByID(
      G.gameArmyCards,
      defenderGameUnit.gameCardID
    )
    //! EARLY OUTS
    // DISALLOW - missing needed ingredients
    if (
      !attackerGameCard ||
      !attackingUnitHex ||
      !defenderGameCard ||
      !defenderGameUnit
    ) {
      console.error(
        `Attack action denied: missing needed ingredients to calculate attack`
      )
      return
    }
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
    const isUnitHasNoAttacksLeft = unitsAttacked.includes(attackerUnitID)
    if (isUnitHasNoAttacksLeft) {
      console.error(`Attack action denied:unit already attacked`)
      return
    }
    // DISALLOW - attack must be used by a moved unit
    const isMovedUnitAttacking = unitsMoved.includes(attackerUnitID)
    const isAttackAvailableForUnmovedUnitToUse =
      attacksLeft >
      unitsMoved.filter((id) => !unitsAttacked.includes(id)).length
    const isUsableAttack =
      isMovedUnitAttacking || isAttackAvailableForUnmovedUnitToUse
    if (!isUsableAttack) {
      console.error(`Attack action denied:attack must be used by a moved unit`)
      return
    }

    const { isInRange, isRanged, isMelee } = selectIsInRangeOfAttack({
      attacker: attackingUnit,
      defenderHex,
      gameArmyCards: G.gameArmyCards,
      boardHexes: G.boardHexes,
      gameUnits: G.gameUnits,
    })
    // DISALLOW - defender is out of range
    if (!isInRange) {
      console.error(`Attack action denied:defender is out of range`)
      return
    }
    // ALLOW
    const attackRolled = attackerGameCard.attack
    const defenseRolled = defenderGameCard.defense
    const defenderLife = defenderGameCard.life - defenderGameUnit.wounds
    const attackerLife = attackerGameCard.life - attackingUnit.wounds
    const attackRoll = rollHeroscapeDice(attackRolled, random)
    const skulls = attackRoll.skulls
    const defenseRoll = rollHeroscapeDice(defenseRolled, random)
    const shields = defenseRoll.shields
    const woundsDealt = Math.max(skulls - shields, 0)
    const isHit = woundsDealt > 0
    const isFatal = woundsDealt >= defenderLife
    const defenderUnitName = defenderGameCard.name
    const indexOfThisAttack = unitsAttacked.length
    const attackId = `r${currentRound}:om${currentOrderMarker}:${attackerUnitID}:a${indexOfThisAttack}`
    const hasCounterStrike =
      selectIfGameArmyCardHasCounterStrike(defenderGameCard)
    const isCounterStrikeWounds = shields - skulls > 0
    const counterStrikeWounds = shields - skulls
    const isFatalCounterStrike = counterStrikeWounds >= attackerLife
    // const gameLogHumanFriendly = `${unitName} attacked ${defenderUnitName} for ${wounds} wounds (${skulls} skulls, ${shields} shields)`

    // deal damage
    if (isHit) {
      G.gameUnits[defenderHexUnitID].wounds += woundsDealt
    }
    // kill unit, clear hex
    if (isFatal) {
      G.unitsKilled = {
        ...G.unitsKilled,
        [attackerUnitID]: [
          ...(G.unitsKilled?.[attackerUnitID] ?? []),
          defenderGameUnit.unitID,
        ],
      }
      G.killedUnits[defenderGameUnit.unitID] = {
        ...G.gameUnits[defenderGameUnit.unitID],
      }
      delete G.gameUnits[defenderGameUnit.unitID]
      // remove from hex, and tail if applicable
      G.boardHexes[defenderHexID].occupyingUnitID = ''
      if (defenderGameUnit.is2Hex && defenderTailHex) {
        G.boardHexes[defenderTailHex.id].occupyingUnitID = ''
        G.boardHexes[defenderTailHex.id].isUnitTail = false
      }
    }
    // apply counter-strike if applicable
    if (hasCounterStrike && isCounterStrikeWounds) {
      if (isFatalCounterStrike) {
        G.unitsKilled = {
          ...G.unitsKilled,
          [defenderHexUnitID]: [
            ...(G.unitsKilled?.[defenderHexUnitID] ?? []),
            attackingUnit.unitID,
          ],
        }
        G.killedUnits[attackingUnit.unitID] = {
          ...G.gameUnits[attackingUnit.unitID],
        }
        delete G.gameUnits[attackingUnit.unitID]
        // remove from hex, and tail if applicable
        G.boardHexes[attackingUnitHex.id].occupyingUnitID = ''
        if (attackingUnit.is2Hex && attackingUnitTailHex) {
          G.boardHexes[attackingUnitTailHex.id].occupyingUnitID = ''
          G.boardHexes[attackingUnitTailHex.id].isUnitTail = false
        }
      } else {
        G.gameUnits[attackingUnit.unitID].wounds += counterStrikeWounds
      }
      // TODO: add counter-strike to game log
    }
    // update units attacked
    unitsAttacked.push(attackerUnitID)
    G.unitsAttacked = unitsAttacked
    // update game log
    const gameLogForThisAttack = encodeGameLogMessage({
      type: 'attack',
      id: attackId,
      unitID: attackerUnitID,
      unitName,
      targetHexID: defenderHexID,
      defenderUnitName,
      attackRolled,
      defenseRolled,
      skulls,
      shields,
      wounds: woundsDealt,
      isFatal,
      counterStrikeWounds,
      isFatalCounterStrike,
    })
    G.gameLog = [...G.gameLog, gameLogForThisAttack]
  },
}
