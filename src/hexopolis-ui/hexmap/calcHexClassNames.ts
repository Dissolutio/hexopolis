import { transformMoveRangeToArraysOfIds } from 'game/constants'
import { hexUtilsDistance } from 'game/hex-utils'
import {
  selectGameCardByID,
  selectHexForUnit,
  selectTailHexForUnit,
} from 'game/selectors'
import {
  BoardHex,
  BoardHexes,
  GameArmyCard,
  GameUnit,
  GameUnits,
  HexCoordinates,
  MoveRange,
  StartZones,
  WaterCloneRoll,
} from 'game/types'
import { DeploymentProposition } from 'hexopolis-ui/contexts'

export function calcPlacementHexClassNames({
  selectedMapHex,
  selectedUnitID,
  selectedUnitIs2Hex,
  hex,
  startZones,
  startZoneForMy2HexUnits,
  playerID,
  editingBoardHexes,
  activeTailPlacementUnitID,
  tailPlaceables,
}: {
  selectedMapHex: string
  selectedUnitID: string
  selectedUnitIs2Hex: boolean
  hex: BoardHex
  startZones: StartZones
  startZoneForMy2HexUnits: string[]
  playerID: string
  editingBoardHexes: DeploymentProposition
  activeTailPlacementUnitID: string
  tailPlaceables: string[]
}) {
  const isMyStartZoneHex = Boolean(startZones[playerID].includes(hex.id))
  const isTailPlaceable = tailPlaceables.includes(hex.id)
  const isSelectedHex = hex.id === selectedMapHex
  // Start: Paint Terrain
  let classNames = `maphex__terrain--${hex.terrain}`
  //phase: Placement
  const occupyingPlacementUnitId =
    editingBoardHexes?.[hex.id]?.occupyingUnitID ?? ''

  // highlight all player startzones
  if (startZones?.['0'].includes(hex.id)) {
    classNames = classNames.concat(` maphex__startzone--player0 `)
  }
  if (startZones?.['1'].includes(hex.id)) {
    classNames = classNames.concat(` maphex__startzone--player1 `)
  }

  // if we have a unit selected, highlight the unit and placeable hexes
  if (selectedUnitID) {
    // highlight hex (and tail hex) of currently selected unit
    if (isMyStartZoneHex && occupyingPlacementUnitId === selectedUnitID) {
      classNames = classNames.concat(
        ` maphex__start-zone--placement--selected-unit `
      )
    }
    // highlight empty, placeable hexes
    if (selectedUnitIs2Hex) {
      if (
        isMyStartZoneHex &&
        !occupyingPlacementUnitId &&
        startZoneForMy2HexUnits.includes(hex.id)
      ) {
        classNames = classNames.concat(` maphex__start-zone--placement `)
      }
    } else {
      if (isMyStartZoneHex && !occupyingPlacementUnitId) {
        classNames = classNames.concat(` maphex__start-zone--placement `)
      }
    }
    // highlight occupied placeable hexes
    if (
      isMyStartZoneHex &&
      occupyingPlacementUnitId &&
      occupyingPlacementUnitId !== selectedUnitID
    ) {
      classNames = classNames.concat(
        ` maphex__start-zone--placement--occupied `
      )
    }
  }

  // if we have a unit-tail selected, highlight the unit and placeable hexes
  if (activeTailPlacementUnitID) {
    // highlight head hex of currently placing tail
    if (occupyingPlacementUnitId === activeTailPlacementUnitID) {
      classNames = classNames.concat(
        ` maphex__start-zone--placement--selected-unit ` // reused className
      )
    }
    // highlight empty, placeable hexes
    if (isMyStartZoneHex && !occupyingPlacementUnitId && isTailPlaceable) {
      classNames = classNames.concat(` maphex__start-zone--placement `) // reused className
    }
    // highlight occupied placeable hexes
    if (
      isMyStartZoneHex &&
      occupyingPlacementUnitId &&
      occupyingPlacementUnitId !== selectedUnitID &&
      isTailPlaceable
    ) {
      classNames = classNames.concat(
        ` maphex__start-zone--placement--occupied ` // reused className
      )
    }
  }
  // highlight selected hex
  if (isSelectedHex) {
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
  const isSelectedHex = hex.id === selectedMapHex
  // Start: Paint Terrain
  let classNames = `maphex__terrain--${hex.terrain}`

  // highlight active hex
  if (isSelectedHex) {
    classNames = classNames.concat(' maphex__selected--active ')
  }
  return classNames
}

export function calcRopHexClassNames({
  isMyTurn,
  isAttackingStage,
  isMovementStage,
  isWaterCloneStage,
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
}: // clonerHexes,
// clonePlaceableHexes,
{
  isMyTurn: boolean
  isAttackingStage: boolean
  isMovementStage: boolean
  isWaterCloneStage: boolean
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
  // clonerHexes: string[]
  // clonePlaceableHexes: string[]
}) {
  const hexUnitID = hex.occupyingUnitID
  const hexUnit = gameUnits[hexUnitID]
  const hexOfSelectedUnit = selectHexForUnit(selectedUnitID, boardHexes)
  const selectedUnit = gameUnits[selectedUnitID]
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
      const tailHex = selectTailHexForUnit(selectedUnitID, boardHexes)
      const is2HexSelectedUnit = selectedUnit?.is2Hex && tailHex
      const isInTailRange =
        is2HexSelectedUnit && tailHex
          ? hexUtilsDistance(tailHex as HexCoordinates, hex) <=
            (revealedGameCard?.range ?? 0)
          : false
      const isInRange =
        isInTailRange ||
        hexUtilsDistance(startHex as HexCoordinates, hex) <=
          (revealedGameCard?.range ?? 0)
      // ... and is in range
      if (isInRange) {
        classNames = classNames.concat(' maphex__targetable-enemy ')
      }
    }
  }

  // phase: ROP-move
  if (isMovementStage) {
    const { safeMoves, engageMoves, disengageMoves } =
      transformMoveRangeToArraysOfIds(selectedUnitMoveRange)
    const isInSafeMoveRange = safeMoves.includes(hex.id)
    const isInEngageMoveRange = engageMoves.includes(hex.id)
    const hasUnitOnHexMoved = unitsMoved.includes(hexUnitID)
    const isInDisengageMoveRange = disengageMoves.includes(hex.id)
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
  if (isWaterCloneStage) {
    if (true) {
      classNames = classNames.concat(' maphex__cloner-hexes ')
    }
    if (false) {
      classNames = classNames.concat(' maphex__clone-placeable ')
    }
    if (false) {
      classNames = classNames.concat(' maphex__clone-re-placeable ')
    }
  }
  return classNames
}
