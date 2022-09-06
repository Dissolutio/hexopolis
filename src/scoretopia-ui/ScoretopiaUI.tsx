import { useBgioClientInfo, useBgioG } from 'bgio-contexts'
import { LeaveJoinedMatchButton } from 'lobby/LeaveJoinedMatchButton'
import { ChatInput, ChatList } from './Chat'
import { Controls } from './Controls'
import { isLocalApp } from 'app/App'
import { GridGenerator, Hexagon, HexGrid, Layout } from 'react-hexgrid'
import styled from 'styled-components'

export const ScoretopiaUI = () => {
  const { playerID } = useBgioClientInfo()
  const { G } = useBgioG()
  const hexagons = GridGenerator.parallelogram(-2, 3, -2, 1)
  return (
    <div>
      <h1>{`YOU are PLAYER-${playerID}`}</h1>
      <p>{`Player 0 score: ${G?.score['0'] ?? ''}`}</p>
      <p>{`Player 1 score: ${G?.score['1'] ?? ''}`}</p>
      <Controls />
      <Wrapper>
        <HexGrid width={1200} height={1000}>
          <Layout size={{ x: 7, y: 7 }}>
            {hexagons.map((hex, i) => (
              <Hexagon key={i} q={hex.q} r={hex.r} s={hex.s} />
            ))}
          </Layout>
        </HexGrid>
      </Wrapper>
      {!isLocalApp && (
        <>
          <MultiplayerMatchPlayerList />
          <LeaveJoinedMatchButton />
          <h3>Chats</h3>
          <ChatList />
          <ChatInput />
        </>
      )}
    </div>
  )
}

const MultiplayerMatchPlayerList = () => {
  const { matchData } = useBgioClientInfo()

  return matchData ? (
    <>
      <h3>PlayerList</h3>
      <ul>
        {matchData.map((playerSlot) => {
          const { id } = playerSlot
          const playerName = playerSlot?.name ?? ''
          const isConnected = playerSlot?.isConnected ?? false
          const color = isConnected ? 'green' : 'red'
          return playerName ? (
            <li key={id} style={{ color }}>
              Player-{id}: <span>{playerName}</span>
            </li>
          ) : (
            <li key={id} style={{ color }}>
              Player-{id}: <span>No player yet</span>
            </li>
          )
        })}
      </ul>
    </>
  ) : null
}

const Wrapper = styled.div`
  margin: 0;
  padding: 1em;
  font-family: sans-serif;
  background: #f0f0f0;

  [draggable] {
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    user-select: none;
    -moz-user-drag: element;
    -webkit-user-drag: element;
    -khtml-user-drag: element;
    user-drag: element;
  }

  svg g {
    fill: #3f51b5;
    fill-opacity: 0.6;
  }
  svg g:hover {
    fill-opacity: 1;
  }
  svg g:hover text {
    fill-opacity: 1;
  }

  svg g polygon {
    stroke: #3f51b5;
    stroke-width: 0.2;
    transition: fill-opacity 0.2s;
  }
  svg g text {
    font-size: 0.3em;
    fill: #ffffff;
    fill-opacity: 0.4;
    transition: fill-opacity 0.2s;
  }
  svg path {
    fill: none;
    stroke: hsl(60, 20%, 70%);
    stroke-width: 0.4em;
    stroke-opacity: 0.3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`
