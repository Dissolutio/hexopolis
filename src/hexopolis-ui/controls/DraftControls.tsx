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
import { transformHSCardsToDraftableCards } from 'game/transformers'
import { ArmyCard } from 'game/types'
import { GreenButton } from 'hexopolis-ui/layout/buttons'

export const DraftControls = () => {
  return (
    <>
      <StyledControlsHeaderH2>DraftControls</StyledControlsHeaderH2>
      <DraftCardGallery />
    </>
  )
}

const DraftCardGallery = () => {
  const { myCards } = useBgioG()
  const { playerID } = useBgioClientInfo()
  const {
    moves: { confirmDraftReady },
  } = useBgioMoves()
  const myCardsIDs = myCards.map((c) => c.armyCardID)
  const draftableCards = transformHSCardsToDraftableCards(MS1Cards).filter(
    (c) => !myCardsIDs.includes(c.armyCardID)
  )
  const onClickConfirm = () => {
    confirmDraftReady({ playerID })
  }
  return (
    <StyledDraftGalleryDiv>
      <GreenButton onClick={onClickConfirm}>
        Confirm Ready (finished Drafting)
      </GreenButton>
      {draftableCards.map((card) => (
        <DraftArmyCard key={card?.armyCardID} card={card} />
      ))}
    </StyledDraftGalleryDiv>
  )
}

const StyledDraftGalleryDiv = styled.div``

const DraftArmyCard = ({ card }: { card: ArmyCard }) => {
  const { playerID } = useBgioClientInfo()
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
    <StyledDraftCardDiv onClick={handleClickDraftCard}>
      <img alt={'unit portrait'} src={`/heroscape-portraits/${card?.image}`} />
    </StyledDraftCardDiv>
  )
}
const StyledDraftCardDiv = styled.div``
