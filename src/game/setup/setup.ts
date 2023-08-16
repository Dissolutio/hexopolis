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
  makeForsakenWatersMap,
  makeMoveRangeTestMap,
} from './map-gen'
import { transformGameArmyCardsToGameUnits } from '../transformers'
import { armyCardsToGameArmyCardsForTest } from './unit-gen'
import { scenarioNames } from './scenarios'
import {
  generatePreplacedOrderMarkers,
  playersStateWithPrePlacedOMs,
} from './order-marker-gen'
import { selectIfGameArmyCardHasAbility } from '../selector/card-selectors'
import { keyBy } from 'lodash'
import { selectGameCardByID } from '../selectors'

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
  theDropUsed: [],
  chompsAttempted: [],
  mindShacklesAttempted: [],
  berserkerChargeRoll: undefined,
  berserkerChargeSuccessCount: 0,
  stageQueue: [],
  // secret: { glyphs: {} },
}
const frequentlyChangedDevState = (
  numPlayers: number,
  isDevOverrideState?: boolean
) =>
  isDevOverrideState
    ? {
        // Use the state below to start a game in the play-phase already
        draftReady: generateReadyStateForNumPlayers(numPlayers, true),
        placementReady: generateReadyStateForNumPlayers(numPlayers, true),
        orderMarkersReady: generateReadyStateForNumPlayers(numPlayers, true),
        players: playersStateWithPrePlacedOMs(numPlayers),
        orderMarkers: generatePreplacedOrderMarkers(numPlayers),
        // Use the state below for a From-the-draft-phase local 2-player game
        // draftReady: generateReadyStateForNumPlayers(numPlayers, false),
        // placementReady: generateReadyStateForNumPlayers(numPlayers, false),
        // orderMarkersReady: generateReadyStateForNumPlayers(numPlayers, false),
        // orderMarkers: generateBlankOrderMarkersForNumPlayers(numPlayers),
        // players: generateBlankPlayersStateForNumPlayers(numPlayers),
        ...someInitialGameState,
      }
    : {
        draftReady: generateReadyStateForNumPlayers(numPlayers, false),
        placementReady: generateReadyStateForNumPlayers(numPlayers, false),
        orderMarkersReady: generateReadyStateForNumPlayers(numPlayers, false),
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
  const isDemoGame =
    numPlayers === 2 &&
    isLocalOrDemoGame &&
    process.env.NODE_ENV === 'production'
  return makeMoveRangeTestScenario(numPlayers, true)
  if (scenarioName === scenarioNames.clashingFrontsAtTableOfTheGiants2) {
    return makeGiantsTable2PlayerScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.forsakenWaters2) {
    return makeForsakenWaters2PlayerScenario(numPlayers, withPrePlacedUnits)
  }
  if (isDemoGame) {
    return makeGiantsTable2PlayerScenario(numPlayers, withPrePlacedUnits)
  }
  // DEFAULT RETURN BELOW::
  // return makeGiantsTable2PlayerScenario(2, false)
  // return makeGiantsTable2PlayerScenario(numPlayers, withPrePlacedUnits)
  return makeDefaultScenario(numPlayers, withPrePlacedUnits)
  // return makeMoveRangeTestScenario(numPlayers, withPrePlacedUnits)
}
function makeGiantsTable2PlayerScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? armyCardsToGameArmyCardsForTest(numPlayers)
    : []
  const gameUnits: GameUnits = withPrePlacedUnits
    ? transformGameArmyCardsToGameUnits(armyCards)
    : {}
  const armyCardIDsWithTheDrop = armyCards
    .filter((card) => {
      return selectIfGameArmyCardHasAbility('The Drop', card)
    })
    .map((ac) => ac.gameCardID)
  const gameUnitsToPrePlace = keyBy(
    Object.values(gameUnits).filter(
      (u) => !armyCardIDsWithTheDrop.includes(u.gameCardID)
    ),
    'unitID'
  )
  const map = makeGiantsTableMap({
    withPrePlacedUnits,
    gameUnitsToPrePlace,
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
function makeForsakenWaters2PlayerScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? armyCardsToGameArmyCardsForTest(numPlayers)
    : []
  const gameUnits: GameUnits = withPrePlacedUnits
    ? transformGameArmyCardsToGameUnits(armyCards)
    : {}
  const armyCardIDsWithTheDrop = armyCards
    .filter((card) => {
      return selectIfGameArmyCardHasAbility('The Drop', card)
    })
    .map((ac) => ac.gameCardID)
  const gameUnitsToPrePlace = keyBy(
    Object.values(gameUnits).filter(
      (u) => !armyCardIDsWithTheDrop.includes(u.gameCardID)
    ),
    'unitID'
  )
  const map = makeForsakenWatersMap(withPrePlacedUnits, gameUnitsToPrePlace)
  return {
    ...frequentlyChangedDevState(numPlayers, withPrePlacedUnits),
    maxArmyValue: 300,
    maxRounds: 12,
    gameArmyCards: withPrePlacedUnits ? armyCards : [],
    gameUnits: withPrePlacedUnits ? gameUnits : {},
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
function makeDefaultScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  // ArmyCards to GameArmyCards
  // const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? armyCardsToGameArmyCardsForTest(numPlayers)
    : []
  // GameUnits
  // const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  const gameUnits: GameUnits = withPrePlacedUnits
    ? transformGameArmyCardsToGameUnits(armyCards)
    : {}
  const gameUnitsWithoutTheDrop = keyBy(
    Object.values(gameUnits).filter((u) => {
      const card = selectGameCardByID(armyCards, u.gameCardID)
      return !selectIfGameArmyCardHasAbility('The Drop', card)
    }),
    'unitID'
  )
  // Map
  // const map = makeGiantsTableMap({
  //   withPrePlacedUnits: true,
  //   gameUnitsToPrePlace: gameUnitsWithoutTheDrop,
  // })
  // const map = makeForsakenWatersMap(withPrePlacedUnits, gameUnitsWithoutTheDrop)
  // const map = makeDevHexagonMap({
  //   withPrePlacedUnits: Boolean(withPrePlacedUnits),
  //   gameUnits: gameUnitsWithoutTheDrop,
  // })
  const map = makeHexagonShapedMap({
    mapSize: Math.max(numPlayers * 2, 8),
    // mapSize: 1,
    withPrePlacedUnits,
    gameUnits: gameUnitsWithoutTheDrop,
    flat: false,
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
export function makeMoveRangeTestScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  // ArmyCards to GameArmyCards
  // const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? armyCardsToGameArmyCardsForTest(numPlayers)
    : []
  // GameUnits
  // const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  const gameUnits: GameUnits = withPrePlacedUnits
    ? transformGameArmyCardsToGameUnits(armyCards)
    : {}
  const gameUnitsWithoutTheDrop = keyBy(
    Object.values(gameUnits).filter((u) => {
      const card = selectGameCardByID(armyCards, u.gameCardID)
      return !selectIfGameArmyCardHasAbility('The Drop', card)
    }),
    'unitID'
  )
  // Map
  const map = makeMoveRangeTestMap({
    withPrePlacedUnits: Boolean(withPrePlacedUnits),
    gameUnits: gameUnitsWithoutTheDrop,
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
