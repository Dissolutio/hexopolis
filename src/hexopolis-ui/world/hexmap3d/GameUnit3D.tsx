import React, { useState } from 'react'
import { Float } from '@react-three/drei'

import { BoardHex, GameUnit } from 'game/types'
import { getDirectionOfNeighbor } from 'game/hex-utils'
import { usePlacementContext, useUIContext } from 'hexopolis-ui/contexts'
import { useBgioCtx, useBgioG } from 'bgio-contexts'
import { selectTailHexForUnit } from 'game/selectors'
import {
  Tarn1PlainModel,
  Tarn2PlainModel,
  Tarn3PlainModel,
  Tarn4PlainModel,
  Izumi1PlainModel,
  Izumi2PlainModel,
  Izumi3PlainModel,
  FinnPlainModel,
  GrimnakPlainModel,
  Krav1PlainModel,
  Krav2PlainModel,
  Krav3PlainModel,
  NeGokSaPlainModel,
  ThorgrimPlainModel,
  Zettian1PlainModel,
  Zettian2PlainModel,
  AgentCarrPlainModel,
  Airborn1PlainModel,
  Airborn2PlainModel,
  Airborn3PlainModel,
  Airborn4PlainModel,
  SgtDrakePlainModel,
  D9000PlainModel,
  Raelin1PlainModel,
  SyvarrisPlainModel,
  MimringPlainModel,
  MarroWarriors1PlainModel,
  MarroWarriors2PlainModel,
  MarroWarriors3PlainModel,
  MarroWarriors4PlainModel,
} from '../components/models/PlainModels'
import { MarroWarrior1 } from '../components/models/unique-squad/marro-warriors/MarroWarrior1'
import { MarroWarrior2 } from '../components/models/unique-squad/marro-warriors/MarroWarrior2'
import { MarroWarrior3 } from '../components/models/unique-squad/marro-warriors/MarroWarrior3'
import { MarroWarrior4 } from '../components/models/unique-squad/marro-warriors/MarroWarrior4'
import { Deathwalker9000Model } from '../components/models/unique-hero/Deathwalker9000Model'
import { SgtDrakeModel } from '../components/models/unique-hero/SgtDrakeModel'
import { SyvarrisModel } from '../components/models/unique-hero/SyvarrisModel'
import { AgentCarrModel } from '../components/models/unique-hero/AgentCarrModel'
import { AirbornElite1 } from '../components/models/unique-squad/airborn-elite/AirbornElite1'
import { AirbornElite2 } from '../components/models/unique-squad/airborn-elite/AirbornElite2'
import { AirbornElite3 } from '../components/models/unique-squad/airborn-elite/AirbornElite3'
import { AirbornElite4 } from '../components/models/unique-squad/airborn-elite/AirbornElite4'
import { RaelinRotvModel } from '../components/models/unique-hero/RaelinRotvModel'
import { MimringModel } from '../components/models/unique-hero/Mimring'
import { Krav1Model } from '../components/models/unique-squad/krav-maga-agents/Krav1Model'
import { Krav2Model } from '../components/models/unique-squad/krav-maga-agents/Krav2Model'
import { Krav3Model } from '../components/models/unique-squad/krav-maga-agents/Krav3Model'
import { ThorgrimModel } from '../components/models/unique-hero/ThorgrimModel'

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
  const { isPlacementPhase } = useBgioCtx()
  const { editingBoardHexes } = usePlacementContext()

  const positionX = x
  const positionZ = z
  const positionY = boardHex.altitude / 2
  const tailHex = selectTailHexForUnit(
    gameUnit.unitID,
    isPlacementPhase ? editingBoardHexes : boardHexes
  )
  const directionToTail = tailHex
    ? getDirectionOfNeighbor(boardHex, tailHex)
    : undefined
  const rotationToTail = ((directionToTail ?? 0) * Math.PI) / 3 + Math.PI
  const playerAdjustedRotationForSingleHexFigures =
    (gameUnit.rotation * Math.PI) / 3
  const rotationY = gameUnit.is2Hex
    ? rotationToTail
    : playerAdjustedRotationForSingleHexFigures
  const [isHovered, setIsHovered] = useState(false)
  return (
    <group
      onPointerEnter={(e) => {
        e.stopPropagation()
        setIsHovered(true)
      }}
      onPointerLeave={() => {
        setIsHovered(false)
      }}
      position={[positionX, positionY, positionZ]}
      rotation={[0, rotationY, 0]}
    >
      <FloatSelectedWrapper unitID={gameUnit.unitID}>
        <UnitModelByID gameUnit={gameUnit} isHovered={isHovered} />
      </FloatSelectedWrapper>
    </group>
  )
}
export const UnitModelByID = ({
  gameUnit,
  isHovered,
}: {
  gameUnit: GameUnit
  isHovered: boolean
}) => {
  switch (gameUnit.armyCardID) {
    case 'hs1000':
      // marro warriors
      if (gameUnit.modelIndex === 0)
        // return <MarroWarriors1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <MarroWarrior1 gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 1)
        // return <MarroWarriors2PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <MarroWarrior2 gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 2)
        // return <MarroWarriors3PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <MarroWarrior3 gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 3)
        // return <MarroWarriors4PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <MarroWarrior4 gameUnit={gameUnit} isHovered={isHovered} />
      return <MarroWarrior1 gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1001':
      // deathwalker 9000
      // return <D9000PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <Deathwalker9000Model gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1002':
      // izumi
      if (gameUnit.modelIndex === 0)
        return <Izumi1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 1)
        return <Izumi2PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 2)
        return <Izumi3PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <Izumi1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1003':
      // sgt drake
      // return <SgtDrakePlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <SgtDrakeModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1004':
      // syvarris
      // return <SyvarrisPlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <SyvarrisModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1005':
      if (gameUnit.modelIndex === 0)
        // return <Krav1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <Krav1Model gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 1)
        // return <Krav2PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <Krav2Model gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 2)
        // return <Krav3PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <Krav3Model gameUnit={gameUnit} isHovered={isHovered} />
      return <Krav1Model gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1006':
      if (gameUnit.modelIndex === 0)
        return <Tarn1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 1)
        return <Tarn2PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 2)
        return <Tarn3PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 3)
        return <Tarn4PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <Tarn1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1007':
      // agent carr
      // return <AgentCarrPlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <AgentCarrModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1008':
      // zettian guards
      if (gameUnit.modelIndex === 0)
        return <Zettian1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 1)
        return <Zettian2PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <Zettian1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1009':
      if (gameUnit.modelIndex === 0)
        // return <Airborn1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <AirbornElite1 gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 1)
        // return <Airborn2PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <AirbornElite2 gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 2)
        // return <Airborn3PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <AirbornElite3 gameUnit={gameUnit} isHovered={isHovered} />
      if (gameUnit.modelIndex === 3)
        // return <Airborn4PlainModel gameUnit={gameUnit} isHovered={isHovered} />
        return <AirbornElite4 gameUnit={gameUnit} isHovered={isHovered} />
      // return <Airborn1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <AirbornElite1 gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1010':
      return <FinnPlainModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1011':
      // return <ThorgrimPlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <ThorgrimModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1012':
      // return <Raelin1PlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <RaelinRotvModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1013':
      // return <MimringPlainModel gameUnit={gameUnit} isHovered={isHovered} />
      return <MimringModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1014':
      // ne gok sa
      return <NeGokSaPlainModel gameUnit={gameUnit} isHovered={isHovered} />
    case 'hs1015':
      // grimnak
      return <GrimnakPlainModel gameUnit={gameUnit} isHovered={isHovered} />
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
