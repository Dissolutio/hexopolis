import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../OutlineHighlight'
import { GameUnit } from 'game/types'

export function MimringModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes, materials } = useGLTF('/mimring_low_poly_colored.glb') as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mimring_Scanned.geometry}
        material={materials.CopperBrown}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mimring_Scanned_1.geometry}
        material={materials.DragonTongueRed}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mimring_Scanned_2.geometry}
        material={materials.DragonBone}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mimring_Scanned_3.geometry}
        material={materials.DragonGold}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

useGLTF.preload('/mimring_low_poly_colored.glb')
