import React from 'react'

import { PageNavbar } from './PageNavbar'
import { StyledPageWrapper } from './StyledPageWrapper'

export const RulesPage = () => {
  return (
    <>
      <PageNavbar />
      <StyledPageWrapper>
        <h1>Rules</h1>
        <GameRulesJsx />
      </StyledPageWrapper>
    </>
  )
}
const GameRulesJsx = () => {
  return <div>I am the GameRulesJsx</div>
}
