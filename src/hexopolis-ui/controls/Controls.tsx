import { useBgioClientInfo, useBgioCtx } from 'bgio-contexts'
import { StyledControlsHeaderH2 } from 'hexopolis-ui/layout/Typography'
import React from 'react'
import { DraftControls, IdleDraftControls } from './DraftControls'
import { PlacementControls } from './PlacementControls'
import { PlaceOrderMarkersControls } from './PlaceOrderMarkersControls'
import { RopControls } from './RopControls'
export const Controls = () => {
  const { playerID } = useBgioClientInfo()
  const {
    gameover,
    isWaitingForPlayersToJoin,
    isMyTurn,
    isDraftPhase,
    isOrderMarkerPhase,
    isPlacementPhase,
    isRoundOfPlayPhase,
    isGameover,
  } = useBgioCtx()
  // if (isWaitingForPlayersToJoin) {
  //   return (
  //     <StyledControlsHeaderH2>
  //       Waiting for all players to join
  //     </StyledControlsHeaderH2>
  //   )
  // }
  if (isDraftPhase && isMyTurn) {
    return <DraftControls />
  }
  if (isDraftPhase && !isMyTurn) {
    return <IdleDraftControls />
  }
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
