// import { hexedMeadowCards } from './cards'
import {
  ArmyCard,
  BaseGameOptions,
  DevGameOptions,
  GameArmyCard,
  GameArmyCardsState,
  GameState,
  GameUnit,
  GameUnits,
  PlayersState,
} from './types'
import {
  generateBlankPlayersState,
  generateBlankOrderMarkers,
} from './constants'
import { makeHexagonShapedMap } from './mapGen'
import { ICoreHeroscapeCard, MS1Cards } from './coreHeroscapeCards'
import { keyBy } from 'lodash'

function playersStateWithPrePlacedOMs(): PlayersState {
  return {
    '0': {
      orderMarkers: {
        '0': 'p0_hm101',
        '1': 'p0_hm101',
        '2': 'p0_hm101',
        X: 'p0_hm101',
      },
    },
    '1': {
      orderMarkers: {
        '0': 'p1_hm201',
        '1': 'p1_hm201',
        '2': 'p1_hm201',
        X: 'p1_hm201',
      },
    },
  }
}

function generateBaseGameState(devOptions?: BaseGameOptions) {
  const defaultDevOptions = {
    withPrePlacedUnits: false,
    placementReady: { '0': false, '1': false },
    orderMarkersReady: { '0': false, '1': false },
    roundOfPlayStartReady: { '0': false, '1': false },
    currentRound: 0,
    currentOrderMarker: 0,
    orderMarkers: generateBlankOrderMarkers(),
    initiative: [],
    unitsMoved: [],
    unitsAttacked: [],
    players: generateBlankPlayersState(),
  }

  return {
    ...defaultDevOptions,
    ...devOptions,
  }
}

//!! TEST SCENARIO
export const testScenario = makeTestScenario({
  mapSize: 1,
  withPrePlacedUnits: false,
  //   placementReady: { '0': true, '1': true },
  //   orderMarkersReady: { '0': true, '1': true },
  //   roundOfPlayStartReady: { '0': true, '1': true },
  //   withPrePlacedUnits: true,
  //   players: playersStateWithPrePlacedOMs(),
})
function hsCardsToArmyCards(params: ICoreHeroscapeCard[]): ArmyCard[] {
  return params.map((hsCard) => {
    return {
      name: hsCard.name,
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

function makeTestScenario(devOptions: DevGameOptions): GameState {
  const mapSize = devOptions.mapSize
  const withPrePlacedUnits = devOptions?.withPrePlacedUnits ?? false
  // ArmyCards to GameArmyCards
  // These are the cards that deploy normally, during the placement phase (Todo: handle any other summoned or non-deployed units i.e. The Airborne Elite, Rechets of Bogdan...)
  const armyCards: GameArmyCard[] = makeArmyCards()
  //
  // GameUnits:
  const gameUnits = gameArmyCardsToGameUnits(armyCards)
  // Map
  const hexagonMap = makeHexagonShapedMap({
    mapSize,
    withPrePlacedUnits,
    gameUnits: gameArmyCardsToGameUnits(armyCards),
  })
  return {
    ...generateBaseGameState(),
    armyCards,
    gameUnits,
    hexMap: hexagonMap.hexMap,
    boardHexes: hexagonMap.boardHexes,
    startZones: hexagonMap.startZones,
  }
}
//! TEST SCENARIO GAMEARMYCARDS
function makeArmyCards() {
  return hsCardsToArmyCards(MS1Cards)
    .filter(
      // hs1000 is marro warriors, hs1002 is izumi samurai
      (c) => c.armyCardID === 'hs1000' || c.armyCardID === 'hs1002'
    )
    .map((card) => {
      // we give player 1 the marro, and player 2 the samurai
      const isCardMarroWarriors = card.armyCardID === 'hs1000'
      const isCardIzumiSamurai = card.armyCardID === 'hs1002'
      const playerID = isCardMarroWarriors ? '0' : isCardIzumiSamurai ? '1' : ''
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
function makeTestGameUnits(armyCards: GameArmyCard[]): GameUnits {
  const testGameUnitTemplate = {
    movePoints: 0,
    moveRange: {
      safe: [],
      engage: [],
      disengage: [],
      denied: [],
    },
  }
  return {
    p0u0: {
      ...testGameUnitTemplate,
      armyCardID: 'hs1000',
      gameCardID: 'p0_hs1000',
      playerID: '0',
      unitID: 'p0u0',
    },
    p0u1: {
      ...testGameUnitTemplate,
      armyCardID: 'hs1000',
      gameCardID: 'p0_hs1000',
      playerID: '0',
      unitID: 'p0u1',
    },
    p1u2: {
      ...testGameUnitTemplate,
      armyCardID: 'hs1002',
      gameCardID: 'p1_hs1002',
      playerID: '1',
      unitID: 'p1u2',
    },
    p1u3: {
      ...testGameUnitTemplate,
      armyCardID: 'hs1002',
      gameCardID: 'p1_hs1002',
      playerID: '1',
      unitID: 'p1u3',
    },
  }
}

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
