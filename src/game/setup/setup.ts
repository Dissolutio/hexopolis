import { GameArmyCard, GameState, GameUnits, PlayerStateToggle } from '../types'
import {
  generateBlankPlayersState,
  generateBlankOrderMarkers,
} from '../constants'
import {
  makeDevHexagonMap,
  makeGiantsTableMap,
  makeHexagonShapedMap,
} from './mapGen'
import { transformGameArmyCardsToGameUnits } from '../transformers'
import {
  armyCardsToGameArmyCardsForTest,
  generatePreplacedOrderMarkers,
  playersStateWithPrePlacedOMs,
} from './unitGen'
import { scenarnioNames } from './scenarios'

function generateReadyStateForNumPlayers(
  numPlayers: number,
  defaultValue: boolean
): PlayerStateToggle {
  let rdyState: { [key: string]: boolean } = {}
  for (let index = 0; index < numPlayers; index++) {
    rdyState[index] = defaultValue
  }
  const result = rdyState
  return result
}
const someInitialGameState = {
  currentRound: 1,
  currentOrderMarker: 0,
  initiative: [],
  unitsMoved: [],
  disengagesAttempting: undefined,
  disengagedUnitIds: [],
  unitsAttacked: {},
  isCurrentPlayerAttacking: false,
  unitsKilled: {},
  gameLog: [],
  killedArmyCards: [],
  // gameUnits,
  killedUnits: {},
  // hexMap: map.hexMap,
  // boardHexes: map.boardHexes,
  // startZones: map.startZones,
  waterClonesPlaced: [],
  grenadesThrown: [],
  chompsAttempted: [],
  mindShacklesAttempted: [],
  berserkerChargeRoll: undefined,
  berserkerChargeSuccessCount: 0,
  stageQueue: [],
}
const frequentlyChangedDevState = (
  numPlayers: number,
  isDevOverrideState?: boolean
) =>
  isDevOverrideState
    ? {
        placementReady: generateReadyStateForNumPlayers(numPlayers, true),
        orderMarkersReady: generateReadyStateForNumPlayers(numPlayers, true),
        roundOfPlayStartReady: generateReadyStateForNumPlayers(
          numPlayers,
          true
        ),
        players: playersStateWithPrePlacedOMs(numPlayers),
        orderMarkers: generatePreplacedOrderMarkers(numPlayers),
        ...someInitialGameState,
      }
    : {
        placementReady: generateReadyStateForNumPlayers(numPlayers, false),
        orderMarkersReady: generateReadyStateForNumPlayers(numPlayers, false),
        roundOfPlayStartReady: generateReadyStateForNumPlayers(
          numPlayers,
          false
        ),
        orderMarkers: generateBlankOrderMarkers(),
        players: generateBlankPlayersState(),
        ...someInitialGameState,
      }
//!! TEST SCENARIO
export const gameSetupInitialGameState = ({
  numPlayers,
  scenarioName,
  withPrePlacedUnits,
}: {
  numPlayers: number
  scenarioName?: string
  withPrePlacedUnits?: boolean
}) => {
  if (scenarioName === scenarnioNames.clashingFrontsAtTableOfTheGiants) {
    return makeGiantsTable2PlayerScenario(numPlayers, withPrePlacedUnits)
  }
  if (numPlayers === 2) {
    return makeTestScenario(numPlayers, withPrePlacedUnits)
  }
  if (numPlayers === 3) {
    return makeTestScenario(numPlayers, withPrePlacedUnits)
  }
  if (numPlayers === 4) {
    return makeTestScenario(numPlayers, withPrePlacedUnits)
  }
  if (numPlayers === 5) {
    return makeTestScenario(numPlayers, withPrePlacedUnits)
  }
  if (numPlayers === 6) {
    return makeTestScenario(numPlayers, withPrePlacedUnits)
  }
  return makeTestScenario(numPlayers, withPrePlacedUnits)
}
function makeGiantsTable2PlayerScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  const map = makeGiantsTableMap({
    withPrePlacedUnits: true,
    gameUnits,
  })
  return {
    ...frequentlyChangedDevState(numPlayers, withPrePlacedUnits),
    gameArmyCards: armyCards,
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
function makeTestScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  // ArmyCards to GameArmyCards
  // These are the cards that deploy normally, during the placement phase (Todo: handle any other summoned or non-deployed units i.e. The Airborne Elite, Rechets of Bogdan...)
  const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  // GameUnits
  const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  // Map
  const map = makeHexagonShapedMap({
    mapSize: 7,
    withPrePlacedUnits,
    gameUnits: transformGameArmyCardsToGameUnits(armyCards),
    flat: false,
  })
  // const map = makeGiantsTableMap({
  //   withPrePlacedUnits: true,
  //   gameUnits,
  // })
  // const map = makeDevHexagonMap({
  //   withPrePlacedUnits: Boolean(withPrePlacedUnits),
  //   gameUnits,
  // })
  return {
    ...frequentlyChangedDevState(numPlayers, withPrePlacedUnits),
    gameArmyCards: armyCards,
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
