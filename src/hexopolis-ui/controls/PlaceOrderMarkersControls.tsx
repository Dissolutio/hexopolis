import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'

import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import React, { useState } from 'react'
import styled from 'styled-components'
import { OrderMarkerArmyCards } from './order-markers/OrderMarkerArmyCards'
import { selectedTileStyle } from 'hexopolis-ui/layout/styles'
import {
  ConfirmOrResetButtons,
  StyledButtonWrapper,
} from './ConfirmOrResetButtons'
import { motion, AnimatePresence } from 'framer-motion'

import { RedButton } from 'hexopolis-ui/layout/buttons'
import {
  generateBlankOrderMarkersForNumPlayers,
  generateBlankPlayersOrderMarkers,
} from 'game/constants'
import { omToString } from 'game/transformers'
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
  const { currentRoundText, orderMarkersReady, myCards, myOrderMarkers } =
    useBgioG()
  const isReady = orderMarkersReady[playerID] === true
  const [editingOrderMarkers, setEditingOrderMarkers] = useState(
    () => myOrderMarkers
  )
  const {
    moves: {
      confirmOrderMarkersReady,
      placeOrderMarkers,
      deconfirmOrderMarkersReady,
    },
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
  return (
    <>
      {isReady ? (
        <>
          <StyledControlsHeaderH2>
            Waiting for opponents to finish placing order markers...
          </StyledControlsHeaderH2>
          <StyledButtonWrapper>
            <RedButton onClick={() => deconfirmOrderMarkersReady({ playerID })}>
              Wait, go back!
            </RedButton>
          </StyledButtonWrapper>
        </>
      ) : (
        <>
          <StyledControlsHeaderH2>{`Place your order-markers for round ${currentRoundText}:`}</StyledControlsHeaderH2>
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
        </>
      )}
      {areAllOMsAssigned && !orderMarkersReady[playerID] && (
        <div
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
              reset={() =>
                setEditingOrderMarkers(generateBlankPlayersOrderMarkers())
              }
            />
          </>
        </div>
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
  const { playerID } = useBgioClientInfo()
  const { orderMarkersReady } = useBgioG()
  const isReady = orderMarkersReady[playerID] === true
  const onClick = (om: string) => {
    selectOrderMarker(om)
  }
  return (
    <AnimatePresence>
      <StyledOrderMarkersUl>
        {toBePlacedOrderMarkers.map((om) => (
          <motion.li
            key={om}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              disabled={isReady}
              onClick={() => onClick(om)}
              style={{
                ...selectedOrderMarkerStyle(activeMarker, om),
                ...orderMarkerButtonStyle,
              }}
            >
              {omToString(om)}
            </button>
          </motion.li>
        ))}
        {extraButton}
      </StyledOrderMarkersUl>
    </AnimatePresence>
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
