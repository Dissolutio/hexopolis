import {
  ArmyCard,
  GameArmyCard,
  ICoreHeroscapeCard,
  OrderMarkers,
  PlayerState,
} from '../types'
import { MS1Cards } from '../coreHeroscapeCards'
import { makeGameCardID } from '../transformers'

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
    marroID,
    drake1ID,
    // negoksaID,
    // airbornID,
    // thorgrimID,
    // izumiID,
    // deathwalker9000ID,
    // mimringID,
    // finnID,
  ],
  '1': [
    // grimnakID,
    // raelinOneID,
    kravMagaID,
    // tarnID,
    // syvarrisID,
    // airbornID,
    zettianID,
    // carrID,
  ],
  '2': [tarnID],
  '3': [tarnID],
  '4': [mimringID, tarnID],
  '5': [mimringID, tarnID],
}
function hsCardsToArmyCards(
  params: Array<ICoreHeroscapeCard>,
  playerID: string
): Array<GameArmyCard | undefined> {
  // hsCardsToArmyCards assumes pre-formed armies, no draft phase
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
