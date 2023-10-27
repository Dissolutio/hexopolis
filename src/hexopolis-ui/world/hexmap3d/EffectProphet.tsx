import { CameraControls } from '@react-three/drei'
import { useBgioClientInfo, useBgioCtx, useBgioG } from 'bgio-contexts'
import { getBoardHex3DCoords } from 'game/hex-utils'
import { selectHexForUnit } from 'game/selectors'
import { usePlayContext, useUIContext } from 'hexopolis-ui/contexts'
import { StyledControlsHeaderH2 } from 'hexopolis-ui/layout/Typography'
import React, { useEffect } from 'react'

export const EffectProphet = ({
  cameraControlsRef,
}: {
  cameraControlsRef: React.MutableRefObject<CameraControls>
}) => {
  const { isRoundOfPlayPhase, isMovementStage } = useBgioCtx()
  if (isRoundOfPlayPhase) {
    if (isMovementStage) {
      return <EffectStartOfTurn cameraControlsRef={cameraControlsRef} />
    }
  }
  return <></>
}

const EffectStartOfTurn = ({
  cameraControlsRef,
}: {
  cameraControlsRef: React.MutableRefObject<CameraControls>
}) => {
  const { isRoundOfPlayPhase, isMovementStage } = useBgioCtx()
  const { boardHexes, gameUnits } = useBgioG()
  const { playerID } = useBgioClientInfo()
  //   const { setSelectedUnitID } = useUIContext()
  const { revealedGameCardUnitIDs } = usePlayContext()
  const randomEnemyUnit = Object.values(gameUnits).find(
    (u) => u.playerID !== playerID
  )
  useEffect(() => {
    if (Boolean(revealedGameCardUnitIDs?.[0])) {
      const hex = selectHexForUnit(revealedGameCardUnitIDs?.[0], boardHexes)
      const hexForRandomEnemyUnit = selectHexForUnit(
        randomEnemyUnit?.unitID ?? '',
        boardHexes
      )
      const pos = hex ? getBoardHex3DCoords(hex) : undefined
      const posLookAt = hexForRandomEnemyUnit
        ? getBoardHex3DCoords(hexForRandomEnemyUnit)
        : undefined
      if (pos && posLookAt) {
        // so, we pick a the first enemy unit, to look in their direction
        // then, we kick the camera back on the X & Z axes, and kick the look-at similarly towards the target
        // the result is we are looking from a spot a little behind and above our unit, at a spot a little in front of and below our unit, towards the enemy
        const cameraOutKick = 10
        const cameraFromAbove = 20
        const cameraLookBelow = 10
        const dX = pos.x - posLookAt.x > 0 ? cameraOutKick : -cameraOutKick
        const dZ = pos.z - posLookAt.z > 0 ? cameraOutKick : -cameraOutKick
        cameraControlsRef.current.setLookAt(
          pos.x + dX,
          pos.y + cameraFromAbove,
          pos.z + dZ,

          pos.x - dX,
          pos.y - cameraLookBelow,
          pos.z - dZ,

          true
        )
      }
    }
  }, [])

  return (
    // Need to return something that persists
    <>
      <mesh>
        <boxGeometry args={[0.001, 0.001, 0.001]} />
        <meshBasicMaterial />
      </mesh>
    </>
  )
}
