import { Move } from 'boardgame.io'
import {
  transformDraftableCardToGameCard,
  transformGameArmyCardsToGameUnits,
  transformBoardHexesWithPrePlacedUnits,
} from '../transformers'
import { ArmyCard, GameState } from '../types'

export const draftPrePlaceArmyCardAction: Move<GameState> = {
  client: false,
  move: (
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
    const newBoardHexes = transformBoardHexesWithPrePlacedUnits(
      //
      { ...G.boardHexes },
      { ...G.startZones },
      addedUnits
    )
    const newGameUnits = { ...G.gameUnits, ...addedUnits }
    // and go ahead and auto-place the units on the board
    G.boardHexes = newBoardHexes
    G.gameUnits = newGameUnits
    G.gameArmyCards = newGameArmyCards
  },
}
