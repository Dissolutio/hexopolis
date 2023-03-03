import { motion, AnimatePresence } from 'framer-motion'
import { SyntheticEvent } from 'react'

import {
  useUIContext,
  useMapContext,
  usePlacementContext,
  usePlayContext,
} from '../contexts'
import { selectGameCardByID } from 'game/selectors'
import { BoardHex, Point } from 'game/types'
import { useBgioClientInfo, useBgioCtx, useBgioG } from 'bgio-contexts'
import {
  calcDraftAndPlacementHexClassNames,
  calcOrderMarkerHexClassNames,
  calcRopHexClassNames,
} from './calcHexClassNames'
import { HexIDText, UnitLifeText } from './HexIDText'
import { useSpecialAttackContext } from 'hexopolis-ui/contexts/special-attack-context'
import { GlyphDisplay } from './GlyphDisplay'
import { HexGridCoordinate } from './HexGridCoordinate'
import { useLayoutContext } from './HexgridLayout'
import { UnitTail } from 'hexopolis-ui/unit-icons/UnitTail'
import { UnitIcon } from 'hexopolis-ui/unit-icons'

export const MapHex = ({ hex }: { hex: BoardHex }) => {
  const { playerID } = useBgioClientInfo()
  const {
    boardHexes,
    hexMap: { hexSize, glyphs },
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
    isDraftPhase,
    isPlacementPhase,
    isOrderMarkerPhase,
    isTheDropStage,
    isIdleTheDropStage,
    isRoundOfPlayPhase,
    isAttackingStage,
    isMovementStage,
    isWaterCloneStage,
    isChompStage,
    isMindShackleStage,
    isFireLineSAStage,
    isExplosionSAStage,
    isGrenadeSAStage,
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
    currentTurnGameCardID,
    clonerHexIDs,
    clonePlaceableHexIDs,
    theDropPlaceableHexIDs,
  } = usePlayContext()
  const {
    selectSpecialAttack,
    fireLineTargetableHexIDs,
    fireLineAffectedHexIDs,
    fireLineSelectedHexIDs,
    explosionTargetableHexIDs,
    explosionAffectedHexIDs,
    explosionAffectedUnitIDs,
    explosionSelectedUnitIDs,
    chompableHexIDs,
    chompSelectedHexIDs,
    mindShackleTargetableHexIDs,
    mindShackleSelectedHexIDs,
  } = useSpecialAttackContext()
  // handlers
  const onClick = (event: SyntheticEvent, sourceHex: BoardHex) => {
    if (isPlacementPhase) {
      onClickPlacementHex?.(event, sourceHex)
    }
    if (isPlacementPhase) {
      onClickPlacementHex?.(event, sourceHex)
    }
    if (isTheDropStage) {
      onClickTurnHex?.(event, sourceHex)
    }

    if (isFireLineSAStage) {
      if (fireLineTargetableHexIDs.includes(sourceHex.id)) {
        selectSpecialAttack(sourceHex.id)
      }
    } else if (isMindShackleStage) {
      if (mindShackleTargetableHexIDs.includes(sourceHex.id)) {
        selectSpecialAttack(sourceHex.id)
      }
    } else if (isChompStage) {
      if (chompableHexIDs.includes(sourceHex.id)) {
        selectSpecialAttack(sourceHex.id)
      }
    } else if (isExplosionSAStage) {
      if (explosionTargetableHexIDs.includes(sourceHex.id)) {
        selectSpecialAttack(sourceHex.id)
      }
    } else if (isRoundOfPlayPhase) {
      if (
        isGrenadeSAStage &&
        explosionTargetableHexIDs.includes(sourceHex.id)
      ) {
        // this is a weird splitting off to select a grenade hex, part of hacky GrenadeSA implementation
        selectSpecialAttack(sourceHex.id)
      } else {
        // if we clicked a grenade unit, we need to deselect the attack (if any) of the previously selected grenade unit, but still let the onClick pass thru to select the new unit
        if (
          isGrenadeSAStage &&
          sourceHex.occupyingUnitID !== selectedUnitID &&
          gameUnits[sourceHex.occupyingUnitID]?.gameCardID ===
            currentTurnGameCardID
        ) {
          selectSpecialAttack('')
        }
        onClickTurnHex?.(event, sourceHex)
      }
    }
  }
  // classnames
  const hexClassNames = (hex: BoardHex) => {
    if (isPlacementPhase || isDraftPhase) {
      return calcDraftAndPlacementHexClassNames({
        hex,
        selectedMapHex,
        selectedUnitID,
        selectedUnitIs2Hex,
        startZones,
        startZoneForMy2HexUnits,
        playerID,
        editingBoardHexes,
        activeTailPlacementUnitID,
        tailPlaceables,
      })
    }
    if (isTheDropStage || isIdleTheDropStage) {
      return calcOrderMarkerHexClassNames({
        hex,
        theDropPlaceableHexIDs,
      })
    }
    if (isOrderMarkerPhase) {
      return calcOrderMarkerHexClassNames({
        hex,
      })
    }
    if (isRoundOfPlayPhase) {
      return calcRopHexClassNames({
        hex,
        selectedUnitID,
        revealedGameCardUnits,
        revealedGameCardUnitIDs,
        isMyTurn,
        isAttackingStage,
        isMovementStage,
        isWaterCloneStage,
        isChompStage,
        isMindShackleStage,
        isFireLineSAStage,
        isExplosionSAStage,
        isGrenadeSAStage,
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
        explosionAffectedHexIDs,
        explosionAffectedUnitIDs,
        explosionSelectedUnitIDs,
      })
    }
  }
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
  const gameUnitCard = selectGameCardByID(gameArmyCards, gameUnit?.gameCardID)
  const unitName = gameUnitCard?.singleName ?? ''
  const isGlyph = !!glyphs[hex.id]?.glyphID
  // computed
  // we only show players their own units during placement phase
  const isShowableUnit = !isPlacementPhase || gameUnit?.playerID === playerID
  const isUnitTail = isPlacementPhase
    ? editingBoardHexes?.[hex.id]?.isUnitTail
    : hex.isUnitTail
  const isUnitAHeroOrMultiLife =
    gameUnitCard?.type.includes('hero') || (gameUnitCard?.life ?? 0) > 1

  const unitLifePosition: Point = { x: hexSize * -0.6, y: 0 }

  const { points } = useLayoutContext()
  return (
    <HexGridCoordinate hex={hex} onClick={onClick}>
      <polygon
        points={points}
        className={`base-maphex ${hexClassNames(hex)}`}
      />
      {/* Hex text */}
      <HexIDText
        hexSize={hexSize}
        text={`${hex.id}`}
        textLine2={`${hex.altitude}`}
        // text={`${hex.altitude}`}
        // only show unit name on head-hex
        // textLine2={!hex.isUnitTail ? `${unitName}` : ''}
      />
      {/* Glyph display */}
      <GlyphDisplay hex={hex} />
      {/* Unit icon */}
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

      {/* Unit life text */}
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
