import { Vector3, BufferGeometry, Line, Color } from 'three'
import { ReactThreeFiber, extend } from '@react-three/fiber'
import { ONE_HEIGHT_LEVEL, hexTerrainColor } from './MapHex3D'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { transformMoveRangeToArraysOfIds } from 'game/constants'
import { useBgioCtx, useBgioG } from 'bgio-contexts'
import { playerColors } from 'hexopolis-ui/theme'

export const HeightRings = ({
  bottomRingYPos,
  topRingYPos,
  position,
  terrainForColor,
  boardHexID,
  isHighlighted,
}: // isInSafeMoveRange,
// isInEngageMoveRange,
// isInDisengageMoveRange,
{
  bottomRingYPos: number
  topRingYPos: number
  position: Vector3
  terrainForColor: string
  boardHexID: string
  isHighlighted: boolean
  // isInSafeMoveRange: boolean
  // isInEngageMoveRange: boolean
  // isInDisengageMoveRange: boolean
}) => {
  const { selectedUnitMoveRange } = usePlayContext()
  const {
    safeMoves,
    engageMoves,
    dangerousMoves: disengageMoves,
  } = transformMoveRangeToArraysOfIds(selectedUnitMoveRange)
  const isInSafeMoveRange = safeMoves?.includes(boardHexID)
  const isInEngageMoveRange = engageMoves?.includes(boardHexID)
  const isInDisengageMoveRange = disengageMoves?.includes(boardHexID)
  const heightRingsForThisHex = genHeightRings(topRingYPos, bottomRingYPos)
  return (
    <>
      {heightRingsForThisHex.map((height) => (
        <HeightRing
          key={`${boardHexID}${height}`}
          position={position}
          height={height}
          top={topRingYPos}
          terrainForColor={terrainForColor}
          boardHexID={boardHexID}
          isHighlighted={isHighlighted}
          isInSafeMoveRange={isInSafeMoveRange}
          isInEngageMoveRange={isInEngageMoveRange}
          isInDisengageMoveRange={isInDisengageMoveRange}
        />
      ))}
    </>
  )
}

// this extension for line_ is because, if we just use <line></line> then we get an error:
// Property 'geometry' does not exist on type 'SVGProps<SVGLineElement>'
// So, following advice found in issue: https://github.com/pmndrs/react-three-fiber/discussions/1387
extend({ Line_: Line })
declare global {
  namespace JSX {
    interface IntrinsicElements {
      line_: ReactThreeFiber.Object3DNode<Line, typeof Line>
    }
  }
}

const HeightRing = ({
  height,
  top,
  position,
  boardHexID,
  terrainForColor,
  isHighlighted,
  isInSafeMoveRange,
  isInEngageMoveRange,
  isInDisengageMoveRange,
}: {
  height: number
  top: number
  position: Vector3
  boardHexID: string
  terrainForColor: string
  isHighlighted: boolean
  isInSafeMoveRange: boolean
  isInEngageMoveRange: boolean
  isInDisengageMoveRange: boolean
}) => {
  const {
    boardHexes,
    hexMap: { hexSize, glyphs },
    gameArmyCards,
    startZones,
    gameUnits,
    unitsMoved,
  } = useBgioG()
  const {
    gameover,
    isWaitingForPlayersToJoin,
    isMyTurn,
    isDraftPhase,
    isOrderMarkerPhase,
    isPlacementPhase,
    isTheDropStage,
    isIdleTheDropStage,
    isRoundOfPlayPhase,
    isGameover,
  } = useBgioCtx()
  const points = genPointsForHeightRing(height)
  const lineGeometry = new BufferGeometry().setFromPoints(points)
  const getLineStyle = () => {
    // The top ring receives all kinds of highlighting throughout the game, and a different color than the other rings
    if (height === top) {
      if (isHighlighted) {
        return { color: 'white', opacity: 1, lineWidth: 2 }
      }
      if (isPlacementPhase) {
        if ((startZones?.['0'] ?? []).includes(boardHexID)) {
          return {
            color: new Color(playerColors['0']),
            opacity: 1,
            lineWidth: 5,
          }
        }
        if ((startZones?.['1'] ?? []).includes(boardHexID)) {
          return {
            color: new Color(playerColors['1']),
            opacity: 1,
            lineWidth: 5,
          }
        }
        if ((startZones?.['2'] ?? []).includes(boardHexID)) {
          return {
            color: new Color(playerColors['2']),
            opacity: 1,
            lineWidth: 5,
          }
        }
        if ((startZones?.['3'] ?? []).includes(boardHexID)) {
          return {
            color: new Color(playerColors['3']),
            opacity: 1,
            lineWidth: 5,
          }
        }
        if ((startZones?.['4'] ?? []).includes(boardHexID)) {
          return {
            color: new Color(playerColors['4']),
            opacity: 1,
            lineWidth: 5,
          }
        }
        if ((startZones?.['5'] ?? []).includes(boardHexID)) {
          return {
            color: new Color(playerColors['5']),
            opacity: 1,
            lineWidth: 5,
          }
        }
      }
      if (isRoundOfPlayPhase) {
        if (isInSafeMoveRange) {
          return { color: new Color('#bad954'), opacity: 1, lineWidth: 5 }
        }
        if (isInEngageMoveRange) {
          return { color: new Color('#e09628'), opacity: 1, lineWidth: 5 }
        }
        if (isInDisengageMoveRange) {
          return { color: new Color('#e25328'), opacity: 1, lineWidth: 5 }
        }
      }
      // NONE OF ABOVE, THEN:
      // top rings, if not modified, are gray to highlight the edge between hexes
      // or white, for light-colored terrain
      if (terrainForColor === 'sand' || terrainForColor === 'grass') {
        return { color: new Color('lightGray'), opacity: 0.2, lineWidth: 1 }
      }
      return { color: new Color('gray'), opacity: 0.2, lineWidth: 1 }
    }
    // all non-top rings are as below:
    else
      return {
        color: new Color(hexTerrainColor[terrainForColor]),
        opacity: 1,
        lineWidth: 1,
      }
  }
  const { color, opacity, lineWidth } = getLineStyle()
  return (
    <line_
      geometry={lineGeometry}
      position={position}
      rotation={[0, Math.PI / 6, 0]}
    >
      <lineBasicMaterial
        attach="material"
        transparent
        opacity={opacity}
        color={color}
        linewidth={lineWidth}
        linecap={'round'}
        linejoin={'round'}
      />
    </line_>
  )
}

const genPointsForHeightRing = (height: number) => {
  // our World renders where the map is flat along the X,Z axes, and the negative-Y is out of the screen
  return [
    new Vector3(1.0, height, 0),
    new Vector3(0.5, height, Math.sqrt(3) / 2),
    new Vector3(-0.5, height, Math.sqrt(3) / 2),
    new Vector3(-1.0, height, 0),
    new Vector3(-0.5, height, -Math.sqrt(3) / 2),
    new Vector3(0.5, height, -Math.sqrt(3) / 2),
    new Vector3(1.0, height, 0),
  ]
}

const genHeightRings = (top: number, bottom: number) => {
  const rings: number[] = [top] // no need to show bottom/top rings
  for (
    let index = bottom + ONE_HEIGHT_LEVEL;
    index < top;
    index += ONE_HEIGHT_LEVEL
  ) {
    rings.push(index)
  }
  return rings
}
