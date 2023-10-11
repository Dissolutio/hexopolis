import { Edges, Outlines, useGLTF } from '@react-three/drei'
import { cubeToPixel } from '../HexMap3D'

const modelAltitudeAdjustment = {
  sgtDrakeRotvId: 1,
}

export function SgtDrakeModel(props) {
  const hex = { q: 4, r: 9, s: -13, altitude: 4, id: '4,9,-13' }
  const pixel = cubeToPixel(hex)
  const { nodes, materials } = useGLTF('/sgt_drake_low_poly_colored.glb')
  console.log('🚀 ~ file: SgtDrakeModel.jsx:12 ~ SgtDrakeModel ~ nodes:', nodes)
  return (
    <group {...props} dispose={null}>
      <group
        position={[
          pixel.x,
          hex.altitude / 4 + modelAltitudeAdjustment.sgtDrakeRotvId,
          pixel.y,
        ]}
        rotation={[0, Math.PI, 0]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_1.geometry}
          material={materials.SandyWhiteSkin}
        >
          <Outlines thickness={0.05} color="hotpink" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_2.geometry}
          material={materials.ArmyDkGreen}
        >
          <Outlines thickness={0.05} color="hotpink" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_3.geometry}
          material={materials.ArmyLtGreen}
        >
          <Outlines thickness={0.05} color="hotpink" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_4.geometry}
          material={materials.ArmyLtBrown}
        >
          <Outlines thickness={0.05} color="hotpink" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_5.geometry}
          material={materials.BrightRed}
        >
          <Outlines thickness={0.05} color="hotpink" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_6.geometry}
          material={materials.Black}
        >
          <Outlines thickness={0.05} color="hotpink" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_7.geometry}
          material={materials.Gold}
        >
          <Outlines thickness={0.05} color="hotpink" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_8.geometry}
          material={materials.WoodBrown}
        >
          <Outlines thickness={0.05} color="hotpink" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_9.geometry}
          material={materials.Gunmetal}
        >
          <Outlines thickness={0.05} color="hotpink" />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sgt_Drake_Alexander_Scanned_10.geometry}
          material={materials.Blade}
        >
          <Outlines thickness={0.05} color="hotpink" />
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload('/sgt_drake_low_poly_colored.glb')
