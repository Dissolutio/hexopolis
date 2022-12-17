import styled from 'styled-components'
import React from 'react'
import { GameArmyCard, OrderMarker } from 'game/types'
import { useBgioClientInfo, useBgioG } from 'bgio-contexts'
import { playerIDDisplay } from 'game/transformers'
import { PlaceOrderMarkersArmyCardUnitIcon } from 'hexopolis-ui/unit-icons'

export const Armies = () => {
  const { gameArmyCards } = useBgioG()
  const armies = gameArmyCards.reduce(
    (prev: { [playerID: string]: GameArmyCard[] }, curr) => {
      return {
        ...prev,
        [curr.playerID]: [...(prev[curr.playerID] ?? []), curr],
      }
    },
    {}
  )

  return (
    <>
      {Object.entries(armies).map((entry) => (
        <div key={entry[0]}>
          <h4>{playerIDDisplay(entry[0])}</h4>
          <Army cards={entry[1]} />
        </div>
      ))}
    </>
  )
}
const Army = ({ cards }: { cards: GameArmyCard[] }) => {
  return (
    <StyledOrderMarkerArmyCardsUl>
      {cards.map((card) => (
        <ArmyCard card={card} />
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
const ArmyCard = ({ card }: { card: GameArmyCard }) => {
  const { orderMarkers } = useBgioG()
  const { playerID } = useBgioClientInfo()
  const orderMarkersOnThisCard = orderMarkers[playerID].filter(
    (om) => om.gameCardID === card.gameCardID
  )

  return (
    <StyledOrderMarkerArmyCardsLi>
      <PlaceOrderMarkersArmyCardUnitIcon
        armyCardID={card.armyCardID}
        playerID={card.playerID}
      />
      <span>{card.name}</span>
      <OMList orderMarkers={orderMarkersOnThisCard} />
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

export const OMList = ({ orderMarkers }: { orderMarkers: OrderMarker[] }) => {
  return (
    <StyledOrderMarkersUl>
      {orderMarkers.map((om, i) => {
        return (
          <li
            style={{
              fontSize: '1.5rem',
              padding: '0 1rem',
              margin: '0 0.5rem',
            }}
            key={i}
          >
            {om.order || '?'}
          </li>
        )
      })}
    </StyledOrderMarkersUl>
  )
}
export const StyledOrderMarkersUl = styled.ul`
  display: flex;
  border: 1px solid red;
  flex-flow: row wrap;
  justify-content: center;
  flex-grow: 0;
  margin: 0;
  padding: 0;
  list-style-type: none;
  font-size: 1rem;
`
