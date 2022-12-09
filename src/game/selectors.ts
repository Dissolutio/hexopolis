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
  const startHex = boardHexes?.[startHexID]
  if (!startHex) return []
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
export function selectEngagementsForUnit({
  unitID,
  boardHexes,
  gameUnits,
  armyCards,
}: {
  unitID: string
  boardHexes: BoardHexes
  gameUnits: GameUnits
  armyCards: GameArmyCard[]
}) {
  const hex = selectHexForUnit(unitID, boardHexes)
  // either use hex unit, or override unit
  const unitOnHex = gameUnits[unitID]
  const armyCardForUnitOnHex = selectGameCardByID(
    armyCards,
    unitOnHex?.gameCardID
  )
  const playerID = unitOnHex?.playerID

  // if no unit, then no engagements
  if (!unitOnHex) {
    return []
  }
  const adjacentUnitIDs = selectHexNeighbors(hex?.id ?? '', boardHexes)
    .filter((h) => h.occupyingUnitID)
    .map((h) => h.occupyingUnitID)
  const engagedUnitIDs = adjacentUnitIDs.filter(
    (id) => gameUnits[id].playerID !== playerID
  )
  return engagedUnitIDs.filter((unitBID) => {
    const unitB = gameUnits[unitBID]
    const hexB = selectHexForUnit(unitBID, boardHexes)
    const unitBCard = selectGameCardByID(armyCards, unitB?.gameCardID)
    return selectAreTwoUnitsEngaged({
      aHeight: armyCardForUnitOnHex?.height ?? 0,
      aAltitude: hex?.altitude ?? 0,
      bHeight: unitBCard?.height ?? 0,
      bAltitude: hexB?.altitude ?? 0,
    })
  })
}
export function selectAreTwoUnitsEngaged({
  aHeight,
  aAltitude,
  bHeight,
  bAltitude,
}: {
  aHeight: number
  aAltitude: number
  bHeight: number
  bAltitude: number
}) {
  // this just checks if the top of one unit is above the bottom of the other
  // TODO: account for barriers between two hexes
  return bAltitude < aAltitude + aHeight && bAltitude > aAltitude - bHeight
}

// this function will lookup the unit on the hex, OR you can pass an override unit to place on the hex to predict engagements
export function selectEngagementsForHex({
  hexID,
  playerID,
  boardHexes,
  gameUnits,
  armyCards,
  overrideUnitID,
}: {
  hexID: string
  playerID: string
  boardHexes: BoardHexes
  gameUnits: GameUnits
  armyCards: GameArmyCard[]
  overrideUnitID?: string
}) {
  const hex = boardHexes[hexID]

  // either use hex unit, or override unit
  const unitOnHex = overrideUnitID
    ? gameUnits?.[overrideUnitID]
    : gameUnits?.[hex?.occupyingUnitID]
  const armyCardForUnitOnHex = selectGameCardByID(
    armyCards,
    unitOnHex?.gameCardID
  )
  // if no unit, then no engagements
  if (!unitOnHex) {
    return []
  }
  const adjacentUnitIDs = selectHexNeighbors(hexID, boardHexes)
    // unit cannot engage/be-adjacent-to itself
    .filter((h) => h.occupyingUnitID && h.occupyingUnitID !== overrideUnitID)
    .map((h) => h.occupyingUnitID)
  const engagedUnitIDs = adjacentUnitIDs.filter(
    (id) => gameUnits[id].playerID !== playerID
  )
  return engagedUnitIDs.filter((unitBID) => {
    const unitB = gameUnits[unitBID]
    const hexB = selectHexForUnit(unitBID, boardHexes)
    const unitBCard = selectGameCardByID(armyCards, unitB?.gameCardID)
    return selectAreTwoUnitsEngaged({
      aHeight: armyCardForUnitOnHex?.height ?? 0,
      aAltitude: hex?.altitude ?? 0,
      bHeight: unitBCard?.height ?? 0,
      bAltitude: hexB?.altitude ?? 0,
    })
  })
}
