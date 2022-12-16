import React, { SyntheticEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text } from 'react-hexgrid'

import {
  useUIContext,
  useMapContext,
  usePlacementContext,
  usePlayContext,
} from '../contexts'
import { UnitIcon } from '../unit-icons/UnitIcon'
import { generateBlankMoveRange } from 'game/constants'
import { selectGameCardByID } from 'game/selectors'
import { BoardHex } from 'game/types'
import { useBgioClientInfo, useBgioCtx, useBgioG } from 'bgio-contexts'
import {
  calcPlacementHexClassNames,
  calcRopHexClassNames,
} from './calcHexClassNames'
import Hexagon from './Hexagon'

type MapHexesProps = {
  hexSize: number
}

export const MapHexes = ({ hexSize }: MapHexesProps) => {
  const { playerID } = useBgioClientInfo()
  const {
    boardHexes,
    gameArmyCards: armyCards,
    startZones,
    gameUnits,
    unitsMoved,
  } = useBgioG()
  const { selectedUnitID } = useUIContext()
  const { selectedMapHex } = useMapContext()
  const { isMyTurn, isPlacementPhase, isRoundOfPlayPhase, isAttackingStage } =
    useBgioCtx()
  const { onClickPlacementHex, editingBoardHexes } = usePlacementContext()
  const {
    onClickTurnHex,
    selectedUnit,
    revealedGameCard,
    revealedGameCardUnits,
    revealedGameCardUnitIDs,
  } = usePlayContext()

  // computed
  const selectedUnitMoveRange =
    selectedUnit?.moveRange ?? generateBlankMoveRange()

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
        hex,
        startZones,
        playerID,
        editingBoardHexes,
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
        boardHexes,
        gameUnits,
        unitsMoved,
        selectedUnitMoveRange,
      })
    }
  }
  const onClickHex = (e: React.SyntheticEvent, source: any) => {
    const boardHex = source.data as BoardHex
    onClickBoardHex(e, boardHex)
  }

  const hexJSX = () => {
    return Object.values(boardHexes).map((hex: BoardHex, i) => {
      // During placement phase, player is overwriting units on hexes, in local state, but we wish to show that state for units
      const unitIdToShowOnHex = isPlacementPhase
        ? editingBoardHexes?.[hex.id] ?? ''
        : hex.occupyingUnitID
      const gameUnit = gameUnits?.[unitIdToShowOnHex]
      const isShowableUnit =
        !isPlacementPhase || gameUnit?.playerID === playerID
      const gameUnitCard = selectGameCardByID(armyCards, gameUnit?.gameCardID)
      const unitName = gameUnitCard?.singleName ?? ''
      return (
        <Hexagon
          key={i}
          q={hex.q}
          r={hex.r}
          s={hex.s}
          data={hex}
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
                  <UnitIcon
                    hexSize={hexSize}
                    armyCardID={gameUnit.armyCardID}
                    iconPlayerID={gameUnit.playerID}
                  />
                </motion.g>
              )}
            </AnimatePresence>
            {isPlacementPhase && (
              <HexIDText
                hexSize={hexSize}
                text={`${hex.altitude}`}
                textLine2={`${unitName}`}
              />
            )}
            {!isPlacementPhase && !!unitName && (
              <HexIDText hexSize={hexSize} text={unitName} />
            )}
          </g>
        </Hexagon>
      )
    })
  }
  return <>{hexJSX()}</>
}
const HexIDText = ({
  hexSize,
  text,
  textLine2,
}: {
  hexSize: number
  text: string
  textLine2?: string
}) => {
  return (
    <>
      <Text className="maphex_altitude-text" y={hexSize * 0.6}>
        {text.toString()}
      </Text>
      {textLine2 && (
        <Text className="maphex_altitude-text" y={hexSize * 0.8}>
          {textLine2.toString()}
        </Text>
      )}
    </>
  )
}
