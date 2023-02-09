import { GameArmyCard, GameState, GameUnits } from '../types'
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
const frequentlyChangedDevState = isDevOverrideState
  ? {
      placementReady: {
        '0': true,
        '1': true,
      },
      orderMarkersReady: { '0': true, '1': true },
      roundOfPlayStartReady: { '0': true, '1': true },
      players: playersStateWithPrePlacedOMs(),
      orderMarkers: generatePreplacedOrderMarkers(),
    }
  : {
      placementReady: {
        '0': false,
        '1': false,
      },
      orderMarkersReady: { '0': false, '1': false },
      roundOfPlayStartReady: { '0': false, '1': false },
      orderMarkers: generateBlankOrderMarkers(),
      players: generateBlankPlayersState(),
    }
//!! TEST SCENARIO
export const testScenario = makeTestScenario()
function makeTestScenario(): GameState {
  // ArmyCards to GameArmyCards
  // These are the cards that deploy normally, during the placement phase (Todo: handle any other summoned or non-deployed units i.e. The Airborne Elite, Rechets of Bogdan...)
  const armyCards: GameArmyCard[] = armyCardsToGameArmyCardsForTest()
  // GameUnits
  const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  // Map
  const map = makeHexagonShapedMap({
    mapSize: 3,
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
    ...frequentlyChangedDevState,
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
    initialArmyCards: [...armyCards],
    gameUnits,
    killedUnits: {},
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
    waterClonesPlaced: [],
  }
}
