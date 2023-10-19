import React from 'react'
import { Deathwalker9000Model } from '../components/Deathwalker9000Model'
import { BoardHex, GameUnit, StringKeyedNums } from 'game/types'
import { SyvarrisModel } from '../components/SyvarrisModel'
import { SgtDrakeModel } from '../components/SgtDrakeModel'
import { AgentCarrModel } from '../components/AgentCarrModel'
import { cubeToPixel } from 'game/hex-utils'
import { useUIContext } from 'hexopolis-ui/contexts'
import { Float } from '@react-three/drei'
import { useBgioCtx } from 'bgio-contexts'
import { playerColors } from 'hexopolis-ui/theme'
import { MarroWarrior1 } from '../components/models/MarroWarrior1'
import { MarroWarrior2 } from '../components/models/MarroWarrior2'
import { MarroWarrior3 } from '../components/models/MarroWarrior3'
import { MarroWarrior4 } from '../components/models/MarroWarrior4'

const initialRotations: StringKeyedNums = {
  hs1000: Math.PI, // marro warriors
  hs1001: Math.PI, // dw9000
  hs1003: -Math.PI / 2, // sgt drake1
  hs1004: -(Math.PI * 2) / 3, // syvarris
  hs1007: -(Math.PI * 7) / 6, // carr
}
export const GameUnit3D = ({
  gameUnit,
  boardHex,
}: {
  gameUnit: GameUnit
  boardHex: BoardHex
  // onClick?: (e: ThreeEvent<MouseEvent>, hex: BoardHex) => void
}) => {
  const pixel = cubeToPixel(boardHex)
  return (
    <group
      position={[pixel.x, boardHex.altitude / 2, pixel.y]}
      rotation={[0, initialRotations[gameUnit.armyCardID], 0]}
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
