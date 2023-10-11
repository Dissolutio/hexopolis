import { Suspense } from 'react'
import { Gltf, useGLTF } from '@react-three/drei'
import { ModelLoader } from './ModelLoader'
import { cubeToPixel } from '../HexMap3D'

const modelAltitudeAdjustment = {
  agentCarrID: 1,
}

export function AgentCarrModel() {
  const hex = { q: 5, r: 9, s: -14, altitude: 4, id: '5,9,-14' }
  const pixel = cubeToPixel(hex)
  const { nodes, materials } = useGLTF('/sgt_drake_low_poly_colored.glb')
  return (
    <Suspense fallback={<ModelLoader />}>
      <group
        position={[
          pixel.x,
          hex.altitude / 4 + modelAltitudeAdjustment.agentCarrID,
          pixel.y,
        ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <Gltf
          src="/agent_carr_low_poly_colored_1.glb"
          receiveShadow
          castShadow
        />
      </group>
    </Suspense>
  )
}

useGLTF.preload('/agent_carr_low_poly_colored_1.glb')
