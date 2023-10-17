import { useGLTF } from '@react-three/drei'
import { cubeToPixel } from 'game/hex-utils'
import { BoardHex } from 'game/types'
import { useState } from 'react'

// depending on how the model was facing, and how high above the ground it was, in the editor it was made in (Blender), it may require adjusting
const initialAngleAdjustment = -(Math.PI * 2) / 3
export function SyvarrisModel({ boardHex }: { boardHex: BoardHex }) {
  const rotation = 0
  const totalRotation = initialAngleAdjustment + rotation * (Math.PI / 3)
  const pixel = cubeToPixel(boardHex)
  const { nodes, materials } = useGLTF('/syvarris_low_poly.glb') as any
  return (
    <group
      position={[pixel.x, boardHex.altitude / 2, pixel.y]}
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
