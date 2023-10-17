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
  const solidTerrainYPosition = altitude / 4
  const solidHexGeometry = new CylinderGeometry(1, 1, ONE_HEIGHT_LEVEL, 6)
  const isFluidHex = isFluidTerrainHex(boardHex.terrain)
  const bottomRingYPosition = solidTerrainYPosition - altitude / 2
  /* If a terrain is a fluid type, then we make it as a small fluid-terrain cylinder on top of a sub-terrain cylinder which is scaled up to be most of the hex */
  const topRingYPosition = isFluidHex
    ? solidTerrainYPosition + quarterLevel
    : solidTerrainYPosition
  const hexPosition = new Vector3(
    pixel.x,
    solidTerrainYPosition,
    // 0,
    pixel.y
  )
  const heightScaleSubTerrain = altitude - halfLevel
  const heightScaleFluid = 1
  const fluidTerrainGeometry = isFluidHex
    ? new CylinderGeometry(1, 1, halfLevel, 6)
    : undefined
  const fluidTerrainYAdjust = altitude / 2
  const fluidTerrainPosition = new Vector3(
    pixel.x,
    fluidTerrainYAdjust,
    // 0,
    pixel.y
  )
  const subTerrain =
    boardHex?.subTerrain ?? getDefaultSubTerrainForTerrain(boardHex.terrain)
  const subTerrainGeometry = isFluidHex
    ? new CylinderGeometry(1, 1, ONE_HEIGHT_LEVEL, 6)
    : undefined
  const subTerrainYAdjust = (altitude - quarterLevel) / 4
  const subTerrainPosition = new Vector3(
    pixel.x,
    subTerrainYAdjust,
    // 0,
    pixel.y
  )
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
  // const hasUnitOnHexMoved = unitsMoved?.includes(boardHex.occupyingUnitID)
  // const isUnitMovePartiallyExpended =
  //   hasUnitOnHexMoved && hexUnit.movePoints > 0
  // const isUnitMoveTotallyUsed = hasUnitOnHexMoved && hexUnit.movePoints <= 0
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
      {isFluidHex ? (
        <>
          <mesh
            geometry={subTerrainGeometry}
            position={subTerrainPosition}
            scale={[1, heightScaleSubTerrain, 1]}
            material={
              new MeshToonMaterial({
                color: new Color(hexTerrainColor[subTerrain]),
              })
            }
          />
          <group
            onClick={(e) => {
              if (onClick) {
                onClick(e, boardHex)
              }
            }}
            onPointerEnter={() => setIsHighlighted(true)}
            onPointerLeave={() => setIsHighlighted(false)}
          >
            <mesh
              geometry={fluidTerrainGeometry}
              position={fluidTerrainPosition}
              scale={[1, heightScaleFluid, 1]}
              material={
                new MeshLambertMaterial({
                  color: new Color(hexTerrainColor[boardHex.terrain]),
                  transparent: true,
                  opacity: 0.9,
                })
              }
            />
          </group>
        </>
      ) : (
        <group
          onClick={(e) => {
            if (onClick) {
              onClick(e, boardHex)
              // console.log('🚀 ~ file: MapHex3D.tsx:80 ~ boardHex:', boardHex)
            }
          }}
          onPointerEnter={() => setIsHighlighted(true)}
          onPointerLeave={() => setIsHighlighted(false)}
        >
          <mesh
            geometry={solidHexGeometry}
            material={
              new MeshToonMaterial({
                color: new Color(hexTerrainColor[boardHex.terrain]),
              })
            }
            position={hexPosition}
            scale={[1, altitude, 1]}
          />
        </group>
      )}
    </group>
  )
}
