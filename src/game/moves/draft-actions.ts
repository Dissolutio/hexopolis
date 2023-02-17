import { Move } from 'boardgame.io'
import {
  transformDraftableCardToGameCard,
  transformGameArmyCardsToGameUnits,
  transformBoardHexesWithPrePlacedUnits,
} from '../transformers'
import { ArmyCard, GameState } from '../types'

export const draftPrePlaceArmyCardAction: Move<GameState> = (
  { G, ctx },
  {
    armyCard,
    playerID,
  }: {
    armyCard: ArmyCard
    playerID: string
  }
) => {
  const newGameArmyCards = [...G.gameArmyCards]

  //give the player the card
  const newCardsForPlayer = transformDraftableCardToGameCard(
    [armyCard],
    playerID
  )[0]
  newGameArmyCards.push(newCardsForPlayer)
  // give the player the units from the card
  const addedUnits = transformGameArmyCardsToGameUnits([newCardsForPlayer])
  // and go ahead and auto-place the units on the board
  const newBoardHexes = transformBoardHexesWithPrePlacedUnits(
    //
    { ...G.boardHexes },
    { ...G.startZones },
    addedUnits
  )
  G.cardsDraftedThisTurn.push(armyCard.armyCardID)
  const newGameUnits = { ...G.gameUnits, ...addedUnits }
  G.boardHexes = newBoardHexes
  G.gameUnits = newGameUnits
  G.gameArmyCards = newGameArmyCards
}
