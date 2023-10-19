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
import { cubeToPixel } from 'game/hex-utils'
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
  boardHex,
  onClick,
}: {
  boardHex: BoardHex
  onClick?: (e: ThreeEvent<MouseEvent>, hex: BoardHex) => void
}) => {
  const pixel = cubeToPixel(boardHex)
  const altitude = boardHex.altitude
  const hexYPosition = altitude / 4
  const isFluidHex = isFluidTerrainHex(boardHex.terrain)
  const bottomRingYPosition = hexYPosition - altitude / 2
  /* Hexes have a thin cap on top, this is the clickable and hoverable bit */
  const topRingYPosition = isFluidHex
    ? hexYPosition + quarterLevel
    : hexYPosition

  const hexPosition = new Vector3(pixel.x, hexYPosition, pixel.y)
  const heightScaleSubTerrain = isFluidHex
    ? altitude - halfLevel
    : altitude - quarterLevel
  const heightScaleFluid = 1
  const heightScaleSolidCap = halfLevel
  const scaleToUseForCap = isFluidHex ? heightScaleFluid : heightScaleSolidCap
  // const hexCapYAdjust = isFluidHex ? altitude / 2 : altitude / 4
  const hexCapYAdjust = isFluidHex
    ? altitude / 2
    : altitude / 2 - quarterLevel / 4
  const capPosition = new Vector3(
    pixel.x,
    hexCapYAdjust,
    // 0,
    pixel.y
  )
  const subTerrain =
    boardHex?.subTerrain ?? getDefaultSubTerrainForTerrain(boardHex.terrain)
  const subTerrainYAdjust = (altitude - quarterLevel) / 4
  const subTerrainPosition = new Vector3(pixel.x, subTerrainYAdjust, pixel.y)
  // styling of top ring is dependent on states below:
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
  return (
    <group>
      {/* These rings around the hex cylinder convey height levels to the user, so they can visually see how many levels of height between 2 adjacent hexes */}
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
      <mesh position={subTerrainPosition} scale={[1, heightScaleSubTerrain, 1]}>
        <cylinderGeometry args={[1, 1, ONE_HEIGHT_LEVEL, 6]} />
        <meshToonMaterial color={new Color(hexTerrainColor[subTerrain])} />
      </mesh>
      <group
        onClick={(e) => {
          if (onClick) {
            onClick(e, boardHex)
          }
        }}
        onPointerEnter={() => setIsHighlighted(true)}
        onPointerLeave={() => setIsHighlighted(false)}
      >
        {isFluidHex ? (
          <mesh position={capPosition} scale={[1, scaleToUseForCap, 1]}>
            <meshLambertMaterial
              color={new Color(hexTerrainColor[boardHex.terrain])}
              transparent={isFluidHex}
              opacity={isFluidHex ? 0.9 : 1}
            />
            <cylinderGeometry args={[1, 1, halfLevel, 6]} />
          </mesh>
        ) : (
          <mesh position={capPosition} scale={[1, scaleToUseForCap, 1]}>
            <meshToonMaterial
              color={new Color(hexTerrainColor[boardHex.terrain])}
            />
            <cylinderGeometry args={[1, 1, halfLevel, 6]} />
          </mesh>
        )}
      </group>
    </group>
  )
}
