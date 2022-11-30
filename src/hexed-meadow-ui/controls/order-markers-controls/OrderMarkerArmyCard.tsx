import styled from 'styled-components'
import { PlaceOrderMarkersArmyCardUnitIcon } from 'hexed-meadow-ui/unit-icons'
import React from 'react'
import { GameArmyCard, PlayerOrderMarkers } from 'game/types'
import { omToString } from 'app/utilities'
import { selectedOrderMarkerStyle } from '../PlaceOrderMarkersControls'

export const OrderMarkerArmyCard = ({
  card,
  activeMarker,
  setActiveMarker,
  selectCard,
  editingOrderMarkers,
}: {
  card: GameArmyCard
  activeMarker: string
  setActiveMarker: React.Dispatch<React.SetStateAction<string>>
  selectCard: (gameCardID: string) => void
  editingOrderMarkers: PlayerOrderMarkers
}) => {
  const orderMarkersOnThisCard = Object.entries(editingOrderMarkers)
    .filter((omEntry) => omEntry[1] === card.gameCardID)
    .map((omEntry) => omEntry[0])

  return (
    <StyledOrderMarkerArmyCardsLi>
      <StyledOMButton onClick={() => selectCard(card.gameCardID)}>
        <span>
          <PlaceOrderMarkersArmyCardUnitIcon
            armyCardID={card.armyCardID}
            playerID={card.playerID}
          />
        </span>
        <span>{card.name}</span>
        <div>
          {orderMarkersOnThisCard.map((om) => (
            <CardOrderMarker
              om={om}
              activeMarker={activeMarker}
              setActiveMarker={setActiveMarker}
            />
          ))}
        </div>
      </StyledOMButton>
    </StyledOrderMarkerArmyCardsLi>
  )
}

const CardOrderMarker = ({
  om,
  activeMarker,
  setActiveMarker,
}: {
  om: string
  activeMarker: string
  setActiveMarker: React.Dispatch<React.SetStateAction<string>>
}) => {
  return (
    <StyledOMButton
      key={om}
      onClick={() => setActiveMarker(om)}
      style={selectedOrderMarkerStyle(activeMarker, om)}
    >
      {omToString(om)}
    </StyledOMButton>
  )
}

export const StyledOMButton = styled.div`
  display: inline-block;
  vertical-align: middle;
  max-width: 100px;
  padding: 5px;
  text-align: center;
  color: #444;
  background: #ddd;
  border: 1px solid #ccc;
  box-shadow: 0 0 5px -1px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  &:active {
    color: red;
    box-shadow: 0 0 5px -1px rgba(0, 0, 0, 0.6);
  }
`
const StyledOrderMarkerArmyCardsLi = styled.li`
  font-size: 1.2rem;
`
