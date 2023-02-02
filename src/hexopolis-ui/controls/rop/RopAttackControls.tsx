import React from 'react'

import { usePlayContext } from '../../contexts'
import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import { UndoRedoButtons } from '../rop/UndoRedoButtons'
import { StyledControlsP } from 'hexopolis-ui/layout/Typography'
import {
  ConfirmOrResetButtons,
  StyledButtonWrapper,
} from '../ConfirmOrResetButtons'
import { GreenButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { RopAttackMoveHeader } from './RopMoveControls'

export const RopAttackControls = () => {
  const { uniqUnitsMoved, unitsAttacked, currentOrderMarker } = useBgioG()
  const { moves } = useBgioMoves()
  const { events } = useBgioEvents()
  const { endCurrentPlayerTurn } = moves
  const { revealedGameCard, unitsWithTargets, freeAttacksAvailable } =
    usePlayContext()
  const revealedGameCardName = revealedGameCard?.name ?? ''
  const hasWaterClone = (revealedGameCard?.abilities ?? []).some(
    (ability) => !!ability.isAfterMove
  )
  const attacksAllowed = revealedGameCard?.figures ?? 0
  const isLessUnitsWithTargetsThanNumberOfAttacks =
    unitsWithTargets < attacksAllowed
  const attacksUsed = unitsAttacked.length
  const handleEndTurnButtonClick = () => {
    endCurrentPlayerTurn()
  }
  const attacksAvailable = attacksAllowed - attacksUsed
  const isAllAttacksUsed = attacksAvailable <= 0
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

      {attacksAvailable <= 0 && (
        <StyledControlsP>
          You now have no units with targets in range
        </StyledControlsP>
      )}
      <StyledControlsP>
        Units with targets in range: {unitsWithTargets}
      </StyledControlsP>

      <StyledControlsP>
        {attacksUsed} / {attacksAllowed} attacks used
      </StyledControlsP>

      {/* <StyledControlsP>
        {`You moved ${uniqUnitsMoved.length} unit${
          uniqUnitsMoved.length !== 1 ? 's' : ''
        }, and have ${freeAttacksAvailable} attack${
          freeAttacksAvailable !== 1 ? 's' : ''
        } available for unmoved units`}
      </StyledControlsP> */}
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
          resetText={`End Turn, skip my ${attacksAvailable} attack${
            attacksAvailable !== 1 ? 's' : ''
          }`}
          noConfirmButton
        />
      )}
    </>
  )
}
