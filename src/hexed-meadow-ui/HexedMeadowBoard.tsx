import React from 'react'
import { ThemeProvider } from 'styled-components'
import { BoardProps } from 'boardgame.io/react'
import {
  PlayerIDProvider,
  GProvider,
  MovesProvider,
  CtxProvider,
  MapContextProvider,
  UIContextProvider,
  PlacementContextProvider,
  PlayContextProvider,
} from './contexts'
import { Layout, HeaderNav } from './layout'
import { Controls } from './controls'
import { MapDisplay } from './hexmap'
import { theme } from './theme'
import './theme.css'
import {
  BgioClientInfoProvider,
  BgioGProvider,
  BgioMovesProvider,
  BgioEventsProvider,
  BgioCtxProvider,
  BgioChatProvider,
} from 'bgio-contexts'
import { ChatMessage } from 'boardgame.io'

type MyBoardProps = BoardProps & { chatMessages?: ChatMessage[] }

export const HexedMeadowBoard = ({
  // G
  G,
  // CTX
  ctx,
  // MOVES
  moves,
  undo,
  redo,
  // EVENTS
  events,
  reset,
  // CHAT
  sendChatMessage,
  chatMessages = [],
  // ALSO ON BOARD PROPS
  playerID,
  log,
  matchID,
  matchData,
  isActive,
  isMultiplayer,
  isConnected,
  credentials,
}: MyBoardProps) => {
  return (
    <ThemeProvider theme={theme(playerID ?? '')}>
      <BgioClientInfoProvider
        log={log}
        playerID={playerID || ''}
        matchID={matchID}
        matchData={matchData}
        credentials={credentials || ''}
        isMultiplayer={isMultiplayer}
        isConnected={isConnected}
        isActive={isActive}
      >
        <BgioGProvider G={G}>
          <BgioCtxProvider ctx={ctx}>
            <BgioMovesProvider moves={moves} undo={undo} redo={redo}>
              <BgioEventsProvider reset={reset} events={events}>
                <BgioChatProvider
                  chatMessages={chatMessages}
                  sendChatMessage={sendChatMessage}
                >
                  {/* START OLD ONES */}
                  <PlayerIDProvider playerID={playerID ?? ''}>
                    <GProvider G={G}>
                      <CtxProvider ctx={ctx}>
                        <MovesProvider moves={moves} undo={undo} redo={redo}>
                          <MapContextProvider>
                            <UIContextProvider>
                              <PlacementContextProvider>
                                <PlayContextProvider>
                                  <Layout>
                                    <HeaderNav />
                                    <MapDisplay />
                                    <Controls />
                                  </Layout>
                                </PlayContextProvider>
                              </PlacementContextProvider>
                            </UIContextProvider>
                          </MapContextProvider>
                        </MovesProvider>
                      </CtxProvider>
                    </GProvider>
                  </PlayerIDProvider>
                  {/* END OLD ONES */}
                </BgioChatProvider>
              </BgioEventsProvider>
            </BgioMovesProvider>
          </BgioCtxProvider>
        </BgioGProvider>
      </BgioClientInfoProvider>
    </ThemeProvider>
  )
}

export default HexedMeadowBoard
