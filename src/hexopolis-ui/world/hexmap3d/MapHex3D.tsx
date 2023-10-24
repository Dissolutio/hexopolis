import { Vector3, Color } from 'three'
import { BoardHex, StringKeyedObj } from 'game/types'
import {
  getDefaultSubTerrainForTerrain,
  isFluidTerrainHex,
} from 'game/constants'
import { HeightRings } from './HeightRings'
import { ThreeEvent } from '@react-three/fiber'
import { useState } from 'react'
import { useBgioClientInfo, useBgioCtx, useBgioG } from 'bgio-contexts'
import { usePlacementContext, useUIContext } from 'hexopolis-ui/contexts'
import { playerColors } from 'hexopolis-ui/theme'
import { selectGlyphForHex } from 'game/selectors'
import { powerGlyphs } from 'game/glyphs'
import { Billboard, Text } from '@react-three/drei'

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
  const {
    startZones,
    hexMap: { glyphs },
  } = useBgioG()
  const { isPlacementPhase } = useBgioCtx()
  const { playerID } = useBgioClientInfo()
  const { editingBoardHexes } = usePlacementContext()
  const unitID = boardHex?.occupyingUnitID ?? ''
  const editingHexUnitID = editingBoardHexes[boardHex.id]?.occupyingUnitID ?? ''
  const { selectedUnitID } = useUIContext()
  const occupyingPlacementUnitId =
    editingBoardHexes?.[boardHex.id]?.occupyingUnitID ?? ''
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
  const heightScaleFluidCap = 1
  const heightScaleSolidCap = halfLevel
  const scaleToUseForCap = isFluidHex
    ? heightScaleFluidCap
    : heightScaleSolidCap
  // as of yet, this just looks right, it's not mathematically sound
  const mysteryMathValueThatSeemsToWorkWell = quarterLevel / 4
  const yAdjustFluidCap = altitude / 2
  const yAdjustSolidCap = yAdjustFluidCap - mysteryMathValueThatSeemsToWorkWell
  const hexCapYAdjust = isFluidHex ? yAdjustFluidCap : yAdjustSolidCap
  const capPosition = new Vector3(x, hexCapYAdjust, z)
  const subTerrain =
    boardHex?.subTerrain ?? getDefaultSubTerrainForTerrain(boardHex.terrain)
  const subTerrainYAdjust = (altitude - quarterLevel) / 4
  const subTerrainPosition = new Vector3(x, subTerrainYAdjust, z)
  const [isHovered, setIsHovered] = useState(false)

  const whiteColor = new Color('white')
  const terrainColor = new Color(hexTerrainColor[boardHex.terrain])
  const playerColor = new Color(playerColors[playerID])

  const isMyStartZoneHex = Boolean(
    startZones?.[playerID]?.includes(boardHex.id)
  )
  const isSelectedUnitHex =
    selectedUnitID &&
    (isPlacementPhase ? editingHexUnitID : unitID) &&
    selectedUnitID === (isPlacementPhase ? editingHexUnitID : unitID)
  // const isPlaceableOccupiedPlacementHex =
  //   isMyStartZoneHex &&
  //   occupyingPlacementUnitId &&
  //   occupyingPlacementUnitId !== selectedUnitID

  const capEmissiveColor =
    isHovered || isSelectedUnitHex ? whiteColor : terrainColor
  // there was a time when the base emissivity was non-zero, but fps improved with removing <Stage>, and <Stage> is where it looked good
  const baseEmissivity = 0
  const capFluidOpacity = 0.85
  const fluidEmissivity = 2 * baseEmissivity
  const capEmissiveIntensity = isHovered ? 1 : baseEmissivity
  const capFluidEmissiveIntensity = isHovered ? 2 : fluidEmissivity
  const subTerrainColor = new Color(hexTerrainColor[subTerrain])

  /* 
    GLYPHS
     */
  const glyphOnHex = selectGlyphForHex({ hexID: boardHex.id, glyphs })
  const isGlyphRevealed = glyphOnHex?.isRevealed
  const canonicalGlyph = powerGlyphs[glyphOnHex?.glyphID ?? '']
  const glyphShortName = canonicalGlyph?.shortName || ''
  const glyphText = isGlyphRevealed ? glyphShortName : '?'
  const layerBetweenHexCapAndUnitFeet = 0.01
  const glyphYAdjust = isFluidHex
    ? yAdjustFluidCap + layerBetweenHexCapAndUnitFeet
    : yAdjustSolidCap + layerBetweenHexCapAndUnitFeet
  const sleightOffsetFromCenterOfHex = 0.2
  const glyphPosition = new Vector3(
    x,
    glyphYAdjust,
    z - sleightOffsetFromCenterOfHex
  )

  return (
    <group>
      {glyphOnHex ? (
        <group position={glyphPosition}>
          <Billboard position={[isGlyphRevealed ? -1 : -0.5, 0.4, 0]}>
            <Text
              fontSize={isGlyphRevealed ? 0.3 : 0.6}
              color={new Color('black')}
            >
              {glyphText}
            </Text>
          </Billboard>
          <mesh>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 6]} />
            <meshBasicMaterial color={new Color('maroon')} />
          </mesh>
        </group>
      ) : (
        <></>
      )}
      {/* These rings around the hex cylinder convey height levels to the user, so they can visually see how many levels of height between 2 adjacent hexes */}
      {/* The top ring will be highlighted when we hover the cap-terrain mesh, and also for all sorts of game reasons */}
      <HeightRings
        bottomRingYPos={bottomRingYPosition}
        topRingYPos={topRingYPosition}
        position={hexPosition}
        terrainForColor={subTerrain} // the subterrain is the color for the interior rings (they'll fall in the subterrain mesh area)
        boardHexID={boardHex.id}
        isHighlighted={isHovered}
      />
      {/* This is the big sub-terrain mesh from the floor to the cap mesh */}
      <mesh position={subTerrainPosition} scale={[1, heightScaleSubTerrain, 1]}>
        <cylinderGeometry args={[1, 1, ONE_HEIGHT_LEVEL, 6]} />
        <meshBasicMaterial color={subTerrainColor} />
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
          setIsHovered(true)
        }}
        onPointerLeave={() => setIsHovered(false)}
      >
        {/* The cap hex is either fluid-terrain or solid-terrain */}
        {isFluidHex ? (
          <mesh position={capPosition} scale={[1, scaleToUseForCap, 1]}>
            <meshLambertMaterial
              color={terrainColor}
              transparent
              opacity={capFluidOpacity}
              emissive={terrainColor}
              emissiveIntensity={capFluidEmissiveIntensity}
            />
            <cylinderGeometry args={[1, 1, halfLevel, 6]} />
          </mesh>
        ) : (
          <mesh position={capPosition} scale={[1, scaleToUseForCap, 1]}>
            <meshToonMaterial
              color={terrainColor}
              emissive={capEmissiveColor}
              emissiveIntensity={capEmissiveIntensity}
            />
            <cylinderGeometry args={[1, 1, halfLevel, 6]} />
          </mesh>
        )}
      </group>
    </group>
  )
}
