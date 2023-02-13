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

const isDevOverrideState =
  process.env.NODE_ENV === 'production'
    ? false
    : // toggle this one to test the game with pre-placed units
      true

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
const frequentlyChangedDevState = (numPlayers: number) =>
  isDevOverrideState
    ? {
        placementReady: generateReadyStateForNumPlayers(numPlayers, true),
        orderMarkersReady: generateReadyStateForNumPlayers(numPlayers, true),
        roundOfPlayStartReady: generateReadyStateForNumPlayers(
          numPlayers,
          true
        ),
        players: playersStateWithPrePlacedOMs(),
        orderMarkers: generatePreplacedOrderMarkers(),
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
      }
//!! TEST SCENARIO
export const gameSetupInitialGameState = (numPlayers: number) =>
  makeTestScenario(numPlayers)
function makeTestScenario(numPlayers: number): GameState {
  // ArmyCards to GameArmyCards
  // These are the cards that deploy normally, during the placement phase (Todo: handle any other summoned or non-deployed units i.e. The Airborne Elite, Rechets of Bogdan...)
  const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest(numPlayers)
  // GameUnits
  const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  // Map
  const map = makeHexagonShapedMap({
    mapSize: 5,
    withPrePlacedUnits: isDevOverrideState,
    gameUnits: transformGameArmyCardsToGameUnits(armyCards),
    flat: false,
  })
  // const map = makeGiantsTableMap({
  //   withPrePlacedUnits: true,
  //   gameUnits,
  // })
  // const map = makeDevHexagonMap({
  //   withPrePlacedUnits: true,
  //   gameUnits,
  // })
  return {
    ...frequentlyChangedDevState(numPlayers),
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
    gameArmyCards: armyCards,
    killedArmyCards: [],
    initialArmyCards: [...armyCards],
    gameUnits,
    killedUnits: {},
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
    waterClonesPlaced: [],
    grenadesThrown: [],
    chompsAttempted: [],
    mindShacklesAttempted: [],
    berserkerChargeRoll: undefined,
    berserkerChargeSuccessCount: 0,
    stageQueue: [],
  }
}
