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
    setSelectedUnitID('')
    endCurrentMoveStage()
  }
  const currentOrderText = `${
    {
      0: '1',
      1: '2',
      2: '3',
    }[currentOrderMarker]
  }`
  return (
    <div>
      <StyledControlsHeaderH2>{`Your #${currentOrderText}: ${revealedGameCardName}`}</StyledControlsHeaderH2>
      {selectedUnit && (
        <StyledControlsP>
          {selectedUnit.movePoints} Move points left
        </StyledControlsP>
      )}
      <StyledControlsP>
        You have used {movedUnitsCount} / {allowedMoveCount} moves
      </StyledControlsP>
      {unitsAliveCount < allowedMoveCount && (
        <StyledControlsP>
          {`You only have ${unitsAliveCount} ${revealedGameCardName} left`}
        </StyledControlsP>
      )}

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
