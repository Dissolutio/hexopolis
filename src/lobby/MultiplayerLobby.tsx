import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { useAuth } from 'hooks'
import { useMultiplayerLobby } from './useMultiplayerLobby'
import { SelectedGameMatchList, MatchListItem } from './SelectedGameMatchList'
import { GameSelect } from './GameSelect'
import { Login } from './Login'
import { LeaveJoinedMatchButton } from './LeaveJoinedMatchButton'
import { CreateMatchForm } from './CreateMatchForm'

export const MultiplayerLobby = () => {
  const {
    lobbyMatches,
    selectedGame,
    lobbyGamesError,
    verifyMatchSuccess,
    verifyMatchError,
    updateLobbyGames,
    handleLeaveJoinedMatch,
    handleVerifyJoinedMatch,
  } = useMultiplayerLobby()
  const { storedCredentials, isAuthenticated } = useAuth()
  const joinedMatchID = storedCredentials?.matchID
  const selectedGameMatches = lobbyMatches?.[selectedGame] ?? []
  const numCurrentMatches = selectedGameMatches?.length ?? 0
  const joinedMatch = lobbyMatches?.[selectedGame]?.find(
    (m) => m.matchID === joinedMatchID
  )
  // First, user must choose a name, this name is not sent to server yet, it is only kept in session storage
  if (!isAuthenticated) {
    return (
      <>
        <p>Please choose a username in order to play multiplayer</p>
        <Login />
      </>
    )
  }
  return (
    <>
      <details>
        <summary>{`Account: ${storedCredentials.playerName}`}</summary>
        <Login />
      </details>
      {/* Either we errored, or we connected to server and received games list */}
      <hr></hr>
      {lobbyGamesError ? (
        <>
          <p
            style={{ color: 'red' }}
          >{`Sorry, could not connect to server `}</p>
          <button onClick={updateLobbyGames}>Retry Connecting to Server</button>
        </>
      ) : (
        <>
          <details>
            <summary>{`Switch games (current: ${selectedGame})`}</summary>
            <GameSelect />
          </details>
        </>
      )}
      {/* <hr></hr> */}
      {/* If no games/connection, don't show anything below */}
      {selectedGame && (
        <>
          {/* Joined match NOT verified, show error / retry OR leave game */}
          {verifyMatchError && (
            <>
              <p>
                Error -- the match you were in could not be verified:{' '}
                {`${verifyMatchError}`}
              </p>
              <p>
                <button onClick={handleVerifyJoinedMatch}>Retry!</button>
              </p>
              <p>
                <button onClick={handleLeaveJoinedMatch}>
                  Leave that match, there are other matters to tend to...
                </button>
              </p>
            </>
          )}

          {/* If in a match, show play/leave buttons , otherwise show match list and create/refresh buttons */}
          {verifyMatchSuccess && joinedMatchID ? (
            <>
              <p>You are joined in a match:</p>
              <MatchListItem match={joinedMatch} />
              <p>
                <LinkAsButton
                  style={{
                    backgroundColor: 'var(--success-green)',
                  }}
                  to="/play"
                >
                  GO TO YOUR MATCH
                </LinkAsButton>
              </p>
              <div>
                <LeaveJoinedMatchButton />
              </div>
            </>
          ) : (
            <>
              <details>
                <summary>{`Create new match`}</summary>
                <CreateMatchForm />
              </details>
              <h2>{`Matches for ${selectedGame} (total: ${numCurrentMatches})`}</h2>
              <SelectedGameMatchList />
            </>
          )}
        </>
      )}
    </>
  )
}

const LinkAsButton = styled(Link)`
  /* Below is dark.css button styles */
  -webkit-appearance: none;
  cursor: pointer;
  transition: background-color 0.1s linear, border-color 0.1s linear,
    color 0.1s linear, box-shadow 0.1s linear, transform 0.1s ease;
  transition: background-color var(--animation-duration) linear,
    border-color var(--animation-duration) linear,
    color var(--animation-duration) linear,
    box-shadow var(--animation-duration) linear,
    transform var(--animation-duration) ease;
  background-color: #0c151c;
  background-color: var(--button-base);
  padding-right: 30px;
  padding-left: 30px;
  color: #fff;
  color: var(--form-text);
  background-color: #161f27;
  background-color: var(--background);
  margin-right: 6px;
  margin-bottom: 6px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  outline: none;
  &:hover {
    background: #040a0f;
    background: var(--button-hover);
  }
  &:focus {
    box-shadow: 0 0 0 2px var(--focus);
  }
`
