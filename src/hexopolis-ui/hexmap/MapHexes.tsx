import React, { SyntheticEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import {
  useUIContext,
  useMapContext,
  usePlacementContext,
  usePlayContext,
} from '../contexts'
import { UnitIcon } from '../unit-icons/UnitIcon'
import { selectGameCardByID, selectValidTailHexes } from 'game/selectors'
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

type MapHexesProps = {
  hexSize: number
}

export const MapHexes = ({ hexSize }: MapHexesProps) => {
  const { playerID } = useBgioClientInfo()
  const { boardHexes, gameArmyCards, startZones, gameUnits, unitsMoved } =
    useBgioG()
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
  } = useBgioCtx()
  const {
    onClickPlacementHex,
    editingBoardHexes,
    activeTailPlacementUnitID,
    tailPlaceables,
  } = usePlacementContext()
  const {
    selectedUnitMoveRange,
    selectedUnitAttackRange,
    onClickTurnHex,
    revealedGameCard,
    revealedGameCardUnits,
    revealedGameCardUnitIDs,
    clonerHexIDs,
    clonePlaceableHexIDs,
  } = usePlayContext()

  // computed
  const startZoneForMy2HexUnits = startZones[playerID].filter((sz) => {
    return selectValidTailHexes(sz, boardHexes).length > 0
  })
  // handlers
  const onClickBoardHex = (event: SyntheticEvent, sourceHex: BoardHex) => {
    if (isPlacementPhase) {
      onClickPlacementHex?.(event, sourceHex)
    }
    if (isRoundOfPlayPhase) {
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
        selectedMapHex,
        hex,
      })
    }
    if (isRoundOfPlayPhase) {
      return calcRopHexClassNames({
        selectedUnitID,
        hex,
        playerID,
        revealedGameCard,
        revealedGameCardUnits,
        revealedGameCardUnitIDs,
        isMyTurn,
        isAttackingStage,
        isMovementStage,
        isWaterCloneStage,
        boardHexes,
        gameUnits,
        gameArmyCards,
        unitsMoved,
        selectedUnitMoveRange,
        selectedUnitAttackRange,
        clonerHexIDs,
        clonePlaceableHexIDs,
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
              // text={`${hex.id}`}
              // textLine2={`${hex.altitude}`}
              text={`${hex.altitude}`}
              textLine2={`${unitName}`}
            />
          </g>
        </Hexagon>
      )
    })
  }
  return <>{hexJSX()}</>
}
