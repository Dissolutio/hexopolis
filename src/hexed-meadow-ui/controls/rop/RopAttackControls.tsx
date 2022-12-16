import React from 'react'

import { usePlayContext } from '../../contexts'
import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import { UndoRedoButtons } from '../rop/UndoRedoButtons'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexed-meadow-ui/layout/Typography'
import { ConfirmOrResetButtons } from '../ConfirmOrResetButtons'
import { GreenButton } from 'hexed-meadow-ui/layout/buttons'
import { stageNames } from 'game/constants'

export const RopAttackControls = () => {
  const { uniqUnitsMoved, unitsAttacked, currentOrderMarker, myCards } =
    useBgioG()
  const { moves } = useBgioMoves()
  const { events } = useBgioEvents()
  const { endCurrentPlayerTurn } = moves
  const {
    revealedGameCard,
    countOfRevealedGameCardUnitsWithTargetsInRange,
    freeAttacksAvailable,
  } = usePlayContext()
  const hasWaterClone = (revealedGameCard?.abilities ?? []).some(
    (ability) => !!ability.isAfterMove
  )
  const attacksAllowed = revealedGameCard?.figures ?? 0
  const isLessUnitsWithTargetsThanNumberOfAttacks =
    countOfRevealedGameCardUnitsWithTargetsInRange < attacksAllowed
  const attacksUsed = unitsAttacked.length
  const handleEndTurnButtonClick = () => {
    endCurrentPlayerTurn()
  }
  const maxAttacks = isLessUnitsWithTargetsThanNumberOfAttacks
    ? countOfRevealedGameCardUnitsWithTargetsInRange
    : attacksAllowed
  const attacksAvailable = maxAttacks - attacksUsed
  const isAllAttacksUsed = attacksAvailable <= 0
  const isNoAttacksUsed = attacksUsed <= 0
  const onClickUseWaterClone = () => {
    events?.setStage?.(stageNames.waterClone)
  }
  return (
    <>
      <StyledControlsHeaderH2>{`Your #${currentOrderMarker + 1}: ${
        revealedGameCard?.name ?? ''
      }`}</StyledControlsHeaderH2>

      {attacksAvailable <= 0 && (
        <StyledControlsP>
          You now have no units with targets in range
        </StyledControlsP>
      )}

      <StyledControlsP>
        You have used {attacksUsed} / {attacksAllowed} attacks allowed
      </StyledControlsP>

      <StyledControlsP>
        {`You moved ${uniqUnitsMoved.length} unit${
          uniqUnitsMoved.length !== 1 ? 's' : ''
        }, and have ${freeAttacksAvailable} attack${
          freeAttacksAvailable !== 1 ? 's' : ''
        } available for unmoved units`}
      </StyledControlsP>
      {isNoAttacksUsed && (
        <UndoRedoButtons undoText="Go back to movement stage" noRedo />
      )}
      {isNoAttacksUsed && hasWaterClone && (
        <GreenButton onClick={onClickUseWaterClone}>
          Use Water Clone
        </GreenButton>
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
