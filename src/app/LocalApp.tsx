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
              <DemoLocalGameLinks />
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
export const DemoLocalGameLinks = () => (
  // if we don't use the reloadDocument prop, then some state seems to be shared or reused between the different games, resulting in crashes
  // magically, and wonderfully, this prop fixes the problem so a user can demo the different multiplayer games in rapid (enough) succession by clicking the links back to back
  <>
    <ul>
      <li>
        <Link reloadDocument to="/local2">
          2-Player Game
        </Link>
      </li>
      <li>
        <Link reloadDocument to="/local3">
          3-Player Game
        </Link>
      </li>
      <li>
        <Link reloadDocument to="/local4">
          4-Player Game
        </Link>
      </li>
      <li>
        <Link reloadDocument to="/local5">
          5-Player Game
        </Link>
      </li>
      <li>
        <Link reloadDocument to="/local6">
          6-Player Game
        </Link>
      </li>
    </ul>
  </>
)

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
  const matchID = `${specialMatchIdToTellHeaderNavThisMatchIsLocal}:${numPlayers}`
  if (numPlayers === 2)
    return (
      <>
        <Local2PlayerClient playerID={'0'} matchID={matchID} />
        <Local2PlayerClient playerID={'1'} matchID={matchID} />
      </>
    )
  if (numPlayers === 3)
    return (
      <>
        <Local3PlayerClient playerID={'0'} matchID={matchID} />
        <Local3PlayerClient playerID={'1'} matchID={matchID} />
        <Local3PlayerClient playerID={'2'} matchID={matchID} />
      </>
    )
  if (numPlayers === 4)
    return (
      <>
        <Local4PlayerClient playerID={'0'} matchID={matchID} />
        <Local4PlayerClient playerID={'1'} matchID={matchID} />
        <Local4PlayerClient playerID={'2'} matchID={matchID} />
        <Local4PlayerClient playerID={'3'} matchID={matchID} />
      </>
    )
  if (numPlayers === 5)
    return (
      <>
        <Local5PlayerClient playerID={'0'} matchID={matchID} />
        <Local5PlayerClient playerID={'1'} matchID={matchID} />
        <Local5PlayerClient playerID={'2'} matchID={matchID} />
        <Local5PlayerClient playerID={'3'} matchID={matchID} />
        <Local5PlayerClient playerID={'4'} matchID={matchID} />
      </>
    )
  if (numPlayers === 6)
    return (
      <>
        <Local6PlayerClient playerID={'0'} matchID={matchID} />
        <Local6PlayerClient playerID={'1'} matchID={matchID} />
        <Local6PlayerClient playerID={'2'} matchID={matchID} />
        <Local6PlayerClient playerID={'3'} matchID={matchID} />
        <Local6PlayerClient playerID={'4'} matchID={matchID} />
        <Local6PlayerClient playerID={'5'} matchID={matchID} />
      </>
    )
  return null
}
