import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../OutlineHighlight'
import { GameUnit } from 'game/types'

export function SyvarrisModel({ gameUnit }: { gameUnit: GameUnit }) {
  // const totalRotation = initialAngleAdjustment + (rotation[1-6]) * (Math.PI / 3)
  const { nodes, materials } = useGLTF('/syvarris_low_poly.glb') as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned.geometry}
        material={materials.SandyWhiteSkin}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned_1.geometry}
        material={materials.Chainmail}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned_2.geometry}
        material={materials.ElfGreen}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned_3.geometry}
        material={materials.ElfBrown}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned_4.geometry}
        material={materials.ElfTan}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Syvarris_Scanned_5.geometry}
        material={materials.ElfLtGreen}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

useGLTF.preload('/syvarris_low_poly.glb')
