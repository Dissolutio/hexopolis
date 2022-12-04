import React from 'react'

import { usePlayContext } from '../contexts'
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
  const { revealedGameCard } = usePlayContext()
  const movedUnitsCount = unitsMoved.length
  const allowedMoveCount = revealedGameCard?.figures ?? 0
  const { endCurrentMoveStage } = moves

  // handlers
  const handleEndMovementClick = () => {
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
        You have moved {movedUnitsCount} / {allowedMoveCount} units{' '}
      </StyledControlsP>
      <StyledButtonWrapper>
        <button onClick={handleEndMovementClick}>END MOVE</button>
        <UndoRedoButtons />
      </StyledButtonWrapper>
    </div>
  )
}

export const RopAttackControls = () => {
  const { unitsAttacked, currentOrderMarker } = useBgioG()
  const { moves } = useBgioMoves()
  const { endCurrentPlayerTurn } = moves

  const { revealedGameCard } = usePlayContext()
  const attacksUsed = unitsAttacked.length
  const attacksPossible = revealedGameCard?.figures ?? 0
  const handleEndTurnButtonClick = () => {
    endCurrentPlayerTurn()
  }
  return (
    <>
      <StyledControlsHeaderH2>{`Your #${currentOrderMarker + 1}: ${
        revealedGameCard?.name ?? ''
      }`}</StyledControlsHeaderH2>
      <StyledControlsP>
        You have used {attacksUsed} / {attacksPossible} attacks{' '}
      </StyledControlsP>
      <ConfirmOrResetButtons
        confirm={handleEndTurnButtonClick}
        confirmText={'End Turn'}
        noResetButton
      />
    </>
  )
}
