import { generateBlankPlayersOrderMarkers } from '../constants'
import { selectGameCardByID } from '../selectors'
import {
  BoardHexes,
  GameArmyCard,
  GameUnits,
  OrderMarkers,
  PlayerOrderMarkers,
  PlayerState,
  UnitsKilled,
} from '../types'

export const killUnit_G = ({
  boardHexes,
  unitsKilled,
  killedUnits,
  gameUnits,
  gameArmyCards,
  killedArmyCards,
  unitToKillID,
  killerUnitID,
  defenderHexID,
  defenderTailHexID,
}: {
  boardHexes: BoardHexes
  gameArmyCards: GameArmyCard[]
  killedArmyCards: GameArmyCard[]
  unitsKilled: UnitsKilled
  killedUnits: GameUnits
  gameUnits: GameUnits
  unitToKillID: string
  killerUnitID?: string
  defenderHexID?: string
  defenderTailHexID?: string
}) => {
  // if someone killed this unit, add them to the killed units (wasted units from The Drop have no killer)
  if (killerUnitID) {
    unitsKilled[killerUnitID] = [
      ...(unitsKilled?.[killerUnitID] ?? []),
      unitToKillID,
    ]
  }

  killedUnits[unitToKillID] = {
    ...gameUnits[unitToKillID],
  }
  delete gameUnits[unitToKillID]
  if (defenderHexID) {
    // remove from hex, and tail if applicable
    boardHexes[defenderHexID].occupyingUnitID = ''
    if (defenderTailHexID) {
      boardHexes[defenderTailHexID].occupyingUnitID = ''
      boardHexes[defenderTailHexID].isUnitTail = false
    }
  }
  // remove the game army card if all units for it are dead
  const isNoMoreUnitsForCard = !Object.values(gameUnits).find(
    (u) => u.gameCardID === killedUnits[unitToKillID].gameCardID
  )
  if (isNoMoreUnitsForCard) {
    const indexOfGameArmyCardToRemove = gameArmyCards.findIndex(
      (c) => c.gameCardID === killedUnits[unitToKillID].gameCardID
    )
    killedArmyCards.push(gameArmyCards[indexOfGameArmyCardToRemove])
    gameArmyCards.splice(indexOfGameArmyCardToRemove, 1)
  }
}

export const assignCardMovePointsToUnit_G = ({
  gameArmyCards,
  gameUnits,
  unitID,
  overrideMovePoints,
}: {
  gameArmyCards: GameArmyCard[]
  gameUnits: GameUnits
  unitID: string
  overrideMovePoints?: number
}) => {
  const gameCard = selectGameCardByID(
    gameArmyCards,
    gameUnits[unitID].gameCardID
  )
  // TODO: move point card selector
  const movePoints = overrideMovePoints ?? gameCard?.move ?? 0
  // move-points
  const unitWithMovePoints = {
    ...gameUnits[unitID],
    movePoints,
  }
  gameUnits[unitID] = unitWithMovePoints
}
export const wipeCardOrderMarkers_G = ({
  gameCardToWipeID,
  playerID,
  playerState,
  orderMarkers,
}: {
  gameCardToWipeID: string
  playerID: string
  playerState: PlayerState
  orderMarkers: OrderMarkers
}) => {
  // 1. wipe order markers from playerState
  const playerPrivateOrderMarkers = playerState[playerID].orderMarkers
  const playerStateOrderMarkersFilteredForCard = Object.entries(
    playerPrivateOrderMarkers
  ).reduce((acc: PlayerOrderMarkers, entry) => {
    const [order, gameCardID] = entry
    if (gameCardID === gameCardToWipeID) {
      return {
        ...acc,
        [order]: '',
      }
    }
    return {
      ...acc,
      [order]: gameCardID,
    }
  }, generateBlankPlayersOrderMarkers())
  // apply mutation to playerState
  playerState[playerID].orderMarkers = playerStateOrderMarkersFilteredForCard
  // 2. wipe order markers from public orderMarkers
  const orderMarkersFilteredForCard = orderMarkers[playerID].map((order) => {
    if (order.gameCardID === gameCardToWipeID) {
      return {
        ...order,
        gameCardID: '',
      }
    }
    return {
      ...order,
      gameCardID: order.gameCardID,
    }
  })
  // apply mutation to public orderMarkers
  orderMarkers[playerID] = orderMarkersFilteredForCard
}
// const entriesPS = Object.entries(playerPrivateOrderMarkers)
