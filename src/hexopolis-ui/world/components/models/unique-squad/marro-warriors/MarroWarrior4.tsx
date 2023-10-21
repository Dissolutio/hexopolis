import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../../OutlineHighlight'

export function MarroWarrior4({ highlightColor }: { highlightColor: string }) {
  const { nodes, materials } = useGLTF(
    '/marro_warrior_4_low_poly_colored.glb'
  ) as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_4_Scanned_1'].geometry}
        material={materials.MarroSkinYellow}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_4_Scanned_2'].geometry}
        material={materials.MarroLtGreen}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_4_Scanned_3'].geometry}
        material={materials.MarroSageGreen}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_4_Scanned_4'].geometry}
        material={materials.MarroLicorice}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Marro_Warriors_-_4_Scanned_5'].geometry}
        material={materials.MarroOrange}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
    </>
  )
}

useGLTF.preload('/marro_warrior_4_low_poly_colored.glb')