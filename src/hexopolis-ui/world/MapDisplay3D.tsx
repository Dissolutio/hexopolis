import { Vector3, BufferGeometry, Color, Line } from 'three'
import { giantsTableBoardHexes } from './giantsTable'
import { BoardHex, StringKeyedObj } from 'game/types'
import { ReactThreeFiber, extend } from '@react-three/fiber'

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

const HEX_RADIUS = 1
const HEX_SPACING = 1.01

export type HexCoordinates = {
  q: number
  r: number
  s: number
  id: string
}
export const cubeToPixel = (hex: HexCoordinates) => {
  const x = HEX_RADIUS * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r)
  const y = HEX_RADIUS * ((3 / 2) * hex.r)
  return { x: x * HEX_SPACING, y: y * HEX_SPACING }
}
const boardHexesArray = Object.values(giantsTableBoardHexes)
const hexTerrainColor: StringKeyedObj = {
  grass: '#60840d',
  water: '#3794fd',
  rock: '#475776',
  sand: '#ab8e10',
}
export function MapDisplay3D() {
  return (
    <>
      {boardHexesArray.map((bh) => {
        return <MapHex3D boardHex={bh as BoardHex} />
      })}
    </>
  )
}

const MapHex3D = ({ boardHex }: { boardHex: BoardHex }) => {
  const pixel = cubeToPixel(boardHex)
  const oneLevel = 0.5
  const halfLevel = 0.25
  const quarterLevel = 0.125
  // TODO: implement the subterrain beneath fluid terrains
  const heightScale = boardHex.altitude
  // water & fluid tiles will be a little thinner
  const hexTileHeight = boardHex.terrain === 'water' ? halfLevel : oneLevel
  const hexYAdjust = boardHex.terrain === 'water' ? quarterLevel : 0
  const meshYPosition = boardHex.altitude / 4 + hexYAdjust
  const topHeightRing = meshYPosition - boardHex.altitude / 2
  const bottomHeightRing = meshYPosition
  const heightRingsForThisHex = [] // no need to show top and bottom rings
  for (
    let index = bottomHeightRing - 0.5;
    index > topHeightRing;
    index -= 0.5
  ) {
    heightRingsForThisHex.push(index)
  }
  return (
    <group
      position={[
        pixel.x,
        boardHex.altitude / 4 + hexYAdjust,
        // 0,
        pixel.y,
      ]}
    >
      {/* These rings around the hex cylinder convey height levels to the user, so they can visually see how many levels of height between 2 adjacent hexes */}
      {heightRingsForThisHex.map((height) => (
        <HeightRing height={height} />
      ))}

      <mesh key={boardHex.id} scale={[1, heightScale, 1]}>
        <cylinderGeometry args={[1, 1, hexTileHeight, 6]} />
        <meshStandardMaterial
          color={new Color(hexTerrainColor[boardHex.terrain])}
        />
      </mesh>
    </group>
  )
}

const genPointsForHeightRing = (height: number) => {
  return [
    new Vector3(1, 0, height),
    new Vector3(0.5, Math.sqrt(3) / 2, height),
    new Vector3(-0.5, Math.sqrt(3) / 2, height),
    new Vector3(-1, 0, height),
    new Vector3(-0.5, -Math.sqrt(3) / 2, height),
    new Vector3(0.5, -Math.sqrt(3) / 2, height),
    new Vector3(1, 0, height),
  ]
}
const HeightRing = ({ height }: { height: number }) => {
  const points = genPointsForHeightRing(height)
  const lineGeometry = new BufferGeometry().setFromPoints(points)
  return (
    <line_ geometry={lineGeometry} rotation={[Math.PI / 2, 0, Math.PI / 6]}>
      <lineBasicMaterial
        attach="material"
        color={'black'}
        linewidth={1}
        linecap={'round'}
        linejoin={'round'}
      />
    </line_>
  )
}
