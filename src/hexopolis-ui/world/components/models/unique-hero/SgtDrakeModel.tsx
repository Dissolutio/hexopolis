import { useGLTF } from '@react-three/drei'
import React from 'react'
import { OutlineHighlight } from '../OutlineHighlight'

export function SgtDrakeModel({ highlightColor }: { highlightColor: string }) {
  const { nodes, materials } = useGLTF('/sgt_drake_low_poly_colored.glb') as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_1.geometry}
        material={materials.SandyWhiteSkin}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_2.geometry}
        material={materials.ArmyDkGreen}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_3.geometry}
        material={materials.ArmyLtGreen}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_4.geometry}
        material={materials.ArmyLtBrown}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_5.geometry}
        material={materials.BrightRed}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_6.geometry}
        material={materials.Black}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_7.geometry}
        material={materials.Gold}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_8.geometry}
        material={materials.WoodBrown}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_9.geometry}
        material={materials.Gunmetal}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_10.geometry}
        material={materials.Blade}
      >
        <OutlineHighlight highlightColor={highlightColor} />
      </mesh>
    </>
  )
}

useGLTF.preload('/sgt_drake_low_poly_colored.glb')
