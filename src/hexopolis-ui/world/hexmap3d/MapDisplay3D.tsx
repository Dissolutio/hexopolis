import { BoardHex } from 'game/types'
import { useBgioClientInfo, useBgioCtx, useBgioG } from 'bgio-contexts'
import { MapHex3D } from './MapHex3D'
import { useSpecialAttackContext } from 'hexopolis-ui/contexts/special-attack-context'
import {
  useMapContext,
  usePlacementContext,
  usePlayContext,
  useUIContext,
} from 'hexopolis-ui/contexts'
import { selectGameCardByID } from 'game/selectors'
import { SyntheticEvent } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { GameUnit3D } from './GameUnit3D'

export function MapDisplay3D() {
  const {
    boardHexes,
    hexMap: { mapId },
  } = useBgioG()
  const hexArray = Object.values(boardHexes)
  return (
    <>
      {hexArray.map((bh) => {
        return (
          <Hex3D
            // TODO: multi-level hexes
            key={`${bh.id}-${bh.altitude}`}
            boardHex={bh as BoardHex}
          />
        )
      })}
    </>
  )
}

const Hex3D = ({ boardHex }: { boardHex: BoardHex }) => {
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

  const onClick = (event: ThreeEvent<MouseEvent>, sourceHex: BoardHex) => {
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
        // this is a weird splitting off to select a grenade hex, part of hacky GrenadeSA implementation
        isGrenadeSAStage &&
        explosionTargetableHexIDs.includes(sourceHex.id)
      ) {
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

  // computed
  const editingBoardHexUnitID =
    editingBoardHexes?.[boardHex.id]?.occupyingUnitID ?? ''
  const unitIdToShowOnHex =
    // order matters here
    isTheDropStage
      ? boardHex.occupyingUnitID || editingBoardHexUnitID
      : isPlacementPhase
      ? editingBoardHexUnitID
      : boardHex.occupyingUnitID
  const gameUnit = gameUnits?.[unitIdToShowOnHex]
  // we only show players their own units during placement phase
  const gameUnitCard = selectGameCardByID(gameArmyCards, gameUnit?.gameCardID)
  const unitName = gameUnitCard?.name ?? ''
  // const isGlyph = !!glyphs[hex.id]?.glyphID
  // computed
  // we only show players their own units during placement phase
  const isShowableUnit = !isPlacementPhase || gameUnit?.playerID === playerID
  const isUnitTail = isPlacementPhase
    ? editingBoardHexes?.[boardHex.id]?.isUnitTail
    : boardHex.isUnitTail

  // const isUnitAHeroOrMultiLife =
  //   gameUnitCard?.type.includes('hero') || (gameUnitCard?.life ?? 0) > 1
  // const unitLifePosition: Point = { x: hexSize * -0.6, y: 0 }

  return (
    <>
      <MapHex3D boardHex={boardHex} onClick={onClick} />
      {gameUnit && isShowableUnit ? (
        <GameUnit3D
          // onClick={onClick}
          gameUnit={gameUnit}
          boardHex={boardHex}
        />
      ) : (
        <></>
      )}
    </>
  )
}
