import React from 'react'
import styled from 'styled-components'
import { useG, useCtx } from '../contexts'

export const TurnCounter = () => {
  const { currentRound, currentOrderMarker } = useG()
  const { ctx } = useCtx()

  const { isPlacementPhase, isOrderMarkerPhase, isRoundOfPlayPhase } = ctx

  return (
    <StyledTurnCounter>
      {isPlacementPhase && <div>Phase: Army Placement</div>}
      {isOrderMarkerPhase && <div>Phase: Place Order Markers</div>}
      {isRoundOfPlayPhase && (
        <>
          <div>Round: {currentRound + 1}</div>
          <div>Order marker: {currentOrderMarker + 1}</div>
        </>
      )}
    </StyledTurnCounter>
  )
}

const StyledTurnCounter = styled.span`
  position: absolute;
  top: 0%;
  right: 0%;
  padding-top: 36px;
  padding-right: 36px;
  @media screen and (max-width: 1100px) {
    padding-top: 14px;
    padding-left: 14px;
  }
  font-size: 0.8rem;
  z-index: 2;
`
