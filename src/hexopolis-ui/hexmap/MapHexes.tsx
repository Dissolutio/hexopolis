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
import { HexText } from './HexText'
import { UnitTail } from 'hexopolis-ui/unit-icons/UnitTail'

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
  const {
    isMyTurn,
    isPlacementPhase,
    isOrderMarkerPhase,
    isRoundOfPlayPhase,
    isAttackingStage,
  } = useBgioCtx()
  const { onClickPlacementHex, editingBoardHexes } = usePlacementContext()
  const {
    selectedUnitMoveRange,
    onClickTurnHex,
    revealedGameCard,
    revealedGameCardUnits,
    revealedGameCardUnitIDs,
  } = usePlayContext()

  // computed

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
      // we only show players their own units during placement phase
      const isShowableUnit =
        !isPlacementPhase || gameUnit?.playerID === playerID
      const gameUnitCard = selectGameCardByID(armyCards, gameUnit?.gameCardID)
      const unitName = gameUnitCard?.singleName ?? ''
      const isUnitTail = hex.isUnitTail
      const unitHeadHex = boardHexes[hex.unitHeadHexID]
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
                  {(isUnitTail && hex.unitHeadHexID && (
                    <UnitTail hexSize={hexSize} hex={hex} />
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
      <HexText
        hexSize={hexSize}
        className="maphex_altitude-text"
        y={hexSize * 0.6}
      >
        {text.toString()}
      </HexText>
      {textLine2 && (
        <HexText
          hexSize={hexSize}
          className="maphex_altitude-text"
          y={hexSize * 0.8}
        >
          {textLine2.toString()}
        </HexText>
      )}
    </>
  )
}
