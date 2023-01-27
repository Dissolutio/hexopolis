import React from 'react'

import { usePlayContext, useUIContext } from '../../contexts'
import { useBgioG, useBgioMoves } from 'bgio-contexts'
import { UndoRedoButtons } from './UndoRedoButtons'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { ConfirmOrResetButtons } from '../ConfirmOrResetButtons'
import { uniq } from 'lodash'
import { selectIfGameArmyCardHasFlying } from 'game/selectors'
import { omToString } from 'app/utilities'
import styled from 'styled-components'
import { FlyingUnitTextAndToggle } from './FlyingUnitTextAndToggle'

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
  const { moves } = useBgioMoves()
  const { selectedUnit, revealedGameCard, revealedGameCardUnitIDs } =
    usePlayContext()
  const { setSelectedUnitID } = useUIContext()
  const movedUnitsCount = uniq(unitsMoved).length
  const allowedMoveCount = revealedGameCard?.figures ?? 0
  const unitsAliveCount = revealedGameCardUnitIDs.length
  const { hasFlying, hasStealth } =
    selectIfGameArmyCardHasFlying(revealedGameCard)
  const revealedGameCardName = revealedGameCard?.name ?? ''
  const movesAvailable =
    Math.min(allowedMoveCount, unitsAliveCount) - movedUnitsCount
  const isAllMovesUsed = movesAvailable <= 0
  const { endCurrentMoveStage } = moves
  const handleEndMovementClick = () => {
    // setSelectedUnitID('')
    endCurrentMoveStage()
  }
  return (
    <div>
      <RopAttackMoveHeader
        currentOrderMarker={currentOrderMarker}
        revealedGameCardName={revealedGameCardName}
      />
      <StyledControlsP style={{ color: 'var(--text-muted)' }}>
        {`${unitsAliveCount} unit${unitsAliveCount !== 1 ? 's' : ''}`}
      </StyledControlsP>
      <FlyingUnitTextAndToggle
        hasFlying={hasFlying}
        hasStealth={hasStealth}
        revealedGameCardName={revealedGameCardName}
      />
      <StyledControlsP>
        Selected unit move points remaining: {selectedUnit?.movePoints ?? '-'}
      </StyledControlsP>
      <StyledControlsP>
        {movedUnitsCount} / {allowedMoveCount} units moved
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
