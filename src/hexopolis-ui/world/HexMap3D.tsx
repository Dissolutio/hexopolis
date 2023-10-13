import * as THREE from 'three'
import { giantsTableBoardHexes } from './giantsTable'
import { BoardHex, StringKeyedObj } from 'game/types'
import { Edges } from '@react-three/drei'

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
  const pixel = cubeToPixel(boardHex)
  const heightScale = boardHex.altitude === 0 ? 0.5 : boardHex.altitude // water, at 0 altitude, was rendering black darkness
  return (
    <mesh
      key={boardHex.id}
      position={[pixel.x, boardHex.altitude / 4, pixel.y]}
      scale={[1, heightScale, 1]}
    >
      <cylinderGeometry args={[1, 1, 0.5, 6]} />
      <meshToonMaterial
        color={new THREE.Color(hexTerrainColor[boardHex.terrain])}
      />
      <Edges
        scale={1.0}
        threshold={90} // Display edges only when the angle between two faces exceeds this value (default=15 degrees)
        color={new THREE.Color('black')}
      />
    </mesh>
  )
}