import { BrowserRouter, Route, Link, Routes } from 'react-router-dom'
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

const hexedMeadowClientOptions = {
  game: HexedMeadow,
  board: Board,
  numPlayers: 6,
}
export const specialMatchIdToTellHeaderNavThisMatchIsLocal = 'localGameId'
const DemoGameClient = Client({
  ...hexedMeadowClientOptions,
  multiplayer: Local(),
  enhancer: reduxDevTools,
  // debug: { impl: Debug },
  debug: false,
})

const MultiplayerGameClient = Client({
  ...hexedMeadowClientOptions,
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
                      <DemoGameClient
                        matchID={specialMatchIdToTellHeaderNavThisMatchIsLocal}
                        playerID="0"
                      />
                      <DemoGameClient
                        matchID={specialMatchIdToTellHeaderNavThisMatchIsLocal}
                        playerID="1"
                      />
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
    <>
      <Helmet>
        <title>Hexoscape - Local Game</title>
      </Helmet>
      <DemoGameClient
        matchID={specialMatchIdToTellHeaderNavThisMatchIsLocal}
        playerID="0"
      />
      <DemoGameClient
        matchID={specialMatchIdToTellHeaderNavThisMatchIsLocal}
        playerID="1"
      />
      <DemoGameClient
        matchID={specialMatchIdToTellHeaderNavThisMatchIsLocal}
        playerID="2"
      />
      <DemoGameClient
        matchID={specialMatchIdToTellHeaderNavThisMatchIsLocal}
        playerID="3"
      />
      <DemoGameClient
        matchID={specialMatchIdToTellHeaderNavThisMatchIsLocal}
        playerID="4"
      />
      <DemoGameClient
        matchID={specialMatchIdToTellHeaderNavThisMatchIsLocal}
        playerID="5"
      />
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
