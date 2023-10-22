import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../../OutlineHighlight'
import { GameUnit } from 'game/types'

export function MarroWarrior2({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes, materials } = useGLTF(
    '/marro_warrior_2_low_poly_colored.glb'
  ) as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_2_Scanned_1'].geometry}
        material={materials.MarroSkinYellow}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_2_Scanned_2'].geometry}
        material={materials.MarroLtGreen}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_2_Scanned_3'].geometry}
        material={materials.MarroOrange}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_2_Scanned_4'].geometry}
        material={materials.MarroSageGreen}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_2_Scanned_5'].geometry}
        material={materials.MarroLicorice}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

useGLTF.preload('/marro_warrior_2_low_poly_colored.glb')
