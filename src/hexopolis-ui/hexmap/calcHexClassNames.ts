import { selectHexForUnit } from 'game/selectors'
import {
  BoardHex,
  BoardHexes,
  GameArmyCard,
  GameUnit,
  GameUnits,
  MoveRange,
  StartZones,
} from 'game/types'
import { DeploymentProposition } from 'hexopolis-ui/contexts'
import { Hex, HexUtils } from 'react-hexgrid'

export function calcPlacementHexClassNames({
  selectedMapHex,
  selectedUnitID,
  hex,
  startZones,
  playerID,
  editingBoardHexes,
}: {
  selectedMapHex: string
  selectedUnitID: string
  hex: BoardHex
  startZones: StartZones
  playerID: string
  editingBoardHexes: DeploymentProposition
}) {
  const isMyStartZoneHex = (hex: BoardHex) => {
    const myStartZone = startZones[playerID]
    return Boolean(myStartZone.includes(hex.id))
  }
  const isSelectedHex = (hex: BoardHex) => {
    return hex.id === selectedMapHex
  }
  // Start: Paint Terrain
  let classNames = `maphex__terrain--${hex.terrain}`
  //phase: Placement
  const occupyingPlacementUnitId = editingBoardHexes[hex.id]
  // paint all player startzones
  // TODO: make this work for however many players
  if (startZones?.['0'].includes(hex.id)) {
    classNames = classNames.concat(` maphex__startzone--player0 `)
  }
  if (startZones?.['1'].includes(hex.id)) {
    classNames = classNames.concat(` maphex__startzone--player1 `)
  }

  // highlight placeable hexes that DO NOT have units
  if (selectedUnitID && isMyStartZoneHex(hex) && !occupyingPlacementUnitId) {
    classNames = classNames.concat(` maphex__start-zone--placement `)
  }

  // highlight placeable hexes that DO have units, but the one with the currently selected unit will be styled separately, below
  if (
    selectedUnitID &&
    isMyStartZoneHex(hex) &&
    occupyingPlacementUnitId &&
    occupyingPlacementUnitId !== selectedUnitID
  ) {
    classNames = classNames.concat(` maphex__start-zone--placement--occupied `)
  }

  // highlight hex with currently selected unit
  if (
    selectedUnitID &&
    isMyStartZoneHex(hex) &&
    occupyingPlacementUnitId &&
    occupyingPlacementUnitId === selectedUnitID
  ) {
    classNames = classNames.concat(
      ` maphex__start-zone--placement--selected-unit `
    )
  }

  // highlight active hex
  if (isSelectedHex(hex)) {
    classNames = classNames.concat(' maphex__selected--active ')
  }
  return classNames
}

export function calcOrderMarkerHexClassNames({
  selectedMapHex,
  hex,
}: {
  selectedMapHex: string
  hex: BoardHex
}) {
  const isSelectedHex = (hex: BoardHex) => {
    return hex.id === selectedMapHex
  }
  // Start: Paint Terrain
  let classNames = `maphex__terrain--${hex.terrain}`

  // highlight active hex
  if (isSelectedHex(hex)) {
    classNames = classNames.concat(' maphex__selected--active ')
  }
  return classNames
}

export function calcRopHexClassNames({
  isMyTurn,
  isAttackingStage,
  selectedUnitID,
  hex,
  playerID,
  revealedGameCardUnits,
  revealedGameCardUnitIDs,
  revealedGameCard,
  boardHexes,
  gameUnits,
  unitsMoved,
  selectedUnitMoveRange,
}: {
  isMyTurn: boolean
  isAttackingStage: boolean
  selectedUnitID: string
  hex: BoardHex
  playerID: string
  revealedGameCardUnits: GameUnit[]
  revealedGameCardUnitIDs: string[]
  revealedGameCard: GameArmyCard | undefined
  boardHexes: BoardHexes
  gameUnits: GameUnits
  unitsMoved: string[]
  selectedUnitMoveRange: MoveRange
}) {
  const hexUnitID = hex.occupyingUnitID
  const hexUnit = gameUnits[hexUnitID]
  const hexOfSelectedUnit = selectHexForUnit(selectedUnitID, boardHexes)
  const isSelectedCard = (hex: BoardHex) => {
    return revealedGameCardUnitIDs.includes(hexUnitID)
  }
  const isSelectedUnitHex = (hex: BoardHex) => {
    return hexUnitID && hexUnitID === selectedUnitID
  }
  const activeEnemyUnitIDs = (revealedGameCardUnits ?? []).map((u) => u.unitID)
  const isOpponentsActiveUnitHex = (hex: BoardHex) => {
    return activeEnemyUnitIDs.includes(hexUnitID)
  }
  // Start: Paint Terrain
  let classNames = `maphex__terrain--${hex.terrain}`
  //phase: ROP
  // Highlight selected card units
  // TODO Color selectable units based on if they have moved, have not moved, or have finished moving
  const isSelectableUnit = isSelectedCard(hex) && !isSelectedUnitHex(hex)
  if (isSelectableUnit) {
    classNames = classNames.concat(' maphex__selected-card-unit--selectable ')
  }
  // Highlight selected unit
  if (selectedUnitID && isSelectedUnitHex(hex)) {
    classNames = classNames.concat(' maphex__selected-card-unit--active ')
  }
  // NOT MY TURN
  // Highlight opponents active units on their turn
  if (!isMyTurn && isOpponentsActiveUnitHex(hex)) {
    classNames = classNames.concat(' maphex__opponents-active-unit ')
  }

  //phase: ROP-attack
  if (isAttackingStage) {
    // Highlight targetable enemy units
    const isEndHexOccupied = Boolean(hexUnitID)
    const endHexUnitPlayerID = hexUnit?.playerID
    const isEndHexEnemyOccupied =
      isEndHexOccupied && endHexUnitPlayerID !== playerID // TODO: make this work for however many players AKA isFriendlyUnit
    // If unit selected, hex is enemy occupied...
    if (selectedUnitID && isEndHexEnemyOccupied) {
      const startHex = selectHexForUnit(selectedUnitID, boardHexes)
      const isInRange =
        HexUtils.distance(startHex as Hex, hex) <=
        (revealedGameCard?.range ?? 0)
      // ... and is in range
      if (isInRange) {
        classNames = classNames.concat(' maphex__targetable-enemy ')
      }
    }
  }

  // phase: ROP-move
  if (!isAttackingStage) {
    const { safe, engage, disengage } = selectedUnitMoveRange
    const isInSafeMoveRange = safe.includes(hex.id)
    const isInEngageMoveRange = engage.includes(hex.id)
    const hasUnitOnHexMoved = unitsMoved.includes(hexUnitID)
    const isInDisengageMoveRange = disengage.includes(hex.id)
    const isUnitMovePartiallyExpended =
      hasUnitOnHexMoved && hexUnit.movePoints > 0
    const isUnitMoveTotallyUsed = hasUnitOnHexMoved && hexUnit.movePoints <= 0
    // only do moveRange/move-expended coloring on non-selected units/hexes
    if (hex.id !== hexOfSelectedUnit?.id) {
      // Paint safe moves
      if (isInSafeMoveRange) {
        classNames = classNames.concat(' maphex__move-safe ')
      }
      // Paint engage moves
      if (isInEngageMoveRange) {
        classNames = classNames.concat(' maphex__move-engage ')
      }
      // Paint disengage moves
      if (isInDisengageMoveRange) {
        classNames = classNames.concat(' maphex__move-disengage ')
      }
      // Paint hexes with units that have partially expended moves
      if (isUnitMovePartiallyExpended) {
        classNames = classNames.concat(' maphex__move-partially-moved-unit ')
      }
      // Paint hexes with units that have totally expended moves
      if (isUnitMoveTotallyUsed) {
        classNames = classNames.concat(' maphex__move-totally-moved-unit ')
      }
    }
  }
  return classNames
}
