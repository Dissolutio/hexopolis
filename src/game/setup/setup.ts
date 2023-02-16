import { GameArmyCard, GameState, GameUnits } from '../types'
import {
  generateBlankPlayersState,
  generateBlankOrderMarkers,
  generateReadyStateForNumPlayers,
} from '../constants'
import {
  makeDevHexagonMap,
  makeGiantsTableMap,
  makeHexagonShapedMap,
} from './map-gen'
import { transformGameArmyCardsToGameUnits } from '../transformers'
import { armyCardsToGameArmyCardsForTest } from './unit-gen'
import { scenarioNames } from './scenarios'
import {
  generatePreplacedOrderMarkers,
  playersStateWithPrePlacedOMs,
} from './om-gen'

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
  isLocalOrDemoGame,
  scenarioName,
  withPrePlacedUnits,
}: {
  numPlayers: number
  isLocalOrDemoGame: boolean
  scenarioName?: string
  withPrePlacedUnits?: boolean
}) => {
  if (scenarioName === scenarioNames.clashingFrontsAtTableOfTheGiants2) {
    return makeGiantsTable2PlayerScenario(numPlayers, withPrePlacedUnits)
  }
  if (
    numPlayers === 2 &&
    isLocalOrDemoGame &&
    process.env.NODE_ENV === 'production'
  ) {
    return makeGiantsTable2PlayerScenario(numPlayers, withPrePlacedUnits)
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
  const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  // GameUnits
  const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  // Map
  const map = makeHexagonShapedMap({
    mapSize: Math.max(numPlayers * 2, 8),
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
