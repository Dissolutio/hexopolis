import React from 'react'

import { usePlayContext, useUIContext } from '../contexts'
import {
  useBgioClientInfo,
  useBgioCtx,
  useBgioG,
  useBgioMoves,
} from 'bgio-contexts'
import { UndoRedoButtons } from './rop/UndoRedoButtons'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexed-meadow-ui/layout/Typography'
import { ConfirmOrResetButtons } from './ConfirmOrResetButtons'
import { uniq } from 'lodash'
import { GreenButton, RedButton } from 'hexed-meadow-ui/layout/buttons'

export const RoundOfPlayControls = () => {
  const { ctx } = useBgioCtx()
  const {
    isMyTurn,
    isIdleStage,
    isMovementStage,
    isWaitingForDisengagementSwipeStage,
    isDisengagementSwipeStage,
    isAttackingStage,
  } = ctx
  if (isIdleStage) {
    return (
      <>
        <RopIdleControls />
      </>
    )
  }
  if (isMovementStage) {
    return (
      <>
        <RopMoveControls />
      </>
    )
  }
  if (isAttackingStage) {
    return (
      <>
        <RopAttackControls />
      </>
    )
  }
  if (isWaitingForDisengagementSwipeStage) {
    return (
      <>
        <RopWaitingForDisengageControls />
      </>
    )
  }
  if (isDisengagementSwipeStage) {
    return (
      <>
        <RopDisengagementSwipeControls />
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
  const {
    revealedGameCard,
    revealedGameCardUnitIDs,
    disengageConfirm,
    toggleDisengageConfirm,
  } = usePlayContext()
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
  if (disengageConfirm) {
    return (
      <div>
        <StyledControlsHeaderH2>
          Confirm you want to disengage:
        </StyledControlsHeaderH2>
        <button onClick={() => toggleDisengageConfirm(disengageConfirm)}>
          Yes, disengage
        </button>
      </div>
    )
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

      <StyledControlsP>
        {`You moved ${uniqUnitsMoved.length} unit${
          uniqUnitsMoved.length !== 1 ? 's' : ''
        }, and have ${freeAttacksAvailable} attack${
          freeAttacksAvailable !== 1 ? 's' : ''
        } available for unmoved units`}
      </StyledControlsP>
      {unitsAttacked.length <= 0 && (
        <UndoRedoButtons undoText="Go back to movement stage" noRedo />
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

const RopWaitingForDisengageControls = () => {
  // where are we moving to? who is swiping us?
  return (
    <>
      <StyledControlsHeaderH2>Waiting to get swiped</StyledControlsHeaderH2>
    </>
  )
}

const RopDisengagementSwipeControls = () => {
  const { disengagesAttempting } = useBgioG()
  const {
    moves: { takeDisengagementSwipe },
  } = useBgioMoves()
  const { playerID } = useBgioClientInfo()
  console.log(
    '🚀 ~ file: RoundOfPlayControls.tsx:222 ~ RopDisengagementSwipeControls ~ disengagesAttempting',
    disengagesAttempting
  )
  return (
    <>
      <StyledControlsHeaderH2>
        Take a disengagement strike?
        <GreenButton
          onClick={() => takeDisengagementSwipe({ playerID, isTaking: true })}
        >
          YES, KILL!!!
        </GreenButton>
        <RedButton
          onClick={() => takeDisengagementSwipe({ playerID, isTaking: false })}
        >
          No, we have other plans...
        </RedButton>
      </StyledControlsHeaderH2>
    </>
  )
}
