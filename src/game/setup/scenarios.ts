import { GameArmyCard, GameState, GameUnits, StartingArmies } from '../types'
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
  makeCirdanGardenMap,
} from './map-gen'
import {
  startingArmiesFor1HexFlyingEngagedMap,
  startingArmiesFor2HexFlyingEngagedMap,
  startingArmiesFor3Player,
  startingArmiesForDefaultScenario,
  startingArmiesForForsakenWaters2Player,
  startingArmiesForGiantsTable2Player,
  startingArmiesForMoveRange1HexFlyMap,
  startingArmiesForMoveRange1HexWalkMap,
  startingArmiesForMoveRange2HexFlyMap,
  startingArmiesForMoveRange2HexWalkMap,
  startingArmiesForMoveRangePassThruMap,
  startingArmiesToGameCards,
  transformGameArmyCardsToGameUnits,
} from './unit-gen'
import { selectIfGameArmyCardHasAbility } from '../selector/card-selectors'
import { keyBy } from 'lodash'
import { selectGameCardByID } from '../selectors'
import {
  generateBlankOrderMarkersForNumPlayers,
  generateBlankPlayersStateForNumPlayers,
  generateReadyStateForNumPlayers,
} from '../constants'
import {
  generatePreplacedOrderMarkers,
  playersStateWithPrePlacedOMs,
} from './order-marker-gen'

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
        // Ready states can be edited to change what phase the game starts in (there's some state change too, like starting armies, unit placement, order markers)
        draftReady: generateReadyStateForNumPlayers(numPlayers, true),
        placementReady: generateReadyStateForNumPlayers(numPlayers, true),
        orderMarkersReady: generateReadyStateForNumPlayers(numPlayers, true),
        orderMarkers: generatePreplacedOrderMarkers(numPlayers, startingArmies),
        players: playersStateWithPrePlacedOMs(numPlayers, startingArmies),
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
  // currently returns any unit that doesn't have The Drop
  return keyBy(
    Object.values(units).filter((u) => {
      const card = selectGameCardByID(cards, u.gameCardID)
      return !selectIfGameArmyCardHasAbility('The Drop', card)
    }),
    'unitID'
  )
}
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
export function makeGiantsTable2PlayerScenario(
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
    maxArmyValue: 300,
    maxRounds: 12,
    gameArmyCards: armyCards,
    gameUnits: gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
export function makeForsakenWaters2PlayerScenario(
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
export function makeCirdanGarden3PlayerScenario(
  numPlayers: number,
  withPrePlacedUnits?: boolean
): GameState {
  const armyCards: GameArmyCard[] = withPrePlacedUnits
    ? startingArmiesToGameCards(numPlayers, startingArmiesFor3Player)
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
  const map = makeCirdanGardenMap(withPrePlacedUnits, gameUnitsToPrePlace)
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
export function makeDefaultScenario(
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
    maxArmyValue: 150,
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

export const scenarioNames = {
  clashingFrontsAtTableOfTheGiants2: 'clashingFrontsAtTableOfTheGiants2',
  forsakenWaters2: 'forsakenWaters2',
  cirdanGardenWithoutTrees: 'cirdanGardenWithoutTrees',
  clashingFrontsAtTableOfTheGiants4: 'clashingFrontsAtTableOfTheGiants4',
  theBigHexagon2: 'theBigHexagon2',
  theBigHexagon3: 'theBigHexagon3',
  theBigHexagon4: 'theBigHexagon4',
  theBigHexagon5: 'theBigHexagon5',
  theBigHexagon6: 'theBigHexagon6',
  makeMoveRange1HexWalkScenario: 'makeMoveRange1HexWalkScenario',
  makeMoveRange2HexWalkScenario: 'makeMoveRange2HexWalkScenario',
  makeMoveRangePassThruScenario: 'makeMoveRangePassThruScenario',
  makeMoveRange1HexFlyScenario: 'makeMoveRange1HexFlyScenario',
  makeMoveRange2HexFlyScenario: 'makeMoveRange2HexFlyScenario',
  makeMoveRange1HexFlyEngagedScenario: 'makeMoveRange1HexFlyEngagedScenario',
  makeMoveRange2HexFlyEngagedScenario: 'makeMoveRange2HexFlyEngagedScenario',
  makeMoveRange1HexFlyEngagedStealthScenario:
    'makeMoveRange1HexFlyEngagedStealthScenario',
}

export const hexoscapeScenarios = {
  [scenarioNames.cirdanGardenWithoutTrees]: {
    numPlayers: 3,
    description: `A balanced 3 way map, that will be way cooler when there is trees in the game.`,
    armyPoints: 300,
    maxRounds: 12,
  },
  [scenarioNames.clashingFrontsAtTableOfTheGiants2]: {
    numPlayers: 2,
    description: `The Table of the Giants has long been a meeting place-but this one was unexpected. Two enemy Valkerie Gernerals' armies have been marching in this direction all winter, unknowingly on a major collision course. In the end, which side will be left to march on to their destination?`,
    armyPoints: 400,
    maxRounds: 12,
  },
  [scenarioNames.clashingFrontsAtTableOfTheGiants4]: {
    numPlayers: 4,
    // naming like this, so that in future we might have two team types, like a team of 1 player versus a team of 3 players [1, 3]
    teams: [2, 2],
    description: `The Table of the Giants has long been a meeting place-but this one was unexpected. Two enemy Valkerie Gernerals' armies have been marching in this direction all winter, unknowingly on a major collision course. In the end, which side will be left to march on to their destination?`,
    armyPoints: 300,
    maxRounds: 12,
  },
  [scenarioNames.forsakenWaters2]: {
    numPlayers: 2,
    // teams: [2, 2],
    description: `For centuries, the Dark Lakes separated the Regions of Laur and Nastralund. When the search for wellsprings began, the lakes became a source of dispute between the Archkyries on each side. They each built a fort on their shore, but dozens of skirmishes quickly reduced the area to ruins.`,
    armyPoints: 300,
    maxRounds: 12,
  },
  [scenarioNames.theBigHexagon2]: {
    numPlayers: 2,
    description: `This map is pretty boring.`,
  },
  [scenarioNames.theBigHexagon3]: {
    numPlayers: 3,
    description: `This map is pretty boring.`,
  },
  [scenarioNames.theBigHexagon4]: {
    numPlayers: 4,
    description: `This map is pretty boring.`,
  },
  [scenarioNames.theBigHexagon5]: {
    numPlayers: 5,
    description: `This map is pretty boring.`,
  },
  [scenarioNames.theBigHexagon6]: {
    numPlayers: 6,
    description: `This map is pretty boring.`,
  },
}
