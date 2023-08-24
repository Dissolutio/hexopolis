import type { Move } from 'boardgame.io'

import {
  selectGameCardByID,
  selectIsInRangeOfAttack,
  selectHexForUnit,
  selectTailHexForUnit,
  selectAttackerHasAttacksAllowed,
} from '../selectors'
import { GameState, BoardHex, GameUnit, StageQueueItem } from '../types'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import {
  selectIfGameArmyCardHasAbility,
  selectUnitAttackDiceForAttack,
  selectUnitDefenseDiceForAttack,
} from '../selector/card-selectors'
import { getActivePlayersIdleStage, stageNames } from '../constants'
import { killUnit_G } from './G-mutators'
import { rollHeroscapeDice } from '../rollHeroscapeDice'

export const attackAction: Move<GameState> = {
  undoable: false,
  move: (
    { G, random, events },
    {
      attackingUnit,
      defenderHex,
      isStillAttacksLeft,
    }: {
      attackingUnit: GameUnit
      defenderHex: BoardHex
      isStillAttacksLeft: boolean
    }
  ) => {
    let newStageQueue: StageQueueItem[] = []
    const { unitID: attackerUnitID } = attackingUnit
    const attackerGameCard = selectGameCardByID(
      G.gameArmyCards,
      attackingUnit.gameCardID
    )
    const attackerHex = selectHexForUnit(attackingUnit.unitID, G.boardHexes)
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
      !attackerHex ||
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

    const { isInRange, isMelee, isRanged } = selectIsInRangeOfAttack({
      attackingUnit: attackingUnit,
      defenderHex,
      gameArmyCards: G.gameArmyCards,
      boardHexes: G.boardHexes,
      gameUnits: G.gameUnits,
      glyphs: G.hexMap.glyphs,
    })
    // DISALLOW - defender is out of range
    if (!isInRange) {
      console.error(`Attack action denied:defender is out of range`)
      return
    }
    // ALLOW
    const attackRolled = selectUnitAttackDiceForAttack({
      attackerHex,
      defenderHex,
      defender: defenderGameUnit,
      attackerArmyCard: attackerGameCard,
      defenderArmyCard: defenderGameCard,
      isMelee,
      boardHexes: G.boardHexes,
      gameArmyCards: G.gameArmyCards,
      gameUnits: G.gameUnits,
      glyphs: G.hexMap.glyphs,
      unitsAttacked: G.unitsAttacked,
    })
    const defenseRolled = selectUnitDefenseDiceForAttack({
      attackerHex,
      defenderHex,
      defenderArmyCard: defenderGameCard,
      defenderUnit: defenderGameUnit,
      boardHexes: G.boardHexes,
      gameArmyCards: G.gameArmyCards,
      gameUnits: G.gameUnits,
      glyphs: G.hexMap.glyphs,
    })
    const defenderLife = defenderGameCard.life - defenderGameUnit.wounds
    const attackerLife = attackerGameCard.life - attackingUnit.wounds
    const { skulls } = rollHeroscapeDice(attackRolled, random)
    const { shields } = rollHeroscapeDice(defenseRolled, random)

    // SPECIAL ABILITIES TIME XD
    const isStealthDodge =
      isRanged &&
      selectIfGameArmyCardHasAbility('Stealth Dodge', defenderGameCard) &&
      shields > 0 &&
      shields < skulls
    const isHit = skulls > shields && !isStealthDodge
    const woundsDealt = isHit ? Math.max(skulls - shields, 0) : 0
    const isFatal = woundsDealt >= defenderLife
    const isWarriorSpirit =
      isFatal &&
      selectIfGameArmyCardHasAbility(
        "Warrior's Attack Spirit 1",
        defenderGameCard
      )
    const isArmorSpirit =
      isFatal &&
      selectIfGameArmyCardHasAbility(
        "Warrior's Armor Spirit 1",
        defenderGameCard
      )
    const defenderUnitName = defenderGameCard.name
    const indexOfThisAttack = Object.values(unitsAttacked).flat().length
    const attackId = `r${currentRound}:om${currentOrderMarker}:${attackerUnitID}:a${indexOfThisAttack}`
    const counterStrikeWounds =
      selectIfGameArmyCardHasAbility('Counter Strike', defenderGameCard) &&
      isMelee
        ? shields - skulls
        : 0
    const isCounterStrikeWounds = counterStrikeWounds > 0
    const isFatalCounterStrike = counterStrikeWounds >= attackerLife

    // deal damage
    if (isHit) {
      G.gameUnits[defenderHexUnitID].wounds += woundsDealt
    }
    // kill unit, clear hex
    if (isFatal) {
      killUnit_G({
        boardHexes: G.boardHexes,
        gameArmyCards: G.gameArmyCards,
        killedArmyCards: G.killedArmyCards,
        unitsKilled: G.unitsKilled,
        killedUnits: G.killedUnits,
        gameUnits: G.gameUnits,
        unitToKillID: defenderHexUnitID,
        killerUnitID: attackerUnitID,
        defenderHexID: defenderHexID,
        defenderTailHexID: defenderTailHex?.id,
      })
    }
    // apply counter-strike if applicable
    if (isCounterStrikeWounds) {
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
        G.boardHexes[attackerHex.id].occupyingUnitID = ''
        if (attackingUnit.is2Hex && attackingUnitTailHex) {
          G.boardHexes[attackingUnitTailHex.id].occupyingUnitID = ''
          G.boardHexes[attackingUnitTailHex.id].isUnitTail = false
        }
      } else {
        G.gameUnits[attackingUnit.unitID].wounds += counterStrikeWounds
      }
    }
    // update units attacked
    unitsAttacked[attackerUnitID] = [
      ...(unitsAttacked?.[attackerUnitID] ?? []),
      defenderGameUnit.unitID,
    ]

    G.unitsAttacked = unitsAttacked
    // update game log
    const gameLogForThisAttack = encodeGameLogMessage({
      type: gameLogTypes.attack,
      id: attackId,
      playerID: attackerGameCard.playerID,
      defenderPlayerID: defenderGameCard.playerID,
      unitID: attackerUnitID,
      unitName: attackerGameCard.name,
      targetHexID: defenderHexID,
      defenderUnitName,
      defenderSingleName: defenderGameCard.singleName,
      attackRolled,
      defenseRolled,
      skulls,
      shields,
      wounds: woundsDealt,
      isFatal,
      counterStrikeWounds,
      isFatalCounterStrike,
      isStealthDodge,
    })
    G.gameLog = [...G.gameLog, gameLogForThisAttack]
    if (isWarriorSpirit) {
      if (isStillAttacksLeft) {
        // mark this so after placing spirit we can get back to attacking (or ending turn if we're out of attacks)
        newStageQueue.push({
          playerID: attackerGameCard.playerID,
          stage: stageNames.attacking,
        })
      }
      const activePlayers = getActivePlayersIdleStage({
        gamePlayerIDs: Object.keys(G.players),
        activePlayerID: defenderGameCard.playerID,
        activeStage: stageNames.placingAttackSpirit,
        idleStage: stageNames.idlePlacingAttackSpirit,
      })
      events.setActivePlayers({
        value: activePlayers,
      })
    }
    if (isArmorSpirit) {
      // mark this so after placing spirit we can get back to attacking (or ending turn if we're out of attacks)
      if (isStillAttacksLeft) {
        newStageQueue.push({
          playerID: attackerGameCard.playerID,
          stage: stageNames.attacking,
        })
      }
      const activePlayers = getActivePlayersIdleStage({
        gamePlayerIDs: Object.keys(G.players),
        activePlayerID: defenderGameCard.playerID,
        activeStage: stageNames.placingArmorSpirit,
        idleStage: stageNames.idlePlacingArmorSpirit,
      })
      events.setActivePlayers({
        value: activePlayers,
      })
    }
    // This update of G.stageQueue technically happens before the events.setActivePlayers above
    G.stageQueue = newStageQueue
  },
}
