import React from 'react'
import styled from 'styled-components'

import { useBgioClientInfo } from 'bgio-contexts'
import { playerIDDisplay } from 'game/transformers'

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
          <PlayerTeamLogoH1>
            Hexopolis: {playerIDDisplay(playerID)}
          </PlayerTeamLogoH1>
        </a>
      )
    }
    return (
      <PlayerTeamLogoH1>
        Hexopolis: {playerIDDisplay(playerID)}
      </PlayerTeamLogoH1>
    )
  }
  if (playerID === '1') {
    if (isLocalOrDemoGame) {
      return (
        <a href="#player0">
          <PlayerTeamLogoH1>
            Hexopolis: {playerIDDisplay(playerID)}
          </PlayerTeamLogoH1>
        </a>
      )
    }
    return (
      <PlayerTeamLogoH1>
        Hexopolis: {playerIDDisplay(playerID)}
      </PlayerTeamLogoH1>
    )
  }
  return null
}

const PlayerTeamLogoH1 = styled.h1`
  margin: 0;
  font-size: 1.3rem;
  color: var(--player-color);
`
