import { useBgioG } from 'bgio-contexts'
import React from 'react'
import styled from 'styled-components'

export const DraftCounter = () => {
  const { maxArmyValue, myPointsOnBoard } = useBgioG()

  return (
    <StyledDraftCounter>
      <div>Phase: Draft</div>
      <div>Max Army Value: {maxArmyValue}</div>
      <div>Points left: {maxArmyValue - myPointsOnBoard}</div>
    </StyledDraftCounter>
  )
}

const StyledDraftCounter = styled.span`
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
