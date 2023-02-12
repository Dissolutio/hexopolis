import { GameArmyCard, GameUnit, GameUnits } from './types'

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
export function transformGameArmyCardsToGameUnits(
  armyCards: GameArmyCard[]
): GameUnits {
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
