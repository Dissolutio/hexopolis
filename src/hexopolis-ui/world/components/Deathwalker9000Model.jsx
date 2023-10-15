import { useGLTF } from '@react-three/drei'
import { cubeToPixel } from '../MapDisplay3D'

const modelAltitudeAdjustment = {
  d9000Id: 2.45,
}
const initialAngleAdjustment = Math.PI
export function Deathwalker9000Model(props) {
  const hex = { q: 6, r: 9, s: -15, altitude: 4, id: '6,9,-15' }
  const pixel = cubeToPixel(hex)
  const { nodes, materials } = useGLTF('/d9000_low_poly_colored.glb')
  return (
    <group {...props} dispose={null}>
      <group
        position={[
          pixel.x,
          hex.altitude / 4 + modelAltitudeAdjustment.d9000Id,
          pixel.y,
        ]}
        rotation={[0, initialAngleAdjustment, 0]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Deathwalker_9000_Scanned_1.geometry}
          material={materials.Black}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Deathwalker_9000_Scanned_2.geometry}
          material={materials.Silver}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Deathwalker_9000_Scanned_3.geometry}
          material={materials.BrightRed}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Deathwalker_9000_Scanned_4.geometry}
          material={materials.Silver}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Deathwalker_9000_Scanned_5.geometry}
          material={materials.BrightRed}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/d9000_low_poly_colored.glb')
