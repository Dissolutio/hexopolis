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
  const { boardHexes, armyCards, startZones, gameUnits } = useBgioG()
  const { selectedUnitID } = useUIContext()
  const { selectedMapHex } = useMapContext()
  const { ctx } = useBgioCtx()
  const { onClickPlacementHex, editingBoardHexes } = usePlacementContext()
  const {
    onClickTurnHex,
    selectedUnit,
    revealedGameCard,
    revealedGameCardUnits,
    revealedGameCardUnitIDs,
  } = usePlayContext()

  const { isMyTurn, isPlacementPhase, isRoundOfPlayPhase, isAttackingStage } =
    ctx

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
        revealedGameCardUnits,
        revealedGameCardUnitIDs,
        isMyTurn,
        isAttackingStage,
        revealedGameCard,
        boardHexes,
        gameUnits,
        selectedUnitMoveRange,
      })
    }
  }
  const onClickHex = (e: React.SyntheticEvent, source: any) => {
    console.log('🚀 ~ file: MapHexes.tsx:87 ~ onClickHex ~ source', source)
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
      const onClickIcon: React.MouseEventHandler<SVGElement> = (event) => {
        event.stopPropagation()
        console.log('clicked icon')
      }
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
            <AnimatePresence>
              {gameUnit && isShowableUnit && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <UnitIcon
                    onClick={onClickIcon}
                    hexSize={hexSize}
                    armyCardID={gameUnit.armyCardID}
                    iconPlayerID={gameUnit.playerID}
                  />
                </motion.g>
              )}
            </AnimatePresence>
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
