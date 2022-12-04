import { useBgioClientInfo, useBgioCtx } from 'bgio-contexts'
import React from 'react'
import { PlacementControls, PlaceOrderMarkersControls } from './'
import { RoundOfPlayControls } from './RoundOfPlayControls'
export const Controls = () => {
  const { playerID } = useBgioClientInfo()
  const { ctx } = useBgioCtx()
  const {
    gameover,
    isOrderMarkerPhase,
    isPlacementPhase,
    isRoundOfPlayPhase,
    isGameover,
  } = ctx

  if (isPlacementPhase) {
    return <PlacementControls />
  }
  if (isOrderMarkerPhase) {
    return <PlaceOrderMarkersControls />
  }
  if (isRoundOfPlayPhase) {
    return <RoundOfPlayControls />
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
