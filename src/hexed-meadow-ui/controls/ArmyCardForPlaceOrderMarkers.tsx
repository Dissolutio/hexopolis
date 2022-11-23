import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import { GameArmyCard } from 'game/types'
import React, { useState } from 'react'

type Props = {
  card: GameArmyCard
}

export const ArmyCardForPlaceOrderMarkers = ({ card }: Props) => {
  const { playerID } = useBgioClientInfo()
  const { currentRound, orderMarkersReady, myCards, myOrderMarkers } =
    useBgioG()
  const { moves } = useBgioMoves()
  const { placeOrderMarker } = moves
  const [activeMarker, setActiveMarker] = useState('')
  const selectOrderMarker = (orderMarker: string) => {
    setActiveMarker(orderMarker)
  }
  const selectCard = (gameCardID: string) => {
    if (!activeMarker) return
    if (activeMarker) {
      placeOrderMarker({ playerID, order: activeMarker, gameCardID })
    }
  }
  // TODO use this instead for active style toggling within the styled component
  const activeOrderMarkerStyles = (orderMarker: string) => {
    if (activeMarker === orderMarker) {
      return {
        boxShadow: `1 1 2px var(--neon-green)`,
        border: `1px solid var(--neon-green)`,
      }
    } else {
      return {}
    }
  }
  return (
    <li key={card.gameCardID}>
      <button onClick={() => selectCard(card.gameCardID)}>
        <span>{card.name}</span>
      </button>
    </li>
  )
}
