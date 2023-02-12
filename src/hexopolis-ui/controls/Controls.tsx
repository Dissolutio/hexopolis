import { useBgioClientInfo, useBgioCtx } from 'bgio-contexts'
import React from 'react'
import { PlacementControls } from './PlacementControls'
import { PlaceOrderMarkersControls } from './PlaceOrderMarkersControls'
import { RopControls } from './RopControls'
export const Controls = () => {
  const { playerID } = useBgioClientInfo()
  const {
    gameover,
    isOrderMarkerPhase,
    isPlacementPhase,
    isRoundOfPlayPhase,
    isGameover,
  } = useBgioCtx()
  if (isPlacementPhase) {
    return <PlacementControls />
  }
  if (isOrderMarkerPhase) {
    return <PlaceOrderMarkersControls />
  }
  if (isRoundOfPlayPhase) {
    return <RopControls />
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
