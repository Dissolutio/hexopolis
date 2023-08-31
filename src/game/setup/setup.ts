import { GameArmyCard, GameState, GameUnits, StartingArmies } from '../types'
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
  makeMoveRangeTest2HexWalkMap,
  makeMoveRangePassThruMap,
  makeMoveRange1HexFlyingEngagedMap,
  makeMoveRange2HexFlyingEngagedMap,
  makeMoveRange1HexFlyMap,
  makeMoveRange2HexFlyMap,
} from './map-gen'
import { transformGameArmyCardsToGameUnits } from '../transformers'
import {
  startingArmiesFor1HexFlyingEngagedMap,
  startingArmiesFor2HexFlyingEngagedMap,
  startingArmiesForDefaultScenario,
  startingArmiesForForsakenWaters2Player,
  startingArmiesForGiantsTable2Player,
  startingArmiesForMoveRange1HexFlyMap,
  startingArmiesForMoveRange1HexWalkMap,
  startingArmiesForMoveRange2HexFlyMap,
  startingArmiesForMoveRange2HexWalkMap,
  startingArmiesForMoveRangePassThruMap,
  startingArmiesToGameCards,
} from './unit-gen'
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
// These are the initial states frequently changed while devving (i.e. to start the game in placement, or play, or draft phase, or with order-markers already placed)
const generatePlayerAndReadyAndOMStates = ({
  numPlayers,
  isDevOverrideState,
  startingArmies,
}: {
  numPlayers: number
  startingArmies: StartingArmies
  isDevOverrideState?: boolean
}) =>
  isDevOverrideState
    ? {
        // Use the state below to start a game in the play-phase already
        draftReady: generateReadyStateForNumPlayers(numPlayers, true),
        placementReady: generateReadyStateForNumPlayers(numPlayers, true),
        orderMarkersReady: generateReadyStateForNumPlayers(numPlayers, true),
        orderMarkers: generatePreplacedOrderMarkers(numPlayers, startingArmies),
        players: playersStateWithPrePlacedOMs(numPlayers, startingArmies),
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

const gameCardsToPreplaceableUnits = (
  cards: GameArmyCard[],
  units: GameUnits
) => {
  return keyBy(
    Object.values(units).filter((u) => {
      const card = selectGameCardByID(cards, u.gameCardID)
      return !selectIfGameArmyCardHasAbility('The Drop', card)
    }),
    'unitID'
  )
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
  // return makeMoveRangeTestScenario(numPlayers, true)
  if (scenarioName === scenarioNames.clashingFrontsAtTableOfTheGiants2) {
    return makeGiantsTable2PlayerScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.forsakenWaters2) {
    return makeForsakenWaters2PlayerScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.makeMoveRange1HexWalkScenario) {
    return makeMoveRange1HexWalkScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.makeMoveRange1HexFlyEngagedScenario) {
    const withStealth = false
    return makeMoveRange1HexFlyEngagedScenario(
      withStealth,
      numPlayers,
      withPrePlacedUnits
    )
  }
  if (scenarioName === scenarioNames.makeMoveRange2HexFlyEngagedScenario) {
    const withStealth = true
    return makeMoveRange2HexFlyEngagedScenario(
      withStealth,
      numPlayers,
      withPrePlacedUnits
    )
  }
  if (scenarioName === scenarioNames.makeMoveRange2HexWalkScenario) {
    return makeMoveRange2HexWalkScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.makeMoveRangePassThruScenario) {
    const withGhostWalk = true
    return makeMoveRangePassThruScenario(
      withGhostWalk,
      numPlayers,
      withPrePlacedUnits
    )
  }
  if (
    scenarioName === scenarioNames.makeMoveRange1HexFlyEngagedStealthScenario
  ) {
    const withStealth = true
    return makeMoveRange1HexFlyEngagedScenario(
      withStealth,
      numPlayers,
      withPrePlacedUnits
    )
  }
  if (scenarioName === scenarioNames.makeMoveRange1HexFlyScenario) {
    return makeMoveRange1HexFlyScenario(numPlayers, withPrePlacedUnits)
  }
  if (scenarioName === scenarioNames.makeMoveRange2HexFlyScenario) {
    return makeMoveRange2HexFlyScenario(numPlayers, withPrePlacedUnits)
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
    ? startingArmiesToGameCards(numPlayers, startingArmiesForGiantsTable2Player)
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
    ...generatePlayerAndReadyAndOMStates({
      numPlayers,
      isDevOverrideState: withPrePlacedUnits,
      startingArmies: startingArmiesForGiantsTable2Player,
    }),
    maxArmyValue: 400,
    maxRounds: 12,
    gameArmyCards: armyCards,
    gameUnits: gameUnits,
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
    ? startingArmiesToGameCards(
        numPlayers,
        startingArmiesForForsakenWaters2Player
      )
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
    ...generatePlayerAndReadyAndOMStates({
      numPlayers,
      isDevOverrideState: withPrePlacedUnits,
      startingArmies: startingArmiesForForsakenWaters2Player,
    }),
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
    ? startingArmiesToGameCards(numPlayers, startingArmiesForDefaultScenario)
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
    ...generatePlayerAndReadyAndOMStates({
      numPlayers,
      isDevOverrideState: withPrePlacedUnits,
      startingArmies: startingArmiesForDefaultScenario,
    }),
    gameArmyCards: armyCards,
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
export function makeMoveRange1HexWalkScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  // ArmyCards to GameArmyCards
  // const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? startingArmiesToGameCards(
        numPlayers,
        startingArmiesForMoveRange1HexWalkMap
      )
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
    ...generatePlayerAndReadyAndOMStates({
      numPlayers,
      isDevOverrideState: withPrePlacedUnits,
      startingArmies: startingArmiesForMoveRange1HexWalkMap,
    }),
    gameArmyCards: armyCards,
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
export function makeMoveRange1HexFlyScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  // ArmyCards to GameArmyCards
  // const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? startingArmiesToGameCards(
        numPlayers,
        startingArmiesForMoveRange1HexFlyMap
      )
    : []
  // GameUnits
  // const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  const gameUnits: GameUnits = withPrePlacedUnits
    ? transformGameArmyCardsToGameUnits(armyCards)
    : {}
  const gameUnitsWithoutTheDrop = withPrePlacedUnits
    ? gameCardsToPreplaceableUnits(armyCards, gameUnits)
    : {}
  // Map
  const map = makeMoveRange1HexFlyMap({
    withPrePlacedUnits: Boolean(withPrePlacedUnits),
    gameUnits: gameUnitsWithoutTheDrop,
  })
  return {
    ...generatePlayerAndReadyAndOMStates({
      numPlayers,
      isDevOverrideState: withPrePlacedUnits,
      startingArmies: startingArmiesForMoveRange1HexFlyMap,
    }),
    gameArmyCards: armyCards,
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
export function makeMoveRange2HexFlyScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  // ArmyCards to GameArmyCards
  // const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? startingArmiesToGameCards(
        numPlayers,
        startingArmiesForMoveRange2HexFlyMap
      )
    : []
  // GameUnits
  // const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  const gameUnits: GameUnits = withPrePlacedUnits
    ? transformGameArmyCardsToGameUnits(armyCards)
    : {}
  const gameUnitsWithoutTheDrop = withPrePlacedUnits
    ? gameCardsToPreplaceableUnits(armyCards, gameUnits)
    : {}
  // Map
  const map = makeMoveRange2HexFlyMap({
    withPrePlacedUnits: Boolean(withPrePlacedUnits),
    gameUnits: gameUnitsWithoutTheDrop,
  })
  return {
    ...generatePlayerAndReadyAndOMStates({
      numPlayers,
      isDevOverrideState: withPrePlacedUnits,
      startingArmies: startingArmiesForMoveRange2HexFlyMap,
    }),
    gameArmyCards: armyCards,
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
export function makeMoveRangePassThruScenario(
  withGhostWalk: boolean,
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  // ArmyCards to GameArmyCards
  // const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? startingArmiesToGameCards(
        numPlayers,
        startingArmiesForMoveRangePassThruMap(withGhostWalk)
      )
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
  const map = makeMoveRangePassThruMap({
    withPrePlacedUnits: Boolean(withPrePlacedUnits),
    gameUnits: gameUnitsWithoutTheDrop,
  })
  return {
    ...generatePlayerAndReadyAndOMStates({
      numPlayers,
      isDevOverrideState: withPrePlacedUnits,
      startingArmies: startingArmiesForMoveRangePassThruMap(withGhostWalk),
    }),
    gameArmyCards: armyCards,
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
export function makeMoveRange1HexFlyEngagedScenario(
  withStealth: boolean,
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? startingArmiesToGameCards(
        numPlayers,
        startingArmiesFor1HexFlyingEngagedMap(withStealth)
      )
    : []
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
  const map = makeMoveRange1HexFlyingEngagedMap({
    withPrePlacedUnits: Boolean(withPrePlacedUnits),
    gameUnits: gameUnitsWithoutTheDrop,
  })
  return {
    ...generatePlayerAndReadyAndOMStates({
      numPlayers,
      isDevOverrideState: withPrePlacedUnits,
      startingArmies: startingArmiesFor1HexFlyingEngagedMap(withStealth),
    }),
    gameArmyCards: armyCards,
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
export function makeMoveRange2HexFlyEngagedScenario(
  withStealth: boolean,
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? startingArmiesToGameCards(
        numPlayers,
        startingArmiesFor2HexFlyingEngagedMap(withStealth)
      )
    : []
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
  const map = makeMoveRange2HexFlyingEngagedMap({
    withPrePlacedUnits: Boolean(withPrePlacedUnits),
    gameUnits: gameUnitsWithoutTheDrop,
  })
  return {
    ...generatePlayerAndReadyAndOMStates({
      numPlayers,
      isDevOverrideState: withPrePlacedUnits,
      startingArmies: startingArmiesFor2HexFlyingEngagedMap(withStealth),
    }),
    gameArmyCards: armyCards,
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}

export function makeMoveRange2HexWalkScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? startingArmiesToGameCards(
        numPlayers,
        startingArmiesForMoveRange2HexWalkMap
      )
    : []
  const gameUnits: GameUnits = withPrePlacedUnits
    ? transformGameArmyCardsToGameUnits(armyCards)
    : {}
  const gameUnitsWithoutTheDrop = withPrePlacedUnits
    ? gameCardsToPreplaceableUnits(armyCards, gameUnits)
    : {}
  const map = makeMoveRangeTest2HexWalkMap({
    withPrePlacedUnits: Boolean(withPrePlacedUnits),
    gameUnits: gameUnitsWithoutTheDrop,
  })
  return {
    ...generatePlayerAndReadyAndOMStates({
      numPlayers,
      isDevOverrideState: withPrePlacedUnits,
      startingArmies: startingArmiesForMoveRange2HexWalkMap,
    }),
    gameArmyCards: armyCards,
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
