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
  unitToKillID,
  killerUnitID,
  defenderHexID,
  defenderTailHexID,
}: {
  boardHexes: BoardHexes
  unitsKilled: UnitsKilled
  killedUnits: GameUnits
  gameUnits: GameUnits
  unitToKillID: string
  killerUnitID: string
  defenderHexID: string
  defenderTailHexID?: string
}) => {
  unitsKilled[killerUnitID] = [
    ...(unitsKilled?.[killerUnitID] ?? []),
    unitToKillID,
  ]

  killedUnits[unitToKillID] = {
    ...gameUnits[unitToKillID],
  }
  delete gameUnits[unitToKillID]
  // remove from hex, and tail if applicable
  boardHexes[defenderHexID].occupyingUnitID = ''
  if (defenderTailHexID) {
    boardHexes[defenderTailHexID].occupyingUnitID = ''
    boardHexes[defenderTailHexID].isUnitTail = false
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
    return acc
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
    return order
  })
  // apply mutation to public orderMarkers
  orderMarkers[playerID] = orderMarkersFilteredForCard
}
// const entriesPS = Object.entries(playerPrivateOrderMarkers)
