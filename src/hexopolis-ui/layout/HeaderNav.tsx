import React from 'react'
import styled from 'styled-components'

import { useBgioClientInfo } from 'bgio-contexts'
import { playerIDDisplay } from 'game/transformers'

export const HeaderNav = ({
  isLocalOrDemoGame,
  localOrDemoGameNumPlayers,
}: {
  isLocalOrDemoGame: boolean
  localOrDemoGameNumPlayers: number
}) => {
  const { playerID } = useBgioClientInfo()
  return (
    <StyledNavbar>
      <PlayerTeamLogo
        playerID={playerID}
        isLocalOrDemoGame={isLocalOrDemoGame}
        localOrDemoGameNumPlayers={localOrDemoGameNumPlayers}
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

const PlayerTeamLogo = ({
  playerID,
  isLocalOrDemoGame,
  localOrDemoGameNumPlayers,
}: {
  playerID: string
  isLocalOrDemoGame: boolean
  localOrDemoGameNumPlayers: number
}) => {
  if (isLocalOrDemoGame) {
    return (
      // for pass-and-play / development, making the logo a link to the other players screens is helpful (see Layout.tsx for the html-id we link to)
      <a
        // this will make it so player 0-4 will link to player 1-5, and player 5 will link to player 0
        href={`#player${
          parseInt(playerID) === localOrDemoGameNumPlayers - 1
            ? 0
            : parseInt(playerID) + 1
        }`}
      >
        <PlayerTeamLogoH1>
          Hexopolis: {playerIDDisplay(playerID)}
        </PlayerTeamLogoH1>
      </a>
    )
  }
  return (
    <PlayerTeamLogoH1>Hexopolis: {playerIDDisplay(playerID)}</PlayerTeamLogoH1>
  )
}

const PlayerTeamLogoH1 = styled.h1`
  margin: 0;
  font-size: 1.3rem;
  color: var(--player-color);
`
