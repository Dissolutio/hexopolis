import { AnimatePresence, motion } from 'framer-motion'
import {
  useBgioClientInfo,
  useBgioCtx,
  useBgioEvents,
  useBgioG,
  useBgioMoves,
} from 'bgio-contexts'
import styled from 'styled-components'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
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
import { selectIfGameArmyCardHasAbility } from 'game/selector/card-selectors'
import { usePlacementContext, usePlayContext } from 'hexopolis-ui/contexts'
import { noop } from 'lodash'
import { stageNames } from 'game/constants'

export const DropControls = () => {
  const { playerID } = useBgioClientInfo()
  const { events } = useBgioEvents()
  const {
    toBeDroppedUnitIDs,
    onConfirmDropPlacement,
    onDenyDrop,
    theDropPlaceableHexIDs,
  } = usePlayContext()
  const { editingBoardHexes } = usePlacementContext()
  const { myCards, myDraftPointsLeft, cardsDraftedThisTurn, draftReady } =
    useBgioG()
  const theCard = myCards.filter((c) =>
    selectIfGameArmyCardHasAbility('The Drop', c)
  )[0]
  const numberUnitsRemainingToDrop = toBeDroppedUnitIDs.length
  const isCouldBeDone =
    numberUnitsRemainingToDrop === 0 || theDropPlaceableHexIDs.length === 0
  return (
    <>
      <StyledControlsHeaderH2>
        The Drop: place {numberUnitsRemainingToDrop} more {theCard.singleName}
      </StyledControlsHeaderH2>

      {isCouldBeDone ? (
        <StyledButtonWrapper>
          <BigGreenButton onClick={onConfirmDropPlacement}>
            Confirm Ready (finished placing units)
          </BigGreenButton>
        </StyledButtonWrapper>
      ) : (
        <StyledControlsP>
          Select a green hex to place a unit there.
        </StyledControlsP>
      )}
      {/* hacky way to show the deny button */}
      {numberUnitsRemainingToDrop === 4 && (
        <StyledButtonWrapper>
          <GreenButton onClick={onDenyDrop}>
            Hold the plane! (deny using The Drop and save it for a future round)
          </GreenButton>
        </StyledButtonWrapper>
      )}
    </>
  )
}

export const IdleDropControls = () => {
  const { activePlayers } = useBgioCtx()
  const playerDoingTheDrop =
    Object.keys(activePlayers ?? {}).find(
      (k) => activePlayers?.[k] === stageNames.theDrop
    ) ?? ''
  return (
    <>
      <StyledControlsHeaderH2>
        {playerIDDisplay(playerDoingTheDrop)} is deciding how to use The Drop
      </StyledControlsHeaderH2>
    </>
  )
}
