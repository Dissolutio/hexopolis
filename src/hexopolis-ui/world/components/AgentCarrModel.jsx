import { Suspense } from 'react'
import { Gltf, Outlines, useGLTF } from '@react-three/drei'
import { ModelLoader } from './ModelLoader'
import { cubeToPixel } from '../HexMap3D'

const modelAltitudeAdjustment = {
  agentCarrID: 1,
}

export function AgentCarrModel() {
  const hex = { q: 5, r: 9, s: -14, altitude: 4, id: '5,9,-14' }
  const pixel = cubeToPixel(hex)
  const { nodes, materials } = useGLTF('/agent_carr_low_poly_colored.glb')
  return (
    <group
      position={[
        pixel.x,
        hex.altitude / 4 + modelAltitudeAdjustment.agentCarrID,
        pixel.y,
      ]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001.geometry}
        material={materials.Gunmetal}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_1.geometry}
        material={nodes.Mesh_0001_1.material}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_2.geometry}
        material={materials.DarkBlueCoat}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_3.geometry}
        material={materials.BlackSkin}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_4.geometry}
        material={materials.DarkGray}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_5.geometry}
        material={materials.LightBlue}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_6.geometry}
        material={materials.Silver}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_7.geometry}
        material={materials.BlackHair}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_8.geometry}
        material={materials.Black}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_9.geometry}
        material={materials.Blade}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_10.geometry}
        material={materials.BlueGray}
      >
        <Outlines thickness={0.05} color="hotpink" />
      </mesh>
    </group>
  )
}

useGLTF.preload('/agent_carr_low_poly_colored.glb')
