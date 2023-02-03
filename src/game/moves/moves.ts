import type { Move, MoveMap } from 'boardgame.io'
import {
  GameState,
  PlayerOrderMarkers,
  UnitsCloning,
  WaterCloneRoll,
} from '../types'
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
  const blankWaterCloneRoll = {
    diceRolls: {},
    threshholds: {},
    cloneCount: 0,
    placements: {},
  }
  const waterCloneRoll: WaterCloneRoll = unitsCloning.reduce(
    (result, current) => {
      const isOnWater = G.boardHexes[current.unitHexID].terrain === 'water'
      const threshhold = isOnWater ? 10 : 15
      // TODO: Anything influencing the dice roll? i.e. SuBakNa Hive Supremacy, Glyph of Lodin (+1 d20)
      const dieRoll = random.Die(20)
      const isSuccess = dieRoll >= threshhold
      return {
        ...result,
        threshholds: {
          ...result.threshholds,
          [current.unit.unitID]: threshhold,
        },
        diceRolls: {
          ...result.diceRolls,
          [current.unit.unitID]: dieRoll,
        },
        cloneCount: isSuccess ? result.cloneCount + 1 : result.cloneCount,
        placements: {
          ...result.placements,
          [current.unit.unitID]: isSuccess
            ? { unitHexID: current.unitHexID, tails: current.tails }
            : undefined,
        },
      }
    },
    blankWaterCloneRoll
  )

  G.waterCloneRoll = waterCloneRoll
  G.waterClonesPlaced = []
  //
}
const finishWaterCloningAndEndTurn: Move<GameState> = ({ G, events }) => {
  // reset water clone stuff
  G.waterCloneRoll = undefined
  // G.waterClonesPlaced = [] // not needed
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
