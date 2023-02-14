import styled from 'styled-components'
import { GameArmyCard, OrderMarker } from 'game/types'
import { useBgioClientInfo, useBgioG } from 'bgio-contexts'
import { omToString, playerIDDisplay } from 'game/transformers'
import { PlaceOrderMarkersArmyCardUnitIcon } from 'hexopolis-ui/unit-icons'
import { selectedTileStyle } from 'hexopolis-ui/layout/styles'
import { OpenCardModalButton } from 'hexopolis-ui/OpenAbilityModalButton'
import { StyledButtonWrapper } from './ConfirmOrResetButtons'

export const Armies = () => {
  const { gameArmyCards } = useBgioG()
  const { playerID } = useBgioClientInfo()
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
          <h4>{`${playerIDDisplay(entry[0])}${
            entry[0] === playerID ? ' (You)' : ''
          }`}</h4>
          <Army cards={entry[1]} playerID={entry[0]} />
        </div>
      ))}
    </>
  )
}
export const Army = ({
  cards,
  playerID,
  onClickCard,
  selectedID,
}: {
  cards: GameArmyCard[]
  playerID: string
  onClickCard?: (clickedCardID: string) => void
  selectedID?: string
}) => {
  return (
    <StyledOrderMarkerArmyCardsUl playerID={playerID}>
      {cards.map((card) => (
        <ArmyCard
          key={card.gameCardID}
          card={card}
          onClickCard={onClickCard}
          selectedID={selectedID}
        />
      ))}
    </StyledOrderMarkerArmyCardsUl>
  )
}

const StyledOrderMarkerArmyCardsUl = styled.ul<{ playerID: string }>`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  flex-grow: 0;
  list-style-type: none;
  margin: 0;
  padding: 5px;
  color: ${(props) => `${props.theme.playerColors[props.playerID]}`};
`
export const ArmyCard = ({
  card,
  onClickCard,
  selectedID,
}: {
  card: GameArmyCard
  onClickCard?: (clickedCardID: string) => void
  selectedID?: string
}) => {
  const { orderMarkers, players } = useBgioG()
  const { playerID } = useBgioClientInfo()
  const cardPlayerID = card.playerID
  const isMyCard = playerID === cardPlayerID
  const activeStyle = selectedID === card.gameCardID ? selectedTileStyle : ''
  let orderMarkersOnThisCard: OrderMarker[]
  if (isMyCard) {
    orderMarkersOnThisCard = Object.entries(players[playerID].orderMarkers)
      .map((om) => ({ gameCardID: om[1], order: om[0] }))
      .filter((om) => om.gameCardID === card.gameCardID)
  } else {
    orderMarkersOnThisCard = orderMarkers[cardPlayerID].filter(
      (om) => om.gameCardID === card.gameCardID
    )
  }

  return (
    <StyledOrderMarkerArmyCardsLi
      onClick={() => onClickCard?.(card.gameCardID)}
      style={{ ...activeStyle }}
    >
      <PlaceOrderMarkersArmyCardUnitIcon
        armyCardID={card.armyCardID}
        playerID={card.playerID}
      />
      <span>{card.name}</span>
      <StyledButtonWrapper>
        <OpenCardModalButton card={card} />
      </StyledButtonWrapper>
      <OMList orderMarkers={orderMarkersOnThisCard} />
    </StyledOrderMarkerArmyCardsLi>
  )
}
export const StyledOrderMarkerArmyCardsLi = styled.li`
  padding: 5px;
  margin: 5px;
  max-width: 300px;
  border: 1px solid;
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
            {omToString(om.order) || '?'}
          </li>
        )
      })}
    </StyledOrderMarkersUl>
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
