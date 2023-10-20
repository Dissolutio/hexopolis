import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../OutlineHighlight'

export function MimringModel({ highlightColor }: { highlightColor: string }) {
  const { nodes, materials } = useGLTF('/mimring_low_poly_colored.glb') as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mimring_Scanned.geometry}
        material={materials.CopperBrown}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mimring_Scanned_1.geometry}
        material={materials.DragonTongueRed}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mimring_Scanned_2.geometry}
        material={materials.DragonBone}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mimring_Scanned_3.geometry}
        material={materials.DragonGold}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
    </>
  )
}

useGLTF.preload('/mimring_low_poly_colored.glb')
