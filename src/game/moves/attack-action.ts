import type { Move } from 'boardgame.io'

import {
  selectGameCardByID,
  selectIsInRangeOfAttack,
  selectHexForUnit,
  selectTailHexForUnit,
  selectAttackerHasAttacksAllowed,
} from '../selectors'
import { GameState, BoardHex, GameUnit } from '../types'
import { encodeGameLogMessage } from '../gamelog'
import { RandomAPI } from 'boardgame.io/dist/types/src/plugins/random/random'
import {
  selectIfGameArmyCardHasCounterStrike,
  selectUnitAttackDiceForAttack,
} from 'game/selectors/card-selectors'

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
    const unitName = attackerGameCard?.name ?? ''
    const attackingUnitHex = selectHexForUnit(
      attackingUnit.unitID,
      G.boardHexes
    )
    const attackingUnitTailHex = selectTailHexForUnit(
      attackingUnit.unitID,
      G.boardHexes
    )
    const { currentRound, currentOrderMarker } = G
    const unitsAttacked = { ...G.unitsAttacked }
    const { id: defenderHexID, occupyingUnitID: defenderHexUnitID } =
      defenderHex
    const defenderGameUnit = G.gameUnits[defenderHexUnitID]
    const defenderGameCard = selectGameCardByID(
      G.gameArmyCards,
      defenderGameUnit.gameCardID
    )
    const defenderTailHex = selectTailHexForUnit(
      defenderGameUnit.unitID,
      G.boardHexes
    )
    //! EARLY OUTS
    // DISALLOW - missing needed ingredients
    if (
      !attackerGameCard ||
      !attackingUnitHex ||
      !defenderHexUnitID ||
      !defenderGameCard ||
      !defenderGameUnit
    ) {
      console.error(
        `Attack action denied: missing needed ingredients to calculate attack`
      )
      return
    }
    const {
      isNoAttacksLeftFromTotal,
      isUnitHasNoAttacksLeft,
      isUnmovedUnitUsableAttack,
    } = selectAttackerHasAttacksAllowed({
      attackingUnit,
      gameArmyCards: G.gameArmyCards,
      unitsAttacked: G.unitsAttacked,
      unitsMoved: G.unitsMoved,
    })
    // DISALLOW - all attacks used from total
    if (isNoAttacksLeftFromTotal) {
      console.error(`Attack action denied:all attacks used`)
      return
    }
    // DISALLOW - unit has used all their attacks
    if (isUnitHasNoAttacksLeft) {
      console.error(`Attack action denied:unit already used all their attacks`)
      return
    }
    // DISALLOW - attack must be used by a moved unit
    if (!isUnmovedUnitUsableAttack) {
      console.error(`Attack action denied:attack must be used by a moved unit`)
      return
    }

    const { isInRange, isMelee } = selectIsInRangeOfAttack({
      attackingUnit: attackingUnit,
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
    // const attackRolled = attackerGameCard.attack
    const attackRolled = selectUnitAttackDiceForAttack({
      defender: defenderGameUnit,
      attackerArmyCard: attackerGameCard,
      unitsAttacked: G.unitsAttacked,
      isMelee,
    })
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
    const indexOfThisAttack = Object.values(unitsAttacked).flat().length
    const attackId = `r${currentRound}:om${currentOrderMarker}:${attackerUnitID}:a${indexOfThisAttack}`
    const hasCounterStrike =
      selectIfGameArmyCardHasCounterStrike(defenderGameCard)
    const counterStrikeWounds = hasCounterStrike ? shields - skulls : 0
    const isCounterStrikeWounds = counterStrikeWounds > 0
    const isFatalCounterStrike = counterStrikeWounds >= attackerLife

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
    unitsAttacked[attackerUnitID] = [
      ...(unitsAttacked?.[attackerUnitID] ?? []),
      defenderGameUnit.unitID,
    ]

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
