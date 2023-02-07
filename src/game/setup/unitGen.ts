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
export const finnID = 'hs1010'
export const thorgrimID = 'hs1011'
export const raelinOneID = 'hs1012'
const mimringID = 'hs1013'
const negoksaID = 'hs1014'
const grimnakID = 'hs1015'

// TEST SCENARIO ARMYCARDS
const player1Ids = [
  marroID,
  zettianID,
  syvarrisID,
  airbornID,
  raelinID,
  deathwalker9000ID,
  mimringID,
  drake1ID,
]
const player2Ids = [
  carrID,
  izumiID,
  kravMagaID,
  tarnID,
  finnID,
  thorgrimID,
  negoksaID,
  grimnakID,
]
// TEST SCENARIO ORDERMARKERS
const p0_0 = `p0_${player1Ids[0]}`
const p0_1 = `p0_${player1Ids[0]}`
const p0_2 = `p0_${player1Ids[0]}`
const p0_X = `p0_${player1Ids[0]}`

const p1_0 = `p1_${player2Ids[0]}`
const p1_1 = `p1_${player2Ids[0]}`
const p1_2 = `p1_${player2Ids[0]}`
const p1_X = `p1_${player2Ids[0]}`

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

export function generatePreplacedOrderMarkers(): OrderMarkers {
  const orderMarkers: OrderMarkers = {
    '0': [
      { order: '0', gameCardID: p0_0 },
      { order: '1', gameCardID: p0_1 },
      { order: '2', gameCardID: p0_2 },
      { order: 'X', gameCardID: p0_X },
    ],
    '1': [
      { order: '0', gameCardID: p1_0 },
      { order: '1', gameCardID: p1_1 },
      { order: '2', gameCardID: p1_2 },
      { order: 'X', gameCardID: p1_X },
    ],
  }
  return orderMarkers
}
export function playersStateWithPrePlacedOMs(): PlayersState {
  return {
    '0': {
      orderMarkers: {
        '0': p0_0,
        '1': p0_1,
        '2': p0_2,
        X: p0_X,
      },
    },
    '1': {
      orderMarkers: {
        '0': p1_0,
        '1': p1_1,
        '2': p1_2,
        X: p1_X,
      },
    },
  }
}
