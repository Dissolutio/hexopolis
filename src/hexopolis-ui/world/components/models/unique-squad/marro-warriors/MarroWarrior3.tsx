import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../../OutlineHighlight'

export function MarroWarrior3({ highlightColor }: { highlightColor: string }) {
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
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_3001_2'].geometry}
        material={materials.MarroLtGreen}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_3001_3'].geometry}
        material={materials.MarroOrange}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_3001_4'].geometry}
        material={materials.MarroLicorice}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_3001_5'].geometry}
        material={materials.MarroSageGreen}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
    </>
  )
}

useGLTF.preload('/marro_warrior_3_low_poly_colored.glb')
