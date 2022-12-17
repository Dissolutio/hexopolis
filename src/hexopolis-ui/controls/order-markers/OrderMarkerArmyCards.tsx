import styled from 'styled-components'
import { PlaceOrderMarkersArmyCardUnitIcon } from 'hexopolis-ui/unit-icons'
import React from 'react'
import { GameArmyCard, PlayerOrderMarkers } from 'game/types'
import { OMButtonList } from '../PlaceOrderMarkersControls'
import { useBgioG } from 'bgio-contexts'

export const OrderMarkerArmyCards = ({
  activeMarker,
  setActiveMarker,
  selectCard,
  editingOrderMarkers,
}: {
  activeMarker: string
  setActiveMarker: React.Dispatch<React.SetStateAction<string>>
  selectCard: (gameCardID: string) => void
  editingOrderMarkers: PlayerOrderMarkers
}) => {
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
const StyledOrderMarkerArmyCardsUl = styled.ul`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  flex-grow: 0;
  list-style-type: none;
  margin: 0;
  padding: 5px;
`

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

  const handleClickCard = () => {
    selectCard(card.gameCardID)
  }
  const handleClickOrderMarker = (om: string) => {
    setActiveMarker(om)
  }
  return (
    <StyledOrderMarkerArmyCardsLi onClick={handleClickCard}>
      <PlaceOrderMarkersArmyCardUnitIcon
        armyCardID={card.armyCardID}
        playerID={card.playerID}
      />
      <span>{card.name}</span>
      <OMButtonList
        activeMarker={activeMarker}
        selectOrderMarker={handleClickOrderMarker}
        toBePlacedOrderMarkers={orderMarkersOnThisCard}
      />
    </StyledOrderMarkerArmyCardsLi>
  )
}
const StyledOrderMarkerArmyCardsLi = styled.li`
  padding: 5px;
  margin: 5px;
  max-width: 300px;
  border: 1px solid var(--player-color);
  font-size: 1.3rem;
  @media screen and (max-width: 1100px) {
    max-width: 100px;
    font-size: 0.9rem;
  }
`
