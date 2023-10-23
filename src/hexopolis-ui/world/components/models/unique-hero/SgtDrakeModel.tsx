import { useGLTF } from '@react-three/drei'
import React from 'react'
import { OutlineHighlight } from '../OutlineHighlight'
import { GameUnit } from 'game/types'

export function SgtDrakeModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes, materials } = useGLTF('/sgt_drake_low_poly_colored.glb') as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_1.geometry}
        material={materials.SandyWhiteSkin}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_2.geometry}
        material={materials.ArmyDkGreen}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_3.geometry}
        material={materials.ArmyLtGreen}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_4.geometry}
        material={materials.ArmyLtBrown}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_5.geometry}
        material={materials.BrightRed}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_6.geometry}
        material={materials.Black}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_7.geometry}
        material={materials.Gold}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_8.geometry}
        material={materials.WoodBrown}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_9.geometry}
        material={materials.Gunmetal}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sgt_Drake_Alexander_Scanned_10.geometry}
        material={materials.Blade}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

useGLTF.preload('/sgt_drake_low_poly_colored.glb')
