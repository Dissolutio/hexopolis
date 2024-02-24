import { MapHex3D } from './MapHex3D'
import { staticMap } from './static-map'
import { BoardHex, BoardHexes } from 'game/types'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, Stars, Stats } from '@react-three/drei'
import { cubeToPixel } from 'game/hex-utils'

const boardHexesArray = Object.values(staticMap)

export function StaticMap({ boardHexes }: { boardHexes?: BoardHexes }) {
  const hexArray = boardHexes ? Object.values(boardHexes) : boardHexesArray
  return (
    <>
      {hexArray.map((bh) => {
        const pixel = cubeToPixel(bh)
        // world is flat on X-Z, and Y is altitude
        const positionX = pixel.x
        const positionZ = pixel.y
        return (
          <MapHex3D
            key={`${bh.id}${bh.altitude}`}
            x={positionX}
            z={positionZ}
            boardHex={bh as BoardHex}
          />
        )
      })}
    </>
  )
}
