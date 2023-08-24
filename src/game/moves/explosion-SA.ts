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
import { GameState, PossibleExplosionAttack, StageQueueItem } from '../types'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import { getActivePlayersIdleStage, stageNames } from '../constants'
import { killUnit_G } from './G-mutators'
import { rollHeroscapeDice } from '../rollHeroscapeDice'

export const rollForExplosionSpecialAttack: Move<GameState> = (
  { G, events, random },
  {
    attackerUnitID,
    chosenExplosionAttack,
    grenadeThrowingGameCardID,
    isStillAttacksLeft,
  }: {
    attackerUnitID: string
    chosenExplosionAttack: PossibleExplosionAttack
    grenadeThrowingGameCardID?: string
    isStillAttacksLeft?: boolean
  }
) => {
  const affectedUnitIDs = chosenExplosionAttack?.affectedUnitIDs
  const affectedHexIDs = chosenExplosionAttack?.affectedHexIDs
  const isGrenadesInsteadOfExplosion = !!grenadeThrowingGameCardID
  // 0. get ready
  let newStageQueue: StageQueueItem[] = []
  const attackRolled = isGrenadesInsteadOfExplosion ? 2 : 3 // D9000 explosion is 3, airborne grenade is 2
  const unitsAttacked = { ...G.unitsAttacked }
  const attackerHex = selectHexForUnit(attackerUnitID, G.boardHexes)
  const attackerGameCard = selectGameCardByID(
    G.gameArmyCards,
    G.gameUnits[attackerUnitID].gameCardID
  )
  // DISALLOW - missing needed ingredients
  if (
    !attackerHex ||
    !attackerGameCard ||
    !affectedUnitIDs ||
    !affectedHexIDs
  ) {
    console.error(
      `Explosion/Grenade Special Attack aborted before attack was rolled: missing needed ingredients to calculate attack`
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
    // this hex is the one we will measure range to, the range function won't care if it's the head or tail
    const defenderHeadHex = selectHexForUnit(
      defenderGameUnit.unitID,
      G.boardHexes
    )
    // DISALLOW - no card should not happen
    if (!defenderGameCard || !defenderHeadHex) {
      console.error(
        `Attack action denied: missing needed ingredients to calculate attack`
      )
      return
    }
    const defenderTailHex = selectTailHexForUnit(
      defenderGameUnit.unitID,
      G.boardHexes
    )
    const isRanged = !selectEngagementsForHex({
      hexID: defenderHeadHex.id,
      boardHexes: G.boardHexes,
      gameUnits: G.gameUnits,
      armyCards: G.gameArmyCards,
    }).includes(attackerUnitID)
    const defenseRolled = selectUnitDefenseDiceForAttack({
      attackerHex,
      defenderHex: defenderHeadHex,
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
    // TODO: gamelog: improve from regular attack log to a special one for explosion/grenade
    const gameLogForThisAttack = encodeGameLogMessage({
      type: gameLogTypes.attack,
      id: attackId,
      playerID: attackerGameCard.playerID,
      defenderPlayerID: defenderGameCard.playerID,
      unitID: attackerUnitID,
      unitName: attackerGameCard.name,
      targetHexID: defenderHeadHex.id,
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
  // After end of loop, add a marker to come back to finish grenade attacks
  if (isStillAttacksLeft) {
    newStageQueue.push({
      playerID: attackerGameCard.playerID,
      stage: stageNames.grenadeSA,
    })
  }

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
  // Mark this so that in game.ts file
  if (grenadeThrowingGameCardID) {
    G.grenadesThrown = [...G.grenadesThrown, grenadeThrowingGameCardID]
  }
  if (!nextStage) {
    events.endTurn()
  }
}
