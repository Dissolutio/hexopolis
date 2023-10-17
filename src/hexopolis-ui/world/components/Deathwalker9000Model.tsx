import { useGLTF } from '@react-three/drei'
import { BoardHex } from 'game/types'

const initialAngleAdjustment = Math.PI

export function Deathwalker9000Model({ boardHex }: { boardHex: BoardHex }) {
  const { nodes, materials } = useGLTF('/d9000_low_poly_colored.glb') as any
  return (
    <>
      <group rotation={[0, initialAngleAdjustment, 0]}>
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
    </>
  )
}

useGLTF.preload('/d9000_low_poly_colored.glb')
