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
export const startingArmies: { [playerID: string]: string[] } = {
  '0': [
    kravMagaID,
    tarnID,
    grimnakID,
    airbornID,
    negoksaID,
    carrID,
    thorgrimID,
    syvarrisID,
  ],
  '1': [
    drake1ID,
    izumiID,
    zettianID,
    deathwalker9000ID,
    marroID,
    mimringID,
    finnID,
    raelinOneID,
  ],
  '2': [mimringID, tarnID],
  '3': [mimringID, tarnID],
  '4': [mimringID, tarnID],
  '5': [mimringID, tarnID],
}

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
  const theArmiesTurnedIntoGameArmyCards: {
    [pid: string]: GameArmyCard[]
  } = Object.entries(startingArmies).reduce(
    (acc, [playerID, playerHSCardIDs]) => {
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
    },
    {}
  )
  return Object.values(theArmiesTurnedIntoGameArmyCards).flat()
}
