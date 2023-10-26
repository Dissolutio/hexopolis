import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { GameUnit } from 'game/types'
import { playerColors } from 'hexopolis-ui/theme'
import { OutlineHighlight } from './OutlineHighlight'
/* 
 WORKFLOW:
 Every group of faces that you paint with a material, in Blender, gets a mesh in the exported GLB file.
 These plain models below, with no material, only have one mesh. This is handy.
 The key in the object below is frustratingly decided when you export the file from Blender, based on the names of the meshes, so
 there is a good amount of tedious mistakes that can be made, that's why my keys below are inconsistently named.

 I am using this site to convert glb files to nice react code: https://gltf.pmnd.rs/
 And it in turn is using this lib: https://github.com/pmndrs/gltfjsx

 Instead of needing the lib, we could come with a system and a more general 3D model component instead of each ID getting its own model component
*/
type GLTFResult = GLTF & {
  nodes: {
    Izumi_Samurai_1?: THREE.Mesh
    Izumi_Samurai_2?: THREE.Mesh
    Izumi_Samurai_3?: THREE.Mesh
    Tarn_Viking_Warriors_1?: THREE.Mesh
    Tarn_Viking_Warriors_2?: THREE.Mesh
    Tarn_Viking_Warriors_3?: THREE.Mesh
    Tarn_Viking_Warriors_4?: THREE.Mesh
    Negoksa?: THREE.Mesh
    Grimnak?: THREE.Mesh
    Zettian_Guards_2?: THREE.Mesh
    Zettian_Guards_1?: THREE.Mesh
    Krav_Maga_Agent_1?: THREE.Mesh
    Krav_Maga_2?: THREE.Mesh
    Krav_Maga_3?: THREE.Mesh
    Finn_the_Viking_Champion_Scanned?: THREE.Mesh
    Thorgrim_the_Viking_Champion_Scanned?: THREE.Mesh
  }
}

export function Tarn1PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/tarn_1_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])

  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Tarn_Viking_Warriors_1?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

export function Tarn2PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/tarn_2_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Tarn_Viking_Warriors_2?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function Tarn3PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/tarn_3_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Tarn_Viking_Warriors_3?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function Tarn4PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/tarn_4_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Tarn_Viking_Warriors_4?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function Izumi1PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/izumi_1_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])

  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Izumi_Samurai_1?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

export function Izumi2PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/izumi_2_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Izumi_Samurai_2?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function Izumi3PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/izumi_3_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Izumi_Samurai_3?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function GrimnakPlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/grimnak_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])

  return (
    <>
      <mesh castShadow receiveShadow geometry={nodes?.Grimnak?.geometry}>
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function NeGokSaPlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/negoksa_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])

  return (
    <>
      <mesh castShadow receiveShadow geometry={nodes?.Negoksa?.geometry}>
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

export function Zettian1PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/zettian_1_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])

  return (
    <>
      {/* OOPS: Got 1 and 2 mixed up on this squad when exporting */}
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Zettian_Guards_2?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

export function Zettian2PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/zettian_2_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      {/* OOPS: Got 1 and 2 mixed up on this squad when exporting */}
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Zettian_Guards_1?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function Krav1PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/krav_1_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Krav_Maga_Agent_1?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function Krav2PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/krav_2_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh castShadow receiveShadow geometry={nodes?.Krav_Maga_2?.geometry}>
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function Krav3PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/krav_3_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh castShadow receiveShadow geometry={nodes?.Krav_Maga_3?.geometry}>
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function FinnPlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/finn_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Finn_the_Viking_Champion_Scanned?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function ThorgrimPlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/thorgrim_low_poly_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Thorgrim_the_Viking_Champion_Scanned?.geometry}
      >
        <meshPhongMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
