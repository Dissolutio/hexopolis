import type { Move } from 'boardgame.io'
import { selectHexForUnit } from '../selectors'
import { GameState, PlayerOrderMarkers } from '../types'
import { stageNames } from '../constants'

//phase:___RoundOfPlay
import { moveAction } from './move-action'
import { attemptDisengage } from './attempt-disengage'
import { attackAction } from './attack-action'

//phase:___RoundOfPlay
const endCurrentMoveStage: Move<GameState> = ({ events }) => {
  events.setStage(stageNames.attacking)
}
const endCurrentPlayerTurn: Move<GameState> = ({ events }) => {
  events.endTurn()
}

//phase:___Placement
const deployUnits: Move<GameState> = (
  { G },
  deploymentProposition: {
    [boardHexId: string]: string // occupyingUnitId
  }
) => {
  const propositions = Object.entries(deploymentProposition)
  let newG = {
    ...G,
    boardHexes: {
      ...G.boardHexes,
    },
  }

  propositions.forEach((proposition) => {
    const boardHexId = proposition[0]
    const placedGameUnitId = proposition[1]
    const oldHexId = selectHexForUnit(placedGameUnitId, G.boardHexes)?.id ?? ''
    const latestUnitIdOnOldHexId = newG.boardHexes[oldHexId]?.occupyingUnitID
    const shouldOverwriteOldHex =
      !!oldHexId &&
      !!latestUnitIdOnOldHexId &&
      latestUnitIdOnOldHexId === placedGameUnitId
    // don't overwrite it if another unit has already been placed on that hex; in that case, the erasure "happened" for us early, so yay
    if (shouldOverwriteOldHex) {
      newG.boardHexes[oldHexId].occupyingUnitID = ''
    }
    newG.boardHexes[boardHexId].occupyingUnitID = placedGameUnitId
  })
  G.boardHexes = newG.boardHexes
}
const confirmPlacementReady: Move<GameState> = (
  { G },
  { playerID }: { playerID: string }
) => {
  G.placementReady[playerID] = true
}
const deconfirmPlacementReady: Move<GameState> = (
  { G },
  { playerID }: { playerID: string }
) => {
  G.placementReady[playerID] = false
}

//phase:___PlaceOrderMarkers
// placeOrderMarkers places the private order markers, the public ones get revealed each turn
const placeOrderMarkers: Move<GameState> = (
  { G },
  {
    playerID,
    orders,
  }: { playerID: string; orders: PlayerOrderMarkers; gameCardID: string }
) => {
  G.players[playerID].orderMarkers = orders
}
const confirmOrderMarkersReady: Move<GameState> = (
  { G },
  { playerID }: { playerID: string }
) => {
  G.orderMarkersReady[playerID] = true
}
const deconfirmOrderMarkersReady: Move<GameState> = (
  { G },
  { playerID }: { playerID: string }
) => {
  G.orderMarkersReady[playerID] = false
}

export const moves = {
  endCurrentMoveStage,
  endCurrentPlayerTurn,
  moveAction,
  attemptDisengage,
  attackAction,
  deployUnits,
  confirmPlacementReady,
  deconfirmPlacementReady,
  placeOrderMarkers,
  confirmOrderMarkersReady,
  deconfirmOrderMarkersReady,
}
