import { Vector3, BufferGeometry, Line, Color } from 'three'
import { ReactThreeFiber, extend } from '@react-three/fiber'
import { ONE_HEIGHT_LEVEL, hexTerrainColor } from './MapHex3D'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { transformMoveRangeToArraysOfIds } from 'game/constants'

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
  terrainForColor,
  isHighlighted,
  isInSafeMoveRange,
  isInEngageMoveRange,
  isInDisengageMoveRange,
}: {
  height: number
  top: number
  position: Vector3
  terrainForColor: string
  isHighlighted: boolean
  isInSafeMoveRange: boolean
  isInEngageMoveRange: boolean
  isInDisengageMoveRange: boolean
}) => {
  const points = genPointsForHeightRing(height)
  const lineGeometry = new BufferGeometry().setFromPoints(points)
  const isNotModified =
    !isHighlighted &&
    !isInSafeMoveRange &&
    !isInEngageMoveRange &&
    !isInDisengageMoveRange
  const getColor = () => {
    // The top ring receives all kinds of highlighting throughout the game
    if (height === top) {
      if (isHighlighted) {
        return 'white'
      }
      if (isInSafeMoveRange) {
        return new Color('#bad954')
      }
      if (isInEngageMoveRange) {
        return new Color('#e09628')
      }
      if (isInDisengageMoveRange) {
        return new Color('#e25328')
      } else {
        // top rings, if not modified, are gray to highlight the edge between hexes
        // or white, for light-colored terrain
        if (terrainForColor === 'sand' || terrainForColor === 'grass') {
          return new Color('lightGray')
        }
        return new Color('gray')
      }
    }
    // all non-top rings are as below:
    else return new Color(hexTerrainColor[terrainForColor])
  }
  return (
    <line_
      geometry={lineGeometry}
      position={position}
      rotation={[0, Math.PI / 6, 0]}
    >
      <lineBasicMaterial
        attach="material"
        transparent
        opacity={top === height && isNotModified ? 0.2 : 1.0}
        color={getColor()}
        linewidth={1}
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
