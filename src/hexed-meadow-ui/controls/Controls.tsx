import { useBgioClientInfo, useBgioCtx } from 'bgio-contexts'
import React from 'react'
import {
  RopIdleControls,
  RopMoveControls,
  RopAttackControls,
  PlacementControls,
  PlaceOrderMarkersControls,
} from './'
import { Notifications } from './Notifications'

export const Controls = () => {
  const { playerID } = useBgioClientInfo()
  const { ctx } = useBgioCtx()
  const {
    gameover,
    isOrderMarkerPhase,
    isPlacementPhase,
    isRoundOfPlayPhase,
    isMyTurn,
    isAttackingStage,
    isGameover,
  } = ctx

  if (isPlacementPhase) {
    return <PlacementControls />
  }
  if (isOrderMarkerPhase) {
    return <PlaceOrderMarkersControls />
  }
  if (isRoundOfPlayPhase) {
    if (!isMyTurn) {
      return (
        <>
          <RopIdleControls />
        </>
      )
    }
    if (isMyTurn && !isAttackingStage) {
      return (
        <>
          <RopMoveControls />
        </>
      )
    }
    if (isMyTurn && isAttackingStage) {
      return (
        <>
          <RopAttackControls />
        </>
      )
    }
  }
  if (isGameover) {
    const winnerID = gameover.winner
    if (winnerID === playerID) {
      return <h1>{`VICTORY!`}</h1>
    } else {
      return <h1>{`DEFEAT!`}</h1>
    }
  }
  return <></>
}
