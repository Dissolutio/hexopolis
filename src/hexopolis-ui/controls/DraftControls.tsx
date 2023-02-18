import { AnimatePresence, motion } from 'framer-motion'
import {
  useBgioClientInfo,
  useBgioCtx,
  useBgioEvents,
  useBgioG,
  useBgioMoves,
} from 'bgio-contexts'
import styled from 'styled-components'
import { StyledControlsHeaderH2 } from 'hexopolis-ui/layout/Typography'
import React from 'react'
import { MS1Cards } from 'game/coreHeroscapeCards'
import {
  playerIDDisplay,
  transformHSCardsToDraftableCards,
} from 'game/transformers'
import { ArmyCard } from 'game/types'
import { BigGreenButton, GreenButton } from 'hexopolis-ui/layout/buttons'
import { UndoRedoButtons } from './rop/UndoRedoButtons'
import { OpenCardModalButton } from 'hexopolis-ui/OpenAbilityModalButton'
import { StyledButtonWrapper } from './ConfirmOrResetButtons'

export const DraftControls = () => {
  const { playerID } = useBgioClientInfo()
  const { events } = useBgioEvents()
  const { myCards, myDraftPointsLeft, cardsDraftedThisTurn, draftReady } =
    useBgioG()
  const {
    moves: { confirmDraftReady, draftPrePlaceArmyCardAction },
  } = useBgioMoves()
  const myCardsIDs = myCards.map((c) => c.armyCardID)
  const draftableCards = transformHSCardsToDraftableCards(MS1Cards).filter(
    // TODO: Common cards, searching of cards, etc
    (c) => !myCardsIDs.includes(c.armyCardID) && c.points <= myDraftPointsLeft
  )
  const onClickConfirm = () => {
    confirmDraftReady({ playerID })
  }
  const handleDraftCard = (card: ArmyCard) => {
    draftPrePlaceArmyCardAction({
      armyCard: card,
      playerID,
    })
  }
  const isCouldBeDone = draftableCards.length === 0
  const isPickedCardThisTurn = cardsDraftedThisTurn.length > 0
  const cardIDChosen = cardsDraftedThisTurn[0]
  const cardChosen = MS1Cards.find((c) => c.armyCardID === cardIDChosen)
  const isReady = draftReady[playerID] === true
  if (isReady) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <StyledControlsHeaderH2>
            Waiting for opponents to finish Draft Phase...
          </StyledControlsHeaderH2>
        </motion.div>
      </AnimatePresence>
    )
  }
  if (isCouldBeDone && !isPickedCardThisTurn) {
    return (
      <>
        <StyledControlsHeaderH2>
          Your army is at capacity, no more cards can be drafted. Ready for
          Placement phase?
        </StyledControlsHeaderH2>
        <StyledButtonWrapper>
          <GreenButton onClick={onClickConfirm}>
            Confirm Ready (finished Drafting)
          </GreenButton>
        </StyledButtonWrapper>
      </>
    )
  }
  return (
    <>
      {isPickedCardThisTurn ? (
        <StyledControlsHeaderH2>
          You chose: {cardChosen?.name}
        </StyledControlsHeaderH2>
      ) : (
        <StyledControlsHeaderH2>
          Your draft! Select a card:
        </StyledControlsHeaderH2>
      )}
      {(isPickedCardThisTurn && (
        <>
          <BigGreenButton onClick={() => events?.endTurn?.()}>
            That's my pick, next player!
          </BigGreenButton>
          <UndoRedoButtons />
        </>
      )) || <DraftCardGallery handleDraftCard={handleDraftCard} />}
    </>
  )
}
export const IdleDraftControls = () => {
  const { currentPlayer } = useBgioCtx()
  return (
    <>
      <StyledControlsHeaderH2>
        {playerIDDisplay(currentPlayer)} is drafting a card
      </StyledControlsHeaderH2>
      <DraftCardGallery />
    </>
  )
}

const DraftCardGallery = ({
  handleDraftCard,
}: {
  handleDraftCard?: (card: ArmyCard) => void
}) => {
  const { myCards, myDraftPointsLeft } = useBgioG()
  const myCardsIDs = myCards.map((c) => c.armyCardID)
  const draftableCards = transformHSCardsToDraftableCards(MS1Cards).filter(
    // TODO: Common cards, searching of cards, etc
    (c) => !myCardsIDs.includes(c.armyCardID) && c.points <= myDraftPointsLeft
  )
  return (
    <>
      <StyledDraftGalleryDiv>
        {draftableCards.map((card) => (
          <DraftArmyCard
            handleDraftCard={handleDraftCard}
            key={card?.armyCardID}
            card={card}
          />
        ))}
      </StyledDraftGalleryDiv>
    </>
  )
}

const StyledDraftGalleryDiv = styled.div`
  /* display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 1rem; */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
`

const DraftArmyCard = ({
  card,
  handleDraftCard,
}: {
  card: ArmyCard
  handleDraftCard?: (card: ArmyCard) => void
}) => {
  const { cardsDraftedThisTurn } = useBgioG()
  const { isMyTurn } = useBgioCtx()
  return (
    <StyledDraftCardDiv>
      <h4>{card.name}</h4>
      <img
        alt={'unit portrait'}
        src={`/heroscape-portraits/${card?.image}`}
        style={{ width: '100px', height: '100px' }}
      />
      <span>Points: {card.points}</span>
      <GreenButton
        disabled={!(isMyTurn && cardsDraftedThisTurn.length === 0)}
        onClick={() => handleDraftCard?.(card)}
      >
        DRAFT
      </GreenButton>
      <OpenCardModalButton card={card} />
    </StyledDraftCardDiv>
  )
}
const StyledDraftCardDiv = styled.div`
  flex-basis: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  font-size: 0.8rem;
`
