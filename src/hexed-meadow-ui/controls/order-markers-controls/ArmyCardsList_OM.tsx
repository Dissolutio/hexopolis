import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import styled from 'styled-components'
import { PlaceOrderMarkersArmyCardUnitIcon } from 'hexed-meadow-ui/unit-icons'
import React, { useState } from 'react'

export const ArmyCardsList_OM = () => {
  const { playerID } = useBgioClientInfo()
  const { myCards, myOrderMarkers } = useBgioG()
  console.log(
    '🚀 ~ file: ArmyCardsList_OM.tsx ~ line 9 ~ myOrderMarkers',
    myOrderMarkers
  )
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
    <StyledOrderMarkerArmyCardsUl>
      {myCards.map((card) => (
        <StyledOrderMarkerArmyCardsLi key={card.gameCardID}>
          <button onClick={() => selectCard(card.gameCardID)}>
            <span>
              <PlaceOrderMarkersArmyCardUnitIcon
                armyCardID={card.armyCardID}
                playerID={card.playerID}
              />
            </span>
            <span>{card.name}</span>
          </button>
        </StyledOrderMarkerArmyCardsLi>
      ))}
    </StyledOrderMarkerArmyCardsUl>
  )
}

const StyledOrderMarkerArmyCardsLi = styled.li`
  font-size: 1.2rem;
`
const StyledOrderMarkerArmyCardsUl = styled.ul`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  flex-grow: 1;
  list-style-type: none;
  margin: 0;
  padding: 0;
`
