import type { Move } from 'boardgame.io'
import { Hex, HexUtils } from 'react-hexgrid'

import {
  selectHexForUnit,
  selectGameCardByID,
  calcUnitMoveRange,
  selectUnitsForCard,
  selectUnrevealedGameCard,
} from './selectors'
import { GameState, BoardHexes, BoardHex, GameUnits, GameUnit } from './types'
import { stageNames } from './constants'

//phase:___RoundOfPlay
const endCurrentMoveStage: Move<GameState> = ({ events }) => {
  events.setStage(stageNames.attacking)
}
const endCurrentPlayerTurn: Move<GameState> = ({ events }) => {
  events.endTurn()
}
const moveAction: Move<GameState> = (
  { G, ctx },
  unit: GameUnit,
  endHex: BoardHex
) => {
  const { unitID, movePoints } = unit
  const playersOrderMarkers = G.players[ctx.currentPlayer].orderMarkers
  const endHexID = endHex.id
  const startHex = selectHexForUnit(unitID, G.boardHexes)
  const startHexID = startHex?.id ?? ''
  const currentMoveRange = calcUnitMoveRange(unit, G.boardHexes, G.gameUnits)
  const isInSafeMoveRange = currentMoveRange.safe.includes(endHexID)
  const moveCost = HexUtils.distance(startHex as Hex, endHex)
  // clone G
  const newBoardHexes: BoardHexes = { ...G.boardHexes }
  const newGameUnits: GameUnits = { ...G.gameUnits }
  // update moved units counter
  const unitsMoved = [...G.unitsMoved]
  if (!unitsMoved.includes(unitID)) {
    unitsMoved.push(unitID)
    G.unitsMoved = unitsMoved
  }
  // update unit position
  newBoardHexes[startHexID].occupyingUnitID = ''
  newBoardHexes[endHexID].occupyingUnitID = unitID
  // update unit move points
  const newMovePoints = movePoints - moveCost
  newGameUnits[unitID].movePoints = newMovePoints
  // update move ranges for this turn's units
  const unrevealedGameCard = selectUnrevealedGameCard(
    playersOrderMarkers,
    G.armyCards,
    G.currentOrderMarker
  )
  const currentTurnUnits = selectUnitsForCard(
    unrevealedGameCard?.gameCardID ?? '',
    G.gameUnits
  )
  currentTurnUnits.forEach((unit: GameUnit) => {
    const { unitID } = unit
    const moveRange = calcUnitMoveRange(unit, newBoardHexes, newGameUnits)
    newGameUnits[unitID].moveRange = moveRange
  })
  // Make the move
  if (isInSafeMoveRange) {
    G.boardHexes = { ...newBoardHexes }
    G.gameUnits = { ...newGameUnits }
  }
  return G
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
  const isOpenAttack =
    attacksLeft > unitsMoved.filter((id) => !unitsAttacked.includes(id)).length
  const isUsableAttack = isMovedUnit || isOpenAttack
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
    const oldHexId = Object.values(G.boardHexes).find(
      (bh) => bh.occupyingUnitID === placedGameUnitId
    )?.id
    const latestUnitIdOnOldHexId =
      newG.boardHexes[oldHexId ?? '']?.occupyingUnitID
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

//phase:___PlaceOrderMarkers
const placeOrderMarker: Move<GameState> = (
  { G, ctx },
  {
    playerID,
    // TODO: orderMarker should be called "order", really
    order,
    gameCardID,
  }: { playerID: string; order: string; gameCardID: string }
) => {
  G.players[playerID].orderMarkers[order] = gameCardID
}
const confirmOrderMarkersReady: Move<GameState> = (
  { G, ctx },
  { playerID }: { playerID: string }
) => {
  G.orderMarkersReady[playerID] = true
}

export const moves = {
  endCurrentMoveStage,
  endCurrentPlayerTurn,
  moveAction,
  attackAction,
  deployUnits,
  confirmPlacementReady,
  placeOrderMarker,
  confirmOrderMarkersReady,
}
