import {
  Vector3,
  Color,
  CylinderGeometry,
  MeshLambertMaterial,
  MeshToonMaterial,
} from 'three'
import { BoardHex, StringKeyedObj } from 'game/types'
import {
  getDefaultSubTerrainForTerrain,
  isFluidTerrainHex,
  transformMoveRangeToArraysOfIds,
} from 'game/constants'
import { HeightRings } from './HeightRings'
import { ThreeEvent } from '@react-three/fiber'
import { useState } from 'react'
import { usePlayContext } from 'hexopolis-ui/contexts'

export const ONE_HEIGHT_LEVEL = 0.5
const halfLevel = 0.25
const quarterLevel = 0.125

export const hexTerrainColor: StringKeyedObj = {
  grass: '#60840d',
  water: '#3794fd',
  rock: '#475776',
  sand: '#ab8e10',
}
export const MapHex3D = ({
  x,
  z,
  boardHex,
  onClick,
}: {
  x: number
  z: number
  boardHex: BoardHex
  onClick?: (e: ThreeEvent<MouseEvent>, hex: BoardHex) => void
}) => {
  const altitude = boardHex.altitude
  const hexYPosition = altitude / 4
  const isFluidHex = isFluidTerrainHex(boardHex.terrain)
  const bottomRingYPosition = hexYPosition - altitude / 2
  const topRingYPosition = isFluidHex
    ? hexYPosition + quarterLevel
    : hexYPosition

  const hexPosition = new Vector3(x, hexYPosition, z)
  const heightScaleSubTerrain = isFluidHex
    ? altitude - halfLevel
    : altitude - quarterLevel
  const heightScaleFluid = 1
  const heightScaleSolidCap = halfLevel
  const scaleToUseForCap = isFluidHex ? heightScaleFluid : heightScaleSolidCap
  const hexCapYAdjust = isFluidHex
    ? altitude / 2
    : altitude / 2 - quarterLevel / 4
  const capPosition = new Vector3(x, hexCapYAdjust, z)
  const subTerrain =
    boardHex?.subTerrain ?? getDefaultSubTerrainForTerrain(boardHex.terrain)
  const subTerrainYAdjust = (altitude - quarterLevel) / 4
  const subTerrainPosition = new Vector3(x, subTerrainYAdjust, z)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const { selectedUnitMoveRange } = usePlayContext()
  const {
    safeMoves,
    engageMoves,
    dangerousMoves: disengageMoves,
  } = transformMoveRangeToArraysOfIds(selectedUnitMoveRange)
  const isInSafeMoveRange = safeMoves?.includes(boardHex.id)
  const isInEngageMoveRange = engageMoves?.includes(boardHex.id)
  const isInDisengageMoveRange = disengageMoves?.includes(boardHex.id)
  const whiteColor = new Color('white')
  const terrainColor = new Color(hexTerrainColor[boardHex.terrain])
  const capEmissiveColor = isHighlighted ? whiteColor : terrainColor
  const subTerrainColor = new Color(hexTerrainColor[subTerrain])
  return (
    <group>
      {/* These rings around the hex cylinder convey height levels to the user, so they can visually see how many levels of height between 2 adjacent hexes */}
      {/* The top ring will be highlighted when we hover the cap-terrain mesh, and also for all sorts of game reasons */}
      <HeightRings
        bottomRingYPos={bottomRingYPosition}
        topRingYPos={topRingYPosition}
        position={hexPosition}
        terrain={subTerrain} // the height rings would be showing on the subterrain of fluids anyway, and solids have same ter/subterr
        boardHexID={boardHex.id}
        isHighlighted={isHighlighted}
        isInSafeMoveRange={isInSafeMoveRange}
        isInEngageMoveRange={isInEngageMoveRange}
        isInDisengageMoveRange={isInDisengageMoveRange}
      />
      {/* This is the big sub-terrain mesh from the floor to the cap mesh */}
      <mesh position={subTerrainPosition} scale={[1, heightScaleSubTerrain, 1]}>
        <cylinderGeometry args={[1, 1, ONE_HEIGHT_LEVEL, 6]} />
        <meshToonMaterial color={subTerrainColor} />
      </mesh>
      {/* This group wraps the cap-terrain, and triggers the hover for this hex's top height ring */}
      <group
        onClick={(e) => {
          if (onClick) {
            onClick(e, boardHex)
          }
        }}
        onPointerEnter={(e) => {
          // this keeps the hover from penetrating to hoverable-hexes behind this one
          e.stopPropagation()
          setIsHighlighted(true)
        }}
        onPointerLeave={() => setIsHighlighted(false)}
      >
        {isFluidHex ? (
          <mesh position={capPosition} scale={[1, scaleToUseForCap, 1]}>
            <meshLambertMaterial
              color={terrainColor}
              transparent
              opacity={0.85}
              emissive={terrainColor}
              emissiveIntensity={isHighlighted ? 2 : 1}
            />
            <cylinderGeometry args={[1, 1, halfLevel, 6]} />
          </mesh>
        ) : (
          <mesh position={capPosition} scale={[1, scaleToUseForCap, 1]}>
            <meshToonMaterial
              color={terrainColor}
              emissive={capEmissiveColor}
              emissiveIntensity={isHighlighted ? 1 : 0.5}
            />
            <cylinderGeometry args={[1, 1, halfLevel, 6]} />
          </mesh>
        )}
      </group>
    </group>
  )
}
