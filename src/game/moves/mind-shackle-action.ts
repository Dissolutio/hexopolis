import type { Move } from 'boardgame.io'
import { getActivePlayersIdleStage, stageNames } from 'game/constants'
import { encodeGameLogMessage, gameLogTypes } from 'game/gamelog'
import { selectIfGameArmyCardHasAbility } from 'game/selector/card-selectors'
import { selectTailHexForUnit, selectUnitForHex } from 'game/selectors'
import { GameState } from '../types'

export const mindShackleAction: Move<GameState> = (
  { G, random, events },
  { sourceUnitID, targetHexID }: { sourceUnitID: string; targetHexID: string }
) => {
  const targetUnit = selectUnitForHex(targetHexID, G.boardHexes, G.gameUnits)
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
  // UI tells us to only target unique cards, 20 takes it over
  const roll = random.Die(20)
  const rollThreshold = 20
  const isSuccessful = roll >= rollThreshold
  const mindShackledUnitID = targetUnit.unitID
  // if it works: takeover the unit

  // add to game log
  const unitMindShackledName = targetGameCard.name
  const unitMindShackledSingleName = targetGameCard.singleName
  //   const gameLogForChomp = encodeGameLogMessage({
  //     type: gameLogTypes.chomp,
  //     id: `r${G.currentRound}:om${G.currentOrderMarker}:${sourceUnitID}:chomp:${chompedUnitID}`,
  //     isChompSuccessful,
  //     sourceUnitID,
  //     unitChompedName: unitMindShackledName,
  //     unitChompedSingleName: unitMindShackledSingleName,
  //     chompRoll,
  //   })
  //   G.gameLog.push(gameLogForChomp)

  // mark negoksa as having attempted
  G.mindShacklesAttempted.push(sourceUnitID)
}
