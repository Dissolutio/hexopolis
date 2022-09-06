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

export const HexedMeadowBoard: React.FunctionComponent<BoardProps> = ({
  playerID,
  G,
  ctx,
  moves,
  undo,
  redo,
}) => {
  return (
    <ThemeProvider theme={theme(playerID ?? '')}>
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
    </ThemeProvider>
  )
}

export default HexedMeadowBoard
