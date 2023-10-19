import { useBgioCtx, useBgioG } from 'bgio-contexts'
import React from 'react'
import styled from 'styled-components'

export const RoundCounter = () => {
  const { currentRoundText, currentOrderMarker } = useBgioG()
  const { isPlacementPhase, isOrderMarkerPhase, isRoundOfPlayPhase } =
    useBgioCtx()

  return (
    <StyledRoundCounter>
      {isPlacementPhase && <>Phase: Army Placement</>}
      {isOrderMarkerPhase && <>Phase: Place Order Markers</>}
      {isRoundOfPlayPhase && (
        <>
          <>Round: {currentRoundText}</>
          <>Order marker: {currentOrderMarker + 1}</>
        </>
      )}
    </StyledRoundCounter>
  )
}

const StyledRoundCounter = styled.span`
  position: absolute;
  top: 36px;
  right: 36px;
  @media screen and (max-width: 1100px) {
    top: 14px;
    right: 14px;
  }
  font-size: 0.8rem;
  z-index: 2;
`
