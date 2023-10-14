import { useGLTF } from '@react-three/drei'
import { cubeToPixel } from '../HexMap3D'
import { useState } from 'react'

// depending on how the model was facing, and how high above the ground it was, in the editor it was made in (Blender)
const modelAltitudeAdjustment = {
  syvarrisID: 2,
}
const initialAngleAdjustment = -(Math.PI * 2) / 3

export function SyvarrisModel() {
  const rotation = 0
  const totalRotation = initialAngleAdjustment + rotation * (Math.PI / 3)
  const hex = { q: 7, r: 9, s: -16, altitude: 4, id: '7,9,-16' }
  const pixel = cubeToPixel(hex)
  const { nodes, materials } = useGLTF('/syvarris_low_poly.glb')
  const [active, setActive] = useState(false)
  return (
    <group
      position={[
        pixel.x,
        hex.altitude / 4 + modelAltitudeAdjustment.syvarrisID,
        pixel.y,
      ]}
      rotation={[0, totalRotation, 0]}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned.geometry}
        material={materials.SandyWhiteSkin}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned_1.geometry}
        material={materials.Chainmail}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned_2.geometry}
        material={materials.ElfGreen}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned_3.geometry}
        material={materials.ElfBrown}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned_4.geometry}
        material={materials.ElfTan}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned_5.geometry}
        material={materials.ElfLtGreen}
      />
    </group>
  )
}

useGLTF.preload('/syvarris_low_poly.glb')
