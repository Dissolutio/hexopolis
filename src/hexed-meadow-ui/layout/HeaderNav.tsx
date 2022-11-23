import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import beesBigLogo from '../assets/beesBigLogo.png'
import butterfliesLogo from '../assets/butterfliesLogo.png'
import { isLocalApp } from 'app/constants'
import { useBgioClientInfo } from 'bgio-contexts'

export const HeaderNav = ({
  isLocalOrDemoGame,
}: {
  isLocalOrDemoGame: boolean
}) => {
  const { playerID } = useBgioClientInfo()
  return (
    <StyledNavbar>
      <PlayerTeamLogo
        playerID={playerID}
        isLocalOrDemoGame={isLocalOrDemoGame}
      />
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

// for pass-and-play / development, making the logo a link to the other players screens is helpful (see Layout.tsx for the html-id we link to)

const PlayerTeamLogo = ({
  playerID,
  isLocalOrDemoGame,
}: {
  playerID: string
  isLocalOrDemoGame: boolean
}) => {
  if (playerID === '0') {
    if (isLocalOrDemoGame) {
      return (
        <a href="#player1">
          <PlayerTeamLogoImg src={beesBigLogo} alt="Bees team logo" />
        </a>
      )
    }
    return <PlayerTeamLogoImg src={beesBigLogo} alt="Bees team logo" />
  }
  if (playerID === '1') {
    if (isLocalOrDemoGame) {
      return (
        <a href="#player0">
          <PlayerTeamLogoImg
            src={butterfliesLogo}
            alt="Butterflies team logo"
          />
        </a>
      )
    }
    return (
      <PlayerTeamLogoImg src={butterfliesLogo} alt="Butterflies team logo" />
    )
  }
  return null
}

const PlayerTeamLogoImg = styled.img`
  height: var(--navbar-logo-height);
  width: auto;
`