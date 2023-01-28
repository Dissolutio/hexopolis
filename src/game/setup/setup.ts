import {
  ArmyCard,
  GameArmyCard,
  GameState,
  GameUnits,
  ICoreHeroscapeCard,
  OrderMarkers,
  PlayersState,
} from '../types'
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
import { MS1Cards } from '../coreHeroscapeCards'

const isDevOverrideState = true
// const isDevOverrideState = false
const devPlayer1orderMarkers = 'p0_hs1012'
const devPlayer2orderMarkers = 'p1_hs1002'

export function generatePreplacedOrderMarkers(): OrderMarkers {
  const orderMarkers: OrderMarkers = {
    '0': [
      { order: '0', gameCardID: devPlayer1orderMarkers },
      { order: '1', gameCardID: devPlayer1orderMarkers },
      { order: '2', gameCardID: devPlayer1orderMarkers },
      { order: 'X', gameCardID: devPlayer1orderMarkers },
    ],
    '1': [
      { order: '0', gameCardID: devPlayer2orderMarkers },
      { order: '1', gameCardID: devPlayer2orderMarkers },
      { order: '2', gameCardID: devPlayer2orderMarkers },
      { order: 'X', gameCardID: devPlayer2orderMarkers },
    ],
  }
  return orderMarkers
}
function playersStateWithPrePlacedOMs(): PlayersState {
  return {
    '0': {
      orderMarkers: {
        '0': devPlayer1orderMarkers,
        '1': devPlayer1orderMarkers,
        '2': devPlayer1orderMarkers,
        X: devPlayer1orderMarkers,
      },
    },
    '1': {
      orderMarkers: {
        '0': devPlayer2orderMarkers,
        '1': devPlayer2orderMarkers,
        '2': devPlayer2orderMarkers,
        X: devPlayer2orderMarkers,
      },
    },
  }
}

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
      // orderMarkers: generateBlankOrderMarkers(),
      // players: generateBlankPlayersState(),
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
  // const map = makeHexagonShapedMap({
  //   mapSize: 2,
  //   withPrePlacedUnits: isDevOverrideState,
  //   gameUnits: transformGameArmyCardsToGameUnits(armyCards),
  //   flat: false,
  // })
  const map = makeGiantsTableMap({
    withPrePlacedUnits: true,
    gameUnits,
  })
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
    unitsAttacked: [],
    unitsKilled: {},
    gameLog: [],
    gameArmyCards: armyCards,
    initialArmyCards: [...armyCards],
    gameUnits,
    hexMap: map.hexMap,
    boardHexes: map.boardHexes,
    startZones: map.startZones,
  }
}
function hsCardsToArmyCards(params: ICoreHeroscapeCard[]): ArmyCard[] {
  return params.map((hsCard) => {
    return {
      abilities: hsCard.abilities,
      name: hsCard.name,
      singleName: hsCard.singleName,
      armyCardID: hsCard.armyCardID,
      race: hsCard.race,
      life: parseInt(hsCard.life),
      move: parseInt(hsCard.move),
      range: parseInt(hsCard.range),
      attack: parseInt(hsCard.attack),
      defense: parseInt(hsCard.defense),
      height: parseInt(hsCard.height),
      heightClass: hsCard.heightClass,
      points: parseInt(hsCard.points),
      figures: parseInt(hsCard.figures),
      hexes: parseInt(hsCard.hexes),
      general: hsCard.general,
      type: hsCard.type,
      cardClass: hsCard.cardClass,
      personality: hsCard.personality,
    }
  })
}

//! TEST SCENARIO GAMEARMYCARDS
function armyCardsToGameArmyCardsForTest() {
  return hsCardsToArmyCards(MS1Cards)
    .filter(
      (c) =>
        // c.armyCardID === 'hs1000' ||
        c.armyCardID === 'hs1002' ||
        // c.armyCardID === 'hs1003' ||
        // c.armyCardID === 'hs1008' ||
        c.armyCardID === 'hs1012'
    )
    .map((card) => {
      const player1Ids = [
        'hs1000',
        'hs1001',
        'hs1003',
        'hs1004',
        'hs1008',
        'hs1009',
        'hs1010',
        'hs1012',
      ]
      const player2Ids = [
        'hs1002',
        'hs1005',
        'hs1006',
        'hs1007',
        'hs1011',
        'hs1013',
        'hs1014',
        'hs1015',
      ]
      const isCardForPlayer1 = player1Ids.includes(card.armyCardID)
      const playerID = isCardForPlayer1 ? '0' : '1'
      // id factory ...
      function makeGameCardID() {
        return `p${playerID}_${card.armyCardID}`
      }

      return {
        ...card,
        playerID,
        // cardQuantity: isCardMezzodemonWarmongers ? 2 : 1,
        cardQuantity: 1,
        gameCardID: makeGameCardID(),
      }
    })
}
