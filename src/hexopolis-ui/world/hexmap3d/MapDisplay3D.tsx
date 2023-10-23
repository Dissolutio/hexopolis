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
import { ThreeEvent } from '@react-three/fiber'
import { GameUnit3D } from './GameUnit3D'
import { Billboard, Text } from '@react-three/drei'
import { cubeToPixel } from 'game/hex-utils'

export function MapDisplay3D() {
  const { boardHexes } = useBgioG()
  const hexArray = Object.values(boardHexes)
  return (
    <>
      {hexArray.map((bh) => {
        return <Hex3D key={`${bh.id}-${bh.altitude}`} boardHexID={bh.id} />
      })}
    </>
  )
}

const Hex3D = ({ boardHexID }: { boardHexID: string }) => {
  const { playerID } = useBgioClientInfo()
  const {
    boardHexes,
    hexMap: { hexSize, glyphs },
    gameArmyCards,
    startZones,
    gameUnits,
    unitsMoved,
  } = useBgioG()
  const boardHex = boardHexes[boardHexID]
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
    // if (isDraftPhase) {
    // TODO: Select Units: should be able to click around units on map as ppl draft them
    // onClickPlacementHex?.(event, sourceHex)
    // }
    if (isPlacementPhase) {
      onClickPlacementHex?.(event, sourceHex)
    }
    // ROP
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
  const isUnitTail = isPlacementPhase
    ? editingBoardHexes?.[boardHex.id]?.isUnitTail
    : boardHex.isUnitTail
  const editingBoardHexUnitID = isUnitTail
    ? ''
    : editingBoardHexes?.[boardHex.id]?.occupyingUnitID ?? ''
  const unitIdToShowOnHex =
    // order matters here
    isTheDropStage
      ? //The Drop: uses the same editing state as placement phase, and player needs to see their Dropped units
        boardHex.occupyingUnitID || editingBoardHexUnitID
      : isPlacementPhase
      ? // in placement phase, we only show each player their editing state
        editingBoardHexUnitID
      : isUnitTail
      ? ''
      : boardHex.occupyingUnitID
  const gameUnit = gameUnits?.[unitIdToShowOnHex]
  const gameUnitCard = selectGameCardByID(gameArmyCards, gameUnit?.gameCardID)
  const unitName = gameUnitCard?.name ?? ''

  // we only show players their own units during placement phase
  const isShowableUnit = !isPlacementPhase || gameUnit?.playerID === playerID

  // const isGlyph = !!glyphs[hex.id]?.glyphID
  // computed
  // we only show players their own units during placement phase

  // const isUnitAHeroOrMultiLife =
  //   gameUnitCard?.type.includes('hero') || (gameUnitCard?.life ?? 0) > 1
  // const unitLifePosition: Point = { x: hexSize * -0.6, y: 0 }

  const pixel = cubeToPixel(boardHex)
  // world is flat on X-Z, and Y is altitude
  const positionX = pixel.x
  const positionZ = pixel.y
  const positionY = boardHex.altitude / 2
  const positionYHexText = positionY + 0.2
  return (
    <>
      <MapHex3D
        x={positionX}
        z={positionZ}
        boardHex={boardHex}
        onClick={onClick}
      />

      {/* <Billboard position={[positionX, positionYHexText, positionZ]}>
        <Text fontSize={0.1}>{boardHex.id}</Text>
      </Billboard> */}

      {gameUnit && isShowableUnit && !isUnitTail ? (
        <GameUnit3D
          gameUnit={gameUnit}
          boardHex={boardHex}
          x={positionX}
          z={positionZ}
        />
      ) : (
        <></>
      )}
    </>
  )
}
