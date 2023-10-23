import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../../OutlineHighlight'
import { GameUnit } from 'game/types'

export function AirbornElite2({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes, materials } = useGLTF('/airborn_2_low_poly_colored.glb') as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Airborn_Elite_2_Scanned.geometry}
        material={materials.ArmyLtGreen}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Airborn_Elite_2_Scanned_1.geometry}
        material={materials.Silver}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Airborn_Elite_2_Scanned_2.geometry}
        material={materials.WoodBrown}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Airborn_Elite_2_Scanned_3.geometry}
        material={materials.SandyWhiteSkin}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Airborn_Elite_2_Scanned_4.geometry}
        material={materials.ArmyDkGreen}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Airborn_Elite_2_Scanned_5.geometry}
        material={materials.ArmyLtBrown}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Airborn_Elite_2_Scanned_6.geometry}
        material={materials.Black}
      >
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

useGLTF.preload('/airborn_2_low_poly_colored.glb')
