import { useGLTF } from '@react-three/drei'
import { BoardHex } from 'game/types'

const initialAngleAdjustment = -(Math.PI * 3) / 6
export function SgtDrakeModel({ boardHex }: { boardHex: BoardHex }) {
  const { nodes, materials } = useGLTF('/sgt_drake_low_poly_colored.glb') as any
  return (
    <group dispose={null}>
      <group rotation={[0, initialAngleAdjustment, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_1.geometry}
          material={materials.SandyWhiteSkin}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_2.geometry}
          material={materials.ArmyDkGreen}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_3.geometry}
          material={materials.ArmyLtGreen}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_4.geometry}
          material={materials.ArmyLtBrown}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_5.geometry}
          material={materials.BrightRed}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_6.geometry}
          material={materials.Black}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_7.geometry}
          material={materials.Gold}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_8.geometry}
          material={materials.WoodBrown}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_9.geometry}
          material={materials.Gunmetal}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_10.geometry}
          material={materials.Blade}
        ></mesh>
      </group>
    </group>
  )
}

useGLTF.preload('/sgt_drake_low_poly_colored.glb')
