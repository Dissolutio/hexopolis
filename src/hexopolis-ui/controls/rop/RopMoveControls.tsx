import React from 'react'

import { usePlayContext } from '../../contexts'
import { useBgioEvents, useBgioG } from 'bgio-contexts'
import { UndoRedoButtons } from './UndoRedoButtons'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import {
  ConfirmOrResetButtons,
  StyledButtonWrapper,
} from '../ConfirmOrResetButtons'
import { uniq } from 'lodash'
import { omToString } from 'app/utilities'
import { FlyingUnitTextAndToggle } from './FlyingUnitTextAndToggle'
import { stageNames } from 'game/constants'
import { GreenButton } from 'hexopolis-ui/layout/buttons'
import { selectIfGameArmyCardHasFlying } from 'game/selector/card-selectors'

export const RopAttackMoveHeader = ({
  currentOrderMarker,
  revealedGameCardName,
}: {
  currentOrderMarker: number
  revealedGameCardName: string
}) => {
  const currentOrderText = omToString(currentOrderMarker.toString())
  return (
    <StyledControlsHeaderH2>{`Your #${currentOrderText}: ${revealedGameCardName}`}</StyledControlsHeaderH2>
  )
}

export const RopMoveControls = () => {
  const { unitsMoved, currentOrderMarker } = useBgioG()
  const { events } = useBgioEvents()
  const { selectedUnit, revealedGameCard, revealedGameCardUnitIDs } =
    usePlayContext()
  const movedUnitsCount = uniq(unitsMoved).length
  const allowedMoveCount = revealedGameCard?.figures ?? 0
  const unitsAliveCount = revealedGameCardUnitIDs.length
  const { hasFlying, hasStealth } =
    selectIfGameArmyCardHasFlying(revealedGameCard)
  const revealedGameCardName = revealedGameCard?.name ?? ''
  const movesAvailable =
    Math.min(allowedMoveCount, unitsAliveCount) - movedUnitsCount
  const isAllMovesUsed = movesAvailable <= 0
  // TODO: If we have "Before attacking, or After moving" abilities, we'll need put the user in those stages instead of attacking
  const handleEndMovementClick = () => {
    // setSelectedUnitID('')
    events?.setStage?.(stageNames.attacking)
  }
  return (
    <div>
      <RopAttackMoveHeader
        currentOrderMarker={currentOrderMarker}
        revealedGameCardName={revealedGameCardName}
      />

      {unitsAliveCount === 0 ? (
        <StyledControlsP>
          All of your {revealedGameCardName} units have been destroyed.
        </StyledControlsP>
      ) : (
        <>
          <StyledControlsP style={{ color: 'var(--text-muted)' }}>
            {`${unitsAliveCount} unit${unitsAliveCount !== 1 ? 's' : ''}`}
          </StyledControlsP>
          <FlyingUnitTextAndToggle
            hasFlying={hasFlying}
            hasStealth={hasStealth}
            revealedGameCardName={revealedGameCardName}
          />
          <StyledControlsP>
            Selected unit move points remaining:{' '}
            {selectedUnit?.movePoints ?? '-'}
          </StyledControlsP>
          <StyledControlsP>
            {movedUnitsCount} / {allowedMoveCount} units moved
          </StyledControlsP>

          <UndoRedoButtons />
        </>
      )}
      {unitsAliveCount === 0 ? (
        <StyledButtonWrapper>
          <GreenButton onClick={() => events?.endTurn?.()}>
            End Turn
          </GreenButton>
        </StyledButtonWrapper>
      ) : isAllMovesUsed ? (
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
