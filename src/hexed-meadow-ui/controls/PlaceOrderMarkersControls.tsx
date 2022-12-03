import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexed-meadow-ui/layout/Typography'
import React, { useState } from 'react'
import styled from 'styled-components'
import { OrderMarkerArmyCards } from './order-markers/OrderMarkerArmyCards'
import { omToString } from 'app/utilities'
import { selectedTileStyle } from 'hexed-meadow-ui/layout/styles'
import { ConfirmOrResetButtons } from './ConfirmOrResetButtons'
import { motion, AnimatePresence } from 'framer-motion'
const AnimateMe = ({
  children,
  style,
}: {
  children: JSX.Element
  style: React.CSSProperties
}) => {
  const isShowing = true
  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          style={style}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
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
  const {
    moves: { confirmOrderMarkersReady, placeOrderMarkers },
  } = useBgioMoves()
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
      <StyledControlsHeaderH2>{`Place your order-markers for round ${
        currentRound + 1
      }:`}</StyledControlsHeaderH2>
      <OMButtonList
        activeMarker={activeMarker}
        selectOrderMarker={selectOrderMarker}
        toBePlacedOrderMarkers={toBePlacedOrderMarkers}
        extraButton={
          toBePlacedOrderMarkers.length > 0 ? (
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
          ) : (
            <></>
          )
        }
      />
      {areAllOMsAssigned && !orderMarkersReady[playerID] && (
        <AnimateMe
          style={{
            marginTop: '1rem',
          }}
        >
          <>
            <StyledControlsP>
              All of your order markers are placed, confirm that these are your
              choices for the round?
            </StyledControlsP>
            <ConfirmOrResetButtons
              confirm={onClickConfirm}
              reset={() => setEditingOrderMarkers(myOrderMarkers)}
            />
          </>
        </AnimateMe>
      )}
      <OrderMarkerArmyCards
        activeMarker={activeMarker}
        setActiveMarker={setActiveMarker}
        selectCard={selectCard}
        editingOrderMarkers={editingOrderMarkers}
      />
    </>
  )
}
export const OMButtonList = ({
  activeMarker,
  selectOrderMarker,
  toBePlacedOrderMarkers,
  extraButton,
}: {
  activeMarker: string
  selectOrderMarker: (om: string) => void
  toBePlacedOrderMarkers: string[]
  extraButton?: JSX.Element
}) => {
  return (
    <StyledOrderMarkersUl>
      {toBePlacedOrderMarkers.map((om) => (
        <OMButton
          key={om}
          om={om}
          activeMarker={activeMarker}
          selectOrderMarker={selectOrderMarker}
        ></OMButton>
      ))}
      {extraButton}
    </StyledOrderMarkersUl>
  )
}
const OMButton = ({
  om,
  activeMarker,
  selectOrderMarker,
}: {
  om: string
  activeMarker: string
  selectOrderMarker: (om: string) => void
}) => {
  return (
    <li>
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
  )
}
export const StyledOrderMarkersUl = styled.ul`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  flex-grow: 0;
  margin: 0;
  padding: 0;
  list-style-type: none;
  font-size: 1rem;
`
