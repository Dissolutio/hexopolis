import { Route, Link, Routes } from 'react-router-dom'
import { Client } from 'boardgame.io/react'
import { Local, SocketIO } from 'boardgame.io/multiplayer'
import { Debug } from 'boardgame.io/debug'
import { Helmet } from 'react-helmet'
import { BgioLobbyApiProvider } from 'bgio-contexts'
import { AuthProvider, useAuth } from 'hooks/useAuth'
import { MultiplayerLobby, MultiplayerLobbyProvider } from 'lobby'
import { MultiplayerNav } from './MultiplayerNav'
import { HexedMeadow } from 'game/game'
import { isLocalApp, SERVER } from './constants'
import { Board } from 'hexopolis-ui/Board'

// Enable Redux DevTools in development
const reduxDevTools =
  window &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__()

export const specialMatchIdToTellHeaderNavThisMatchIsLocal = 'localGameId'
const Local2PlayerClient = Client({
  game: HexedMeadow,
  board: Board,
  numPlayers: 3,
  multiplayer: Local(),
  enhancer: reduxDevTools,
  // debug: { impl: Debug },
  debug: false,
})
const Local3PlayerClient = Client({
  game: HexedMeadow,
  board: Board,
  numPlayers: 3,
  multiplayer: Local(),
  enhancer: reduxDevTools,
  // debug: { impl: Debug },
  debug: false,
})
const LocalDemoClients = ({ numPlayers }: { numPlayers: number }) => {
  if (numPlayers === 2)
    return (
      <>
        <Local2PlayerClient
          playerID={'0'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${2}`}
        />
        <Local2PlayerClient
          playerID={'1'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${2}`}
        />
      </>
    )
  if (numPlayers === 3)
    return (
      <>
        <Local2PlayerClient
          playerID={'0'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${3}`}
        />
        <Local2PlayerClient
          playerID={'1'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${3}`}
        />
        <Local2PlayerClient
          playerID={'2'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${3}`}
        />
      </>
    )
  if (numPlayers === 4)
    return (
      <>
        <Local2PlayerClient
          playerID={'0'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${4}`}
        />
        <Local2PlayerClient
          playerID={'1'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${4}`}
        />
        <Local2PlayerClient
          playerID={'2'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${4}`}
        />
        <Local2PlayerClient
          playerID={'3'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${4}`}
        />
      </>
    )
  if (numPlayers === 5)
    return (
      <>
        <Local2PlayerClient
          playerID={'0'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${5}`}
        />
        <Local2PlayerClient
          playerID={'1'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${5}`}
        />
        <Local2PlayerClient
          playerID={'2'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${5}`}
        />
        <Local2PlayerClient
          playerID={'3'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${5}`}
        />
        <Local2PlayerClient
          playerID={'4'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${5}`}
        />
      </>
    )
  if (numPlayers === 6)
    return (
      <>
        <Local2PlayerClient
          playerID={'0'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
        <Local2PlayerClient
          playerID={'1'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
        <Local2PlayerClient
          playerID={'2'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
        <Local2PlayerClient
          playerID={'3'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
        <Local2PlayerClient
          playerID={'4'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
        <Local2PlayerClient
          playerID={'5'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
      </>
    )
  return null
}
const MultiplayerGameClient = Client({
  game: HexedMeadow,
  board: Board,
  numPlayers: 2,
  multiplayer: SocketIO({ server: SERVER }),
  debug: false,
})

export const App = () => {
  if (isLocalApp) {
    return <LocalApp />
  } else {
    return (
      <AuthProvider>
        <BgioLobbyApiProvider serverAddress={SERVER}>
          <MultiplayerLobbyProvider>
            <Helmet>
              <title>Hexoscape</title>
            </Helmet>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <MultiplayerNav />
                    <MultiplayerLobby />
                  </>
                }
              />
              <Route
                path="/demo"
                element={
                  <>
                    <MultiplayerNav />
                    <LocalDemoClients numPlayers={2} />
                  </>
                }
              />
              <Route
                path="/play"
                element={
                  <>
                    <MultiplayerNav />
                    <PlayPage />
                  </>
                }
              />
            </Routes>
          </MultiplayerLobbyProvider>
        </BgioLobbyApiProvider>
      </AuthProvider>
    )
  }
}

const LocalApp = () => {
  return (
    <>
      <Helmet>
        <title>Hexoscape - Local Game</title>
      </Helmet>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Choose a map:</h1>
              <ul>
                <li>
                  <Link to="/local2">2-Player Game</Link>
                </li>
                <li>
                  <Link to="/local3">3-Player Game</Link>
                </li>
                <li>
                  <Link to="/local4">4-Player Game</Link>
                </li>
              </ul>
            </>
          }
        />
        <Route path="/local2" element={<LocalDemoClients numPlayers={2} />} />
        <Route path="/local3" element={<LocalDemoClients numPlayers={3} />} />
        <Route path="/local4" element={<LocalDemoClients numPlayers={4} />} />
      </Routes>
    </>
  )
}

const PlayPage = () => {
  const { storedCredentials } = useAuth()
  const { playerID, matchID, playerCredentials } = storedCredentials
  if (!playerID || !matchID || !playerCredentials) {
    return (
      <p>
        You are not currently joined in a match.{' '}
        <Link to="/">Return to Lobby?</Link>
      </p>
    )
  }
  // TODO: This component, or its parent, needs to be responsible for decided which Game Client to render, depending on which game that the server offers that the player then chooses
  return (
    <MultiplayerGameClient
      matchID={matchID}
      playerID={playerID}
      credentials={playerCredentials}
    />
  )
}
