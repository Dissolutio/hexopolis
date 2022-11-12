import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import React, { useState } from 'react'
import { ArmyListStyle } from '../layout'

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
  console.log(
    '🚀 ~ file: PlaceOrderMarkersControls.tsx ~ line 14 ~ PlaceOrderMarkersControls ~ toBePlacedOrderMarkers',
    toBePlacedOrderMarkers
  )
  const { confirmOrderMarkersReady, placeOrderMarker } = moves
  const [activeMarker, setActiveMarker] = useState('')
  const selectOrderMarker = (orderMarker: string) => {
    setActiveMarker(orderMarker)
  }
  const selectCard = (gameCardID: string) => {
    if (!activeMarker) return
    if (activeMarker) {
      placeOrderMarker({ playerID, orderMarker: activeMarker, gameCardID })
    }
  }
  // TODO use this instead for active style toggling within the styled component
  const selectedStyle = (orderMarker: string) => {
    if (activeMarker === orderMarker) {
      return {
        boxShadow: `1 1 2px var(--neon-green)`,
        border: `1px solid var(--neon-green)`,
      }
    } else {
      return {}
    }
  }
  const makeReady = () => {
    confirmOrderMarkersReady({ playerID })
  }
  const areAllOMsAssigned = !Object.values(myOrderMarkers).some(
    (om) => om === ''
  )
  const onClickAutoLayOrderMarkers = () => {
    unplacedOrdersArr.forEach((order) => {
      placeOrderMarker({
        playerID,
        orderMarker: order,
        gameCardID: myFirstCard.gameCardID,
      })
    })
    confirmOrderMarkersReady({ playerID })
  }

  if (orderMarkersReady[playerID] === true) {
    return (
      <>
        <p>Waiting for opponents to finish placing order markers...</p>
      </>
    )
  }
  if (areAllOMsAssigned) {
    return (
      <>
        <p>Done placing your order markers?</p>
        <button onClick={makeReady}>CONFIRM DONE</button>
      </>
    )
  }
  return (
    <>
      <ArmyListStyle>
        <h2>{`Place your order markers for Round ${currentRound + 1}:`}</h2>
        <button type="button" onClick={onClickAutoLayOrderMarkers}>
          Put the rest of them on {myFirstCard.name}
        </button>
        <ul className="order-marker">
          {toBePlacedOrderMarkers.map((om) => (
            <li
              key={om}
              onClick={() => selectOrderMarker(om)}
              style={selectedStyle(om)}
            >
              {om === 'X' ? om : (parseInt(om) + 1).toString()}
            </li>
          ))}
        </ul>
        <ul className="om-army-cards">
          {myCards.map((card) => (
            <li key={card.gameCardID}>
              <button
                // style={selectedStyle(card.gameCardID)}
                onClick={() => selectCard(card.gameCardID)}
              >
                <span>{card.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </ArmyListStyle>
    </>
  )
}
