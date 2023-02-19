import { Move } from 'boardgame.io'
import { selectIfGameArmyCardHasAbility } from '../selector/card-selectors'
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
  const hasTheDrop = selectIfGameArmyCardHasAbility('The Drop', armyCard)
  // units with The Drop are not auto-placed on the board, the rest are
  if (!hasTheDrop) {
    const newBoardHexes = transformBoardHexesWithPrePlacedUnits(
      { ...G.boardHexes },
      { ...G.startZones },
      addedUnits
    )
    G.boardHexes = newBoardHexes
  }
  // apply the card and units after units are placed
  G.cardsDraftedThisTurn.push(armyCard.armyCardID)
  const newGameUnits = { ...G.gameUnits, ...addedUnits }
  G.gameUnits = newGameUnits
  G.gameArmyCards = newGameArmyCards
}
