import { Vector3, BufferGeometry, Color, Line } from 'three'
import { giantsTableBoardHexes } from './giantsTable'
import { BoardHex, StringKeyedObj } from 'game/types'
import { Edges } from '@react-three/drei'
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
export function HexMap3D() {
  return (
    <>
      {boardHexesArray.map((bh) => {
        return <MapHex3D boardHex={bh as BoardHex} />
      })}
    </>
  )
}

const MapHex3D = ({ boardHex }: { boardHex: BoardHex }) => {
  const genPointsForHeightRing = (height: number) => {
    return [
      new Vector3(1, 0, 0),
      new Vector3(0.5, Math.sqrt(3) / 2, 0),
      new Vector3(-0.5, Math.sqrt(3) / 2, 0),
      new Vector3(-1, 0, 0),
      new Vector3(-0.5, -Math.sqrt(3) / 2, 0),
      new Vector3(0.5, -Math.sqrt(3) / 2, 0),
      new Vector3(1, 0, 0),
    ]
  }
  const points = [
    new Vector3(1, 0, 0),
    new Vector3(0.5, Math.sqrt(3) / 2, 0),
    new Vector3(-0.5, Math.sqrt(3) / 2, 0),
    new Vector3(-1, 0, 0),
    new Vector3(-0.5, -Math.sqrt(3) / 2, 0),
    new Vector3(0.5, -Math.sqrt(3) / 2, 0),
    new Vector3(1, 0, 0),
  ]
  const lineGeometry = new BufferGeometry().setFromPoints(points)
  const pixel = cubeToPixel(boardHex)
  const heightScale = boardHex.altitude === 0 ? 1 : boardHex.altitude // water, at 0 altitude, was rendering black darkness
  const heightRingsForThisHex = [lineGeometry]
  // fluid tiles will be a little thinner
  const hexTileHeight = boardHex.terrain === 'water' ? 0.25 : 0.5
  // also, because fluid tiles technically county as the height BELOW them, they are boosted up to render their bottom on the ground of their level
  const hexYAdjust = boardHex.terrain === 'water' ? -0.125 : 0
  return (
    <group
      position={[
        pixel.x,
        boardHex.altitude / 4 + hexYAdjust,
        // 0,
        pixel.y,
      ]}
    >
      {heightRingsForThisHex.map((hexLineGeometry) => (
        <line_
          geometry={hexLineGeometry}
          rotation={[Math.PI / 2, 0, Math.PI / 6]}
        >
          <lineBasicMaterial
            attach="material"
            color={'white'}
            linewidth={1}
            linecap={'round'}
            linejoin={'round'}
          />
        </line_>
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
