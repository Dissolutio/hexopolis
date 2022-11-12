import React from 'react'
import { Link } from 'react-router-dom'

import { PageNavbar } from './PageNavbar'
import { StyledPageWrapper } from './StyledPageWrapper'

export const HelpPage = () => {
  return (
    <>
      <PageNavbar />
      <StyledPageWrapper>
        <h1>Help Page</h1>
        <p>
          <Link to="/rules">Game Rules</Link>
        </p>
      </StyledPageWrapper>
    </>
  )
}
