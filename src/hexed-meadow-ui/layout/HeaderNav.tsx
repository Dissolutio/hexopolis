import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { usePlayerID } from '../contexts'
import beesBigLogo from 'assets/beesBigLogo.png'
import butterfliesLogo from 'assets/butterfliesLogo.png'

export const HeaderNav = () => {
  const { playerID } = usePlayerID()
  return (
    <StyledNavbar>
      <PlayerTeamLogo playerID={playerID} />
      <Link to={'/help'}>Help</Link>
      <Link to={'/rules'}>Rules</Link>
      <Link to={'/feedback'}>Feedback</Link>
    </StyledNavbar>
  )
}

const StyledNavbar = styled.nav`
  background-color: var(--black);
  padding: 4px 16px 0px 16px;
  z-index: 10;
  & button:focus,
  & button:hover {
    outline: 2px solid var(--white);
  }
  a {
    color: var(--player-color) !important ;
  }
  .navbar-toggler {
    color: var(--player-color) !important ;
    border-color: var(--player-color) !important ;
    padding: 0.25rem;
  }
  .dropdown-menu {
    background-color: var(--black);
  }
`

const PlayerTeamLogo = ({ playerID, ...rest }: { playerID: string }) => {
  if (playerID === '0') {
    return (
      <PlayerTeamLogoImg src={beesBigLogo} alt="Bees team logo" {...rest} />
    )
  }
  if (playerID === '1') {
    return (
      <PlayerTeamLogoImg
        src={butterfliesLogo}
        alt="Butterflies team logo"
        {...rest}
      />
    )
  }
  return null
}

const PlayerTeamLogoImg = styled.img`
  height: var(--navbar-logo-height);
  width: auto;
`
