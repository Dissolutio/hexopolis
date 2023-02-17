import type { Move, MoveMap } from 'boardgame.io'
import {
  BoardHexesUnitDeployment,
  GameState,
  PlayerOrderMarkers,
} from '../types'
import { moveAction } from './move-action'
import { attemptDisengage } from './attempt-disengage'
import { takeDisengagementSwipe } from './disengagement-swipe'
import { attackAction } from './attack-action'
import { placeAttackSpirit, placeArmorSpirit } from './place-spirits'
import { rollForFireLineSpecialAttack } from './fire-line-SA'
import { rollForExplosionSpecialAttack } from './explosion-SA'
import { chompAction } from './chomp-action'
import { mindShackleAction } from './mind-shackle-action'
import { draftPrePlaceArmyCardAction } from './draft-actions'
import { rollForBerserkerCharge } from './roll-berserker-charge'
import {
  rollForWaterClone,
  finishWaterCloningAndEndTurn,
  placeWaterClone,
} from './water-clone-action'

//phase:___Draft
const confirmDraftReady: Move<GameState> = (
  { G, events },
  { playerID }: { playerID: string }
) => {
  G.draftReady[playerID] = true
  // we only surface the confirm button when it is current players turn to "draft"
  events.endTurn()
}

//phase:___Placement
const deployUnits: Move<GameState> = (
  { G },
  deploymentProposition: BoardHexesUnitDeployment,
  playerID: string
) => {
  const myStartZone = G.startZones?.[playerID]
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
  confirmDraftReady,
  draftPrePlaceArmyCardAction,
  deployUnits,
  confirmPlacementReady,
  deconfirmPlacementReady,
  placeOrderMarkers,
  confirmOrderMarkersReady,
  deconfirmOrderMarkersReady,
  moveAction,
  attemptDisengage,
  takeDisengagementSwipe,
  rollForBerserkerCharge,
  rollForWaterClone,
  finishWaterCloningAndEndTurn,
  placeWaterClone,
  chompAction,
  mindShackleAction,
  attackAction,
  placeAttackSpirit,
  placeArmorSpirit,
  rollForFireLineSpecialAttack,
  rollForExplosionSpecialAttack,
}
