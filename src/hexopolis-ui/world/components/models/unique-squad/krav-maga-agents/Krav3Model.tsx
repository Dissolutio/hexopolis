import { useGLTF } from '@react-three/drei'
import { OutlineHighlight } from '../../OutlineHighlight'
import { GameUnit } from 'game/types'

export function Krav3Model({
  gameUnit,
  isHovered,
}: {
  gameUnit: GameUnit
  isHovered: boolean
}) {
  const { nodes, materials } = useGLTF(
    '/krav_maga_3_low_poly_colored.glb'
  ) as any
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Karv_Maga_Agent_-_3_Scanned'].geometry}
        material={materials.Black}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Karv_Maga_Agent_-_3_Scanned_1'].geometry}
        material={materials.Gunmetal}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Karv_Maga_Agent_-_3_Scanned_2'].geometry}
        material={materials.White}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Karv_Maga_Agent_-_3_Scanned_3'].geometry}
        material={materials.BlackSkin}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes['Karv_Maga_Agent_-_3_Scanned_4'].geometry}
        material={materials.BlackHair}
      >
        <OutlineHighlight gameUnit={gameUnit} isHovered={isHovered} />
      </mesh>
    </>
  )
}

useGLTF.preload('/krav_maga_3_low_poly_colored.glb')
