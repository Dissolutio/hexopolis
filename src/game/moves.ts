import type { Move } from 'boardgame.io'
import { Hex, HexUtils } from 'react-hexgrid'

import { selectHexForUnit, selectGameCardByID } from './selectors'
import { GameState, BoardHex, GameUnit, PlayerOrderMarkers } from './types'
import { stageNames } from './constants'
import { moveAction } from './move-action'

//phase:___RoundOfPlay
const endCurrentMoveStage: Move<GameState> = ({ events }) => {
  events.setStage(stageNames.attacking)
}
const endCurrentPlayerTurn: Move<GameState> = ({ events }) => {
  events.endTurn()
}
const attackAction: Move<GameState> = (
  { G, ctx, random },
  unit: GameUnit,
  defenderHex: BoardHex
) => {
  const { unitID } = unit
  const unitGameCard = selectGameCardByID(G.armyCards, unit.gameCardID)
  const unitRange = unitGameCard?.range ?? 0
  const unitsMoved = [...G.unitsMoved]
  const unitsAttacked = [...G.unitsAttacked]
  // attacksAllowed is where we might account for Double Attack, etc.
  const attacksAllowed = unitGameCard?.figures ?? 0
  const attacksLeft = attacksAllowed - unitsAttacked.length
  const attackerHex = selectHexForUnit(unitID, G.boardHexes)

  //! EARLY OUTS
  // DISALLOW - no target
  if (!defenderHex.occupyingUnitID) {
    console.log(`no target`)
    return
  }
  // DISALLOW - all attacks used
  const isEndAttacks = attacksLeft <= 0
  if (isEndAttacks) {
    console.log(`all attacks used`)
    return
  }
  // DISALLOW - unit already attacked
  const isAlreadyAttacked = unitsAttacked.includes(unitID)
  if (isAlreadyAttacked) {
    console.log(`unit already attacked`)
    return
  }
  // DISALLOW - attack must be used by a moved unit
  const isMovedUnit = unitsMoved.includes(unitID)
  const isAttackAvailableForUnmovedUnitToUse =
    attacksLeft > unitsMoved.filter((id) => !unitsAttacked.includes(id)).length
  const isUsableAttack = isMovedUnit || isAttackAvailableForUnmovedUnitToUse
  if (!isUsableAttack) {
    console.log(`attack must be used by a moved unit`)
    return
  }
  // DISALLOW - defender is out of range
  const isInRange =
    HexUtils.distance(attackerHex as Hex, defenderHex) <= unitRange
  if (!isInRange) {
    console.log(`defender is out of range`)
    return
  }

  // ALLOW
  const attack = unitGameCard?.attack ?? 0
  const defenderGameUnit = G.gameUnits[defenderHex.occupyingUnitID]
  const defenderGameCard = selectGameCardByID(
    G.armyCards,
    defenderGameUnit.gameCardID
  )
  const defense = defenderGameCard?.defense ?? 0
  const defenderLife = defenderGameCard?.life ?? 0
  const attackRoll = random?.Die(6, attack) ?? []
  const skulls = attackRoll.filter((n) => n <= 3).length
  const defenseRoll = random?.Die(6, defense) ?? []
  const shields = defenseRoll.filter((n) => n === 4 || n === 5).length
  const wounds = Math.max(skulls - shields, 0)
  const isHit = wounds > 0
  const isFatal = wounds >= defenderLife
  console.log(`A:`, skulls, `D:`, shields, `wounds:`, wounds)

  // deal damage
  if (isHit && !isFatal) {
    const gameCardIndex = G.armyCards.findIndex(
      (card) => card?.gameCardID === defenderGameUnit.gameCardID
    )
    G.armyCards[gameCardIndex].life = defenderLife - wounds
  }
  // kill unit, clear hex
  if (isFatal) {
    delete G.gameUnits[defenderGameUnit.unitID]
    G.boardHexes[defenderHex.id].occupyingUnitID = ''
  }
  // update units attacked
  unitsAttacked.push(unitID)
  G.unitsAttacked = unitsAttacked
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
