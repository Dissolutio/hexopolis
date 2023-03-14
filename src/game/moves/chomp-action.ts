import type { Move } from 'boardgame.io'
import { getActivePlayersIdleStage, stageNames } from '../constants'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import { selectIfGameArmyCardHasAbility } from '../selector/card-selectors'
import {
  selectHexForUnit,
  selectTailHexForUnit,
  selectUnitForHex,
} from '../selectors'
import { GameState, PossibleChomp, StageQueueItem } from '../types'
import { killUnit_G } from './G-mutators'

export const chompAction: Move<GameState> = {
  undoable: false,
  move: (
    { G, random, events },
    { chompingUnitID, targetHexID, isSquad }: PossibleChomp
  ) => {
    const targetUnit = selectUnitForHex(targetHexID, G.boardHexes, G.gameUnits)
    const targetHeadHex = selectHexForUnit(targetUnit.unitID, G.boardHexes)
    const targetTailHex = selectTailHexForUnit(targetUnit.unitID, G.boardHexes)
    const targetGameCard = G.gameArmyCards.find(
      (gc) => gc.gameCardID === targetUnit.gameCardID
    )
    // DISALLOW - missing needed ingredients
    if (!targetUnit || !targetGameCard) {
      console.error(
        `Chomp action denied: missing needed ingredients to calculate attack`
      )
      return
    }
    const defenderPlayerID = targetGameCard.playerID
    // unconditional success for squads, roll for it if it's a hero
    const roll = random.Die(20)
    const rollThreshold = 16
    const isSuccessfulAndNecessaryRoll = roll >= rollThreshold && !isSquad
    const isChompSuccessful = isSuccessfulAndNecessaryRoll || isSquad
    const chompedUnitID = targetUnit.unitID
    // if it works, kill the unit
    if (isChompSuccessful) {
      killUnit_G({
        boardHexes: G.boardHexes,
        gameArmyCards: G.gameArmyCards,
        killedArmyCards: G.killedArmyCards,
        unitsKilled: G.unitsKilled,
        killedUnits: G.killedUnits,
        gameUnits: G.gameUnits,
        unitToKillID: chompedUnitID,
        killerUnitID: chompingUnitID,
        defenderHexID: targetHeadHex?.id,
        defenderTailHexID: targetTailHex?.id,
      })
    }
    // add to game log
    const unitChompedName = targetGameCard.name
    const unitChompedSingleName = targetGameCard.singleName
    const gameLogForChomp = encodeGameLogMessage({
      type: gameLogTypes.chomp,
      id: `r${G.currentRound}:om${G.currentOrderMarker}:${chompingUnitID}:chomp:${chompedUnitID}`,
      playerID: G.gameUnits[chompingUnitID].playerID,
      defenderPlayerID,
      roll: roll,
      rollThreshold,
      isChompSuccessful,
      unitChompedName,
      unitChompedSingleName,
      isChompedUnitSquad: isSquad,
    })
    G.gameLog.push(gameLogForChomp)
    // mark grimnak as having chomped
    G.chompsAttempted.push(chompingUnitID)
    // if it was a hero with post death powers (finn/thorgrim died), send to post-death-stage and queue up grimnaks movement, otherwise just back to grimnaks movement stage
    const isWarriorSpirit =
      isSuccessfulAndNecessaryRoll &&
      selectIfGameArmyCardHasAbility(
        "Warrior's Attack Spirit 1",
        targetGameCard
      )
    const isArmorSpirit =
      isSuccessfulAndNecessaryRoll &&
      selectIfGameArmyCardHasAbility("Warrior's Armor Spirit 1", targetGameCard)
    let newStageQueue: StageQueueItem[] = []
    if (isWarriorSpirit) {
      // mark this so after placing spirit we can get back to moving Grimnak
      newStageQueue.push({
        playerID: G.gameUnits[chompingUnitID].playerID,
        stage: stageNames.movement,
      })
      const activePlayers = getActivePlayersIdleStage({
        gamePlayerIDs: Object.keys(G.players),
        activePlayerID: targetGameCard.playerID,
        activeStage: stageNames.placingAttackSpirit,
        idleStage: stageNames.idlePlacingAttackSpirit,
      })
      events.setActivePlayers({
        value: activePlayers,
      })
      // this assumes a figure does not have both spirits
    } else if (isArmorSpirit) {
      // mark this so after placing spirit we can get back to moving Grimnak
      newStageQueue.push({
        playerID: G.gameUnits[chompingUnitID].playerID,
        stage: stageNames.movement,
      })
      const activePlayers = getActivePlayersIdleStage({
        gamePlayerIDs: Object.keys(G.players),
        activePlayerID: targetGameCard.playerID,
        activeStage: stageNames.placingArmorSpirit,
        idleStage: stageNames.idlePlacingArmorSpirit,
      })
      events.setActivePlayers({
        value: activePlayers,
      })
    } else {
      events.setStage(stageNames.movement)
    }
    G.stageQueue = newStageQueue
  },
}
