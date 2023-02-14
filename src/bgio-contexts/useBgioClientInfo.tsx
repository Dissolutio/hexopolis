import { Server } from 'boardgame.io'
import { BoardProps } from 'boardgame.io/react'
import * as React from 'react'

type BgioClientInfo = {
  playerID: string
  log: BoardProps['log']
  matchID: string
  matchData: Server.PlayerMetadata[] | undefined // An array containing the players that have joined the current match via the Lobby API
  isActive: boolean
  isMultiplayer: boolean
  isConnected: boolean
  credentials: string
}
// add a handy utility property
type BgioClientInfoCtxValue = BgioClientInfo & {
  belongsToPlayer: (thing: any) => boolean
  isAllPlayerSlotsFilled: boolean
}

const BgioClientInfoContext = React.createContext<
  BgioClientInfoCtxValue | undefined
>(undefined)

type BgioClientInfoProviderProps = BgioClientInfo & {
  children: React.ReactNode
  isLocalOrDemoGame: boolean
}
export function BgioClientInfoProvider(props: BgioClientInfoProviderProps) {
  const {
    isLocalOrDemoGame,
    children,
    playerID,
    log,
    matchID,
    matchData,
    isActive,
    isMultiplayer,
    isConnected,
    credentials,
  } = props
  const belongsToPlayer = (thing: any): boolean =>
    thing && thing?.playerID ? thing.playerID === playerID : false
  const isAllPlayerSlotsFilled =
    !isLocalOrDemoGame &&
    (matchData?.every((player) => player.isConnected) ?? false) &&
    (matchData?.length ?? 0) > 0
  return (
    <BgioClientInfoContext.Provider
      value={{
        playerID,
        belongsToPlayer,
        log,
        matchID,
        matchData,
        isActive,
        isMultiplayer,
        isAllPlayerSlotsFilled,
        isConnected,
        credentials,
      }}
    >
      {children}
    </BgioClientInfoContext.Provider>
  )
}
export function useBgioClientInfo() {
  const context = React.useContext(BgioClientInfoContext)
  if (context === undefined) {
    throw new Error(
      'useBgioClientInfo must be used within a BgioClientInfoProvider'
    )
  }
  return context
}
