import type { Move } from 'boardgame.io'
import { getActivePlayersIdleStage, stageNames } from 'game/constants'
import { encodeGameLogMessage, gameLogTypes } from 'game/gamelog'
import { selectIfGameArmyCardHasAbility } from 'game/selector/card-selectors'
import {
  selectTailHexForUnit,
  selectUnitForHex,
  selectUnitsForCard,
} from 'game/selectors'
import { GameState } from '../types'

export const mindShackleAction: Move<GameState> = (
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
  // DISALLOW - missing needed ingredients
  if (!targetUnit || !targetGameCard) {
    console.error(
      `Mind Shackle action denied: missing needed ingredients to calculate action`
    )
    return
  }
  // UI tells us to only target unique cards, 20 takes it over
  // const roll = random.Die(20)
  const roll = 20
  const rollThreshold = 20
  const isSuccessful = roll >= rollThreshold
  // remove all order markers from the card, first

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
  // add to game log
  const unitMindShackledName = targetGameCard.name
  const gameLogForMindShackle = encodeGameLogMessage({
    type: gameLogTypes.mindShackle,
    id: `r${G.currentRound}:om${G.currentOrderMarker}:${sourceUnitID}:mindshackle:${targetUnitID}`,
    isRollSuccessful: isSuccessful,
    roll,
    // rollThreshold,
    defenderUnitName: unitMindShackledName,
  })
  G.gameLog.push(gameLogForMindShackle)

  // mark negoksa as having attempted
  G.mindShacklesAttempted.push(sourceUnitID)
  events.setStage(stageNames.attacking)
}
