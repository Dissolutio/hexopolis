import type { Move, MoveMap } from 'boardgame.io'
import {
  BoardHexesUnitDeployment,
  GameState,
  PlayerOrderMarkers,
  StageQueueItem,
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
import { selectGameCardByID } from '../selectors'
import { getActivePlayersIdleStage, stageNames } from '../constants'

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
const dropInUnits: Move<GameState> = (
  { G, events },
  {
    isAccepting,
    deploymentProposition,
    gameCardID,
  }: {
    isAccepting: boolean
    deploymentProposition?: BoardHexesUnitDeployment
    gameCardID?: string
  }
) => {
  let newBoardHexes = {
    ...G.boardHexes,
  }
  // if they accept, then they are also passing their placement
  if (isAccepting) {
    if (!gameCardID || !deploymentProposition) {
      console.error(
        'Cannot perform move dropInUnits because the gameCardID or deploymentProposition is undefined'
      )
      return
    }
    const cardDroppingIn = selectGameCardByID(G.gameArmyCards, gameCardID)

    if (!cardDroppingIn) {
      console.error(
        'Cannot perform move dropInUnits because cardDroppingIn is undefined'
      )
      return
    }
    const playerID = cardDroppingIn.playerID
    // TODO: add to gamelog that player dropped in some units
    const propositions = Object.entries(deploymentProposition)
    console.log('🚀 ~ file: moves.ts:100 ~ propositions', propositions)
    // this will just flat out overwrite units, so be careful in the selectable hex generation
    propositions.forEach((proposition) => {
      console.log(
        '🚀 ~ file: moves.ts:107 ~ propositions.forEach ~ proposition',
        proposition
      )
      const boardHexId = proposition[0]
      const placedGameUnitId = proposition[1].occupyingUnitID
      newBoardHexes[boardHexId].occupyingUnitID = placedGameUnitId
      newBoardHexes[boardHexId].isUnitTail = proposition[1].isUnitTail
    })
    G.theDropUsed.push(gameCardID)
  }
  // All below is done even if the player is not accepting the drop in
  // TODO: add to gamelog that player did not drop in units
  let newStageQueue: StageQueueItem[] = [...G.stageQueue]
  const nextStage = newStageQueue.shift()
  G.stageQueue = newStageQueue
  G.boardHexes = newBoardHexes
  if (nextStage) {
    const activePlayers = getActivePlayersIdleStage({
      gamePlayerIDs: Object.keys(G.players),
      activePlayerID: nextStage.playerID,
      activeStage: stageNames.theDrop,
      idleStage: stageNames.idleTheDrop,
    })
    events.setActivePlayers({ value: activePlayers })
  } else {
    events.endPhase()
  }
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
  dropInUnits,
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
