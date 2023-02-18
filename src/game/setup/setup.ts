import { GameArmyCard, GameState, GameUnits } from '../types'
import {
  generateBlankPlayersStateForNumPlayers,
  generateBlankOrderMarkersForNumPlayers,
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
  maxArmyValue: 300,
  maxRounds: 12,
  currentRound: 1,
  currentOrderMarker: 0,
  initiative: [],
  cardsDraftedThisTurn: [],
  unitsMoved: [],
  disengagesAttempting: undefined,
  disengagedUnitIds: [],
  unitsAttacked: {},
  unitsKilled: {},
  gameLog: [],
  killedArmyCards: [],
  killedUnits: {},
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
        draftReady: generateReadyStateForNumPlayers(numPlayers, true),
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
        draftReady: generateReadyStateForNumPlayers(numPlayers, false),
        placementReady: generateReadyStateForNumPlayers(numPlayers, false),
        orderMarkersReady: generateReadyStateForNumPlayers(numPlayers, false),
        roundOfPlayStartReady: generateReadyStateForNumPlayers(
          numPlayers,
          false
        ),
        orderMarkers: generateBlankOrderMarkersForNumPlayers(numPlayers),
        players: generateBlankPlayersStateForNumPlayers(numPlayers),
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
  // THIS IS THE LINE YOU CHANGE WHEN DEVVING::
  // return makeGiantsTable2PlayerScenario(2, false)
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
    maxArmyValue: 400,
    maxRounds: 12,
    gameArmyCards: withPrePlacedUnits ? armyCards : [],
    gameUnits: withPrePlacedUnits ? gameUnits : {},
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
  // const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  const armyCards: GameArmyCard[] = []
  // GameUnits
  // const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  const gameUnits: GameUnits = {}
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
