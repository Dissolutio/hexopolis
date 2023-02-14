import { Route, Link, Routes } from 'react-router-dom'
import { Client } from 'boardgame.io/react'
import { Local } from 'boardgame.io/multiplayer'
import { Debug } from 'boardgame.io/debug'
import { Helmet } from 'react-helmet'
import { Hexoscape } from 'game/game'
import { Board } from 'hexopolis-ui/Board'
import { specialMatchIdToTellHeaderNavThisMatchIsLocal } from './constants'

const reduxDevTools =
  window &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__()

export const LocalApp = () => {
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
              <h1>Choose a game:</h1>
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
                <li>
                  <Link to="/local5">5-Player Game</Link>
                </li>
                <li>
                  <Link to="/local6">6-Player Game</Link>
                </li>
              </ul>
            </>
          }
        />
        <Route path="/local2" element={<LocalDemoClients numPlayers={2} />} />
        <Route path="/local3" element={<LocalDemoClients numPlayers={3} />} />
        <Route path="/local4" element={<LocalDemoClients numPlayers={4} />} />
        <Route path="/local5" element={<LocalDemoClients numPlayers={5} />} />
        <Route path="/local6" element={<LocalDemoClients numPlayers={6} />} />
      </Routes>
    </>
  )
}
const Local2PlayerClient = Client({
  game: Hexoscape,
  board: Board,
  numPlayers: 2,
  multiplayer: Local(),
  enhancer: reduxDevTools,
  // debug: { impl: Debug },
  debug: false,
})
const Local3PlayerClient = Client({
  game: Hexoscape,
  board: Board,
  numPlayers: 3,
  multiplayer: Local(),
  enhancer: reduxDevTools,
  // debug: { impl: Debug },
  debug: false,
})
const Local4PlayerClient = Client({
  game: Hexoscape,
  board: Board,
  numPlayers: 4,
  multiplayer: Local(),
  enhancer: reduxDevTools,
  // debug: { impl: Debug },
  debug: false,
})
const Local5PlayerClient = Client({
  game: Hexoscape,
  board: Board,
  numPlayers: 5,
  multiplayer: Local(),
  enhancer: reduxDevTools,
  // debug: { impl: Debug },
  debug: false,
})
const Local6PlayerClient = Client({
  game: Hexoscape,
  board: Board,
  numPlayers: 6,
  multiplayer: Local(),
  enhancer: reduxDevTools,
  // debug: { impl: Debug },
  debug: false,
})
export const LocalDemoClients = ({ numPlayers }: { numPlayers: number }) => {
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
        <Local3PlayerClient
          playerID={'0'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${3}`}
        />
        <Local3PlayerClient
          playerID={'1'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${3}`}
        />
        <Local3PlayerClient
          playerID={'2'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${3}`}
        />
      </>
    )
  if (numPlayers === 4)
    return (
      <>
        <Local4PlayerClient
          playerID={'0'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${4}`}
        />
        <Local4PlayerClient
          playerID={'1'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${4}`}
        />
        <Local4PlayerClient
          playerID={'2'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${4}`}
        />
        <Local4PlayerClient
          playerID={'3'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${4}`}
        />
      </>
    )
  if (numPlayers === 5)
    return (
      <>
        <Local5PlayerClient
          playerID={'0'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${5}`}
        />
        <Local5PlayerClient
          playerID={'1'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${5}`}
        />
        <Local5PlayerClient
          playerID={'2'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${5}`}
        />
        <Local5PlayerClient
          playerID={'3'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${5}`}
        />
        <Local5PlayerClient
          playerID={'4'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${5}`}
        />
      </>
    )
  if (numPlayers === 6)
    return (
      <>
        <Local6PlayerClient
          playerID={'0'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
        <Local6PlayerClient
          playerID={'1'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
        <Local6PlayerClient
          playerID={'2'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
        <Local6PlayerClient
          playerID={'3'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
        <Local6PlayerClient
          playerID={'4'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
        <Local6PlayerClient
          playerID={'5'}
          matchID={`${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${6}`}
        />
      </>
    )
  return null
}
