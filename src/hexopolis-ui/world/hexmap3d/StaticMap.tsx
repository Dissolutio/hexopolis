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

export const StyledFullScreenWorld = () => {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        id="canvas-container"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Canvas>
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          <ambientLight intensity={1} />
          <directionalLight position={[150, 150, 150]} intensity={1} />
          <Stats />
          <Stage>
            <StaticMap />
          </Stage>
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  )
}
