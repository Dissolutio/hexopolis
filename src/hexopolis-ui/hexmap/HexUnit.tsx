import { motion, AnimatePresence } from 'framer-motion'

import { usePlacementContext } from '../contexts'
import { UnitIcon } from '../unit-icons/UnitIcon'
import { selectGameCardByID } from 'game/selectors'
import { BoardHex, Point } from 'game/types'
import { useBgioClientInfo, useBgioCtx, useBgioG } from 'bgio-contexts'
import { UnitTail } from 'hexopolis-ui/unit-icons/UnitTail'
import { HexGridCoordinate } from './HexGridCoordinate'
import { UnitLifeText } from './HexIDText'

export const MapHex = ({ hex }: { hex: BoardHex }) => {
  const { playerID } = useBgioClientInfo()
  const {
    hexMap: { hexSize },
    gameArmyCards,
    gameUnits,
  } = useBgioG()
  const { isPlacementPhase, isTheDropStage } = useBgioCtx()
  const { editingBoardHexes } = usePlacementContext()

  // computed
  const editingBoardHexUnitID =
    editingBoardHexes?.[hex.id]?.occupyingUnitID ?? ''
  const unitIdToShowOnHex =
    // order matters here
    isTheDropStage
      ? hex.occupyingUnitID || editingBoardHexUnitID
      : isPlacementPhase
      ? editingBoardHexUnitID
      : hex.occupyingUnitID
  const gameUnit = gameUnits?.[unitIdToShowOnHex]
  // we only show players their own units during placement phase
  const isShowableUnit = !isPlacementPhase || gameUnit?.playerID === playerID
  const gameUnitCard = selectGameCardByID(gameArmyCards, gameUnit?.gameCardID)
  const isUnitTail = isPlacementPhase
    ? editingBoardHexes?.[hex.id]?.isUnitTail
    : hex.isUnitTail
  const isUnitAHeroOrMultiLife =
    gameUnitCard?.type.includes('hero') || (gameUnitCard?.life ?? 0) > 1

  const unitLifePosition: Point = { x: hexSize * -0.6, y: 0 }

  return (
    <HexGridCoordinate hex={hex}>
      {/* UNIT ICON */}
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
      {gameUnitCard && isUnitAHeroOrMultiLife && !hex.isUnitTail && (
        <UnitLifeText
          unit={gameUnit}
          card={gameUnitCard}
          hexSize={hexSize}
          position={unitLifePosition}
        />
      )}
    </HexGridCoordinate>
  )
}
