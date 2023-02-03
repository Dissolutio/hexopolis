import type { Move, MoveMap } from 'boardgame.io'
import { GameState, PlayerOrderMarkers, UnitsCloning } from '../types'
import { moveAction } from './move-action'
import { attemptDisengage } from './attempt-disengage'
import { takeDisengagementSwipe } from './disengagement-swipe'
import { attackAction } from './attack-action'
import { DeploymentProposition } from 'hexopolis-ui/contexts'
import { selectHexForUnit } from 'game/selectors'

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
const waterClone: Move<GameState> = (
  { G, random },
  { unitsCloning }: { unitsCloning: UnitsCloning }
) => {
  const numberOfDiceToRoll = unitsCloning.length
  const threshholds = unitsCloning.map((uC) => {
    // TODO: Anything influencing the dice roll? i.e. SuBakNa Hive Supremacy, Glyph of Lodin (+1 d20)
    const isOnWater = G.boardHexes[uC.unitHexID].terrain === 'water'
    if (isOnWater) {
      return 10
    } else {
      return 15
    }
  })
  const diceRolls = random.D20(numberOfDiceToRoll)
  const cloneCount = diceRolls.filter(
    (roll, i) => roll >= threshholds[i]
  ).length
  G.waterCloneRoll = {
    diceRolls,
    threshholds,
    cloneCount,
  }
  G.waterClonesPlaced = []
  //
}
const finishWaterCloningAndEndTurn: Move<GameState> = ({ G, events }) => {
  // reset water clone stuff
  G.waterCloneRoll = undefined
  G.waterClonesPlaced = []
  events.endTurn()
}

export const moves: MoveMap<GameState> = {
  deployUnits,
  confirmPlacementReady,
  deconfirmPlacementReady,
  placeOrderMarkers,
  confirmOrderMarkersReady,
  deconfirmOrderMarkersReady,
  moveAction,
  attemptDisengage,
  takeDisengagementSwipe,
  waterClone,
  finishWaterCloningAndEndTurn,
  attackAction,
}
