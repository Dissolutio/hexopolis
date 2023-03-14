import { useBgioCtx, useBgioG } from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import React from 'react'
import { playerIDDisplay } from 'game/transformers'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { StyledButtonWrapper } from './ConfirmOrResetButtons'
import { selectIfGameArmyCardHasAbility } from 'game/selector/card-selectors'
import { usePlacementContext, usePlayContext } from 'hexopolis-ui/contexts'
import { stageNames } from 'game/constants'

export const DropControls = () => {
  const {
    toBeDroppedUnitIDs,
    onConfirmDropPlacement,
    onDenyDrop,
    theDropPlaceableHexIDs,
  } = usePlayContext()
  const { onResetTheDropState } = usePlacementContext()
  const { myCards } = useBgioG()
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
          <GreenButton onClick={onConfirmDropPlacement}>
            Confirm Ready (finished placing units)
          </GreenButton>
        </StyledButtonWrapper>
      ) : (
        <StyledControlsP>
          Select a green hex to place a unit there.
        </StyledControlsP>
      )}
      <StyledButtonWrapper>
        <RedButton onClick={onResetTheDropState}>Reset</RedButton>
      </StyledButtonWrapper>
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
