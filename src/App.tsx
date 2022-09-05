import { BrowserRouter, Route, Link, Routes } from 'react-router-dom'
import { Client } from 'boardgame.io/react'
import { Local, SocketIO } from 'boardgame.io/multiplayer'
import { Debug } from 'boardgame.io/debug'

import { BgioLobbyApiProvider } from 'bgio-contexts'
import { AuthProvider, useAuth } from 'hooks/useAuth'
import { MultiplayerLobby, MultiplayerLobbyProvider } from 'lobby'
import { scoretopiaBonanzaGame } from './game/game'
import { ScoretopiaBoard } from './scoretopia-ui/ScoretopiaBoard'
import { MultiplayerNav } from './Nav'

// ! Three Options:
// * A local game (for game development) `npm run start`
// * Client that connects to a local server `npm run devstart`
// * Client that connects to its origin server `npm run build`

const isDeploymentEnv = process.env.NODE_ENV === 'production'
const isDevEnv = process.env.NODE_ENV === 'development'
const isSeparateServer = Boolean(process.env.REACT_APP_WITH_SEPARATE_SERVER)
export const isLocalApp = isDevEnv && !isSeparateServer

// use appropriate address for server
const hostname = window?.location?.hostname ?? ''
const protocol = window?.location?.protocol ?? ''
const port = window?.location?.port ?? ''
const deploymentServerAddr = `${protocol}//${hostname}${port ? `:${port}` : ``}`
const localServerAddr = `http://localhost:8000`
const SERVER = isDeploymentEnv ? deploymentServerAddr : localServerAddr

// Enable Redux DevTools in development
const reduxDevTools =
  window &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__()

const bgioClientOptions = {
  game: scoretopiaBonanzaGame,
  board: ScoretopiaBoard,
  numPlayers: 2,
}

const DemoGameClient = Client({
  ...bgioClientOptions,
  multiplayer: Local(),
  enhancer: reduxDevTools,
  // debug: { impl: Debug },
  debug: false,
})

const MultiplayerGameClient = Client({
  ...bgioClientOptions,
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
            <BrowserRouter>
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
                      <DemoGameClient matchID="matchID" playerID="0" />
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
            </BrowserRouter>
          </MultiplayerLobbyProvider>
        </BgioLobbyApiProvider>
      </AuthProvider>
    )
  }
}

const LocalApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Player 0 VS Player 1</h1>
              <div style={{ paddingRight: '20px', paddingLeft: '20px' }}>
                <DemoGameClient matchID="matchID" playerID="0" />
                <hr style={{ marginTop: '20px', marginBottom: '20px' }} />
                <DemoGameClient matchID="matchID" playerID="1" />
              </div>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
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
  return (
    <MultiplayerGameClient
      matchID={matchID}
      playerID={playerID}
      credentials={playerCredentials}
    />
  )
}
