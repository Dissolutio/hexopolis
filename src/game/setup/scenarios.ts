import { transformGameArmyCardsToGameUnits } from '../transformers'
import { makeGiantsTableMap } from './mapGen'
import { armyCardsToGameArmyCardsForTest } from './unitGen'

export const scenarioNames = {
  clashingFrontsAtTableOfTheGiants: 'clashingFrontsAtTableOfTheGiants',
}

export const clashingFrontsAtTableOfTheGiants = ({
  numPlayers,
  withPrePlacedUnits,
}: {
  numPlayers: number
  withPrePlacedUnits?: boolean
}) => {
  const armyCards = armyCardsToGameArmyCardsForTest(numPlayers)
  const gameUnits = transformGameArmyCardsToGameUnits(armyCards)
  //   Destroy opponents' figures
  // 2 Players or 4 Players in 2 teams
  // Armies: 2 player-400 pts. 4 player-300pts
  // 12 rounds

  return {
    description: `The Table of the Giants has long been a meeting place-but this one was unexpected. Two enemy Valkerie Gernerals' armies have been marching in this direction all winter, unknowingly on a major collision course. In the end, which side will be left to march on to their destination?`,
    armyCards: armyCardsToGameArmyCardsForTest(numPlayers),
    gameUnits: transformGameArmyCardsToGameUnits(armyCards),
    map: makeGiantsTableMap({
      withPrePlacedUnits: Boolean(withPrePlacedUnits),
      gameUnits,
    }),
  }
}
