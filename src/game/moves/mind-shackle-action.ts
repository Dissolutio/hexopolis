import type { Move } from 'boardgame.io'
import { generateBlankPlayersOrderMarkers, stageNames } from '../constants'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import { selectUnitsForCard } from '../selectors'
import { GameState, PlayerOrderMarkers } from '../types'
import { wipeCardOrderMarkers_G } from './G-mutators'

export const mindShackleAction: Move<GameState> = {
  client: false,
  move: (
    { G, random, events },
    {
      sourceUnitID,
      targetUnitID,
      sourcePlayerID,
    }: {
      sourceUnitID: string
      sourcePlayerID: string
      targetUnitID: string
    }
  ) => {
    const targetUnit = G.gameUnits[targetUnitID]
    const targetGameCard = G.gameArmyCards.find(
      (gc) => gc.gameCardID === targetUnit.gameCardID
    )
    const sourceGameCard = G.gameArmyCards.find(
      (gc) => gc.gameCardID === G.gameUnits[sourceUnitID].gameCardID
    )
    // DISALLOW - missing needed ingredients
    if (!targetUnit || !targetGameCard || !sourceGameCard) {
      console.error(
        `Mind Shackle action denied: missing needed ingredients to calculate action`
      )
      return
    }
    // UI tells us to only target unique cards, 20 takes it over
    const roll = random.Die(20)
    const rollThreshold = 20
    const isSuccessful = roll >= rollThreshold
    // if successful, change playerID of target card and units, and remove all order markers
    if (isSuccessful) {
      // remove all order markers from the card, first
      const targetPlayerID = targetGameCard.playerID
      if (!targetPlayerID) {
        console.error(`Mind Shackle action denied: missing targetPlayerID`)
        return
      }
      wipeCardOrderMarkers_G({
        gameCardToWipeID: targetGameCard.gameCardID,
        playerID: targetPlayerID,
        playerState: G.players,
        orderMarkers: G.orderMarkers,
      })

      // write playerID of gameArmyCard and gameUnits
      const targetGameCardUnits = selectUnitsForCard(
        targetUnit.gameCardID,
        G.gameUnits
      )
      targetGameCardUnits.forEach((unit) => {
        G.gameUnits[unit.unitID].playerID = sourcePlayerID
      })
      const indexOfMindShackledCard = G.gameArmyCards.findIndex((gc) => {
        return gc.gameCardID === targetGameCard.gameCardID
      })
      if (indexOfMindShackledCard === -1) {
        console.error(
          `Mind Shackle action denied: could not find target card in gameArmyCards`
        )
        return
      }
      G.gameArmyCards[indexOfMindShackledCard].playerID = sourcePlayerID
    }
    // add to game log
    const unitMindShackledName = targetGameCard.name
    const gameLogForMindShackle = encodeGameLogMessage({
      type: gameLogTypes.mindShackle,
      id: `r${G.currentRound}:om${G.currentOrderMarker}:${sourceUnitID}:mindshackle:${targetUnitID}`,
      playerID: sourcePlayerID,
      unitName: sourceGameCard.name,
      defenderPlayerID: targetGameCard.playerID,
      defenderUnitName: unitMindShackledName,
      isRollSuccessful: isSuccessful,
      roll,
      rollThreshold,
    })
    G.gameLog.push(gameLogForMindShackle)

    // mark negoksa as having attempted
    G.mindShacklesAttempted.push(sourceUnitID)
    events.setStage(stageNames.attacking)
  },
}
