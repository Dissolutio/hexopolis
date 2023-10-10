import type { Move } from 'boardgame.io'
import {
  selectIfGameArmyCardHasAbility,
  selectUnitDefenseDiceForAttack,
} from '../selector/card-selectors'
import {
  selectEngagementsForHex,
  selectGameCardByID,
  selectHexForUnit,
  selectTailHexForUnit,
} from '../selectors'
import { GameState, PossibleFireLineAttack, StageQueueItem } from '../types'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import { getActivePlayersIdleStage, stageNames } from '../constants'
import { killUnit_G } from './G-mutators'
import { rollHeroscapeDice } from '../rollHeroscapeDice'

export const rollForFireLineSpecialAttack: Move<GameState> = (
  { G, events, random },
  {
    chosenFireLineAttack,
    affectedUnitIDs,
    attackerUnitID,
  }: {
    chosenFireLineAttack: PossibleFireLineAttack
    affectedUnitIDs: string[]
    attackerUnitID: string
  }
) => {
  // 0. get ready
  let newStageQueue: StageQueueItem[] = []
  const attackRolled = 4
  const unitsAttacked = { ...G.unitsAttacked }
  const attackerHex = selectHexForUnit(attackerUnitID, G.boardHexes)
  const attackerGameCard = selectGameCardByID(
    G.gameArmyCards,
    G.gameUnits[attackerUnitID].gameCardID
  )
  // DISALLOW - missing needed ingredients
  if (!attackerHex || !attackerGameCard) {
    console.error(
      `Fire Line Special Attack aborted before attack was rolled: missing needed ingredients to calculate attack`
    )
    return
  }
  // 1. roll the attack
  const { skulls } = rollHeroscapeDice(attackRolled, random)

  // 2. for-loop each defender figure out defense, wounds
  affectedUnitIDs.forEach((unitID) => {
    const defenderGameUnit = G.gameUnits[unitID]
    const defenderGameCard = selectGameCardByID(
      G.gameArmyCards,
      defenderGameUnit.gameCardID
    )
    // we take the hex that is closest to the attacker to be the defender hex
    // DISALLOW - no card should not happen
    if (!defenderGameCard) {
      console.error(
        `Attack action denied: missing needed ingredients to calculate attack`
      )
      return
    }
    const firstIndexOfDefenderInLine = chosenFireLineAttack.line.findIndex(
      (hex) => hex.occupyingUnitID === defenderGameUnit.unitID
    )
    // this hex is the one we will measure range to, we don't care if it's the tail or head
    const defenderHex = chosenFireLineAttack.line[firstIndexOfDefenderInLine]
    const defenderHeadHex = selectHexForUnit(
      defenderGameUnit.unitID,
      G.boardHexes
    )
    const defenderTailHex = selectTailHexForUnit(
      defenderGameUnit.unitID,
      G.boardHexes
    )
    if (!defenderHeadHex || (!defenderTailHex && defenderGameUnit.is2Hex)) {
      console.error(
        `Fire Line Special Attack aborted before attack was rolled: missing defender hexes to calculate attack`
      )
      return
    }
    const isRanged = selectEngagementsForHex({
      hexID: defenderHex.id,
      boardHexes: G.boardHexes,
      gameUnits: G.gameUnits,
      armyCards: G.gameArmyCards,
    }).includes(attackerUnitID)
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
    const indexOfThisAttack = Object.values(G.unitsAttacked).flat().length
    const attackId = `r${G.currentRound}:om${G.currentOrderMarker}:${attackerUnitID}:a${indexOfThisAttack}`

    // deal damage
    if (isHit) {
      G.gameUnits[defenderGameUnit.unitID].wounds += woundsDealt
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
        unitToKillID: defenderGameUnit.unitID,
        killerUnitID: attackerUnitID,
        defenderHexID: defenderHeadHex?.id,
        defenderTailHexID: defenderTailHex?.id,
      })
    }
    // update units attacked
    unitsAttacked[attackerUnitID] = [
      ...(unitsAttacked?.[attackerUnitID] ?? []),
      defenderGameUnit.unitID,
    ]

    G.unitsAttacked = unitsAttacked
    // update game log
    // TODO: pull this game log out of the loop like stageQueue
    const gameLogForThisAttack = encodeGameLogMessage({
      type: gameLogTypes.attack,
      id: attackId,
      playerID: attackerGameCard.playerID,
      defenderPlayerID: defenderGameCard.playerID,
      unitID: attackerUnitID,
      unitName: attackerGameCard.name,
      targetHexID: defenderHex.id,
      defenderUnitName,
      defenderSingleName: defenderGameCard.singleName,
      attackRolled,
      defenseRolled,
      skulls,
      shields,
      wounds: woundsDealt,
      isFatal,
      isStealthDodge,
    })
    G.gameLog = [...G.gameLog, gameLogForThisAttack]
    // handle post death spirit abilities
    if (isWarriorSpirit) {
      newStageQueue.push({
        playerID: defenderGameCard.playerID,
        stage: stageNames.placingAttackSpirit,
      })
    }
    if (isArmorSpirit) {
      newStageQueue.push({
        playerID: defenderGameCard.playerID,
        stage: stageNames.placingArmorSpirit,
      })
    }
    // END LOOP
  })

  // at this point, newStageQueue could be populated with many stages
  const nextStage = newStageQueue.shift()
  G.stageQueue = newStageQueue
  if (nextStage?.stage === stageNames.placingAttackSpirit) {
    const activePlayers = getActivePlayersIdleStage({
      gamePlayerIDs: Object.keys(G.players),
      activePlayerID: nextStage.playerID,
      activeStage: stageNames.placingAttackSpirit,
      idleStage: stageNames.idlePlacingAttackSpirit,
    })
    events.setActivePlayers({ value: activePlayers })
  }
  if (nextStage?.stage === stageNames.placingArmorSpirit) {
    const activePlayers = getActivePlayersIdleStage({
      gamePlayerIDs: Object.keys(G.players),
      activePlayerID: nextStage.playerID,
      activeStage: stageNames.placingArmorSpirit,
      idleStage: stageNames.idlePlacingArmorSpirit,
    })
    events.setActivePlayers({
      value: activePlayers,
    })
  }
  if (!nextStage) {
    events.endTurn()
  }
}
