import type { Move } from 'boardgame.io'
import { encodeGameLogMessage, gameLogTypes } from 'game/gamelog'
import { selectUnitsForCard } from 'game/selectors'
import { GameState } from '../types'
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
  // TODO: move point card selector
  const movePoints = gameCard.move

  let indexOfThisCharge = 0
  // if success, assign move points
  if (isSuccessful) {
  } else {
    // else remove all their move points ("after moving and before attacking" in ability description)
  }
  // report to UI
  G.berserkerChargeRoll = {
    roll,
    isSuccessful,
  }
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
    roll,
    isRollSuccessful: isSuccessful,
    rollThreshold: berserkChargeThreshold,
    unitName: gameCard.name,
  })
  G.gameLog.push(gameLogForThisMove)
}
