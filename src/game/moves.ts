import type { Move } from 'boardgame.io'
import { selectHexForUnit } from './selectors'
import { GameState, PlayerOrderMarkers } from './types'
import { stageNames } from './constants'

//phase:___RoundOfPlay
import { moveAction } from './move-action'
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
  /*
   ALL this below was WIP, and abandoned for SIMPLICITY, AKA just place the units and worry about cheaters later
   Goals:
  1. Get list of units that player is deploying
  2. Validate units belong to player (note all WRONGLY placed units, for dev-obs?)
  3. Validate assigned hexes are in player's startZone (note all WRONGLY placed hexes, for dev-obs?)
  4. Assign valid game units to valid hexes
  5. All other units marked as destroyed? Or forfeited, somehow?
  Work:
  //  1. get units
  // const playerStartZone = G.startZones[playerID]
  // const validHexIds = propositions
  //   .map((i) => i[0])
  //   .filter((i) => playerStartZone.includes(i))
  // const validGameUnitIds = propositions.map((i) => i[1])
  */
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
  //  2. get start zone
  //  3. assign units
}
const confirmPlacementReady: Move<GameState> = (
  { G, ctx },
  { playerID }: { playerID: string }
) => {
  G.placementReady[playerID] = true
}
const deconfirmPlacementReady: Move<GameState> = (
  { G, ctx },
  { playerID }: { playerID: string }
) => {
  G.placementReady[playerID] = false
}

//phase:___PlaceOrderMarkers
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
  { G, ctx },
  { playerID }: { playerID: string }
) => {
  G.orderMarkersReady[playerID] = true
}
const deconfirmOrderMarkersReady: Move<GameState> = (
  { G, ctx },
  { playerID }: { playerID: string }
) => {
  G.orderMarkersReady[playerID] = false
}

export const moves = {
  endCurrentMoveStage,
  endCurrentPlayerTurn,
  moveAction,
  attackAction,
  deployUnits,
  confirmPlacementReady,
  deconfirmPlacementReady,
  placeOrderMarkers,
  confirmOrderMarkersReady,
  deconfirmOrderMarkersReady,
}
