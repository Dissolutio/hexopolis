import { useBgioEvents, useBgioG, useBgioMoves } from 'bgio-contexts'
import { StyledControlsHeaderH2 } from 'hexopolis-ui/layout/Typography'
import { usePlayContext } from 'hexopolis-ui/contexts'
import { useSpecialAttackContext } from 'hexopolis-ui/contexts/special-attack-context'
import { AbilityReadout } from './FireLineSAControls'
import { StyledButtonWrapper } from '../ConfirmOrResetButtons'
import { GreenButton, RedButton } from 'hexopolis-ui/layout/buttons'
import { stageNames } from 'game/constants'
import { OpenAbilityModalButton } from 'hexopolis-ui/OpenAbilityModalButton'

export const ChompControls = () => {
  const {
    moves: { chompAction },
  } = useBgioMoves()
  const { events } = useBgioEvents()
  const { chompsAttempted } = useBgioG()
  const alreadyChomped = chompsAttempted.length > 0
  const { revealedGameCard } = usePlayContext()
  const ability = revealedGameCard?.abilities?.[0]
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
        {ability && (
          <StyledButtonWrapper>
            <OpenAbilityModalButton cardAbility={ability} />
          </StyledButtonWrapper>
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
      {ability && (
        <StyledButtonWrapper>
          <OpenAbilityModalButton cardAbility={ability} />
        </StyledButtonWrapper>
      )}
    </>
  )
}
