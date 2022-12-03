import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import { StyledControlsHeaderH2 } from 'hexed-meadow-ui/layout/Typography'
import React, { useState } from 'react'
import styled from 'styled-components'
import { OrderMarkerArmyCards } from './order-markers/OrderMarkerArmyCards'
import { omToString } from 'app/utilities'
import { selectedTileStyle } from 'hexed-meadow-ui/layout/styles'

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
const orderMarkerButtonStyle = {
  fontSize: '1.5rem',
  padding: '0 1rem',
  margin: '0 0.5rem',
}

export const PlaceOrderMarkersControls = () => {
  const { playerID } = useBgioClientInfo()
  const { currentRound, orderMarkersReady, myCards, myOrderMarkers } =
    useBgioG()
  const isReady = orderMarkersReady[playerID] === true
  const [editingOrderMarkers, setEditingOrderMarkers] = useState(
    () => myOrderMarkers
  )
  const { moves } = useBgioMoves()
  const { confirmOrderMarkersReady, placeOrderMarkers } = moves
  const placeEditingOrderMarker = (order: string, gameCardID: string) => {
    setEditingOrderMarkers((prev) => ({ ...prev, [order]: gameCardID }))
  }
  const myFirstCard = myCards?.[0]
  const toBePlacedOrderMarkers = Object.keys(editingOrderMarkers).filter(
    (om) => editingOrderMarkers[om] === ''
  )
  const [activeMarker, setActiveMarker] = useState('')
  const selectOrderMarker = (orderMarker: string) => {
    setActiveMarker(orderMarker)
  }
  const onClickConfirm = () => {
    placeOrderMarkers({ orders: editingOrderMarkers, playerID })
    confirmOrderMarkersReady({ playerID })
  }
  const areAllOMsAssigned = !Object.values(editingOrderMarkers).some(
    (om) => om === ''
  )
  const onClickAutoLayOrderMarkers = () => {
    // place all unplaced order markers on first card
    toBePlacedOrderMarkers.forEach((order) => {
      placeEditingOrderMarker(order, myFirstCard.gameCardID)
    })
  }
  const selectCard = (gameCardID: string) => {
    if (!activeMarker) return
    if (activeMarker) {
      placeEditingOrderMarker(activeMarker, gameCardID)
      setActiveMarker('')
    }
  }
  // Early return: Ready and waiting for opponent
  if (isReady) {
    return (
      <StyledControlsHeaderH2>
        Waiting for opponents to finish placing order markers...
      </StyledControlsHeaderH2>
    )
  }
  return (
    <>
      <div>
        <StyledControlsHeaderH2>{`Place your order markers for Round ${
          currentRound + 1
        }:`}</StyledControlsHeaderH2>
        <StyledUnplacedOrderMarkersUl>
          {toBePlacedOrderMarkers.map((om) => (
            <li key={om}>
              <button
                onClick={() => selectOrderMarker(om)}
                style={{
                  ...selectedOrderMarkerStyle(activeMarker, om),
                  ...orderMarkerButtonStyle,
                }}
              >
                {omToString(om)}
              </button>
            </li>
          ))}
          {toBePlacedOrderMarkers.length > 0 && (
            <li>
              <button
                onClick={onClickAutoLayOrderMarkers}
                style={{
                  ...orderMarkerButtonStyle,
                }}
              >
                Auto
              </button>
            </li>
          )}
        </StyledUnplacedOrderMarkersUl>
        {areAllOMsAssigned && !orderMarkersReady[playerID] && (
          <button onClick={onClickConfirm}>CONFIRM DONE</button>
        )}
        <OrderMarkerArmyCards
          activeMarker={activeMarker}
          setActiveMarker={setActiveMarker}
          selectCard={selectCard}
          editingOrderMarkers={editingOrderMarkers}
        />
        <div></div>
      </div>
    </>
  )
}
const StyledUnplacedOrderMarkersUl = styled.ul`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  flex-grow: 1;
  margin: 1rem 0;
  padding: 0;
  list-style-type: none;
`
