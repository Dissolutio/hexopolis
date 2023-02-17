import { selectValidTailHexes } from './selectors'
import {
  ArmyCard,
  BoardHexes,
  GameArmyCard,
  GameUnit,
  GameUnits,
  ICoreHeroscapeCard,
  StartZones,
} from './types'

export function playerIDDisplay(playerID: string): string {
  return (
    {
      '0': 'Player 1',
      '1': 'Player 2',
      '2': 'Player 3',
      '3': 'Player 4',
      '4': 'Player 5',
      '5': 'Player 6',
    }[playerID] || 'Player X'
  )
}
export const omToString = (om: string | number) => {
  if (om === undefined || om === '') return ''
  if (typeof om === 'number') {
    return (om + 1).toString()
  } else {
    return om === 'X' ? om : (parseInt(om) + 1).toString()
  }
}
export function transformHSCardsToDraftableCards(
  params: Array<ICoreHeroscapeCard>
): Array<ArmyCard> {
  return params.map((hsCard) => {
    return {
      // playerID,
      // cardQuantity: 1,
      // gameCardID: makeGameCardID(playerID, hsCard.armyCardID),
      armyCardID: hsCard.armyCardID,
      abilities: hsCard.abilities,
      name: hsCard.name,
      singleName: hsCard.singleName,
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
export function makeGameCardID(playerID: string, armyCardID: string) {
  return `p${playerID}_${armyCardID}`
}
export function transformDraftableCardToGameCard(
  draftCards: ArmyCard[],
  playerID: string
): GameArmyCard[] {
  return draftCards.map((card) => {
    return {
      ...card,
      playerID,
      cardQuantity: 1,
      gameCardID: makeGameCardID(playerID, card.armyCardID),
    }
  })
}
let unitID = 0
export function transformGameArmyCardsToGameUnits(
  armyCards: GameArmyCard[]
): GameUnits {
  // id factory
  console.log('🚀 ~ file: transformers.ts:84 ~ unitID', unitID)
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
        wounds: 0,
        movePoints: 0,
        moveRange: { safe: [], engage: [], disengage: [], denied: [] },
        is2Hex: card.hexes === 2,
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

// WARNING: might be guilty of mutating state accidentally
export function transformBoardHexesWithPrePlacedUnits(
  boardHexes: BoardHexes,
  startZones: StartZones,
  gameUnits: GameUnits
): BoardHexes {
  const copy = { ...boardHexes }
  const gameUnitsArr = Object.values(gameUnits)
  gameUnitsArr.forEach((unit) => {
    const is2Hex = unit.is2Hex
    try {
      const { playerID } = unit
      const sz = startZones?.[playerID].filter(
        (sz) => copy[sz].occupyingUnitID === ''
      )
      // find an empty hex in the start zone, for a two spacer we must find one that has tail hexes
      const validHex =
        sz?.find((hexID) => {
          if (is2Hex) {
            const validTails = selectValidTailHexes(hexID, copy).filter(
              (t) => t?.occupyingUnitID === ''
            )
            return copy[hexID].occupyingUnitID === '' && validTails.length > 0
          } else {
            return copy[hexID].occupyingUnitID === ''
          }
        }) ?? ''
      const validTail = selectValidTailHexes(validHex ?? '', copy)
        .filter((t) => t.occupyingUnitID === '')
        .map((h) => h.id)[0]
      // update boardHex
      if (unit.is2Hex) {
        // update boardHex
        copy[validHex].occupyingUnitID = unit.unitID
        copy[validTail].occupyingUnitID = unit.unitID
        copy[validTail].isUnitTail = true
      } else {
        copy[validHex].occupyingUnitID = unit.unitID
      }
    } catch (error) {
      console.error(
        '🚀 ~ file: mapGen.ts ~ line 81 ~ gameUnitsArr.forEach ~ error',
        `🚔 The problem is likely the map is too small for the function trying to place all the units for pre-placed units (dev option on map setup)`,
        error
      )
    }
  })
  return copy
}
