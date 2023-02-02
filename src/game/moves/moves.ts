import type { Move, MoveMap } from 'boardgame.io'
import { selectHexForUnit } from '../selectors'
import { GameState, PlayerOrderMarkers } from '../types'
import { stageNames } from '../constants'

//phase:___RoundOfPlay
import { moveAction } from './move-action'
import { attemptDisengage } from './attempt-disengage'
import { takeDisengagementSwipe } from './disengagement-swipe'
import { attackAction } from './attack-action'
import { DeploymentProposition } from 'hexopolis-ui/contexts'

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
  deploymentProposition: DeploymentProposition,
  playerID: string
) => {
  const myStartZone = G.startZones[playerID]
  const propositions = Object.entries(deploymentProposition)
  let newBoardHexes = {
    ...G.boardHexes,
  }
  // clear off all units and then apply proposition
  for (const hexID in newBoardHexes) {
    if (
      Object.prototype.hasOwnProperty.call(newBoardHexes, hexID) &&
      myStartZone.includes(hexID)
    ) {
      newBoardHexes[hexID].occupyingUnitID = ''
      newBoardHexes[hexID].isUnitTail = false
    }
  }
  propositions.forEach((proposition) => {
    const boardHexId = proposition[0]
    const placedGameUnitId = proposition[1].occupyingUnitID
    newBoardHexes[boardHexId].occupyingUnitID = placedGameUnitId
    newBoardHexes[boardHexId].isUnitTail = proposition[1].isUnitTail
  })
  G.boardHexes = newBoardHexes
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

export const moves: MoveMap<GameState> = {
  endCurrentMoveStage,
  endCurrentPlayerTurn,
  moveAction,
  attemptDisengage,
  takeDisengagementSwipe,
  attackAction,
  deployUnits,
  confirmPlacementReady,
  deconfirmPlacementReady,
  placeOrderMarkers,
  confirmOrderMarkersReady,
  deconfirmOrderMarkersReady,
}
