import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../OutlineHighlight'
import { GameUnit } from 'game/types'

export function RaelinRotvModel({
  gameUnit,
  isHovered,
}: {
  gameUnit: GameUnit
  isHovered: boolean
}) {
  // const totalRotation = initialAngleAdjustment + (rotation[1-6]) * (Math.PI / 3)
  const gltf = useGLTF('/raelin1_low_poly_colored.glb') as any
  const { nodes, materials } = gltf
  //   nodes.Raelin_the_Kyrie_Warrior_Scanned_1.geometry
  // uids of materials etc
  // nodes.Raelin_the_Kyrie_Warrior_Scanned_2.geometry
  // nodes.Raelin_the_Kyrie_Warrior_Scanned_3.geometry
  // nodes.Raelin_the_Kyrie_Warrior_Scanned_4.geometry
  // nodes.Raelin_the_Kyrie_Warrior_Scanned_5.geometry
  // const nodesToMaterialsNameArr = nodes.map()
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Raelin_the_Kyrie_Warrior_Scanned_1.geometry}
        material={materials.Silver}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Raelin_the_Kyrie_Warrior_Scanned_2.geometry}
        material={materials.ElfBrown}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Raelin_the_Kyrie_Warrior_Scanned_3.geometry}
        material={materials.Gold}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Raelin_the_Kyrie_Warrior_Scanned_4.geometry}
        material={materials.AngelBlue}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Raelin_the_Kyrie_Warrior_Scanned_5.geometry}
        material={materials.SandyWhiteSkin}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
    </>
  )
}

useGLTF.preload('/raelin1_low_poly_colored.glb')
