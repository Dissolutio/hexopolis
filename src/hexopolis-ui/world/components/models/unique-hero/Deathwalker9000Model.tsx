import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../OutlineHighlight'
import { GameUnit } from 'game/types'

export function Deathwalker9000Model({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes, materials } = useGLTF('/d9000_low_poly_colored.glb') as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Deathwalker_9000_Scanned_1.geometry}
        material={materials.Black}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Deathwalker_9000_Scanned_2.geometry}
        material={materials.Silver}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Deathwalker_9000_Scanned_3.geometry}
        material={materials.BrightRed}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Deathwalker_9000_Scanned_4.geometry}
        material={materials.Silver}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Deathwalker_9000_Scanned_5.geometry}
        material={materials.BrightRed}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

useGLTF.preload('/d9000_low_poly_colored.glb')
