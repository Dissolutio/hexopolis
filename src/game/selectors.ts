import { HexUtils } from 'react-hexgrid'

import {
  BoardHexes,
  BoardHex,
  GameArmyCard,
  GameUnits,
  GameUnit,
  OrderMarkers,
  OrderMarker,
  PlayerOrderMarkers,
} from './types'
import { generateHexID } from './constants'

export function selectHexForUnit(unitID: string, boardHexes: BoardHexes) {
  return Object.values(boardHexes).find((hex) => hex.occupyingUnitID === unitID)
}
export function selectUnitForHex(
  hexID: string,
  gameUnits: GameUnits,
  boardHexes: BoardHexes
): GameUnit {
  const hex = boardHexes?.[hexID]
  const unitID = hex?.occupyingUnitID
  const unit = gameUnits?.[unitID]
  return unit
}
export function selectGameCardByID(
  armyCards: GameArmyCard[],
  gameCardID: string
): GameArmyCard | undefined {
  return armyCards.find((card: GameArmyCard) => card.gameCardID === gameCardID)
}
export function selectUnitsForCard(
  gameCardID: string,
  gameUnits: GameUnits
): GameUnit[] {
  return (
    Object.values(gameUnits)
      .filter((u) => u.gameCardID === gameCardID)
      // deproxy array
      .map((u) => ({ ...u }))
  )
}
export function selectRevealedGameCard(
  orderMarkers: OrderMarkers,
  armyCards: GameArmyCard[],
  currentOrderMarker: number,
  currentPlayer: string
) {
  const orderMarker = orderMarkers[currentPlayer].find(
    (om: OrderMarker) => om.order === currentOrderMarker.toString()
  )
  const gameCardID = orderMarker?.gameCardID ?? ''
  return selectGameCardByID(armyCards, gameCardID)
}
export function selectUnrevealedGameCard(
  playerOrderMarkers: PlayerOrderMarkers,
  armyCards: GameArmyCard[],
  currentOrderMarker: number
) {
  const id = playerOrderMarkers[currentOrderMarker.toString()]
  return selectGameCardByID(armyCards, id)
}

export function selectHexNeighbors(
  startHexID: string,
  boardHexes: BoardHexes
): BoardHex[] {
  const startHex = boardHexes[startHexID]
  return HexUtils.neighbors(startHex)
    .map((hex) => {
      const id = generateHexID(hex)
      const exists = Object.keys(boardHexes).includes(id)
      return exists ? { ...boardHexes[generateHexID(hex)] } : null
    })
    .filter((item) => Boolean(item)) as BoardHex[]
}

export function calcMoveCostBetweenNeighbors(
  startHex: BoardHex,
  endHex: BoardHex
): number {
  const altitudeDelta = endHex.altitude - startHex.altitude
  const heightCost = Math.max(altitudeDelta, 0)
  const distanceCost = 1
  const totalCost = heightCost + distanceCost
  return totalCost
}

// export function selectEngagementsForHex(
//   hexID: string,
//   playerID: string,
//   boardHexes: BoardHexes,
//   gameUnits: GameUnits
// ) {
//   const adjacentUnitIDs = selectHexNeighbors(hexID, boardHexes)
//     .filter((h) => h.occupyingUnitID)
//     .map((h) => h.occupyingUnitID)
//   const engagedUnitIDs = adjacentUnitIDs.filter(
//     (id) => gameUnits[id].playerID !== playerID
//   )
//   return engagedUnitIDs
// }
