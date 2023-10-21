import React from 'react'
import { Float } from '@react-three/drei'

import { BoardHex, GameUnit, StringKeyedNums } from 'game/types'
import { getDirectionOfNeighbor } from 'game/hex-utils'
import { useUIContext } from 'hexopolis-ui/contexts'
import { useBgioCtx, useBgioG } from 'bgio-contexts'
import { playerColors } from 'hexopolis-ui/theme'

import { SyvarrisModel } from '../components/models/unique-hero/SyvarrisModel'
import { SgtDrakeModel } from '../components/models/unique-hero/SgtDrakeModel'
import { AgentCarrModel } from '../components/models/unique-hero/AgentCarrModel'
import { Deathwalker9000Model } from '../components/models/unique-hero/Deathwalker9000Model'
import { MarroWarrior1 } from '../components/models/unique-squad/marro-warriors/MarroWarrior1'
import { MarroWarrior2 } from '../components/models/unique-squad/marro-warriors/MarroWarrior2'
import { MarroWarrior3 } from '../components/models/unique-squad/marro-warriors/MarroWarrior3'
import { MarroWarrior4 } from '../components/models/unique-squad/marro-warriors/MarroWarrior4'
import { MimringModel } from '../components/models/unique-hero/Mimring'
import { selectTailHexForUnit } from 'game/selectors'

const initialRotations: StringKeyedNums = {
  // everyone else defaults to Math.PI so far
  hs1003: -Math.PI / 2, // sgt drake1
  hs1004: -(Math.PI * 2) / 3, // syvarris
  hs1007: -(Math.PI * 7) / 6, // carr
}
const getInitialRotationByID = (id: string) => {
  return initialRotations?.[id] ?? Math.PI
}
export const GameUnit3D = ({
  gameUnit,
  boardHex,
  x,
  z,
}: {
  gameUnit: GameUnit
  boardHex: BoardHex
  x: number
  z: number
  // onClick?: (e: ThreeEvent<MouseEvent>, hex: BoardHex) => void
}) => {
  const { boardHexes } = useBgioG()
  const positionX = x
  const positionZ = z
  const positionY = boardHex.altitude / 2
  const tailHex = selectTailHexForUnit(gameUnit.unitID, boardHexes)
  const directionToTail = tailHex
    ? getDirectionOfNeighbor(boardHex, tailHex)
    : undefined
  const rotationToTail = ((directionToTail ?? 0) * Math.PI) / 3
  const playerAdjustedRotationForSingleHexFigures =
    (gameUnit.rotation * Math.PI) / 3
  const rotationY =
    getInitialRotationByID(gameUnit.armyCardID) +
    playerAdjustedRotationForSingleHexFigures +
    rotationToTail
  return (
    <group
      position={[positionX, positionY, positionZ]}
      rotation={[0, rotationY, 0]}
    >
      <FloatSelectedWrapper unitID={gameUnit.unitID}>
        <UnitModelByID gameUnit={gameUnit} />
      </FloatSelectedWrapper>
    </group>
  )
}
export const UnitModelByID = ({ gameUnit }: { gameUnit: GameUnit }) => {
  const { unitID } = gameUnit
  const { isPlacementPhase } = useBgioCtx()
  const { selectedUnitID } = useUIContext()

  const highlightColor = () => {
    if (isPlacementPhase && unitID === selectedUnitID) {
      return playerColors[gameUnit.playerID]
    }
    return ''
  }
  if (!gameUnit) {
    return null
  }
  switch (gameUnit.armyCardID) {
    case 'hs1000':
      // marro warriors
      if (gameUnit.modelIndex === 0)
        return <MarroWarrior1 highlightColor={highlightColor()} />
      if (gameUnit.modelIndex === 1)
        return <MarroWarrior2 highlightColor={highlightColor()} />
      if (gameUnit.modelIndex === 2)
        return <MarroWarrior3 highlightColor={highlightColor()} />
      if (gameUnit.modelIndex === 3)
        return <MarroWarrior4 highlightColor={highlightColor()} />
      return <MarroWarrior1 highlightColor={highlightColor()} />
    case 'hs1001':
      // deathwalker 9000
      return <Deathwalker9000Model highlightColor={highlightColor()} />
    case 'hs1003':
      // sgt drake
      return <SgtDrakeModel highlightColor={highlightColor()} />
    case 'hs1004':
      // syvarris
      return <SyvarrisModel highlightColor={highlightColor()} />
    case 'hs1007':
      // agent carr
      return <AgentCarrModel highlightColor={highlightColor()} />
    case 'hs1013':
      // agent carr
      return <MimringModel highlightColor={highlightColor()} />
    default:
      return null
  }
}

const FloatSelectedWrapper = ({
  unitID,
  children,
}: {
  unitID: string
  children: React.ReactNode
}) => {
  const { selectedUnitID } = useUIContext()
  if (unitID === selectedUnitID) {
    return (
      <Float
        speed={10} // Animation speed, defaults to 1
        rotationIntensity={0.1} // XYZ rotation intensity, defaults to 1
        floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
        floatingRange={[0.1, 0.3]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
      >
        {children}
      </Float>
    )
  } else {
    return <>{children}</>
  }
}
