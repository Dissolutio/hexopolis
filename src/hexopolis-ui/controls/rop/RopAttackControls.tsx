import React from 'react'

import { usePlayContext } from '../../contexts'
import { useBgioEvents, useBgioG } from 'bgio-contexts'
import { StyledControlsP } from 'hexopolis-ui/layout/Typography'
import {
  ConfirmOrResetButtons,
  StyledButtonWrapper,
} from '../ConfirmOrResetButtons'
import { GreenButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { RopAttackMoveHeader } from './RopMoveControls'
import { selectGameArmyCardAttacksAllowed } from 'game/selectors/card-selectors'

export const RopAttackControls = () => {
  const { uniqUnitsMoved, unitsAttacked, currentOrderMarker } = useBgioG()
  const { events } = useBgioEvents()
  const { revealedGameCard, unitsWithTargets, freeAttacksAvailable } =
    usePlayContext()
  const revealedGameCardName = revealedGameCard?.name ?? ''
  const hasWaterClone = (revealedGameCard?.abilities ?? []).some(
    (ability) => ability.name === 'Water Clone'
  )
  // Early return if no card is revealed, this should not happen!
  if (!revealedGameCard) {
    return null
  }
  const { totalNumberOfAttacksAllowed } =
    selectGameArmyCardAttacksAllowed(revealedGameCard)

  const attacksUsed = Object.values(unitsAttacked).flat().length
  const handleEndTurnButtonClick = () => {
    events?.endTurn?.()
  }
  const isAllAttacksUsed = totalNumberOfAttacksAllowed <= 0
  const isNoAttacksUsed = attacksUsed <= 0
  const onClickUseWaterClone = () => {
    events?.setStage?.(stageNames.waterClone)
  }
  const goBackToMoveStage = () => {
    events?.setStage?.(stageNames.movement)
  }
  return (
    <>
      <RopAttackMoveHeader
        currentOrderMarker={currentOrderMarker}
        revealedGameCardName={revealedGameCardName}
      />

      <StyledControlsP>
        Units with targets in range: {unitsWithTargets}
      </StyledControlsP>

      <StyledControlsP>
        {attacksUsed} / {totalNumberOfAttacksAllowed} attacks used
      </StyledControlsP>

      <StyledControlsP>
        {`${uniqUnitsMoved.length} unit${
          uniqUnitsMoved.length !== 1 ? 's' : ''
        } moved`}
      </StyledControlsP>
      <StyledControlsP>
        {`${freeAttacksAvailable} attack${
          freeAttacksAvailable !== 1 ? 's' : ''
        } available for unmoved units`}
      </StyledControlsP>

      {isNoAttacksUsed && (
        <StyledButtonWrapper>
          <GreenButton onClick={goBackToMoveStage}>
            Go back to movement stage
          </GreenButton>
        </StyledButtonWrapper>
      )}

      {isNoAttacksUsed && hasWaterClone && (
        <StyledButtonWrapper>
          <GreenButton onClick={onClickUseWaterClone}>
            Use Water Clone
          </GreenButton>
        </StyledButtonWrapper>
      )}

      {isAllAttacksUsed ? (
        <ConfirmOrResetButtons
          confirm={handleEndTurnButtonClick}
          confirmText={'End Turn'}
          noResetButton
        />
      ) : (
        <ConfirmOrResetButtons
          reset={handleEndTurnButtonClick}
          resetText={`End Turn, skip my ${totalNumberOfAttacksAllowed} attack${
            totalNumberOfAttacksAllowed !== 1 ? 's' : ''
          }`}
          noConfirmButton
        />
      )}
    </>
  )
}
