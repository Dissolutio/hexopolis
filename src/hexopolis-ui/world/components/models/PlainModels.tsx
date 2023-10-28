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
    Airborn_Elite_1?: THREE.Mesh
    Airborn_Elite_2?: THREE.Mesh
    Airborn_Elite_3?: THREE.Mesh
    Airborn_Elite_4?: THREE.Mesh
    Tarn_Viking_Warriors_1?: THREE.Mesh
    Tarn_Viking_Warriors_2?: THREE.Mesh
    Tarn_Viking_Warriors_3?: THREE.Mesh
    Tarn_Viking_Warriors_4?: THREE.Mesh
    Marro_Warriors_1?: THREE.Mesh
    Marro_Warriors_2?: THREE.Mesh
    Marro_Warriors_3?: THREE.Mesh
    Marro_Warriors_4?: THREE.Mesh
    Negoksa?: THREE.Mesh
    D9000?: THREE.Mesh
    Grimnak?: THREE.Mesh
    Raelin1?: THREE.Mesh
    Zettian_Guards_2?: THREE.Mesh
    Zettian_Guards_1?: THREE.Mesh
    Krav_Maga_Agent_1?: THREE.Mesh
    Krav_Maga_2?: THREE.Mesh
    Krav_Maga_3?: THREE.Mesh
    Finn_the_Viking_Champion_Scanned?: THREE.Mesh
    Thorgrim_the_Viking_Champion_Scanned?: THREE.Mesh
    AgentCarr?: THREE.Mesh
    Syvarris?: THREE.Mesh
    Mimring?: THREE.Mesh
    Sgt_Drake_1?: THREE.Mesh
  }
}

export function Airborn1PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/airborn_1_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])

  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Airborn_Elite_1?.geometry}
      >
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

export function Airborn2PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/airborn_2_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Airborn_Elite_2?.geometry}
      >
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function Airborn3PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/airborn_3_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Airborn_Elite_3?.geometry}
      >
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function Airborn4PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/airborn_4_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Airborn_Elite_4?.geometry}
      >
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}

export function MarroWarriors1PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/marro_warriors_1_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])

  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Marro_Warriors_1?.geometry}
      >
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function MarroWarriors2PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/marro_warriors_2_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Marro_Warriors_2?.geometry}
      >
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function MarroWarriors3PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/marro_warriors_3_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Marro_Warriors_3?.geometry}
      >
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function MarroWarriors4PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/marro_warriors_4_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.Marro_Warriors_4?.geometry}
      >
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function Raelin1PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/raelin1_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])

  return (
    <>
      <mesh castShadow receiveShadow geometry={nodes?.Raelin1?.geometry}>
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function D9000PlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/d9000_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])

  return (
    <>
      <mesh castShadow receiveShadow geometry={nodes?.D9000?.geometry}>
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
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
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function AgentCarrPlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/agent_carr_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh castShadow receiveShadow geometry={nodes?.AgentCarr?.geometry}>
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function SyvarrisPlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/syvarris_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh castShadow receiveShadow geometry={nodes?.Syvarris?.geometry}>
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function MimringPlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/mimring_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh castShadow receiveShadow geometry={nodes?.Mimring?.geometry}>
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
export function SgtDrakePlainModel({ gameUnit }: { gameUnit: GameUnit }) {
  const { nodes } = useGLTF('/sgt_drake_plain.glb') as GLTFResult
  const playerColor = new THREE.Color(playerColors[gameUnit.playerID])
  return (
    <>
      <mesh castShadow receiveShadow geometry={nodes?.Sgt_Drake_1?.geometry}>
        <meshLambertMaterial color={playerColor} />
        <OutlineHighlight gameUnit={gameUnit} />
      </mesh>
    </>
  )
}
// if you don't preload them, the map will flicker when you use The Drop and add these models (all the rest load at game start)
useGLTF.preload('/airborn_1_plain.glb')
useGLTF.preload('/airborn_2_plain.glb')
useGLTF.preload('/airborn_3_plain.glb')
useGLTF.preload('/airborn_4_plain.glb')
