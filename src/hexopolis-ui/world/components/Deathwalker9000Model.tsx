import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from './models/OutlineHighlight'

export function Deathwalker9000Model({
  highlightColor,
}: {
  highlightColor: string
}) {
  const { nodes, materials } = useGLTF('/d9000_low_poly_colored.glb') as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Deathwalker_9000_Scanned_1.geometry}
        material={materials.Black}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Deathwalker_9000_Scanned_2.geometry}
        material={materials.Silver}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Deathwalker_9000_Scanned_3.geometry}
        material={materials.BrightRed}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Deathwalker_9000_Scanned_4.geometry}
        material={materials.Silver}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Deathwalker_9000_Scanned_5.geometry}
        material={materials.BrightRed}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
    </>
  )
}

useGLTF.preload('/d9000_low_poly_colored.glb')
