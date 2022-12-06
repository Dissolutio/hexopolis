import React from 'react'

import { usePlayContext, useUIContext } from '../contexts'
import { useBgioCtx, useBgioG, useBgioMoves } from 'bgio-contexts'
import { UndoRedoButtons } from './rop/UndoRedoButtons'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexed-meadow-ui/layout/Typography'
import {
  ConfirmOrResetButtons,
  StyledButtonWrapper,
} from './ConfirmOrResetButtons'
import { uniq } from 'lodash'

export const RoundOfPlayControls = () => {
  const { ctx } = useBgioCtx()
  const { isMyTurn, isAttackingStage } = ctx
  if (!isMyTurn) {
    return (
      <>
        <RopIdleControls />
      </>
    )
  }
  if (isMyTurn && !isAttackingStage) {
    return (
      <>
        <RopMoveControls />
      </>
    )
  }
  if (isMyTurn && isAttackingStage) {
    return (
      <>
        <RopAttackControls />
      </>
    )
  }
  return <></>
}

export const RopIdleControls = () => {
  const { currentOrderMarker } = useBgioG()
  const { revealedGameCard } = usePlayContext()
  return (
    <>
      <StyledControlsHeaderH2>
        {`Opponent's #${currentOrderMarker + 1} is ${
          revealedGameCard?.name ?? '...'
        }`}
      </StyledControlsHeaderH2>
    </>
  )
}

export const RopMoveControls = () => {
  const { unitsMoved, currentOrderMarker } = useBgioG()
  const { moves } = useBgioMoves()
  const { revealedGameCard, revealedGameCardUnitIDs } = usePlayContext()
  const { setSelectedUnitID } = useUIContext()
  const movedUnitsCount = uniq(unitsMoved).length
  const allowedMoveCount = revealedGameCard?.figures ?? 0
  const unitsAliveCount = revealedGameCardUnitIDs.length
  const movesAvailable =
    Math.min(allowedMoveCount, unitsAliveCount) - movedUnitsCount
  const isAllMovesUsed = movesAvailable <= 0
  const { endCurrentMoveStage } = moves

  // handlers
  const handleEndMovementClick = () => {
    setSelectedUnitID('')
    endCurrentMoveStage()
  }
  return (
    <div>
      <StyledControlsHeaderH2>{`Your #${
        {
          0: '1',
          1: '2',
          2: '3',
        }[currentOrderMarker]
      }: ${revealedGameCard?.name ?? ''}`}</StyledControlsHeaderH2>
      <StyledControlsP>
        You have used {movedUnitsCount} /{' '}
        {Math.min(allowedMoveCount, unitsAliveCount)} moves
      </StyledControlsP>

      <UndoRedoButtons />
      {isAllMovesUsed ? (
        <ConfirmOrResetButtons
          confirm={handleEndMovementClick}
          confirmText={'End move, begin attack'}
          noResetButton
        />
      ) : (
        <ConfirmOrResetButtons
          reset={handleEndMovementClick}
          resetText={`End Move, skip ${movesAvailable} available move${
            movesAvailable > 1 ? 's' : ''
          }, begin attack`}
          noConfirmButton
        />
      )}
    </div>
  )
}

export const RopAttackControls = () => {
  const { uniqUnitsMoved, unitsAttacked, currentOrderMarker } = useBgioG()
  const { moves } = useBgioMoves()
  const { endCurrentPlayerTurn } = moves

  const {
    revealedGameCard,
    countOfRevealedGameCardUnitsWithTargetsInRange,
    freeAttacksAvailable,
  } = usePlayContext()
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

      <StyledControlsP style={{ marginBottom: '60px' }}>
        {`You moved ${uniqUnitsMoved.length} unit${
          uniqUnitsMoved.length > 1 ? 's' : ''
        }, and have ${freeAttacksAvailable} attack${
          freeAttacksAvailable > 1 ? 's' : ''
        } available for unmoved units`}
      </StyledControlsP>

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
            attacksAvailable > 1 ? 's' : ''
          }`}
          noConfirmButton
        />
      )}
    </>
  )
}
