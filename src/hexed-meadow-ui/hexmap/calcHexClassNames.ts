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
import { DeploymentProposition } from 'hexed-meadow-ui/contexts'
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
  let classNames = ''
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

export function calcRopHexClassNames({
  selectedUnitID,
  hex,
  playerID,
  revealedGameCardUnits,
  revealedGameCardUnitIDs,
  isMyTurn,
  isAttackingStage,
  revealedGameCard,
  boardHexes,
  gameUnits,
  selectedUnitMoveRange,
}: {
  selectedUnitID: string
  hex: BoardHex
  playerID: string
  revealedGameCardUnits: GameUnit[]
  revealedGameCardUnitIDs: string[]
  isMyTurn: boolean
  isAttackingStage: boolean
  revealedGameCard: GameArmyCard | undefined
  boardHexes: BoardHexes
  gameUnits: GameUnits
  selectedUnitMoveRange: MoveRange
}) {
  const isSelectedCard = (hex: BoardHex) => {
    return revealedGameCardUnitIDs.includes(hex.occupyingUnitID)
  }
  const isSelectedUnitHex = (hex: BoardHex) => {
    return hex.occupyingUnitID && hex.occupyingUnitID === selectedUnitID
  }
  const activeEnemyUnitIDs = (revealedGameCardUnits ?? []).map((u) => u.unitID)
  const isOpponentsActiveUnitHex = (hex: BoardHex) => {
    return activeEnemyUnitIDs.includes(hex.occupyingUnitID)
  }
  // TODO: extract functions for className pieces (i.e. makePlacementPhaseClassNames(startZones, isMyStartZoneHex, isSelectedHex)), instead of building classNames procedurally like this
  let classNames = ''
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
    const endHexUnitID = hex.occupyingUnitID
    const isEndHexOccupied = Boolean(endHexUnitID)
    const endHexUnit = { ...gameUnits[endHexUnitID] }
    const endHexUnitPlayerID = endHexUnit.playerID
    const isEndHexEnemyOccupied =
      isEndHexOccupied && endHexUnitPlayerID !== playerID
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
  // todo: make movement its own stage
  if (!isAttackingStage) {
    const { safe, engage, disengage } = selectedUnitMoveRange
    const isInSafeMoveRange = safe.includes(hex.id)
    const isInEngageMoveRange = engage.includes(hex.id)
    const isInDisengageMoveRange = disengage.includes(hex.id)
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
  }
  return classNames
}
