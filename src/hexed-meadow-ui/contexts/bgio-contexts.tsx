import * as React from 'react'
import { BoardProps } from 'boardgame.io/react'

import { phaseNames, stageNames } from 'game/HM-constants'
import {
  PlayerOrderMarkers,
  GameState,
  GameArmyCard,
  GameUnit,
} from 'game/HM-types'

//️ PLAYERID
type PlayerIDProviderProps = { children: React.ReactNode; playerID: string }
const PlayerIDContext = React.createContext<
  { playerID: string; belongsToPlayer: (thing: any) => boolean } | undefined
>(undefined)

export function PlayerIDProvider({
  playerID,
  children,
}: PlayerIDProviderProps) {
  const belongsToPlayer = (thing: any): boolean => thing?.playerID === playerID
  return (
    <PlayerIDContext.Provider value={{ playerID: playerID, belongsToPlayer }}>
      {children}
    </PlayerIDContext.Provider>
  )
}
export function usePlayerID() {
  const context = React.useContext(PlayerIDContext)
  if (context === undefined) {
    throw new Error('usePlayerID must be used within a PlayerIDProvider')
  }
  return context
}

//️ G
type GProviderProps = { children: React.ReactNode; G: GameState }
type G = GameState & {
  myCards: GameArmyCard[]
  myStartZone: string[]
  myUnits: GameUnit[]
  myOrderMarkers: PlayerOrderMarkers
}
const GContext = React.createContext<G | undefined>(undefined)
export function GProvider({ G, children }: GProviderProps) {
  const { playerID, belongsToPlayer } = usePlayerID()
  const myCards: GameArmyCard[] = G.armyCards.filter(belongsToPlayer)
  const myStartZone: string[] = G.startZones[playerID]
  const myUnits: GameUnit[] = Object.values(G.gameUnits).filter(belongsToPlayer)
  const myOrderMarkers: PlayerOrderMarkers = G.players?.[playerID]?.orderMarkers
  return (
    <GContext.Provider
      value={{ ...G, myCards, myStartZone, myUnits, myOrderMarkers }}
    >
      {children}
    </GContext.Provider>
  )
}
export function useG() {
  const context = React.useContext(GContext)
  if (context === undefined) {
    throw new Error('useG must be used within a GProvider')
  }
  return context
}
//️ CTX
type CtxProviderProps = {
  children: React.ReactNode
  ctx: BoardProps['ctx']
}
type ModifiedCtx = {
  ctx: BoardProps['ctx'] & {
    isMyTurn: boolean
    isOrderMarkerPhase: boolean
    isPlacementPhase: boolean
    isRoundOfPlayPhase: boolean
    isAttackingStage: boolean
    isGameover: boolean
  }
}
const CtxContext = React.createContext<ModifiedCtx | undefined>(undefined)

export function CtxProvider({ ctx, children }: CtxProviderProps) {
  const { playerID } = usePlayerID()
  const isMyTurn: boolean = ctx.currentPlayer === playerID
  const isOrderMarkerPhase: boolean = ctx.phase === phaseNames.placeOrderMarkers
  const isPlacementPhase: boolean = ctx.phase === phaseNames.placement
  const isRoundOfPlayPhase: boolean = ctx.phase === phaseNames.roundOfPlay
  const isAttackingStage: boolean =
    isRoundOfPlayPhase && ctx.activePlayers?.[playerID] === stageNames.attacking
  const isGameover: boolean = Boolean(ctx.gameover)
  return (
    <CtxContext.Provider
      value={{
        ctx: {
          ...ctx,
          isMyTurn,
          isOrderMarkerPhase,
          isPlacementPhase,
          isRoundOfPlayPhase,
          isAttackingStage,
          isGameover,
        },
      }}
    >
      {children}
    </CtxContext.Provider>
  )
}

export function useCtx() {
  const context = React.useContext(CtxContext)
  if (context === undefined) {
    throw new Error('useCtx must be used within a CtxProvider')
  }
  return context
}

//️ MOVES
type MovesProviderProps = {
  children: React.ReactNode
  moves: BoardProps['moves']
  undo: BoardProps['undo']
  redo: BoardProps['redo']
}
const MovesContext = React.createContext<
  | {
      moves: BoardProps['moves']
      undo: BoardProps['undo']
      redo: BoardProps['redo']
    }
  | undefined
>(undefined)
export function MovesProvider({
  moves,
  undo,
  redo,
  children,
}: MovesProviderProps) {
  return (
    <MovesContext.Provider value={{ moves: { ...moves }, undo, redo }}>
      {children}
    </MovesContext.Provider>
  )
}
export function useMoves() {
  const context = React.useContext(MovesContext)
  if (context === undefined) {
    throw new Error('useMoves must be used within a MovesProvider')
  }
  return context
}
