import React from 'react'
import { usePlayerID, useCtx } from '../contexts'
import {
  RopIdleControls,
  RopMoveControls,
  RopAttackControls,
  PlacementControls,
  PlaceOrderMarkersControls,
} from './'

export const Controls = () => {
  const { playerID } = usePlayerID()
  const { ctx } = useCtx()
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
      return <RopIdleControls />
    }
    if (isMyTurn && !isAttackingStage) {
      return <RopMoveControls />
    }
    if (isMyTurn && isAttackingStage) {
      return <RopAttackControls />
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
