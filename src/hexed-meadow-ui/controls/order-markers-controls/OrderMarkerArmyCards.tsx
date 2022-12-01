import styled from 'styled-components'
import { PlaceOrderMarkersArmyCardUnitIcon } from 'hexed-meadow-ui/unit-icons'
import React from 'react'
import { GameArmyCard, PlayerOrderMarkers } from 'game/types'
import { omToString } from 'app/utilities'
import { selectedOrderMarkerStyle } from '../PlaceOrderMarkersControls'
import { useBgioG } from 'bgio-contexts'

type Props = {
  activeMarker: string
  setActiveMarker: React.Dispatch<React.SetStateAction<string>>
  selectCard: (gameCardID: string) => void
  editingOrderMarkers: PlayerOrderMarkers
}

export const OrderMarkerArmyCards = ({
  activeMarker,
  setActiveMarker,
  selectCard,
  editingOrderMarkers,
}: Props) => {
  const { myCards } = useBgioG()
  return (
    <StyledOrderMarkerArmyCardsUl>
      {myCards.map((card) => (
        <OrderMarkerArmyCard
          key={card.gameCardID}
          card={card}
          activeMarker={activeMarker}
          setActiveMarker={setActiveMarker}
          selectCard={selectCard}
          editingOrderMarkers={editingOrderMarkers}
        />
      ))}
    </StyledOrderMarkerArmyCardsUl>
  )
}

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
    <StyledOrderMarkerArmyCardsLi onClick={() => selectCard(card.gameCardID)}>
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
            key={om}
            om={om}
            activeMarker={activeMarker}
            setActiveMarker={setActiveMarker}
          />
        ))}
      </div>
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

const StyledOrderMarkerArmyCardsUl = styled.ul`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  flex-grow: 1;
  list-style-type: none;
  margin: 0;
  padding: 0;
`

const StyledOMButton = styled.div`
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
`
const StyledOrderMarkerArmyCardsLi = styled.li`
  font-size: 1.2rem;
`
