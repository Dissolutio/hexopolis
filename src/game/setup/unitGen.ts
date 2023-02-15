import {
  GameArmyCard,
  ICoreHeroscapeCard,
  OrderMarkers,
  PlayerState,
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
export const grimnakID = 'hs1015'

// TEST SCENARIO ARMYCARDS
const theArmies = {
  '0': [
    grimnakID,
    drake1ID,
    airbornID,
    negoksaID,
    carrID,
    kravMagaID,
    thorgrimID,
    tarnID,
  ],
  '1': [
    deathwalker9000ID,
    mimringID,
    finnID,
    marroID,
    izumiID,
    raelinOneID,
    zettianID,
    syvarrisID,
  ],
  '2': [mimringID, tarnID],
  '3': [mimringID, tarnID],
  '4': [mimringID, tarnID],
  '5': [mimringID, tarnID],
}
// TEST SCENARIO ORDERMARKERS
const p0_0 = `p0_${theArmies['0'][0]}`
const p0_1 = `p0_${theArmies['0'][0]}`
const p0_2 = `p0_${theArmies['0'][0]}`
const p0_X = `p0_${theArmies['0'][0]}`

const p1_0 = `p1_${theArmies['1'][0]}`
const p1_1 = `p1_${theArmies['1'][0]}`
const p1_2 = `p1_${theArmies['1'][0]}`
const p1_X = `p1_${theArmies['1'][0]}`

const p2_0 = `p2_${theArmies['2'][0]}`
const p2_1 = `p2_${theArmies['2'][1]}`
const p2_2 = `p2_${theArmies['2'][1]}`
const p2_X = `p2_${theArmies['2'][0]}`

const p3_0 = `p3_${theArmies['3'][0]}`
const p3_1 = `p3_${theArmies['3'][1]}`
const p3_2 = `p3_${theArmies['3'][1]}`
const p3_X = `p3_${theArmies['3'][0]}`

const p4_0 = `p4_${theArmies['4'][0]}`
const p4_1 = `p4_${theArmies['4'][1]}`
const p4_2 = `p4_${theArmies['4'][1]}`
const p4_X = `p4_${theArmies['4'][0]}`

const p5_0 = `p5_${theArmies['5'][0]}`
const p5_1 = `p5_${theArmies['5'][1]}`
const p5_2 = `p5_${theArmies['5'][1]}`
const p5_X = `p5_${theArmies['5'][0]}`

const theArmiesTurnedIntoGameArmyCards = (
  numPlayers: number
): { [pid: string]: GameArmyCard[] } =>
  Object.entries(theArmies).reduce((acc, [playerID, playerHSCardIDs]) => {
    // bail early for non-existent players
    if (parseInt(playerID) >= numPlayers) {
      return acc
    }

    const playerArmyCards = playerHSCardIDs
      .filter((hsCardID) => {
        return MS1Cards.find((card) => card.armyCardID === hsCardID)
      })
      .map((hsCardID) => {
        return MS1Cards.find((card) => card.armyCardID === hsCardID)
      })
    return {
      ...acc,
      [playerID]: [
        ...hsCardsToArmyCards(
          playerArmyCards as Array<ICoreHeroscapeCard>,
          playerID
        ),
      ].filter((c) => c !== undefined),
    }
  }, {})
function hsCardsToArmyCards(
  params: Array<ICoreHeroscapeCard>,
  playerID: string
): Array<GameArmyCard | undefined> {
  return params.map((hsCard) => {
    if (!hsCard) return undefined
    return {
      playerID,
      cardQuantity: 1,
      gameCardID: makeGameCardID(playerID, hsCard.armyCardID),
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
      image: hsCard.image,
    }
  })
}

function makeGameCardID(playerID: string, armyCardID: string) {
  return `p${playerID}_${armyCardID}`
}
export function armyCardsToGameArmyCardsForTest(
  numPlayers: number
): GameArmyCard[] {
  return Object.values(theArmiesTurnedIntoGameArmyCards(numPlayers)).flat()
}

export function generatePreplacedOrderMarkers(
  numPlayers: number
): OrderMarkers {
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
    '2': [
      { order: '0', gameCardID: p2_0 },
      { order: '1', gameCardID: p2_1 },
      { order: '2', gameCardID: p2_2 },
      { order: 'X', gameCardID: p2_X },
    ],
    '3': [
      { order: '0', gameCardID: p3_0 },
      { order: '1', gameCardID: p3_1 },
      { order: '2', gameCardID: p3_2 },
      { order: 'X', gameCardID: p3_X },
    ],
    '4': [
      { order: '0', gameCardID: p4_0 },
      { order: '1', gameCardID: p4_1 },
      { order: '2', gameCardID: p4_2 },
      { order: 'X', gameCardID: p4_X },
    ],
    '5': [
      { order: '0', gameCardID: p5_0 },
      { order: '1', gameCardID: p5_1 },
      { order: '2', gameCardID: p5_2 },
      { order: 'X', gameCardID: p5_X },
    ],
  }
  const result: OrderMarkers = {}
  for (let index = 0; index < numPlayers; index++) {
    result[index] = orderMarkers[index]
  }
  return orderMarkers
}
export function playersStateWithPrePlacedOMs(numPlayers: number): PlayerState {
  const orderMarkers: { [key: number]: any } = {
    0: {
      '0': p0_0,
      '1': p0_1,
      '2': p0_2,
      X: p0_X,
    },
    1: {
      '0': p1_0,
      '1': p1_1,
      '2': p1_2,
      X: p1_X,
    },
    2: {
      '0': p2_0,
      '1': p2_1,
      '2': p2_2,
      X: p2_X,
    },
    3: {
      '0': p3_0,
      '1': p3_1,
      '2': p3_2,
      X: p3_X,
    },
    4: {
      '0': p4_0,
      '1': p4_1,
      '2': p4_2,
      X: p4_X,
    },
    5: {
      '0': p5_0,
      '1': p5_1,
      '2': p5_2,
      X: p5_X,
    },
  }
  const result: PlayerState = {}
  for (let index = 0; index < numPlayers; index++) {
    result[index] = { orderMarkers: orderMarkers[index] }
  }
  return result
}
