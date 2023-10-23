import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../../OutlineHighlight'
import { GameUnit } from 'game/types'

export function MarroWarrior3({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes, materials } = useGLTF(
    '/marro_warrior_3_low_poly_colored.glb'
  ) as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_3001_1'].geometry}
        material={materials.MarroSkinYellow}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_3001_2'].geometry}
        material={materials.MarroLtGreen}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_3001_3'].geometry}
        material={materials.MarroOrange}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_3001_4'].geometry}
        material={materials.MarroLicorice}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_3001_5'].geometry}
        material={materials.MarroSageGreen}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

useGLTF.preload('/marro_warrior_3_low_poly_colored.glb')
