import React, { SyntheticEvent } from 'react'
import { Hex, Hexagon, HexUtils, Text } from 'react-hexgrid'

import {
  useUIContext,
  useMapContext,
  usePlacementContext,
  usePlayContext,
} from '../contexts'
import { UnitIcon } from '../unit-icons/UnitIcon'
import { generateBlankMoveRange } from 'game/HM-constants'
import { selectHexForUnit, selectGameCardByID } from 'game/HM-G-selectors'
import { BoardHex } from 'game/HM-types'
import { useBgioClientInfo, useBgioCtx, useBgioG } from 'bgio-contexts'

type MapHexesProps = {
  hexSize: number
}

export const MapHexes = ({ hexSize }: MapHexesProps) => {
  const { playerID } = useBgioClientInfo()
  const { boardHexes, armyCards, startZones, gameUnits } = useBgioG()
  const { selectedUnitID } = useUIContext()
  const { selectedMapHex } = useMapContext()
  const { ctx } = useBgioCtx()
  const { onClickBoardHex_placement } = usePlacementContext()
  const {
    onClickBoardHex__turn,
    selectedGameCard,
    selectedGameCardUnits,
    selectedUnit,
    revealedGameCardUnits,
  } = usePlayContext()

  const { isMyTurn, isPlacementPhase, isRoundOfPlayPhase, isAttackingStage } =
    ctx

  // computed
  const selectedUnitMoveRange =
    selectedUnit?.moveRange ?? generateBlankMoveRange()

  // handlers
  const onClickBoardHex = (event: SyntheticEvent, sourceHex: BoardHex) => {
    if (isPlacementPhase) {
      onClickBoardHex_placement?.(event, sourceHex)
    }
    if (isRoundOfPlayPhase) {
      onClickBoardHex__turn?.(event, sourceHex)
    }
  }

  // classnames
  function calcClassNames(hex: BoardHex) {
    const isMyStartZoneHex = (hex: BoardHex) => {
      const myStartZone = startZones[playerID]
      return Boolean(myStartZone.includes(hex.id))
    }
    const isSelectedHex = (hex: BoardHex) => {
      return hex.id === selectedMapHex
    }
    const isSelectedCard = (hex: BoardHex) => {
      const unitIDs = (selectedGameCardUnits ?? []).map((u) => u.unitID)
      return unitIDs.includes(hex.occupyingUnitID)
    }
    const isSelectedUnitHex = (hex: BoardHex) => {
      return hex.occupyingUnitID && hex.occupyingUnitID === selectedUnitID
    }
    const activeEnemyUnitIDs = (revealedGameCardUnits ?? []).map(
      (u) => u.unitID
    )
    const isOpponentsActiveUnitHex = (hex: BoardHex) => {
      return activeEnemyUnitIDs.includes(hex.occupyingUnitID)
    }
    // TODO: extract functions for className pieces (i.e. makePlacementPhaseClassNames(startZones, isMyStartZoneHex, isSelectedHex)), instead of building classNames procedurally like this
    let classNames = ''
    //phase: Placement
    if (isPlacementPhase) {
      // paint all player startzones
      // TODO: make this work for however many players
      if (startZones?.['0'].includes(hex.id)) {
        classNames = classNames.concat(` maphex__startzone--player0 `)
      }
      if (startZones?.['1'].includes(hex.id)) {
        classNames = classNames.concat(` maphex__startzone--player1 `)
      }
      // highlight placeable hexes
      if (selectedUnitID && isMyStartZoneHex(hex) && !hex.occupyingUnitID) {
        classNames = classNames.concat(' maphex__start-zone--placement ')
      }
      // highlight active hex
      if (isSelectedHex(hex)) {
        classNames = classNames.concat(' maphex__selected--active ')
      }
    }
    //phase: ROP
    if (isRoundOfPlayPhase) {
      // Highlight selected card units
      // TODO Color selectable units based on if they have moved, have not moved, or have finished moving
      const isSelectableUnit = isSelectedCard(hex) && !isSelectedUnitHex(hex)
      if (isSelectableUnit) {
        classNames = classNames.concat(
          ' maphex__selected-card-unit--selectable '
        )
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
            (selectedGameCard?.range ?? 0)
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
    }
    return classNames
  }

  const onClickHex = (e: React.SyntheticEvent, source: any) => {
    onClickBoardHex(e, source.data as BoardHex)
  }

  const hexJSX = () => {
    return Object.values(boardHexes).map((hex: BoardHex, i) => {
      const gameUnit = gameUnits?.[hex.occupyingUnitID]
      const isShowableUnit =
        !isPlacementPhase || gameUnit?.playerID === playerID
      const gameUnitCard = selectGameCardByID(armyCards, gameUnit?.gameCardID)
      const unitName = gameUnitCard?.name ?? ''
      return (
        <Hexagon
          key={i}
          q={hex.q}
          r={hex.r}
          s={hex.s}
          data={hex}
          onClick={onClickHex}
          className={calcClassNames(hex)}
        >
          <g>
            {gameUnit && isShowableUnit && (
              <UnitIcon
                hexSize={hexSize}
                armyCardID={gameUnit.armyCardID}
                iconPlayerID={gameUnit.playerID}
              />
            )}
            {isPlacementPhase && <HexIDText hexSize={hexSize} text={hex.id} />}
            {!isPlacementPhase && (
              <HexIDText hexSize={hexSize} text={unitName} />
            )}
          </g>
        </Hexagon>
      )
    })
  }
  return <>{hexJSX()}</>
}
const HexIDText = ({ hexSize, text }: { hexSize: number; text: string }) => {
  return (
    <Text className="maphex_altitude-text" y={hexSize * 0.6}>
      {text.toString()}
    </Text>
  )
}
