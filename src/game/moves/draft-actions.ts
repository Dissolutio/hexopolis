import { Move } from 'boardgame.io'
import { selectIfGameArmyCardHasAbility } from '../selector/card-selectors'
import {
  transformDraftableCardToGameCard,
  transformBoardHexesWithPrePlacedUnits,
} from '../transformers'
import { ArmyCard, GameState } from '../types'
import { transformGameArmyCardsToGameUnits } from '../setup/unit-gen'

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
  const numUnitsPlayerAlreadyHas = Object.values(G.gameUnits).filter(
    (u) => u.playerID === playerID
  ).length
  const addedUnits = transformGameArmyCardsToGameUnits(
    [newCardsForPlayer],
    numUnitsPlayerAlreadyHas
  )
  const hasTheDrop = selectIfGameArmyCardHasAbility('The Drop', armyCard)
  // units with The Drop are not auto-placed on the board, the rest are
  if (!hasTheDrop) {
    // G.boardHexes updated here: this fn mutates boardHexes
    transformBoardHexesWithPrePlacedUnits(
      { ...G.boardHexes },
      { ...G.startZones },
      addedUnits
    )
  }
  // apply the card and units after units are placed
  G.cardsDraftedThisTurn.push(armyCard.armyCardID)
  const newGameUnits = { ...G.gameUnits, ...addedUnits }
  G.gameUnits = newGameUnits
  G.gameArmyCards = newGameArmyCards
}
