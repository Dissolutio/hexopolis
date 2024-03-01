import {
  GameArmyCard,
  GameUnits,
  ICoreHeroscapeCard,
  StartingArmies,
} from '../types'
import { MS1Cards } from '../coreHeroscapeCards'
import { testCards } from '../testHeroscapeCards'
import { makeGameCardID } from '../transformers'
import { keyBy } from 'lodash'

const testDummyID = 'test001'
const test2HexDummyID = 'test002'
const testDummyGhostWalkID = 'test003'
const testDummyFlyerID = 'test004'
const testDummyStealthFlyerID = 'test005'
const testDummy2HexFlyerID = 'test006'
const testDummy2HexStealthFlyerID = 'test007'
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
export const startingArmiesForDefaultScenario: StartingArmies = {
  // '0': [finnID, grimnakID, raelinOneID, marroID],
  // '1': [tarnID, izumiID, syvarrisID, carrID],
  // '2': [marroID, negoksaID, thorgrimID, izumiID],
  // '3': [drake1ID, airbornID, raelinOneID],
  // '4': [zettianID, deathwalker9000ID, kravMagaID],
  // '5': [mimringID, tarnID, carrID],
  '0': [deathwalker9000ID],
  '1': [marroID],
  '2': [marroID],
  '3': [drake1ID],
  '4': [drake1ID, deathwalker9000ID],
  '5': [mimringID, carrID],
}
export const startingArmiesForGiantsTable2Player: StartingArmies = {
  '0': [drake1ID, thorgrimID, finnID, marroID, raelinOneID],
  '1': [mimringID, kravMagaID, carrID, tarnID],
}
export const startingArmiesForForsakenWaters2Player: StartingArmies = {
  // original starting armies (prod) below:
  // '0': [negoksaID, thorgrimID, zettianID, deathwalker9000ID],
  // '1': [izumiID, syvarrisID, airbornID, carrID],

  // for devving 3d below:
  '0': [
    finnID,
    grimnakID,
    izumiID,
    kravMagaID,
    mimringID,
    deathwalker9000ID,
    drake1ID,
    airbornID,
  ],
  '1': [
    negoksaID,
    thorgrimID,
    zettianID,
    tarnID,
    raelinOneID,
    marroID,
    carrID,
    syvarrisID,
  ],
}
export const startingArmiesFor3Player: StartingArmies = {
  // original starting armies (prod) below:
  // '0': [negoksaID, thorgrimID, zettianID, deathwalker9000ID],
  // '1': [izumiID, syvarrisID, airbornID, carrID],

  // for devving 3d below:
  '0': [
    finnID,
    grimnakID,
    izumiID,
    kravMagaID,
    mimringID,
    deathwalker9000ID,
    drake1ID,
    airbornID,
  ],
  '1': [
    negoksaID,
    thorgrimID,
    zettianID,
    tarnID,
    raelinOneID,
    marroID,
    carrID,
    syvarrisID,
  ],
  '2': [
    finnID,
    grimnakID,
    izumiID,
    kravMagaID,
    mimringID,
    deathwalker9000ID,
    drake1ID,
    airbornID,
  ],
}
export const startingArmiesForMoveRange1HexWalkMap: StartingArmies = {
  '0': [drake1ID],
  '1': [testDummyID],
}
export const startingArmiesForMoveRange1HexFlyMap: StartingArmies = {
  '0': [drake1ID],
  '1': [testDummyFlyerID],
}
export const startingArmiesForMoveRange2HexFlyMap: StartingArmies = {
  '0': [drake1ID],
  '1': [testDummy2HexFlyerID],
}
export const startingArmiesFor2HexFlyingEngagedMap = (
  withStealth: boolean
): StartingArmies => {
  if (withStealth) {
    return {
      '0': [zettianID],
      '1': [testDummy2HexStealthFlyerID],
    }
  } else {
    return {
      '0': [zettianID],
      '1': [testDummy2HexFlyerID],
    }
  }
}
export const startingArmiesForMoveRangePassThruMap = (
  withGhostWalk: boolean
): StartingArmies => {
  if (withGhostWalk) {
    return {
      '0': [drake1ID],
      '1': [testDummyGhostWalkID],
    }
  } else {
    return {
      '0': [drake1ID],
      '1': [testDummyID],
    }
  }
}
export const startingArmiesFor1HexFlyingEngagedMap = (
  withStealth: boolean
): StartingArmies => {
  if (withStealth) {
    return {
      '0': [zettianID],
      '1': [testDummyStealthFlyerID],
    }
  } else {
    return {
      '0': [zettianID],
      '1': [testDummyFlyerID],
    }
  }
}
export const startingArmiesForMoveRange2HexWalkMap: StartingArmies = {
  '0': [drake1ID],
  '1': [test2HexDummyID],
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
// in order for the TestDummy cards to be accessible to the game, we need to add them to the army cards
// const cardsUsed = [...MS1Cards, ...testCards]
const cardsUsed = [...MS1Cards]

export function startingArmiesToGameCards(
  numPlayers: number,
  startingArmies: StartingArmies
): GameArmyCard[] {
  const theArmiesTurnedIntoGameArmyCards: {
    [pid: string]: GameArmyCard[]
  } = Object.entries(startingArmies).reduce(
    (acc, [playerID, playerHSCardIDs]) => {
      // bail early for non-existent players
      if (parseInt(playerID) >= numPlayers) {
        // i.e. if it's a 3-player game, then players 0,1, and 2 would be in the game
        return acc
      }

      const playerArmyCards = playerHSCardIDs
        .filter((hsCardID) => {
          return cardsUsed.find((card) => card.armyCardID === hsCardID)
        })
        .map((hsCardID) => {
          return cardsUsed.find((card) => card.armyCardID === hsCardID)
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
// makeUnitID has hardcoded usage in tests, so refactoring will break tests
function makeUnitID(index: number, playerID: string) {
  return `p${playerID}u${index}`
}
export function transformGameArmyCardsToGameUnits(
  armyCards: GameArmyCard[],
  numberOfUnitsPlayerAlreadyHas?: number
): GameUnits {
  const preUnits = armyCards.reduce((result: any[], card) => {
    const numberOfFiguresForThisCard = card.figures * card.cardQuantity
    const preUnitsArr = Array.apply({}, Array(numberOfFiguresForThisCard)).map(
      (f, index) => ({ ...card, modelIndex: index })
    )
    return [...result, ...preUnitsArr]
  }, [])

  const unitsArr = preUnits.map((preUnit, i, arr) => {
    const unitID = makeUnitID(
      i + (numberOfUnitsPlayerAlreadyHas ?? 0),
      preUnit.playerID
    )
    const newGameUnit = {
      unitID,
      armyCardID: preUnit.armyCardID,
      playerID: preUnit.playerID,
      gameCardID: preUnit.gameCardID,
      wounds: 0,
      movePoints: 0,
      is2Hex: preUnit.hexes === 2,
      rotation: 0,
      modelIndex: preUnit.modelIndex,
    }
    return newGameUnit
  })

  return keyBy(unitsArr, 'unitID')
}
