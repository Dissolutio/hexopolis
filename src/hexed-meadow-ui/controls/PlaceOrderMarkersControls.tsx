import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import { StyledControlsHeaderH2 } from 'hexed-meadow-ui/layout/Typography'
import React, { useState } from 'react'
import styled from 'styled-components'
import { OrderMarkerArmyCards } from './order-markers-controls/OrderMarkerArmyCards'
import { selectedTileStyle } from './PlacementControls'
import { StyledOrderMarkersControlsWrapper } from './order-markers-controls/StyledOrderMarkersControlsWrapper'
import { omToString } from 'app/utilities'
import { StyledOMButton } from './order-markers-controls/OrderMarkerArmyCard'

export const selectedOrderMarkerStyle = (
  activeMarker: string,
  orderMarker: string
) => {
  if (activeMarker === orderMarker) {
    return selectedTileStyle
  } else {
    return {}
  }
}
export const PlaceOrderMarkersControls = () => {
  const { playerID } = useBgioClientInfo()
  const { currentRound, orderMarkersReady, myCards, myOrderMarkers } =
    useBgioG()
  const { moves } = useBgioMoves()
  const unplacedOrdersArr = Object.keys(myOrderMarkers)
  const myFirstCard = myCards?.[0]
  const toBePlacedOrderMarkers = Object.keys(myOrderMarkers).filter(
    (om) => myOrderMarkers[om] === ''
  )
  const { confirmOrderMarkersReady, placeOrderMarker } = moves
  const [activeMarker, setActiveMarker] = useState('')
  const selectOrderMarker = (orderMarker: string) => {
    setActiveMarker(orderMarker)
  }
  const onClickConfirm = () => {
    confirmOrderMarkersReady({ playerID })
  }
  const areAllOMsAssigned = !Object.values(myOrderMarkers).some(
    (om) => om === ''
  )
  const onClickAutoLayOrderMarkers = () => {
    unplacedOrdersArr.forEach((order) => {
      placeOrderMarker({
        playerID,
        order,
        gameCardID: myFirstCard.gameCardID,
      })
    })
    confirmOrderMarkersReady({ playerID })
  }

  return (
    <>
      <StyledOrderMarkersControlsWrapper>
        {orderMarkersReady[playerID] === true && (
          <p>Waiting for opponents to finish placing order markers...</p>
        )}

        {areAllOMsAssigned && !orderMarkersReady[playerID] && (
          <button onClick={onClickConfirm}>CONFIRM DONE</button>
        )}

        <StyledControlsHeaderH2>{`Place your order markers for Round ${
          currentRound + 1
        }:`}</StyledControlsHeaderH2>
        <StyledUnplacedOrderMarkersUl>
          {toBePlacedOrderMarkers.map((om) => (
            <StyledUnplacedOrderMarkerLi>
              <button
                key={om}
                onClick={() => selectOrderMarker(om)}
                style={{
                  ...selectedOrderMarkerStyle(activeMarker, om),
                  fontSize: '1.5rem',
                  padding: '0 1rem',
                  margin: '0 0.5rem',
                }}
              >
                {omToString(om)}
              </button>
            </StyledUnplacedOrderMarkerLi>
          ))}
        </StyledUnplacedOrderMarkersUl>
        <OrderMarkerArmyCards
          activeMarker={activeMarker}
          setActiveMarker={setActiveMarker}
        />
        <div>
          <StyledErrorRedButton
            type="button"
            onClick={onClickAutoLayOrderMarkers}
          >
            Put all order markers on {myFirstCard.name}
          </StyledErrorRedButton>
        </div>
      </StyledOrderMarkersControlsWrapper>
    </>
  )
}
const StyledErrorRedButton = styled.button`
  color: var(--error-red);
  border: 1px solid var(--error-red);
`
const StyledUnplacedOrderMarkerLi = styled.li`
  font-size: 2rem;
`
const StyledUnplacedOrderMarkersUl = styled.ul`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  flex-grow: 1;
  list-style-type: none;
  margin: 1rem 0;
  padding: 0;
`
