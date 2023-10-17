import { useGLTF } from '@react-three/drei'
import { cubeToPixel } from 'game/hex-utils'
import { BoardHex } from 'game/types'

// const modelAltitudeAdjustment = {
//   agentCarrID: 1.5,
// }
const initialAngleAdjustment = -(Math.PI * 7) / 6
export function AgentCarrModel({ boardHex }: { boardHex: BoardHex }) {
  // const boardHex = { q: 5, r: 9, s: -14, altitude: 4, id: '5,9,-14' }
  const pixel = cubeToPixel(boardHex)
  const { nodes, materials } = useGLTF(
    '/agent_carr_low_poly_colored.glb'
  ) as any
  return (
    <group
      position={[pixel.x, boardHex.altitude / 2, pixel.y]}
      rotation={[0, initialAngleAdjustment, 0]}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001.geometry}
        material={materials.Gunmetal}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_1.geometry}
        material={nodes.Mesh_0001_1.material}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_2.geometry}
        material={materials.DarkBlueCoat}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_3.geometry}
        material={materials.BlackSkin}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_4.geometry}
        material={materials.DarkGray}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_5.geometry}
        material={materials.LightBlue}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_6.geometry}
        material={materials.Silver}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_7.geometry}
        material={materials.BlackHair}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_8.geometry}
        material={materials.Black}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_9.geometry}
        material={materials.Blade}
      ></mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Mesh_0001_10.geometry}
        material={materials.BlueGray}
      ></mesh>
    </group>
  )
}

useGLTF.preload('/agent_carr_low_poly_colored.glb')
