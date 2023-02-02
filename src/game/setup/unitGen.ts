import {
  ArmyCard,
  ICoreHeroscapeCard,
  OrderMarkers,
  PlayersState,
} from '../types'
import { MS1Cards } from '../coreHeroscapeCards'

const marroID = 'hs1000'
const deathwalker9000ID = 'hs1001'
const izumiID = 'hs1002'
const drake1ID = 'hs1003'
const syvarrisID = 'hs1004'
const kravMagaID = 'hs1005'
const tarnID = 'hs1006'
const carrID = 'hs1007'
const zettianID = 'hs1008'
const airbornID = 'hs1009'
const finnID = 'hs1010'
const thorgrimID = 'hs1011'
const raelinID = 'hs1012'
const mimringID = 'hs1013'
const negoksaID = 'hs1014'
const grimnakID = 'hs1015'

const player1Ids = [
  // drake1ID,
  // syvarrisID,
  // zettianID,
  // airbornID,
  // raelinID,
  // marroID,
  mimringID,
  deathwalker9000ID,
]
const player2Ids = [
  izumiID,
  // kravMagaID,
  // tarnID,
  // carrID,
  // finnID,
  // thorgrimID,
  // negoksaID,
  grimnakID,
]
const armyCardsDevving = hsCardsToArmyCards(MS1Cards).filter((c) => {
  return [...player1Ids, ...player2Ids].includes(c.armyCardID)
})
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
export function armyCardsToGameArmyCardsForTest() {
  return armyCardsDevving.map((card) => {
    const isCardForPlayer1 = player1Ids.includes(card.armyCardID)
    const playerID = isCardForPlayer1 ? '0' : '1'
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

const devPlayer1orderMarkers = `p0_${player1Ids[0]}`
const devPlayer2orderMarkers = `p1_${player2Ids[0]}`
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
export function playersStateWithPrePlacedOMs(): PlayersState {
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
