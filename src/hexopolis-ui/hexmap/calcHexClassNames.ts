import { transformMoveRangeToArraysOfIds } from 'game/constants'
import { selectHexForUnit } from 'game/selectors'
import {
  BoardHex,
  BoardHexes,
  EditingBoardHexes,
  GameUnit,
  GameUnits,
  MoveRange,
  StartZones,
} from 'game/types'

export function calcDraftAndPlacementHexClassNames({
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
  editingBoardHexes: EditingBoardHexes
  activeTailPlacementUnitID: string
  tailPlaceables: string[]
}) {
  const isMyStartZoneHex = Boolean(startZones?.[playerID]?.includes(hex.id))
  const isTailPlaceable = tailPlaceables?.includes(hex.id)
  const isSelectedHex = hex.id === selectedMapHex
  // Start: Paint Terrain
  let classNames = `maphex__terrain--${hex.terrain}`
  //phase: Placement
  const occupyingPlacementUnitId =
    editingBoardHexes?.[hex.id]?.occupyingUnitID ?? ''

  // highlight all player startzones
  if ((startZones?.['0'] ?? []).includes(hex.id)) {
    classNames = classNames.concat(
      ` maphex__startzone maphex__startzone--player0 `
    )
  }
  if ((startZones?.['1'] ?? []).includes(hex.id)) {
    classNames = classNames.concat(
      ` maphex__startzone maphex__startzone--player1 `
    )
  }
  if ((startZones?.['2'] ?? []).includes(hex.id)) {
    classNames = classNames.concat(
      ` maphex__startzone maphex__startzone--player2`
    )
  }
  if ((startZones?.['3'] ?? []).includes(hex.id)) {
    classNames = classNames.concat(
      ` maphex__startzone maphex__startzone--player3`
    )
  }
  if ((startZones?.['4'] ?? []).includes(hex.id)) {
    classNames = classNames.concat(
      ` maphex__startzone maphex__startzone--player4`
    )
  }
  if ((startZones?.['5'] ?? []).includes(hex.id)) {
    classNames = classNames.concat(
      ` maphex__startzone maphex__startzone--player5`
    )
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
        startZoneForMy2HexUnits?.includes(hex.id)
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
  hex,
  theDropPlaceableHexIDs,
}: {
  hex: BoardHex
  theDropPlaceableHexIDs?: string[]
}) {
  // Start: Paint Terrain
  let classNames = `maphex__terrain--${hex.terrain}`
  if ((theDropPlaceableHexIDs ?? []).includes(hex.id)) {
    classNames = classNames.concat(' hexagon-selectable ')
  }
  return classNames
}

export function calcRopHexClassNames({
  isMyTurn,
  isAttackingStage,
  isMovementStage,
  isWaterCloneStage,
  isChompStage,
  isMindShackleStage,
  isFireLineSAStage,
  isExplosionSAStage,
  isGrenadeSAStage,
  selectedUnitID,
  hex,
  revealedGameCardUnits,
  revealedGameCardUnitIDs,
  boardHexes,
  gameUnits,
  unitsMoved,
  selectedUnitMoveRange,
  selectedUnitAttackRange,
  clonerHexIDs,
  clonePlaceableHexIDs,
  chompableHexIDs,
  chompSelectedHexIDs,
  mindShackleTargetableHexIDs,
  mindShackleSelectedHexIDs,
  fireLineTargetableHexIDs,
  fireLineAffectedHexIDs,
  fireLineSelectedHexIDs,
  explosionTargetableHexIDs,
  explosionAffectedUnitIDs,
  explosionSelectedUnitIDs,
}: {
  isMyTurn: boolean
  isAttackingStage: boolean
  isMovementStage: boolean
  isWaterCloneStage: boolean
  isChompStage: boolean
  isMindShackleStage: boolean
  isFireLineSAStage: boolean
  isExplosionSAStage: boolean
  isGrenadeSAStage: boolean
  selectedUnitID: string
  hex: BoardHex
  revealedGameCardUnits: GameUnit[]
  revealedGameCardUnitIDs: string[]
  boardHexes: BoardHexes
  gameUnits: GameUnits
  unitsMoved: string[]
  selectedUnitMoveRange: MoveRange
  selectedUnitAttackRange: string[]
  clonerHexIDs: string[]
  clonePlaceableHexIDs: string[]
  chompableHexIDs: string[]
  chompSelectedHexIDs: string[]
  mindShackleTargetableHexIDs: string[]
  mindShackleSelectedHexIDs: string[]
  fireLineTargetableHexIDs: string[]
  fireLineAffectedHexIDs: string[]
  fireLineSelectedHexIDs: string[]
  explosionTargetableHexIDs: string[]
  explosionAffectedHexIDs: string[]
  explosionAffectedUnitIDs: string[]
  explosionSelectedUnitIDs: string[]
}) {
  const hexUnitID = hex.occupyingUnitID
  const hexUnit = gameUnits[hexUnitID]
  const hexOfSelectedUnit = selectHexForUnit(selectedUnitID, boardHexes)
  const isSelectedCard = (hex: BoardHex) => {
    return revealedGameCardUnitIDs?.includes?.(hexUnitID)
  }
  const isSelectedUnitHex = (hex: BoardHex) => {
    return hexUnitID && hexUnitID === selectedUnitID
  }
  const activeEnemyUnitIDs = (revealedGameCardUnits ?? []).map((u) => u.unitID)
  const isOpponentsActiveUnitHex = (hex: BoardHex) => {
    return activeEnemyUnitIDs?.includes(hexUnitID)
  }
  //phase: ROP-All??
  // Start: Paint Terrain
  let classNames = `maphex__terrain--${hex.terrain}`

  const isSelectableUnit = isSelectedCard(hex) && !isSelectedUnitHex(hex)
  //phase: ROP-All??  Highlight selected card units
  if (isSelectableUnit) {
    classNames = classNames.concat(' maphex__selected-card-unit--selectable ')
  }

  // phase: ROP-idle
  // Highlight opponents active units on their turn
  if (!isMyTurn && isOpponentsActiveUnitHex(hex)) {
    classNames = classNames.concat(' maphex__opponents-active-unit ')
  }

  //phase: ROP-attack
  if (isAttackingStage) {
    // Highlight selected unit
    if (selectedUnitID && isSelectedUnitHex(hex)) {
      classNames = classNames.concat(' maphex__selected-card-unit--active ')
    }
    // Highlight targetable enemy units
    if (selectedUnitAttackRange?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-attack-selectable ')
    }
  }

  // phase: ROP-move
  if (isMovementStage) {
    const {
      safeMoves,
      engageMoves,
      dangerousMoves: disengageMoves,
    } = transformMoveRangeToArraysOfIds(selectedUnitMoveRange)
    const isInSafeMoveRange = safeMoves?.includes(hex.id)
    const isInEngageMoveRange = engageMoves?.includes(hex.id)
    const hasUnitOnHexMoved = unitsMoved?.includes(hexUnitID)
    const isInDisengageMoveRange = disengageMoves?.includes(hex.id)
    const isUnitMovePartiallyExpended =
      hasUnitOnHexMoved && hexUnit.movePoints > 0
    const isUnitMoveTotallyUsed = hasUnitOnHexMoved && hexUnit.movePoints <= 0
    // Highlight selected unit
    if (selectedUnitID && isSelectedUnitHex(hex)) {
      classNames = classNames.concat(' maphex__selected-card-unit--active ')
    }
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
      // if (isUnitMovePartiallyExpended) {
      //   classNames = classNames.concat(' maphex__move-partially-moved-unit ')
      // }
      // Paint hexes with units that have totally expended moves
      if (isUnitMoveTotallyUsed) {
        classNames = classNames.concat(' maphex__move-totally-moved-unit ')
      }
    }
  }

  //  phase: ROP-water-clone
  if (isWaterCloneStage) {
    if (clonerHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' maphex__cloner-hexes ')
    }
    if (clonePlaceableHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-selectable ')
    }
  }
  if (isChompStage) {
    if (chompableHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-selectable ')
    }
    if (chompSelectedHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-selected-special-attack ')
    }
  }
  if (isMindShackleStage) {
    if (mindShackleTargetableHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-selectable ')
    }
    if (mindShackleSelectedHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-selected-special-attack ')
    }
  }
  //  phase: ROP-fire-line Special Attack
  if (isFireLineSAStage) {
    if (fireLineTargetableHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-selectable ')
    }
    if (fireLineAffectedHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-malaffected ')
    }
    if (fireLineSelectedHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-selected-special-attack ')
    }
  }
  if (isExplosionSAStage) {
    if (explosionTargetableHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-selectable ')
    }
    if (explosionAffectedUnitIDs?.includes(hex.occupyingUnitID)) {
      classNames = classNames.concat(' hexagon-malaffected ')
    }
    if (explosionSelectedUnitIDs?.includes(hex.occupyingUnitID)) {
      classNames = classNames.concat(' hexagon-selected-special-attack ')
    }
  }
  if (isGrenadeSAStage) {
    // Highlight selected unit
    if (selectedUnitID && isSelectedUnitHex(hex)) {
      classNames = classNames.concat(' maphex__selected-card-unit--active ')
    }
    if (explosionTargetableHexIDs?.includes(hex.id)) {
      classNames = classNames.concat(' hexagon-selectable ')
    }
    if (explosionAffectedUnitIDs?.includes(hex.occupyingUnitID)) {
      classNames = classNames.concat(' hexagon-malaffected ')
    }
    if (explosionSelectedUnitIDs?.includes(hex.occupyingUnitID)) {
      classNames = classNames.concat(' hexagon-selected-special-attack ')
    }
  }
  return classNames
}
