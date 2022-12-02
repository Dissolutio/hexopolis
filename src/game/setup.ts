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
import { ICoreHeroscapeCard, MS1Cards } from './coreHeroscapeCards'

function playersStateWithPrePlacedOMs(): PlayersState {
  return {
    '0': {
      orderMarkers: {
        '0': 'p0_hs1000',
        '1': 'p0_hs1000',
        '2': 'p0_hs1000',
        X: 'p0_hs1000',
      },
    },
    '1': {
      orderMarkers: {
        '0': 'p1_hs1002',
        '1': 'p1_hs1002',
        '2': 'p1_hs1002',
        X: 'p1_hs1002',
      },
    },
  }
}
export const withPrePlacedUnits = true

//!! TEST SCENARIO
export const testScenario = makeTestScenario()
function makeTestScenario(): GameState {
  // ArmyCards to GameArmyCards
  // These are the cards that deploy normally, during the placement phase (Todo: handle any other summoned or non-deployed units i.e. The Airborne Elite, Rechets of Bogdan...)
  const armyCards: GameArmyCard[] = makeArmyCardsForTestScenario()
  // GameUnits:
  const gameUnits = gameArmyCardsToGameUnits(armyCards)
  // Map
  const hexagonMap = makeHexagonShapedMap({
    mapSize: 3,
    withPrePlacedUnits,
    gameUnits: gameArmyCardsToGameUnits(armyCards),
    flat: false,
  })
  return {
    placementReady: {
      '0': false,
      '1': false,
    },
    orderMarkersReady: { '0': false, '1': false },
    roundOfPlayStartReady: { '0': false, '1': false },
    currentRound: 0,
    currentOrderMarker: 0,
    orderMarkers: generateBlankOrderMarkers(),
    // orderMarkers: generatePreplacedOrderMarkers(),
    initiative: [],
    unitsMoved: [],
    unitsAttacked: [],
    players: generateBlankPlayersState(),
    // players: playersStateWithPrePlacedOMs(),
    armyCards,
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
function makeArmyCardsForTestScenario() {
  return hsCardsToArmyCards(MS1Cards)
    .filter(
      // filter down to the actual cards we want to use
      (c) =>
        // c.armyCardID === 'hs1008'
        c.armyCardID === 'hs1000' ||
        // c.armyCardID === 'hs1008' ||
        c.armyCardID === 'hs1002' ||
        c.armyCardID === 'hs1003' ||
        c.armyCardID === 'hs1014'
    )
    .map((card, index) => {
      // const isCardMarroWarriors = card.armyCardID === 'hs1000'
      // we give player 1 the marro + negoksa, and player 2 the samurai + sgt drake
      const isCardMarroWarriors = card.armyCardID === 'hs1000'
      const isCardNeGokSa = card.armyCardID === 'hs1014'

      // normal setup:
      const isCardForPlayer1 = isCardMarroWarriors || isCardNeGokSa

      // setup 1 card move-range test:
      // const isCardForPlayer1 = index === 0

      const isCardIzumiSamurai = card.armyCardID === 'hs1002'
      const isCardSgtDrake = card.armyCardID === 'hs1003'
      const isCardForPlayer2 = isCardIzumiSamurai || isCardSgtDrake
      const playerID = isCardForPlayer1 ? '0' : isCardForPlayer2 ? '1' : ''
      // const playerID = isCardForPlayer1 ? '0' : '1'
      // id factory ...
      function makeGameCardID() {
        return `p${playerID}_${card.armyCardID}`
      }
      return {
        ...card,
        playerID,
        cardQuantity: 1,
        gameCardID: makeGameCardID(),
      }
    })
}

//! TEST SCENARIO GAMEUNITS
function gameArmyCardsToGameUnits(armyCards: GameArmyCard[]): GameUnits {
  // id factory
  let unitID = 0
  function makeUnitID(playerID: string) {
    return `p${playerID}u${unitID++}`
  }
  return armyCards.reduce((result, card) => {
    // CARD => FIGURES (this is where commons and uncommons get crazy?)
    const numFigures = card.figures * card.cardQuantity
    const figuresArr = Array.apply({}, Array(numFigures))
    // FIGURES => UNITS
    const unitsFromCard = (figuresArr as GameUnit[]).reduce((unitsResult) => {
      const unitID = makeUnitID(card.playerID)
      const newGameUnit = {
        unitID,
        armyCardID: card.armyCardID,
        playerID: card.playerID,
        gameCardID: card.gameCardID,
        movePoints: 0,
        moveRange: { safe: [], engage: [], disengage: [], denied: [] },
      }
      return {
        ...unitsResult,
        [unitID]: newGameUnit,
      }
    }, {})
    return {
      ...result,
      ...unitsFromCard,
    }
  }, {})
}
