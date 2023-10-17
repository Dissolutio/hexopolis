import { useGLTF } from '@react-three/drei'
import { cubeToPixel } from 'game/hex-utils'

const modelAltitudeAdjustment = {
  sgtDrakeRotvId: 1.5,
}
const initialAngleAdjustment = -(Math.PI * 3) / 6
export function SgtDrakeModel(props) {
  const hex = { q: 4, r: 9, s: -13, altitude: 4, id: '4,9,-13' }
  const pixel = cubeToPixel(hex)
  const { nodes, materials } = useGLTF('/sgt_drake_low_poly_colored.glb')
  return (
    <group {...props} dispose={null}>
      <group
        position={[
          pixel.x,
          hex.altitude / 4 + modelAltitudeAdjustment.sgtDrakeRotvId,
          pixel.y,
        ]}
        rotation={[0, initialAngleAdjustment, 0]}
      >
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
