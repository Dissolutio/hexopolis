import type { Move } from 'boardgame.io'
import { encodeGameLogMessage, gameLogTypes } from '../gamelog'
import { selectUnitsForCard } from '../selectors'
import { GameState } from '../types'
import { assignCardMovePointsToUnit_G } from './G-mutators'

export type RollForBerserkerChargeParams = {
  gameCardID: string
}
export const rollForBerserkerCharge: Move<GameState> = (
  { G, random },
  { gameCardID }: RollForBerserkerChargeParams
) => {
  const roll = random.Die(20)
  const berserkChargeThreshold = 15
  const isSuccessful = roll >= berserkChargeThreshold
  const gameCard = G.gameArmyCards.find((gc) => gc.gameCardID === gameCardID)
  if (!gameCard) {
    console.error(
      `Berserker charge failed: no game card found for ${gameCardID}`
    )
    return
  }
  const currentTurnUnits = selectUnitsForCard(gameCardID, G.gameUnits)
  if (!(currentTurnUnits.length > 0)) {
    console.error(`Berserker charge failed: no units found for ${gameCardID}`)
    return
  }

  let indexOfThisCharge = 0
  // if success, assign move points
  if (isSuccessful) {
    currentTurnUnits.forEach((unit) => {
      const { unitID } = unit
      // G mutator
      assignCardMovePointsToUnit_G({
        boardHexes: G.boardHexes,
        gameArmyCards: G.gameArmyCards,
        gameUnits: G.gameUnits,
        glyphs: G.hexMap.glyphs,
        unitID,
      })
    })
  } else {
    // else remove all their move points ("after moving and before attacking" in ability description)
    currentTurnUnits.forEach((unit) => {
      const { unitID } = unit
      // G mutator
      assignCardMovePointsToUnit_G({
        boardHexes: G.boardHexes,
        gameArmyCards: G.gameArmyCards,
        gameUnits: G.gameUnits,
        unitID,
        glyphs: G.hexMap.glyphs,
        overrideMovePoints: 0,
      })
    })
  }
  // report to UI
  G.berserkerChargeRoll = {
    roll,
    isSuccessful,
  }
  // reset unitsMoved
  G.unitsMoved = []
  // get index before incrementing the success count
  indexOfThisCharge = G.berserkerChargeSuccessCount
  const newSuccessCount = isSuccessful
    ? G.berserkerChargeSuccessCount + 1
    : G.berserkerChargeSuccessCount
  G.berserkerChargeSuccessCount = newSuccessCount
  // add to game log
  const id = `r${G.currentRound}:om${G.currentOrderMarker}:${gameCardID}:berserkCharge:${indexOfThisCharge}`
  const gameLogForThisMove = encodeGameLogMessage({
    type: gameLogTypes.berserkerCharge,
    id,
    playerID: gameCard.playerID,
    roll,
    isRollSuccessful: isSuccessful,
    rollThreshold: berserkChargeThreshold,
    unitName: gameCard.name,
  })
  G.gameLog.push(gameLogForThisMove)
}
