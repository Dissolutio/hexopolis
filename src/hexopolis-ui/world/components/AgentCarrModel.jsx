import { useGLTF } from '@react-three/drei'
import { cubeToPixel } from '../HexMap3D'
import { useState } from 'react'

const modelAltitudeAdjustment = {
  agentCarrID: 1,
}

export function AgentCarrModel() {
  const hex = { q: 5, r: 9, s: -14, altitude: 4, id: '5,9,-14' }
  const pixel = cubeToPixel(hex)
  const { nodes, materials } = useGLTF('/agent_carr_low_poly_colored.glb')
  const [active, setActive] = useState(false)
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
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_1.geometry}
        material={nodes.Mesh_0001_1.material}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_2.geometry}
        material={materials.DarkBlueCoat}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_3.geometry}
        material={materials.BlackSkin}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_4.geometry}
        material={materials.DarkGray}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_5.geometry}
        material={materials.LightBlue}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_6.geometry}
        material={materials.Silver}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_7.geometry}
        material={materials.BlackHair}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_8.geometry}
        material={materials.Black}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_9.geometry}
        material={materials.Blade}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_10.geometry}
        material={materials.BlueGray}
        scale={active ? 1.5 : 1}
        onClick={() => setActive(!active)}
      ></mesh>
    </group>
  )
}

useGLTF.preload('/agent_carr_low_poly_colored.glb')
