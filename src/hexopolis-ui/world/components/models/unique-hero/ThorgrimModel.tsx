import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../OutlineHighlight'
import { GameUnit } from 'game/types'

export function ThorgrimModel({
  gameUnit,
  isHovered,
}: {
  gameUnit: GameUnit
  isHovered: boolean
}) {
  // const totalRotation = initialAngleAdjustment + (rotation[1-6]) * (Math.PI / 3)
  const { nodes, materials } = useGLTF('/thorgrim_low_poly_colored.glb') as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Thorgrim_the_Viking_Champion_Scanned_1.geometry}
        material={materials.Chainmail}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Thorgrim_the_Viking_Champion_Scanned_2.geometry}
        material={materials.Gold}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Thorgrim_the_Viking_Champion_Scanned_3.geometry}
        material={materials.SandyWhiteSkin}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Thorgrim_the_Viking_Champion_Scanned_4.geometry}
        material={materials.ElfTan}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Thorgrim_the_Viking_Champion_Scanned_5.geometry}
        material={materials.VikingBlue}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Thorgrim_the_Viking_Champion_Scanned_6.geometry}
        material={materials.LeatherBrown}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
    </>
  )
}

useGLTF.preload('/thorgrim_low_poly_colored.glb')
