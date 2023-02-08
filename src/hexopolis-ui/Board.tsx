import React from 'react'
import { ThemeProvider } from 'styled-components'
import { BoardProps } from 'boardgame.io/react'
import {
  MapContextProvider,
  UIContextProvider,
  PlacementContextProvider,
  PlayContextProvider,
} from './contexts'
import { Layout, HeaderNav } from './layout'
import { MapDisplay } from './hexmap/MapDisplay'
import { theme } from './theme'
import {
  BgioClientInfoProvider,
  BgioGProvider,
  BgioMovesProvider,
  BgioEventsProvider,
  BgioCtxProvider,
  BgioChatProvider,
} from 'bgio-contexts'
import { ChatMessage } from 'boardgame.io'
import { GameState } from 'game/types'
import { specialMatchIdToTellHeaderNavThisMatchIsLocal } from 'app/App'
import { TabsComponent } from './controls/TabsComponent'

interface MyGameProps extends BoardProps<GameState> {
  chatMessages: ChatMessage[]
}

export const Board = ({
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
  playerID = 'observer',
  log,
  matchID,
  matchData,
  isActive,
  isMultiplayer,
  isConnected,
  credentials,
}: MyGameProps) => {
  const isLocalOrDemoGame =
    matchID === specialMatchIdToTellHeaderNavThisMatchIsLocal
  const mapWrapperRef = React.useRef<HTMLDivElement>(null)
  return (
    <>
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
                    <MapContextProvider hexMap={G.hexMap}>
                      {/* UI Context is consumed by PlacementContext and PlayContext */}
                      <UIContextProvider>
                        <PlacementContextProvider>
                          <PlayContextProvider>
                            <Layout mapWrapperRef={mapWrapperRef}>
                              <HeaderNav
                                isLocalOrDemoGame={isLocalOrDemoGame}
                              />

                              <MapDisplay mapWrapperRef={mapWrapperRef} />
                              <TabsComponent />
                            </Layout>
                          </PlayContextProvider>
                        </PlacementContextProvider>
                      </UIContextProvider>
                    </MapContextProvider>
                  </BgioChatProvider>
                </BgioEventsProvider>
              </BgioMovesProvider>
            </BgioCtxProvider>
          </BgioGProvider>
        </BgioClientInfoProvider>
      </ThemeProvider>
    </>
  )
}
