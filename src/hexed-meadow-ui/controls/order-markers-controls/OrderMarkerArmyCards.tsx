import { useBgioG } from 'bgio-contexts'
import styled from 'styled-components'
import React from 'react'
import { OrderMarkerArmyCard } from './OrderMarkerArmyCard'

type Props = {
  activeMarker: string
  setActiveMarker: React.Dispatch<React.SetStateAction<string>>
}

export const OrderMarkerArmyCards = ({
  activeMarker,
  setActiveMarker,
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
        />
      ))}
    </StyledOrderMarkerArmyCardsUl>
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
