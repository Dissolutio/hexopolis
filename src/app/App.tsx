import { Route, Link, Routes } from 'react-router-dom'
import { Client } from 'boardgame.io/react'
import { SocketIO } from 'boardgame.io/multiplayer'
import { Debug } from 'boardgame.io/debug'
import { Helmet } from 'react-helmet'
import { BgioLobbyApiProvider } from 'bgio-contexts'
import { AuthProvider, useAuth } from 'hooks/useAuth'
import { MultiplayerLobby, MultiplayerLobbyProvider } from 'lobby'
import { MultiplayerNav } from './MultiplayerNav'
import { Hexoscape } from 'game/game'
import { isLocalApp, SERVER } from './constants'
import { Board } from 'hexopolis-ui/Board'
import { DemoLocalGameLinks, LocalApp, LocalDemoClients } from './LocalApp'
import { StyledFullScreenWorld } from 'hexopolis-ui/world/hexmap3d/StaticMap'

const MultiplayerGameClient = Client({
  game: Hexoscape,
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
              <Route path="/3d" element={<StyledFullScreenWorld />} />
              <Route
                path="/play"
                element={
                  <>
                    <PlayPage />
                  </>
                }
              />
              <Route
                path="/demo"
                element={
                  <>
                    <MultiplayerNav />
                    <DemoLocalGameLinks />
                  </>
                }
              />
              {/* Copied from Local App, because Routes can't handle a non-Route child */}
              <Route
                path="/local2"
                element={<LocalDemoClients numPlayers={2} />}
              />
              <Route
                path="/local3"
                element={<LocalDemoClients numPlayers={3} />}
              />
              <Route
                path="/local4"
                element={<LocalDemoClients numPlayers={4} />}
              />
              <Route
                path="/local5"
                element={<LocalDemoClients numPlayers={5} />}
              />
              <Route
                path="/local6"
                element={<LocalDemoClients numPlayers={6} />}
              />
            </Routes>
          </MultiplayerLobbyProvider>
        </BgioLobbyApiProvider>
      </AuthProvider>
    )
  }
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
