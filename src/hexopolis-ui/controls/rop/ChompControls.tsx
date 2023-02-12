import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import { StyledControlsHeaderH2 } from 'hexopolis-ui/layout/Typography'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { useSpecialAttackContext } from 'hexopolis-ui/contexts/special-attack-context'
import { AbilityReadout } from './FireLineSAControls'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'

export const ChompControls = () => {
  const {
    moves: { chompAction },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const { chompsAttempted } = useBgioG()
  const alreadyChomped = chompsAttempted.length > 0
  const { revealedGameCard: grimnaksCard } = usePlayContext()
  const { selectSpecialAttack, chosenChomp } = useSpecialAttackContext()
  const goBackToMove = () => {
    selectSpecialAttack('')
    events?.setStage?.(stageNames.movement)
  }
  const confirmChosenAttack = () => {
    chompAction(chosenChomp)
  }
  if (alreadyChomped) {
    return (
      <>
        <StyledControlsHeaderH2>Chomp</StyledControlsHeaderH2>
        <StyledButtonWrapper>
          <GreenButton onClick={goBackToMove}>
            You already chomped this turn, go back to movement
          </GreenButton>
        </StyledButtonWrapper>
        {grimnaksCard?.abilities?.[0] && (
          <AbilityReadout cardAbility={grimnaksCard.abilities[0]} />
        )}
      </>
    )
  }
  return (
    <>
      <StyledControlsHeaderH2>Chomp</StyledControlsHeaderH2>
      <StyledButtonWrapper>
        <GreenButton onClick={goBackToMove}>
          Grimnak no chomp chomp, go back
        </GreenButton>
        <RedButton onClick={confirmChosenAttack} disabled={!chosenChomp}>
          Bon Apetit! (confirm selected target)
        </RedButton>
      </StyledButtonWrapper>
      {grimnaksCard?.abilities?.[0] && (
        <AbilityReadout cardAbility={grimnaksCard.abilities[0]} />
      )}
    </>
  )
}
