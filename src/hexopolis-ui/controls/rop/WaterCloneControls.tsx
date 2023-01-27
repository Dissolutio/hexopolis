import React from 'react'

import { usePlayContext } from '../../contexts'
import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import { UndoRedoButtons } from '../rop/UndoRedoButtons'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { ConfirmOrResetButtons } from '../ConfirmOrResetButtons'
import { GreenButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'

export const WaterCloneControls = () => {
  const { uniqUnitsMoved, unitsAttacked, currentOrderMarker } = useBgioG()
  const { moves } = useBgioMoves()
  const { events } = useBgioEvents()
  const { endCurrentPlayerTurn } = moves
  const { revealedGameCard, unitsWithTargets, freeAttacksAvailable } =
    usePlayContext()
  const hasWaterClone = (revealedGameCard?.abilities ?? []).some(
    (ability) => !!ability.isAfterMove
  )
  return (
    <>
      <StyledControlsHeaderH2>Water Clone</StyledControlsHeaderH2>
      <StyledControlsP>{revealedGameCard?.abilities?.[0].desc}</StyledControlsP>
    </>
  )
}
