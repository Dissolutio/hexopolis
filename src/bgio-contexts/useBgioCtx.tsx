import * as React from 'react'
import { BoardProps } from 'boardgame.io/react'
import { useBgioClientInfo } from './useBgioClientInfo'
import { phaseNames, stageNames } from 'game/constants'

type BgioCtxProviderProps = {
  children: React.ReactNode
  ctx: BoardProps['ctx']
}

// add two handy properties
type BgioCtxValue = BoardProps['ctx'] & {
  isMyTurn: boolean
  isOrderMarkerPhase: boolean
  isPlacementPhase: boolean
  isRoundOfPlayPhase: boolean
  isIdleStage: boolean
  isMovementStage: boolean
  isWaitingForDisengagementSwipeStage: boolean
  isDisengagementSwipeStage: boolean
  isWaterCloneStage: boolean
  isPlacingAttackSpiritStage: boolean
  isIdlePlacingAttackSpiritStage: boolean
  isPlacingArmorSpiritStage: boolean
  isIdlePlacingArmorSpiritStage: boolean
  isAttackingStage: boolean
  isFireLineSAStage: boolean
  isExplosionSAStage: boolean
  isGrenadeSAStage: boolean
  isChompStage: boolean
  isBerserkerStage: boolean
  isGameover: boolean
}
const BgioCtxContext = React.createContext<BgioCtxValue | undefined>(undefined)

export function BgioCtxProvider({ ctx, children }: BgioCtxProviderProps) {
  const { playerID } = useBgioClientInfo()
  const isMyTurn: boolean = ctx.currentPlayer === playerID
  const isMovementStage: boolean =
    ctx.activePlayers?.[playerID] === stageNames.movement
  const isOrderMarkerPhase: boolean = ctx.phase === phaseNames.placeOrderMarkers
  const isPlacementPhase: boolean = ctx.phase === phaseNames.placement
  const isRoundOfPlayPhase: boolean = ctx.phase === phaseNames.roundOfPlay
  const isIdleStage: boolean =
    isRoundOfPlayPhase && ctx.activePlayers?.[playerID] === undefined
  const isAttackingStage: boolean =
    isRoundOfPlayPhase && ctx.activePlayers?.[playerID] === stageNames.attacking
  const isWaterCloneStage: boolean =
    isRoundOfPlayPhase &&
    ctx.activePlayers?.[playerID] === stageNames.waterClone
  const isPlacingAttackSpiritStage: boolean =
    isRoundOfPlayPhase &&
    ctx.activePlayers?.[playerID] === stageNames.placingAttackSpirit
  const isIdlePlacingAttackSpiritStage: boolean =
    isRoundOfPlayPhase &&
    ctx.activePlayers?.[playerID] === stageNames.idlePlacingAttackSpirit
  const isPlacingArmorSpiritStage: boolean =
    isRoundOfPlayPhase &&
    ctx.activePlayers?.[playerID] === stageNames.placingArmorSpirit
  const isIdlePlacingArmorSpiritStage: boolean =
    isRoundOfPlayPhase &&
    ctx.activePlayers?.[playerID] === stageNames.idlePlacingArmorSpirit
  const isWaitingForDisengagementSwipeStage: boolean =
    isRoundOfPlayPhase &&
    ctx.activePlayers?.[playerID] === stageNames.waitingForDisengageSwipe
  const isDisengagementSwipeStage: boolean =
    isRoundOfPlayPhase &&
    ctx.activePlayers?.[playerID] === stageNames.disengagementSwipe
  const isFireLineSAStage: boolean =
    isRoundOfPlayPhase &&
    ctx.activePlayers?.[playerID] === stageNames.fireLineSA
  const isExplosionSAStage: boolean =
    isRoundOfPlayPhase &&
    ctx.activePlayers?.[playerID] === stageNames.explosionSA
  const isGrenadeSAStage: boolean =
    isRoundOfPlayPhase && ctx.activePlayers?.[playerID] === stageNames.grenadeSA
  const isChompStage: boolean =
    isRoundOfPlayPhase && ctx.activePlayers?.[playerID] === stageNames.chomp
  const isBerserkerStage: boolean =
    isRoundOfPlayPhase &&
    ctx.activePlayers?.[playerID] === stageNames.berserkerCharge
  const isGameover: boolean = Boolean(ctx.gameover)
  return (
    <BgioCtxContext.Provider
      value={{
        ...ctx,
        isMyTurn,
        isOrderMarkerPhase,
        isPlacementPhase,
        isRoundOfPlayPhase,
        isIdleStage,
        isMovementStage,
        isWaitingForDisengagementSwipeStage,
        isDisengagementSwipeStage,
        isWaterCloneStage,
        isPlacingAttackSpiritStage,
        isIdlePlacingAttackSpiritStage,
        isPlacingArmorSpiritStage,
        isIdlePlacingArmorSpiritStage,
        isAttackingStage,
        isFireLineSAStage,
        isExplosionSAStage,
        isGrenadeSAStage,
        isChompStage,
        isBerserkerStage,
        isGameover,
      }}
    >
      {children}
    </BgioCtxContext.Provider>
  )
}

export function useBgioCtx() {
  const context = React.useContext(BgioCtxContext)
  if (context === undefined) {
    throw new Error('useBgioCtx must be used within a BgioCtxProvider')
  }
  return context
}
