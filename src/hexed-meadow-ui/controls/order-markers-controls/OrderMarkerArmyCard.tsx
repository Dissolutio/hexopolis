import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import styled from 'styled-components'
import { PlaceOrderMarkersArmyCardUnitIcon } from 'hexed-meadow-ui/unit-icons'
import React from 'react'
import { GameArmyCard } from 'game/types'
import { omToString } from 'app/utilities'
import { selectedOrderMarkerStyle } from '../PlaceOrderMarkersControls'
import WorkerBuilder from 'worker/worker-builder'
import FiboWorker from 'worker/fibo-worker'

var workerInstance = new WorkerBuilder(FiboWorker)

export const OrderMarkerArmyCard = ({
  card,
  activeMarker,
  setActiveMarker,
}: {
  card: GameArmyCard
  activeMarker: string
  setActiveMarker: React.Dispatch<React.SetStateAction<string>>
}) => {
  workerInstance.onmessage = (message) => {
    if (message) {
      console.log('Message from worker', message.data)
    }
  }
  const { playerID } = useBgioClientInfo()
  const { moves } = useBgioMoves()
  const { placeOrderMarker } = moves
  const { myOrderMarkers } = useBgioG()
  const orderMarkersOnThisCard = Object.entries(myOrderMarkers)
    .filter((omEntry) => omEntry[1] === card.gameCardID)
    .map((omEntry) => omEntry[0])

  const selectCard = (gameCardID: string) => {
    if (!activeMarker) return
    if (activeMarker) {
      placeOrderMarker({ playerID, order: activeMarker, gameCardID })
      setActiveMarker('')
    }
  }

  const selectOrderMarker = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    orderMarker: string
  ) => {
    setActiveMarker(orderMarker)
  }

  return (
    <>
      <button
        onClick={() => {
          workerInstance.postMessage(900009 * Math.random())
        }}
      >
        Send Message
      </button>
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
                key={om}
                om={om}
                activeMarker={activeMarker}
                setActiveMarker={setActiveMarker}
              />
            ))}
          </div>
        </StyledOMButton>
      </StyledOrderMarkerArmyCardsLi>
    </>
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
  const selectOrderMarker = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    event.stopPropagation()
    event.preventDefault()
    setActiveMarker(om)
  }
  return (
    <StyledOMButton
      key={om}
      onClick={selectOrderMarker}
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
