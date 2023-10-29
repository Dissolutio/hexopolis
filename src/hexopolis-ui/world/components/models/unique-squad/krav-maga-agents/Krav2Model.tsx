import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../../OutlineHighlight'
import { GameUnit } from 'game/types'

export function Krav2Model({
  gameUnit,
  isHovered,
}: {
  gameUnit: GameUnit
  isHovered: boolean
}) {
  const { nodes, materials } = useGLTF(
    '/krav_maga_2_low_poly_colored.glb'
  ) as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Karv_Maga_Agent_-_2_Scanned'].geometry}
        material={materials.Black}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Karv_Maga_Agent_-_2_Scanned_1'].geometry}
        material={materials.Gunmetal}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Karv_Maga_Agent_-_2_Scanned_2'].geometry}
        material={materials.SandyWhiteSkin}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Karv_Maga_Agent_-_2_Scanned_3'].geometry}
        material={materials['Material.001']}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
    </>
  )
}

useGLTF.preload('/krav_maga_2_low_poly_colored.glb')
