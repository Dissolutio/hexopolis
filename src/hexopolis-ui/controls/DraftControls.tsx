import {
  useBgioClientInfo,
  useBgioCtx,
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
import { GreenButton } from 'hexopolis-ui/layout/buttons'
import { UndoRedoButtons } from './rop/UndoRedoButtons'
import { OpenCardModalButton } from 'hexopolis-ui/OpenAbilityModalButton'

export const DraftControls = () => {
  const { playerID } = useBgioClientInfo()
  const {
    moves: { confirmDraftReady },
  } = useBgioMoves()
  const onClickConfirm = () => {
    confirmDraftReady({ playerID })
  }
  return (
    <>
      <StyledControlsHeaderH2>
        Your draft! Select a card:
      </StyledControlsHeaderH2>
      <GreenButton onClick={onClickConfirm}>
        Confirm Ready (finished Drafting)
      </GreenButton>
      <DraftCardGallery />
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

const DraftCardGallery = () => {
  const { myCards } = useBgioG()
  const myCardsIDs = myCards.map((c) => c.armyCardID)
  const draftableCards = transformHSCardsToDraftableCards(MS1Cards).filter(
    (c) => !myCardsIDs.includes(c.armyCardID)
  )
  return (
    <>
      <UndoRedoButtons />
      <StyledDraftGalleryDiv>
        {draftableCards.map((card) => (
          <DraftArmyCard key={card?.armyCardID} card={card} />
        ))}
      </StyledDraftGalleryDiv>
    </>
  )
}

const StyledDraftGalleryDiv = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 1rem;
`

const DraftArmyCard = ({ card }: { card: ArmyCard }) => {
  const { playerID } = useBgioClientInfo()
  const { isMyTurn } = useBgioCtx()
  const {
    moves: { draftPrePlaceArmyCardAction },
  } = useBgioMoves()
  const handleClickDraftCard = () => {
    draftPrePlaceArmyCardAction({
      armyCard: card,
      playerID,
    })
  }
  return (
    <StyledDraftCardDiv>
      <img
        alt={'unit portrait'}
        src={`/heroscape-portraits/${card?.image}`}
        style={{ width: '100px', height: '100px' }}
      />
      {(isMyTurn && (
        <GreenButton onClick={handleClickDraftCard}>DRAFT</GreenButton>
      )) || <OpenCardModalButton card={card} />}
    </StyledDraftCardDiv>
  )
}
const StyledDraftCardDiv = styled.div``
