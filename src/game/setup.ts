// import { hexedMeadowCards } from './cards'
import {
  ArmyCard,
  BaseGameOptions,
  DevGameOptions,
  GameArmyCard,
  GameState,
  GameUnit,
  GameUnits,
  PlayersState,
} from './types'
import {
  generateBlankPlayersState,
  generateBlankOrderMarkers,
  generatePreplacedOrderMarkers,
} from './constants'
import { makeHexagonShapedMap } from './mapGen'
import {
  coreHeroscapeCards,
  ICoreHeroscapeCard,
  MS1Cards,
} from './coreHeroscapeCards'
import { transformGameArmyCardsToGameUnits } from './transformers'

function playersStateWithPrePlacedOMs(): PlayersState {
  return {
    '0': {
      orderMarkers: {
        '0': 'p0_hs1185',
        '1': 'p0_hs1185',
        '2': 'p0_hs1185',
        X: 'p0_hs1185',
      },
    },
    '1': {
      orderMarkers: {
        '0': 'p1_hs1008',
        '1': 'p1_hs1008',
        '2': 'p1_hs1008',
        X: 'p1_hs1008',
      },
    },
  }
}
export const withPrePlacedUnits = true

const isDevOverrideState = true
// const isDevOverrideState = false

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
  // GameUnits:
  const gameUnits: GameUnits = transformGameArmyCardsToGameUnits(armyCards)
  // Map
  const hexagonMap = makeHexagonShapedMap({
    mapSize: 3,
    withPrePlacedUnits,
    gameUnits: transformGameArmyCardsToGameUnits(armyCards),
    flat: false,
  })
  return {
    ...frequentlyChangedDevState,
    currentRound: 0,
    currentOrderMarker: 0,
    initiative: [],
    unitsMoved: [],
    unitsAttacked: [],
    unitsKilled: {},
    gameLog: [],
    armyCards,
    initialArmyCards: [...armyCards],
    gameUnits,
    hexMap: hexagonMap.hexMap,
    boardHexes: hexagonMap.boardHexes,
    startZones: hexagonMap.startZones,
  }
}
function hsCardsToArmyCards(params: ICoreHeroscapeCard[]): ArmyCard[] {
  return params.map((hsCard) => {
    return {
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
  return hsCardsToArmyCards(coreHeroscapeCards)
    .filter(
      (c) =>
        // c.armyCardID === 'hs1000' ||
        // c.armyCardID === 'hs1002' ||
        // c.armyCardID === 'hs1003' ||
        c.armyCardID === 'hs1008' || c.armyCardID === 'hs1185'
      // c.armyCardID === 'hs1014'
    )
    .map((card) => {
      const isCardMarroWarriors = card.armyCardID === 'hs1000'
      const isCardNeGokSa = card.armyCardID === 'hs1014'
      const isCardMezzodemonWarmongers = card.armyCardID === 'hs1185'
      const isCardForPlayer1 =
        isCardMarroWarriors || isCardNeGokSa || isCardMezzodemonWarmongers

      const isCardIzumiSamurai = card.armyCardID === 'hs1002'
      const isCardSgtDrake = card.armyCardID === 'hs1003'
      const isCardZettianGuard = card.armyCardID === 'hs1008'
      const isCardForPlayer2 =
        isCardIzumiSamurai || isCardSgtDrake || isCardZettianGuard
      const playerID = isCardForPlayer1 ? '0' : isCardForPlayer2 ? '1' : ''

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
