import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexopolis-ui/layout/Typography'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { useSpecialAttackContext } from 'hexopolis-ui/contexts/special-attack-context'
import { AbilityReadout } from './FireLineSAControls'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'

export const MindShackleControls = () => {
  const {
    moves: { mindShackleAction },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const { mindShacklesAttempted } = useBgioG()
  const alreadyAttempted = mindShacklesAttempted.length > 0
  const { revealedGameCard: mindShacklerCard } = usePlayContext()
  const {
    selectSpecialAttack,
    chosenMindShackle,
    singleUnitOfRevealedGameCard: negoksaUnit,
  } = useSpecialAttackContext()
  const targetName = chosenMindShackle?.targetName ?? ''
  const goBackToAttack = () => {
    selectSpecialAttack('')
    events?.setStage?.(stageNames.attacking)
  }
  const confirmChosenAttack = () => {
    mindShackleAction({
      sourceUnitID: negoksaUnit?.unitID ?? '',
      sourcePlayerID: negoksaUnit?.playerID ?? '',
      targetUnitID: chosenMindShackle?.targetUnitID ?? '',
    })
  }

  if (alreadyAttempted) {
    return (
      <>
        <StyledControlsHeaderH2>Mind Shackle</StyledControlsHeaderH2>
        <StyledControlsP>
          You already attempted Mind Shackle this turn
        </StyledControlsP>
        <StyledButtonWrapper>
          <GreenButton onClick={goBackToAttack}>Go back to attack</GreenButton>
        </StyledButtonWrapper>
        {mindShacklerCard?.abilities?.[0] && (
          <AbilityReadout cardAbility={mindShacklerCard.abilities[0]} />
        )}
      </>
    )
  }
  return (
    <>
      <StyledControlsHeaderH2>Mind Shackle</StyledControlsHeaderH2>
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToAttack}>Go back to attack</GreenButton>
        <RedButton onClick={confirmChosenAttack} disabled={!chosenMindShackle}>
          {`Your mind is mine, ${targetName}! (confirm selected target)`}
        </RedButton>
      </StyledButtonWrapper>
      {mindShacklerCard?.abilities?.[0] && (
        <AbilityReadout cardAbility={mindShacklerCard.abilities[0]} />
      )}
    </>
  )
}
