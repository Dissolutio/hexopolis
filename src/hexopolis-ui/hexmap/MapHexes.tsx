import React, { SyntheticEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import {
  useUIContext,
  useMapContext,
  usePlacementContext,
  usePlayContext,
} from '../contexts'
import { UnitIcon } from '../unit-icons/UnitIcon'
import { selectGameCardByID } from 'game/selectors'
import { BoardHex } from 'game/types'
import { useBgioClientInfo, useBgioCtx, useBgioG } from 'bgio-contexts'
import {
  calcOrderMarkerHexClassNames,
  calcPlacementHexClassNames,
  calcRopHexClassNames,
} from './calcHexClassNames'
import Hexagon from './Hexagon'
import { UnitTail } from 'hexopolis-ui/unit-icons/UnitTail'
import { HexIDText } from './HexIDText'
import { useSpecialAttackContext } from 'hexopolis-ui/contexts/special-attack-context'

export const MapHexes = () => {
  const { playerID } = useBgioClientInfo()
  const {
    boardHexes,
    hexMap: { hexSize },
    gameArmyCards,
    startZones,
    gameUnits,
    unitsMoved,
  } = useBgioG()
  const { selectedUnitID } = useUIContext()
  const selectedUnitIs2Hex = gameUnits[selectedUnitID]?.is2Hex
  const { selectedMapHex } = useMapContext()
  const {
    isMyTurn,
    isPlacementPhase,
    isOrderMarkerPhase,
    isRoundOfPlayPhase,
    isAttackingStage,
    isMovementStage,
    isWaterCloneStage,
    isFireLineSAStage,
    isExplosionSAStage,
  } = useBgioCtx()
  const {
    onClickPlacementHex,
    editingBoardHexes,
    activeTailPlacementUnitID,
    tailPlaceables,
    startZoneForMy2HexUnits,
  } = usePlacementContext()
  const {
    selectedUnitMoveRange,
    selectedUnitAttackRange,
    onClickTurnHex,
    revealedGameCardUnits,
    revealedGameCardUnitIDs,
    clonerHexIDs,
    clonePlaceableHexIDs,
  } = usePlayContext()
  const {
    selectSpecialAttack,
    fireLineTargetableHexIDs,
    fireLineAffectedHexIDs,
    fireLineSelectedHexIDs,
    explosionTargetableHexIDs,
    explosionAffectedHexIDs,
    explosionAffectedUnitIDs,
    explosionSelectedHexIDs,
    singleUnitOfRevealedGameCard,
  } = useSpecialAttackContext()

  // handlers
  const onClickBoardHex = (event: SyntheticEvent, sourceHex: BoardHex) => {
    if (isPlacementPhase) {
      onClickPlacementHex?.(event, sourceHex)
    }
    if (isFireLineSAStage) {
      if (fireLineTargetableHexIDs.includes(sourceHex.id)) {
        selectSpecialAttack(sourceHex.id)
      }
    } else if (isExplosionSAStage) {
      if (explosionTargetableHexIDs.includes(sourceHex.id)) {
        selectSpecialAttack(sourceHex.id)
      }
      // clear selection if you click on Deathwalker9000
      if (singleUnitOfRevealedGameCard?.unitID === sourceHex.occupyingUnitID) {
        selectSpecialAttack('sourceHex.id')
      }
    } else if (isRoundOfPlayPhase) {
      onClickTurnHex?.(event, sourceHex)
    }
  }
  // classnames
  const hexClassNames = (hex: BoardHex) => {
    if (isPlacementPhase) {
      return calcPlacementHexClassNames({
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
      })
    }
    if (isOrderMarkerPhase) {
      return calcOrderMarkerHexClassNames({
        terrain: hex.terrain,
      })
    }
    if (isRoundOfPlayPhase) {
      return calcRopHexClassNames({
        selectedUnitID,
        hex,
        revealedGameCardUnits,
        revealedGameCardUnitIDs,
        isMyTurn,
        isAttackingStage,
        isMovementStage,
        isWaterCloneStage,
        isFireLineSAStage,
        isExplosionSAStage,
        boardHexes,
        gameUnits,
        unitsMoved,
        selectedUnitMoveRange,
        selectedUnitAttackRange,
        clonerHexIDs,
        clonePlaceableHexIDs,
        fireLineTargetableHexIDs,
        fireLineAffectedHexIDs,
        fireLineSelectedHexIDs,
        explosionTargetableHexIDs,
        explosionAffectedHexIDs,
        explosionAffectedUnitIDs,
        explosionSelectedHexIDs,
      })
    }
  }
  const onClickHex = (e: React.SyntheticEvent, hex: BoardHex) => {
    onClickBoardHex(e, hex)
  }

  const hexJSX = () => {
    return Object.values(boardHexes).map((hex: BoardHex, i) => {
      // During placement phase, player is overwriting units on hexes, in local state, but we wish to show that state for units
      const unitIdToShowOnHex = isPlacementPhase
        ? editingBoardHexes?.[hex.id]?.occupyingUnitID ?? ''
        : hex.occupyingUnitID
      const gameUnit = gameUnits?.[unitIdToShowOnHex]
      // we only show players their own units during placement phase
      const isShowableUnit =
        !isPlacementPhase || gameUnit?.playerID === playerID
      const gameUnitCard = selectGameCardByID(
        gameArmyCards,
        gameUnit?.gameCardID
      )
      const unitName = gameUnitCard?.singleName ?? ''
      const isUnitTail = isPlacementPhase
        ? editingBoardHexes?.[hex.id]?.isUnitTail
        : hex.isUnitTail
      return (
        <Hexagon
          key={i}
          hex={hex}
          onClick={onClickHex}
          className={hexClassNames(hex)}
        >
          <g>
            <AnimatePresence initial={false}>
              {gameUnit && isShowableUnit && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {(isUnitTail && (
                    <UnitTail hex={hex} iconPlayerID={gameUnit.playerID} />
                  )) || (
                    <UnitIcon
                      hexSize={hexSize}
                      armyCardID={gameUnit.armyCardID}
                      iconPlayerID={gameUnit.playerID}
                    />
                  )}
                </motion.g>
              )}
            </AnimatePresence>
            <HexIDText
              hexSize={hexSize}
              text={`${hex.id}`}
              textLine2={`${hex.altitude}`}
              // text={`${hex.altitude}`}
              // textLine2={`${unitName}`}
            />
          </g>
        </Hexagon>
      )
    })
  }
  return <>{hexJSX()}</>
}
