import { selectUnitsForCard } from 'game/selectors'
import {
  GameArmyCard,
  GameState,
  GameUnit,
  PlayerOrderMarkers,
} from 'game/types'
import { uniq } from 'lodash'
import * as React from 'react'
import { useBgioClientInfo } from './useBgioClientInfo'

type BgioGProviderProps = { children: React.ReactNode; G: GameState }

const BgioGContext = React.createContext<
  | (GameState & {
      myCards: GameArmyCard[]
      myAliveCards: GameArmyCard[]
      myStartZone: string[]
      myUnits: GameUnit[]
      myOrderMarkers: PlayerOrderMarkers
      currentRoundText: string
      uniqUnitsMoved: string[]
    })
  | undefined
>(undefined)

export function BgioGProvider({ G, children }: BgioGProviderProps) {
  const { playerID, belongsToPlayer } = useBgioClientInfo()
  const myCards: GameArmyCard[] = G.gameArmyCards.filter(belongsToPlayer)
  const myAliveCards: GameArmyCard[] = myCards.filter(
    (c) => selectUnitsForCard(c.gameCardID, G.gameUnits).length > 0
  )
  const myStartZone: string[] = G.startZones[playerID]
  const myUnits: GameUnit[] = Object.values(G.gameUnits).filter(belongsToPlayer)
  const myOrderMarkers: PlayerOrderMarkers = G.players?.[playerID]?.orderMarkers
  const currentRoundText = `${G.currentRound}`
  const uniqUnitsMoved = uniq(G.unitsMoved)
  return (
    <BgioGContext.Provider
      value={{
        ...G,
        myCards,
        myAliveCards,
        myStartZone,
        myUnits,
        myOrderMarkers,
        currentRoundText,
        uniqUnitsMoved,
      }}
    >
      {children}
    </BgioGContext.Provider>
  )
}
export function useBgioG() {
  const context = React.useContext(BgioGContext)
  if (context === undefined) {
    throw new Error('useBgioG must be used within a BgioGProvider')
  }
  return context
}
