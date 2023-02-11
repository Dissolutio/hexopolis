import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { selectHexForUnit, selectValidTailHexes } from 'game/selectors'
import { GameUnit, UnitsCloning } from 'game/types'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { UndoRedoButtons } from './UndoRedoButtons'
import { useMemo } from 'react'
import { noop } from 'lodash'
import { AbilityReadout } from './FireLineSAControls'

export const BerserkerChargeControls = () => {
  const { boardHexes, waterCloneRoll, waterClonesPlaced } = useBgioG()
  const {
    moves: {},
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const {
    revealedGameCard,
    revealedGameCardUnits,
    revealedGameCardKilledUnits,
  } = usePlayContext()
  const goBackToMove = () => {
    events?.setStage?.(stageNames.movement)
  }

  // 0. You have not moved any vikings anyway,
  if (Math.random() > 0.5) {
    return (
      <>
        <StyledControlsHeaderH2>Berserker Charge</StyledControlsHeaderH2>
        <StyledControlsP>{`You have not moved any units, you do not need to roll for more move points`}</StyledControlsP>
        <StyledButtonWrapper>
          <GreenButton onClick={goBackToMove}>
            Nevermind, go back to attack
          </GreenButton>
        </StyledButtonWrapper>
        <AbilityReadout cardAbility={revealedGameCard?.abilities?.[0]} />
      </>
    )
  }
  // 1. You rolled for the charge and got it! Now go back to move
  if (Math.random() > 0.5) {
    return (
      <>
        <StyledControlsHeaderH2>Berserker Charge</StyledControlsHeaderH2>
        <StyledControlsP>{`Glory to Njǫrd! You rolled a 17.`}</StyledControlsP>
        <StyledButtonWrapper>
          <GreenButton onClick={noop}>Great, CHARGE! (go to move)</GreenButton>
        </StyledButtonWrapper>
      </>
    )
  }
  // 2. You rolled for the charge and failed! Now go back to attack
  if (Math.random() > 0.5) {
    return (
      <>
        <StyledControlsHeaderH2>Berserker Charge</StyledControlsHeaderH2>
        <StyledControlsP>{`Loki and his tricks! You rolled a 14 and needed a 15`}</StyledControlsP>
        <StyledButtonWrapper>
          <GreenButton onClick={noop}>
            Fine, let us raid instead (go to attack)
          </GreenButton>
        </StyledButtonWrapper>
      </>
    )
  }
  // 3. You haven't rolled yet, roll
  return (
    <>
      <StyledControlsHeaderH2>Berserker Charge</StyledControlsHeaderH2>
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToMove}>
          Wait, I have move points left to use, go back to move
        </GreenButton>
        <RedButton onClick={noop}>Roll for Berserker Charge!</RedButton>
      </StyledButtonWrapper>
      <AbilityReadout cardAbility={revealedGameCard?.abilities?.[0]} />
    </>
  )
}
